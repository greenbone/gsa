/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useEffect, useState} from 'react';
import {useDispatch} from 'react-redux';
import {useNavigate} from 'react-router';
import {TaskCommandCreateContainerParams} from 'gmp/commands/tasks';
import Filter, {REPORTS_FILTER_FILTER} from 'gmp/models/filter';
import Report from 'gmp/models/report';
import {isActive} from 'gmp/models/task';
import {isDefined} from 'gmp/utils/identity';
import DashboardControls from 'web/components/dashboard/Controls';
import {ReportIcon, UploadIcon} from 'web/components/icon';
import ManualIcon from 'web/components/icon/ManualIcon';
import IconDivider from 'web/components/layout/IconDivider';
import PageTitle from 'web/components/layout/PageTitle';
import {
  USE_DEFAULT_RELOAD_INTERVAL,
  USE_DEFAULT_RELOAD_INTERVAL_ACTIVE,
} from 'web/components/loading/Reload';
import EntitiesPage from 'web/entities/EntitiesPage';
import withEntitiesContainer, {
  WithEntitiesContainerComponentProps,
} from 'web/entities/withEntitiesContainer';
import useGmp from 'web/hooks/useGmp';
import useShallowEqualSelector from 'web/hooks/useShallowEqualSelector';
import useTranslation from 'web/hooks/useTranslation';
import ReportsDashboard, {
  REPORTS_DASHBOARD_ID,
} from 'web/pages/reports/dashboard';
import ReportFilterDialog from 'web/pages/reports/ReportFilterDialog';
import ReportImportDialog from 'web/pages/reports/ReportImportDialog';
import ReportsTable from 'web/pages/reports/ReportTable';
import ContainerTaskDialog from 'web/pages/tasks/ContainerTaskDialog';
import {
  loadEntities,
  selector as entitiesSelector,
} from 'web/store/entities/reports';
import {
  loadAllEntities as loadAllTasks,
  selector as tasksSelector,
} from 'web/store/entities/tasks';

interface ToolBarIconsProps {
  onUploadReportClick?: () => void;
}

type ReportListPageProps = WithEntitiesContainerComponentProps<Report>;

const CONTAINER_TASK_FILTER = Filter.fromString('target=""');

const ToolBarIcons = ({onUploadReportClick}: ToolBarIconsProps) => {
  const [_] = useTranslation();
  return (
    <IconDivider>
      <ManualIcon
        anchor="using-and-managing-reports"
        page="reports"
        title={_('Help: Reports')}
      />
      <UploadIcon title={_('Upload report')} onClick={onUploadReportClick} />
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
    Filter | undefined
  >(undefined);
  const dispatch = useDispatch();
  const tasks = useShallowEqualSelector(state =>
    tasksSelector(state).getAllEntities(CONTAINER_TASK_FILTER),
  );
  const loadTasks = () =>
    // @ts-expect-error
    dispatch(loadAllTasks(gmp)(CONTAINER_TASK_FILTER)) as Promise<void>;

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
    void loadTasks().then(() => {
      setImportDialogVisible(true);
    });
  };

  const closeImportDialog = () => {
    setImportDialogVisible(false);
  };

  const handleCloseImportDialog = () => {
    closeImportDialog();
  };

  const handleImportReport = data => {
    return gmp.report
      .import(data)
      .then(onChanged, onError)
      .then(() => closeImportDialog());
  };

  const closeContainerTaskDialog = () => {
    setContainerTaskDialogVisible(false);
  };

  const handleCreateContainerTask = async (
    data: TaskCommandCreateContainerParams,
  ) => {
    const response = await gmp.task.createContainer(data);
    const {data: task} = response;
    void loadTasks();
    setTaskId(task.id);
    closeContainerTaskDialog();
  };

  const handleCloseContainerTask = () => {
    closeContainerTaskDialog();
  };

  const handleReportDeltaSelect = (report: Report) => {
    if (isDefined(selectedDeltaReport)) {
      isDefined(onFilterChanged) &&
        onFilterChanged(beforeSelectFilter as Filter);
      void navigate(`/report/delta/${selectedDeltaReport.id}/${report.id}`, {
        replace: true,
      });
    } else {
      const newFilter = filter || new Filter();

      isDefined(onFilterChanged) &&
        onFilterChanged(
          newFilter
            .copy()
            .set('first', 1) // reset to first page
            .set('task_id', report?.task?.id),
        );
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
          <DashboardControls dashboardId={REPORTS_DASHBOARD_ID} />
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
            selectedDeltaReport={selectedDeltaReport}
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
        <ContainerTaskDialog
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

const FALLBACK_REPORT_LIST_FILTER = Filter.fromString(
  'sort-reverse=date first=1',
);

export default withEntitiesContainer<Report>('report', {
  fallbackFilter: FALLBACK_REPORT_LIST_FILTER,
  entitiesSelector,
  loadEntities,
  reloadInterval: reportsReloadInterval,
})(ReportListPage);
