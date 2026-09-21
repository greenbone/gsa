/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useEffect, useState} from 'react';
import {useNavigate} from 'react-router';
import {type TaskCommandCreateImportTaskParams} from 'gmp/commands/task';
import {REPORTS_FILTER_FILTER} from 'gmp/models/filter';
import type FilterType from 'gmp/models/filter/filter-type';
import QueryFilter from 'gmp/models/filter/query-filter';
import type Report from 'gmp/models/report';
import {TASK_STATUS, isActive} from 'gmp/models/task';
import {isDefined} from 'gmp/utils/identity';
import DashboardControlsContainer from 'web/components/dashboard/DashboardControlsContainer';
import {ImportIcon, ReportIcon} from 'web/components/icon';
import ManualIcon from 'web/components/icon/ManualIcon';
import IconDivider from 'web/components/layout/IconDivider';
import PageTitle from 'web/components/layout/PageTitle';
import {
  USE_DEFAULT_RELOAD_INTERVAL,
  USE_DEFAULT_RELOAD_INTERVAL_ACTIVE,
} from 'web/components/loading/Reload';
import EntitiesPage from 'web/entities/EntitiesPage';
import withEntitiesContainer, {
  type WithEntitiesContainerComponentProps,
} from 'web/entities/withEntitiesContainer';
import {useGetTasks} from 'web/hooks/use-query/tasks';
import useGmp from 'web/hooks/useGmp';
import useTranslation from 'web/hooks/useTranslation';
import ReportsDashboard, {
  REPORTS_DASHBOARD_ID,
} from 'web/pages/reports/dashboard';
import ReportFilterDialog from 'web/pages/reports/ReportFilterDialog';
import ReportImportDialog, {
  type ReportImportDialogData,
} from 'web/pages/reports/ReportImportDialog';
import ReportsTable from 'web/pages/reports/ReportTable';
import ImportTaskDialog from 'web/pages/tasks/ImportTaskDialog';
import {
  loadEntities,
  selector as entitiesSelector,
} from 'web/store/entities/reports';

interface ToolBarIconsProps {
  onUploadReportClick?: () => void;
}

type ReportListPageProps = WithEntitiesContainerComponentProps<Report>;

const CONTAINER_TASK_FILTER = QueryFilter.fromString('target=""');

export const getReportTaskFilter = (entities: Report[] = []) => {
  const reportTaskIds = Array.from(
    new Set(
      entities
        .filter(
          entity => entity.report?.scan_run_status === TASK_STATUS.running,
        )
        .map(entity => entity.report?.task?.id)
        .filter(isDefined),
    ),
  );

  return reportTaskIds.length > 0
    ? QueryFilter.fromString(`id=${reportTaskIds.join(',')}`)
    : undefined;
};

const ToolBarIcons = ({onUploadReportClick}: ToolBarIconsProps) => {
  const [_] = useTranslation();
  return (
    <IconDivider>
      <ManualIcon
        anchor="using-and-managing-reports"
        page="reports"
        title={_('Help: Reports')}
      />
      <ImportIcon title={_('Import Report')} onClick={onUploadReportClick} />
    </IconDivider>
  );
};

const ReportListPage = ({
  entities,
  filter,
  onChanged,
  onDelete,
  onError,
  onFilterChanged,
  ...props
}: ReportListPageProps) => {
  const gmp = useGmp();
  const [_] = useTranslation();
  const navigate = useNavigate();
  const [importDialogVisible, setImportDialogVisible] = useState(false);
  const [containerTaskDialogVisible, setContainerTaskDialogVisible] =
    useState(false);
  const [selectedDeltaReport, setSelectedDeltaReport] = useState<
    Report | undefined
  >(undefined);
  const [taskId, setTaskId] = useState<string | undefined>(undefined);
  const [beforeSelectFilter, setBeforeSelectFilter] = useState<
    FilterType | undefined
  >(undefined);
  const {data: tasksData, refetch: refetchTasks} = useGetTasks({
    filter: CONTAINER_TASK_FILTER,
  });
  const tasks = tasksData?.entities ?? [];
  const taskFilter = getReportTaskFilter(entities);
  const {data: reportTasksData} = useGetTasks({
    enabled: isDefined(taskFilter),
    filter: taskFilter,
    staleTime: 30_000,
  });
  const reportTasks = reportTasksData?.entities ?? [];

  useEffect(() => {
    if (
      isDefined(selectedDeltaReport?.task) &&
      (!isDefined(filter) ||
        filter.get('task_id') !== selectedDeltaReport?.task?.id)
    ) {
      // filter has changed. reset delta report selection
      setSelectedDeltaReport(undefined);
    }
  }, [filter, selectedDeltaReport]);

  const openCreateTaskDialog = () => {
    setContainerTaskDialogVisible(true);
  };

  const openImportDialog = () => {
    void refetchTasks().then(() => {
      setImportDialogVisible(true);
    });
  };

  const closeImportDialog = () => {
    setImportDialogVisible(false);
  };

  const handleCloseImportDialog = () => {
    closeImportDialog();
  };

  const handleImportReport = (data: ReportImportDialogData) => {
    return gmp.report
      .import(data)
      .then(onChanged)
      .then(() => closeImportDialog());
  };

  const closeContainerTaskDialog = () => {
    setContainerTaskDialogVisible(false);
  };

  const handleCreateContainerTask = async (
    data: TaskCommandCreateImportTaskParams,
  ) => {
    const response = await gmp.task.createImportTask(data);
    const {data: task} = response;
    void refetchTasks();
    setTaskId(task.id);
    closeContainerTaskDialog();
  };

  const handleCloseContainerTask = () => {
    closeContainerTaskDialog();
  };

  const handleReportDeltaSelect = (report: Report) => {
    if (isDefined(selectedDeltaReport)) {
      isDefined(onFilterChanged) &&
        onFilterChanged(beforeSelectFilter as FilterType);
      void navigate(`/report/delta/${selectedDeltaReport.id}/${report.id}`, {
        replace: true,
      });
    } else {
      const newFilter = filter ?? new QueryFilter();
      isDefined(onFilterChanged) &&
        onFilterChanged(newFilter.first().set('task_id', report?.task?.id));
      setBeforeSelectFilter(newFilter);
      setSelectedDeltaReport(report);
    }
  };

  const handleReportDeleteClick = (report: Report) => {
    if (!isDefined(onDelete)) {
      return Promise.resolve();
    }
    return onDelete(report);
  };

  const handleTaskChange = (taskId: string) => {
    setTaskId(taskId);
  };

  return (
    <>
      <PageTitle title={_('Reports')} />
      <EntitiesPage<Report>
        {...props}
        dashboard={() => (
          <ReportsDashboard filter={filter} onFilterChanged={onFilterChanged} />
        )}
        dashboardControls={() => (
          <DashboardControlsContainer dashboardId={REPORTS_DASHBOARD_ID} />
        )}
        entities={entities}
        filter={filter}
        filterEditDialog={ReportFilterDialog}
        filtersFilter={REPORTS_FILTER_FILTER}
        sectionIcon={<ReportIcon size="large" />}
        table={
          <ReportsTable
            {...props}
            entities={entities}
            filter={filter}
            selectedDeltaReport={selectedDeltaReport}
            tasks={reportTasks}
            onReportDeleteClick={handleReportDeleteClick}
            onReportDeltaSelect={handleReportDeltaSelect}
          />
        }
        title={_('Reports')}
        toolBarIcons={<ToolBarIcons onUploadReportClick={openImportDialog} />}
        onError={onError}
        onFilterChanged={onFilterChanged}
      />
      {importDialogVisible && (
        <ReportImportDialog
          task_id={taskId as string}
          tasks={tasks}
          onClose={handleCloseImportDialog}
          onNewContainerTaskClick={openCreateTaskDialog}
          onSave={handleImportReport}
          onTaskChange={handleTaskChange}
        />
      )}
      {containerTaskDialogVisible && (
        <ImportTaskDialog
          onClose={handleCloseContainerTask}
          onSave={handleCreateContainerTask}
        />
      )}
    </>
  );
};

const reportsReloadInterval = ({entities = []}: {entities: Report[]}) =>
  entities.some(entity => isActive(entity.report?.scan_run_status))
    ? USE_DEFAULT_RELOAD_INTERVAL_ACTIVE
    : USE_DEFAULT_RELOAD_INTERVAL;

const FALLBACK_REPORT_LIST_FILTER = QueryFilter.fromString(
  'sort-reverse=date first=1',
);

export default withEntitiesContainer<Report>('report', {
  fallbackFilter: FALLBACK_REPORT_LIST_FILTER,
  entitiesSelector,
  loadEntities,
  reloadInterval: reportsReloadInterval,
})(ReportListPage);
