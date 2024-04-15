/* Copyright (C) 2016-2022 Greenbone AG
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
import React from 'react';

import _ from 'gmp/locale';

import {TASKS_FILTER_FILTER} from 'gmp/models/filter';

import PropTypes from 'web/utils/proptypes';
import withCapabilities from 'web/utils/withCapabilities';

import {
  loadEntities,
  selector as entitiesSelector,
} from 'web/store/entities/tasks';

import EntitiesPage from 'web/entities/page';
import withEntitiesContainer from 'web/entities/withEntitiesContainer';

import DashboardControls from 'web/components/dashboard/controls';

import ManualIcon from 'web/components/icon/manualicon';
import TaskIcon from 'web/components/icon/taskicon';
import WizardIcon from 'web/components/icon/wizardicon';

import IconDivider from 'web/components/layout/icondivider';
import PageTitle from 'web/components/layout/pagetitle';

import {
  USE_DEFAULT_RELOAD_INTERVAL,
  USE_DEFAULT_RELOAD_INTERVAL_ACTIVE,
} from 'web/components/loading/reload';

import IconMenu from 'web/components/menu/iconmenu';
import MenuEntry from 'web/components/menu/menuentry';

import NewIconMenu from './icons/newiconmenu';

import TaskComponent from './component';
import TaskDashboard, {TASK_DASHBOARD_ID} from './dashboard';
import TaskFilterDialog from './filterdialog';
import Table from './table';

export const ToolBarIcons = withCapabilities(
  ({
    capabilities,
    onAdvancedTaskWizardClick,
    onModifyTaskWizardClick,
    onContainerTaskCreateClick,
    onTaskCreateClick,
    onTaskWizardClick,
  }) => {
    const mayUseModifyTaskWizard =
      capabilities.mayEdit('task') &&
      (capabilities.mayCreate('alert') || capabilities.mayCreate('schedule'));
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
            {mayUseModifyTaskWizard && (
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
  },
);

ToolBarIcons.propTypes = {
  onAdvancedTaskWizardClick: PropTypes.func.isRequired,
  onContainerTaskCreateClick: PropTypes.func.isRequired,
  onModifyTaskWizardClick: PropTypes.func.isRequired,
  onTaskCreateClick: PropTypes.func.isRequired,
  onTaskWizardClick: PropTypes.func.isRequired,
};

const Page = ({
  filter,
  onFilterChanged,
  onInteraction,
  onChanged,
  onDownloaded,
  onError,
  ...props
}) => (
  <TaskComponent
    onAdvancedTaskWizardSaved={onChanged}
    onCloned={onChanged}
    onCloneError={onError}
    onContainerSaved={onChanged}
    onCreated={onChanged}
    onContainerCreated={onChanged}
    onDeleted={onChanged}
    onDeleteError={onError}
    onDownloaded={onDownloaded}
    onDownloadError={onError}
    onInteraction={onInteraction}
    onModifyTaskWizardSaved={onChanged}
    onReportImported={onChanged}
    onResumed={onChanged}
    onResumeError={onError}
    onSaved={onChanged}
    onStarted={onChanged}
    onStartError={onError}
    onStopped={onChanged}
    onStopError={onError}
    onTaskWizardSaved={onChanged}
  >
    {({
      clone,
      create,
      createcontainer,
      delete: delete_func,
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
          {...props}
          dashboard={() => (
            <TaskDashboard
              filter={filter}
              onFilterChanged={onFilterChanged}
              onInteraction={onInteraction}
            />
          )}
          dashboardControls={() => (
            <DashboardControls
              dashboardId={TASK_DASHBOARD_ID}
              onInteraction={onInteraction}
            />
          )}
          filter={filter}
          filterEditDialog={TaskFilterDialog}
          filtersFilter={TASKS_FILTER_FILTER}
          sectionIcon={<TaskIcon size="large" />}
          table={Table}
          title={_('Tasks')}
          toolBarIcons={ToolBarIcons}
          onAdvancedTaskWizardClick={advancedtaskwizard}
          onContainerTaskCreateClick={createcontainer}
          onError={onError}
          onFilterChanged={onFilterChanged}
          onInteraction={onInteraction}
          onModifyTaskWizardClick={modifytaskwizard}
          onReportImportClick={reportimport}
          onTaskCloneClick={clone}
          onTaskCreateClick={create}
          onTaskDeleteClick={delete_func}
          onTaskDownloadClick={download}
          onTaskEditClick={edit}
          onTaskResumeClick={resume}
          onTaskStartClick={start}
          onTaskStopClick={stop}
          onTaskWizardClick={taskwizard}
        />
      </React.Fragment>
    )}
  </TaskComponent>
);

Page.propTypes = {
  filter: PropTypes.filter,
  onChanged: PropTypes.func.isRequired,
  onDownloaded: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
  onFilterChanged: PropTypes.func.isRequired,
  onInteraction: PropTypes.func.isRequired,
};

export const taskReloadInterval = ({entities = []}) =>
  entities.some(task => task.isActive())
    ? USE_DEFAULT_RELOAD_INTERVAL_ACTIVE
    : USE_DEFAULT_RELOAD_INTERVAL;

export default withEntitiesContainer('task', {
  entitiesSelector,
  loadEntities,
  reloadInterval: taskReloadInterval,
})(Page);

// vim: set ts=2 sw=2 tw=80:
