/* Copyright (C) 2016-2020 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License
 * as published by the Free Software Foundation, either version 3
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */

import React, {useEffect, useCallback} from 'react';

import _ from 'gmp/locale';

import {TASKS_FILTER_FILTER} from 'gmp/models/filter';

import {hasValue} from 'gmp/utils/identity';

import DashboardControls from 'web/components/dashboard/controls';

import Download from 'web/components/form/download';
import useDownload from 'web/components/form/useDownload';

import ManualIcon from 'web/components/icon/manualicon';
import TaskIcon from 'web/components/icon/taskicon';
import WizardIcon from 'web/components/icon/wizardicon';

import Loading from 'web/components/loading/loading';

import IconDivider from 'web/components/layout/icondivider';
import PageTitle from 'web/components/layout/pagetitle';

import IconMenu from 'web/components/menu/iconmenu';
import MenuEntry from 'web/components/menu/menuentry';

import DialogNotification from 'web/components/notification/dialognotification';
import useDialogNotification from 'web/components/notification/useDialogNotification';

import EntitiesPage from 'web/entities/page';

import {useLazyGetTasks, useDeleteTask, useCloneTask} from 'web/graphql/tasks';

import PropTypes from 'web/utils/proptypes';
import useCapabilities from 'web/utils/useCapabilities';
import useChangeFilter from 'web/utils/useChangeFilter';
import usePageFilter from 'web/utils/usePageFilter';
import useUserSessionTimeout from 'web/utils/useUserSessionTimeout';

import NewIconMenu from './icons/newiconmenu';

import TaskComponent from './component';
import TaskDashboard, {TASK_DASHBOARD_ID} from './dashboard';
import TaskFilterDialog from './filterdialog';
import TaskListTable from './table';

export const ToolBarIcons = ({
  onAdvancedTaskWizardClick,
  onModifyTaskWizardClick,
  onContainerTaskCreateClick,
  onTaskCreateClick,
  onTaskWizardClick,
}) => {
  const capabilities = useCapabilities();
  return (
    <IconDivider>
      <ManualIcon
        page="scanning"
        anchor="managing-tasks"
        title={_('Help: Tasks')}
      />
      {capabilities.mayOp('run_wizard') && (
        <IconMenu icon={<WizardIcon />} onClick={onTaskWizardClick}>
          {capabilities.mayCreate('task') && (
            <MenuEntry title={_('Task Wizard')} onClick={onTaskWizardClick} />
          )}
          {capabilities.mayCreate('task') && (
            <MenuEntry
              title={_('Advanced Task Wizard')}
              onClick={onAdvancedTaskWizardClick}
            />
          )}
          {capabilities.mayEdit('task') && (
            <MenuEntry
              title={_('Modify Task Wizard')}
              onClick={onModifyTaskWizardClick}
            />
          )}
        </IconMenu>
      )}

      <NewIconMenu
        onNewClick={onTaskCreateClick}
        onNewContainerClick={onContainerTaskCreateClick}
      />
    </IconDivider>
  );
};

ToolBarIcons.propTypes = {
  onAdvancedTaskWizardClick: PropTypes.func.isRequired,
  onContainerTaskCreateClick: PropTypes.func.isRequired,
  onModifyTaskWizardClick: PropTypes.func.isRequired,
  onTaskCreateClick: PropTypes.func.isRequired,
  onTaskWizardClick: PropTypes.func.isRequired,
};

const TaskListPage = () => {
  const [, renewSession] = useUserSessionTimeout();
  const [filter, isLoadingFilter] = usePageFilter('task');
  const [
    getTasks,
    {counts, tasks, error, loading: isLoading, refetch},
  ] = useLazyGetTasks();
  const [deleteTask] = useDeleteTask();
  const [cloneTask] = useCloneTask();
  const {
    change: handleFilterChanged,
    remove: handleFilterRemoved,
    reset: handleFilterReset,
  } = useChangeFilter('task');
  const {
    dialogState: notificationDialogState,
    closeDialog: closeNotificationDialog,
    showError,
  } = useDialogNotification();
  const [downloadRef, handleDownload] = useDownload();

  const handleCloneTask = useCallback(
    task => cloneTask(task.id).then(refetch, showError),
    [cloneTask, refetch, showError],
  );
  const handleDeleteTask = useCallback(
    task => deleteTask(task.id).then(refetch, showError),
    [deleteTask, refetch, showError],
  );

  useEffect(() => {
    // load tasks after the filter is resolved
    if (!isLoadingFilter && hasValue(filter)) {
      getTasks({
        filterString: filter.toFilterString(),
      });
    }
  }, [isLoadingFilter, filter, getTasks]);

  if (!hasValue(tasks) && (isLoadingFilter || isLoading)) {
    return <Loading />;
  }
  return (
    <TaskComponent
      onAdvancedTaskWizardSaved={refetch}
      onCloned={refetch}
      onCloneError={showError}
      onContainerSaved={refetch}
      onCreated={refetch}
      onContainerCreated={refetch}
      onDeleted={refetch}
      onDeleteError={showError}
      onDownloaded={handleDownload}
      onDownloadError={showError}
      onInteraction={renewSession}
      onModifyTaskWizardSaved={refetch}
      onReportImported={refetch}
      onResumed={refetch}
      onResumeError={showError}
      onSaved={refetch}
      onStarted={refetch}
      onStartError={showError}
      onStopped={refetch}
      onStopError={showError}
      onTaskWizardSaved={refetch}
    >
      {({
        create,
        createcontainer,
        download,
        edit,
        start,
        stop,
        resume,
        reportimport,
        advancedtaskwizard,
        modifytaskwizard,
        taskwizard,
      }) => (
        <React.Fragment>
          <PageTitle title={_('Tasks')} />
          <EntitiesPage
            dashboard={() => (
              <TaskDashboard
                filter={filter}
                onFilterChanged={handleFilterChanged}
                onInteraction={renewSession}
              />
            )}
            dashboardControls={() => (
              <DashboardControls
                dashboardId={TASK_DASHBOARD_ID}
                onInteraction={renewSession}
              />
            )}
            entities={tasks}
            entitiesCounts={counts}
            entitiesError={error}
            filter={filter}
            filterEditDialog={TaskFilterDialog}
            filtersFilter={TASKS_FILTER_FILTER}
            isLoading={isLoading}
            refetch={refetch}
            sectionIcon={<TaskIcon size="large" />}
            table={TaskListTable}
            title={_('Tasks')}
            toolBarIcons={ToolBarIcons}
            onAdvancedTaskWizardClick={advancedtaskwizard}
            onContainerTaskCreateClick={createcontainer}
            onError={showError}
            onFilterChanged={handleFilterChanged}
            onFilterCreated={handleFilterChanged}
            onFilterReset={handleFilterReset}
            onFilterRemoved={handleFilterRemoved}
            onInteraction={renewSession}
            onModifyTaskWizardClick={modifytaskwizard}
            onReportImportClick={reportimport}
            onTaskCloneClick={handleCloneTask}
            onTaskCreateClick={create}
            onTaskDeleteClick={handleDeleteTask}
            onTaskDownloadClick={download}
            onTaskEditClick={edit}
            onTaskResumeClick={resume}
            onTaskStartClick={start}
            onTaskStopClick={stop}
            onTaskWizardClick={taskwizard}
          />
          <DialogNotification
            {...notificationDialogState}
            onCloseClick={closeNotificationDialog}
          />
          <Download ref={downloadRef} />
        </React.Fragment>
      )}
    </TaskComponent>
  );
};

export default TaskListPage;
