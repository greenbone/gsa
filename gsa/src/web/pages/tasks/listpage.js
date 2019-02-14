/* Copyright (C) 2016-2019 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301 USA.
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
import WizardIcon from 'web/components/icon/wizardicon';

import IconDivider from 'web/components/layout/icondivider';

import IconMenu from 'web/components/menu/iconmenu';
import MenuEntry from 'web/components/menu/menuentry';

import {DEFAULT_RELOAD_INTERVAL_ACTIVE} from 'web/utils/constants';

import NewIconMenu from './icons/newiconmenu';

import TaskComponent from './component';
import TaskDashboard, {TASK_DASHBOARD_ID} from './dashboard';
import TaskFilterDialog from './filterdialog';
import Table from './table';
import TaskIcon from 'web/components/icon/taskicon';

const ToolBarIcons = withCapabilities(
  ({
    capabilities,
    onAdvancedTaskWizardClick,
    onModifyTaskWizardClick,
    onContainerTaskCreateClick,
    onTaskCreateClick,
    onTaskWizardClick,
  }) => (
    <IconDivider>
      <ManualIcon
        page="vulnerabilitymanagement"
        anchor="creating-a-task"
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
  ),
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

const taskReloadInterval = ({entities = [], defaultReloadInterval}) =>
  entities.some(task => task.isActive())
    ? DEFAULT_RELOAD_INTERVAL_ACTIVE
    : defaultReloadInterval;

export default withEntitiesContainer('task', {
  entitiesSelector,
  loadEntities,
  reloadInterval: taskReloadInterval,
})(Page);

// vim: set ts=2 sw=2 tw=80:
