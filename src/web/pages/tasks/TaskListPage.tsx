/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import {TASKS_FILTER_FILTER} from 'gmp/models/filter';
import Task from 'gmp/models/task';
import DashboardControls from 'web/components/dashboard/Controls';
import {TaskIcon} from 'web/components/icon';
import PageTitle from 'web/components/layout/PageTitle';
import {
  USE_DEFAULT_RELOAD_INTERVAL,
  USE_DEFAULT_RELOAD_INTERVAL_ACTIVE,
} from 'web/components/loading/Reload';
import EntitiesPage from 'web/entities/EntitiesPage';
import withEntitiesContainer, {
  WithEntitiesContainerComponentProps,
} from 'web/entities/withEntitiesContainer';
import useTranslation from 'web/hooks/useTranslation';
import TaskDashboard, {TASK_DASHBOARD_ID} from 'web/pages/tasks/dashboard';
import TaskToolBarIcons from 'web/pages/tasks/icons/TaskToolBarIcons';
import TaskComponent from 'web/pages/tasks/TaskComponentComponent';
import TaskFilterDialog from 'web/pages/tasks/TaskFilterDialog';
import TaskTable from 'web/pages/tasks/TaskTable';
import {
  loadEntities,
  selector as entitiesSelector,
} from 'web/store/entities/tasks';

type TaskListPageProps = WithEntitiesContainerComponentProps<Task>;

interface TaskEntitiesPageProps {
  onAdvancedTaskWizardClick?: () => void;
  onModifyTaskWizardClick?: () => void;
  onContainerTaskCreateClick?: () => void;
  onTaskCreateClick?: () => void;
  onTaskWizardClick?: () => void;
  onTaskCloneClick?: (task: Task) => void;
  onTaskDeleteClick?: (task: Task) => void;
  onTaskEditClick?: (task: Task) => void;
  onTaskStartClick?: (task: Task) => void;
  onTaskStopClick?: (task: Task) => void;
  onTaskResumeClick?: (task: Task) => void;
  onTaskDownloadClick?: (task: Task) => void;
  onReportImportClick?: (task: Task) => void;
}

const TaskListPage = ({
  filter,
  onFilterChanged,
  onChanged,
  onDownloaded,
  onError,
  ...props
}: TaskListPageProps) => {
  const [_] = useTranslation();
  return (
    <TaskComponent
      onAdvancedTaskWizardSaved={onChanged}
      onCloneError={onError}
      onCloned={onChanged}
      onContainerCreated={onChanged}
      onContainerSaved={onChanged}
      onCreated={onChanged}
      onDeleteError={onError}
      onDeleted={onChanged}
      onDownloadError={onError}
      onDownloaded={onDownloaded}
      onModifyTaskWizardSaved={onChanged}
      onReportImported={onChanged}
      onResumeError={onError}
      onResumed={onChanged}
      onSaved={onChanged}
      onStartError={onError}
      onStarted={onChanged}
      onStopError={onError}
      onStopped={onChanged}
      onTaskWizardSaved={onChanged}
    >
      {({
        clone,
        create,
        createContainer,
        delete: deleteFunc,
        download,
        edit,
        start,
        stop,
        resume,
        reportImport,
        advancedTaskWizard,
        modifyTaskWizard,
        taskWizard,
      }) => (
        <React.Fragment>
          <PageTitle title={_('Tasks')} />
          <EntitiesPage<Task, TaskEntitiesPageProps>
            {...props}
            dashboard={() => (
              <TaskDashboard
                filter={filter}
                onFilterChanged={onFilterChanged}
              />
            )}
            dashboardControls={() => (
              <DashboardControls dashboardId={TASK_DASHBOARD_ID} />
            )}
            filter={filter}
            filterEditDialog={TaskFilterDialog}
            filtersFilter={TASKS_FILTER_FILTER}
            sectionIcon={<TaskIcon size="large" />}
            table={TaskTable}
            title={_('Tasks')}
            toolBarIcons={TaskToolBarIcons}
            onAdvancedTaskWizardClick={advancedTaskWizard}
            onContainerTaskCreateClick={createContainer}
            onError={onError}
            onFilterChanged={onFilterChanged}
            onModifyTaskWizardClick={modifyTaskWizard}
            onReportImportClick={reportImport}
            onTaskCloneClick={clone}
            onTaskCreateClick={create}
            onTaskDeleteClick={deleteFunc}
            onTaskDownloadClick={download}
            onTaskEditClick={edit}
            onTaskResumeClick={resume}
            onTaskStartClick={start}
            onTaskStopClick={stop}
            onTaskWizardClick={taskWizard}
          />
        </React.Fragment>
      )}
    </TaskComponent>
  );
};

export const taskReloadInterval = ({entities = []}: {entities: Task[]}) =>
  entities.some(task => task.isActive())
    ? USE_DEFAULT_RELOAD_INTERVAL_ACTIVE
    : USE_DEFAULT_RELOAD_INTERVAL;

export default withEntitiesContainer('task', {
  entitiesSelector,
  loadEntities,
  reloadInterval: taskReloadInterval,
})(TaskListPage);
