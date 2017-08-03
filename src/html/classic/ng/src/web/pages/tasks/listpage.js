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

import  _ from 'gmp/locale.js';

import PropTypes from '../../utils/proptypes.js';

import EntitiesPage from '../../entities/page.js';
import withEntitiesContainer from '../../entities/withEntitiesContainer.js';

import TaskFilterDialog from './filterdialog.js';
import TaskCharts from './charts.js';
import Table from './table.js';

import NewIconMenu from './icons/newiconmenu.js';

import {withDashboard} from '../../components/dashboard/dashboard.js';

import HelpIcon from '../../components/icon/helpicon.js';

import IconDivider from '../../components/layout/icondivider.js';

import IconMenu from '../../components/menu/iconmenu.js';
import MenuEntry from '../../components/menu/menuentry.js';

import {TASKS_FILTER_FILTER} from 'gmp/models/filter.js';

import withTaskComponent from './withTaskComponent.js';

const Dashboard = withDashboard(TaskCharts, {
  hideFilterSelect: true,
  configPrefId: '3d5db3c7-5208-4b47-8c28-48efc621b1e0',
  defaultControllersString: 'task-by-severity-class|' +
    'task-by-most-high-results|task-by-status',
  defaultControllerString: 'task-by-cvss',
});

const ToolBarIcons = ({
    onAdvancedTaskWizardClick,
    onModifyTaskWizardClick,
    onContainerTaskCreateClick,
    onTaskCreateClick,
    onTaskWizardClick,
  }, {capabilities}) => {
  return (
    <IconDivider>
      <HelpIcon
        page="tasks"
        title={_('Help: Tasks')}/>
      {capabilities.mayOp('run_wizard') &&
        <IconMenu img="wizard.svg" size="small"
          onClick={onTaskWizardClick}>
          {capabilities.mayCreate('task') &&
            <MenuEntry title={_('Task Wizard')}
              onClick={onTaskWizardClick}/>
          }
          {capabilities.mayCreate('task') &&
            <MenuEntry title={_('Advanced Task Wizard')}
              onClick={onAdvancedTaskWizardClick}/>
          }
          {capabilities.mayEdit('task') &&
            <MenuEntry title={_('Modify Task Wizard')}
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
  onModifyTaskWizardClick: PropTypes.func.isRequired,
  onContainerTaskCreateClick: PropTypes.func.isRequired,
  onTaskCreateClick: PropTypes.func.isRequired,
  onTaskWizardClick: PropTypes.func.isRequired,
};

const Page = withTaskComponent({
  onCloned: 'onChanged',
  onCreated: 'onChanged',
  onContainerCreated: 'onChanged',
  onDeleted: 'onChanged',
  onSaved: 'onChanged',
  onStarted: 'onChanged',
  onStopped: 'onChanged',
  onResumed: 'onChanged',
  onAdvancedTaskWizardSaved: 'onChanged',
  onModifyTaskWizardSaved: 'onChanged',
  onTaskWizardSaved: 'onChanged',
  onContainerSaved: 'onChanged',
  onReportImported: 'onChanged',
})(EntitiesPage);

export default withEntitiesContainer('task', {
  dashboard: Dashboard,
  filterEditDialog: TaskFilterDialog,
  filtersFilter: TASKS_FILTER_FILTER,
  sectionIcon: 'task.svg',
  table: Table,
  title: _('Tasks'),
  toolBarIcons: ToolBarIcons,
})(Page);

// vim: set ts=2 sw=2 tw=80:
