/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2016 - 2017 Greenbone Networks GmbH
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

import _ from 'gmp/locale.js';

import PropTypes from '../../utils/proptypes.js';

import EntitiesPage from '../../entities/page.js';
import withEntitiesContainer from '../../entities/withEntitiesContainer.js';

import TaskFilterDialog from './filterdialog.js';
import TaskCharts from './charts.js';
import Table from './table.js';

import NewIconMenu from './icons/newiconmenu.js';

import withDashboard from '../../components/dashboard/withDashboard.js';

import ManualIcon from '../../components/icon/manualicon.js';

import IconDivider from '../../components/layout/icondivider.js';

import IconMenu from '../../components/menu/iconmenu.js';
import MenuEntry from '../../components/menu/menuentry.js';

import {TASKS_FILTER_FILTER} from 'gmp/models/filter.js';

import TaskComponent from './component.js';

const Dashboard = withDashboard({
  hideFilterSelect: true,
  configPrefId: '3d5db3c7-5208-4b47-8c28-48efc621b1e0',
  defaultControllersString: 'task-by-severity-class|' +
    'task-by-most-high-results|task-by-status',
  defaultControllerString: 'task-by-cvss',
})(TaskCharts);

const ToolBarIcons = ({
    onAdvancedTaskWizardClick,
    onModifyTaskWizardClick,
    onContainerTaskCreateClick,
    onTaskCreateClick,
    onTaskWizardClick,
  }, {capabilities}) => {
  return (
    <IconDivider>
      <ManualIcon
        page="vulnerabilitymanagement"
        anchor="creating-a-task"
        title={_('Help: Tasks')}/>
      {capabilities.mayOp('run_wizard') &&
        <IconMenu
          img="wizard.svg"
          onClick={onTaskWizardClick}>
          {capabilities.mayCreate('task') &&
            <MenuEntry
              title={_('Task Wizard')}
              onClick={onTaskWizardClick}/>
          }
          {capabilities.mayCreate('task') &&
            <MenuEntry
              title={_('Advanced Task Wizard')}
              onClick={onAdvancedTaskWizardClick}/>
          }
          {capabilities.mayEdit('task') &&
            <MenuEntry
              title={_('Modify Task Wizard')}
              onClick={onModifyTaskWizardClick}/>
          }
        </IconMenu>
      }

      <NewIconMenu
        onNewClick={onTaskCreateClick}
        onNewContainerClick={onContainerTaskCreateClick}/>

    </IconDivider>
  );
};

ToolBarIcons.contextTypes = {
  capabilities: PropTypes.capabilities.isRequired,
};

ToolBarIcons.propTypes = {
  onAdvancedTaskWizardClick: PropTypes.func.isRequired,
  onContainerTaskCreateClick: PropTypes.func.isRequired,
  onModifyTaskWizardClick: PropTypes.func.isRequired,
  onTaskCreateClick: PropTypes.func.isRequired,
  onTaskWizardClick: PropTypes.func.isRequired,
};

const Page = ({
  onChanged,
  onDownloaded,
  onError,
  ...props
}) => (
  <TaskComponent
    onCloned={onChanged}
    onCloneError={onError}
    onCreated={onChanged}
    onContainerCreated={onChanged}
    onDeleted={onChanged}
    onDeleteError={onError}
    onDownloaded={onDownloaded}
    onDownloadError={onError}
    onSaved={onChanged}
    onStarted={onChanged}
    onStartError={onError}
    onStopped={onChanged}
    onStopError={onError}
    onResumed={onChanged}
    onResumeError={onError}
    onAdvancedTaskWizardSaved={onChanged}
    onModifyTaskWizardSaved={onChanged}
    onTaskWizardSaved={onChanged}
    onContainerSaved={onChanged}
    onReportImported={onChanged}
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
        dashboard={Dashboard}
        filterEditDialog={TaskFilterDialog}
        sectionIcon="task.svg"
        table={Table}
        title={_('Tasks')}
        toolBarIcons={ToolBarIcons}
        onContainerTaskCreateClick={createcontainer}
        onError={onError}
        onReportImportClick={reportimport}
        onTaskCloneClick={clone}
        onTaskCreateClick={create}
        onTaskDeleteClick={delete_func}
        onTaskDownloadClick={download}
        onTaskEditClick={edit}
        onTaskResumeClick={resume}
        onTaskStartClick={start}
        onTaskStopClick={stop}
        onAdvancedTaskWizardClick={advancedtaskwizard}
        onModifyTaskWizardClick={modifytaskwizard}
        onTaskWizardClick={taskwizard}
      />
    )}
  </TaskComponent>
);

Page.propTypes = {
  onChanged: PropTypes.func.isRequired,
  onDownloaded: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
};

export default withEntitiesContainer('task', {
  filtersFilter: TASKS_FILTER_FILTER,
})(Page);

// vim: set ts=2 sw=2 tw=80:
