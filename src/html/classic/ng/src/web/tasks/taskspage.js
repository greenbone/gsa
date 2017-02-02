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

import {is_defined} from '../../utils.js';
import  _ from '../../locale.js';

import Layout from '../layout.js';
import Sort from '../sortby.js';

import Dashboard from '../dashboard/dashboard.js';

import EntitiesListPage from '../entities/listpage.js';
import EntitiesFooter from '../entities/footer.js';

import Icon from '../icons/icon.js';

import IconMenu from '../menu/iconmenu.js';
import MenuEntry from '../menu/menuentry.js';

import TableRow from '../table/row.js';
import TableHead from '../table/head.js';

import TaskWizard from '../wizard/taskwizard.js';
import AdvancedTaskWizard from '../wizard/advancedtaskwizard.js';
import ModifyTaskWizard from '../wizard/modifytaskwizard.js';

import TaskDialog from './dialog.js';
import TaskFilterDialog from './filterdialog.js';
import TaskCharts from './charts.js';
import TasksListRow from './taskslistrow.js';

import {TASKS_FILTER_FILTER} from '../../gmp/commands/filters.js';

export class TasksPage extends EntitiesListPage {

  constructor(props) {
    super(props, {
      name: 'tasks',
      icon_name: 'task.svg',
      download_name: 'tasks.xml',
      title: _('Tasks'),
      empty_title: _('No tasks available'),
      filter_filter: TASKS_FILTER_FILTER,
    });
  }

  renderFooter() {
    let {selection_type} = this.state;
    return (
      <EntitiesFooter span="8" download trash
        selectionType={selection_type}
        onTrashClick={this.onDeleteBulk}
        onDownloadClick={this.onDownloadBulk}
        onSelectionTypeChange={this.onSelectionTypeChange}>
      </EntitiesFooter>
    );
  }

  renderHeader() {
    let entities = this.getEntities();

    if (!is_defined(entities)) {
      return null;
    }

    return [
      <TableRow key="1">
        <TableHead rowSpan="2">
          <Sort by="name" onClick={this.onSortChange}>
            {_('Name')}
          </Sort>
        </TableHead>
        <TableHead rowSpan="2" width="10em">
          <Sort by="status" onClick={this.onSortChange}>
            {_('Status')}
          </Sort>
        </TableHead>
        <TableHead colSpan="2">{_('Reports')}</TableHead>
        <TableHead rowSpan="2" width="10em">
          <Layout flex align="space-between">
            <Sort by="severity" onClick={this.onSortChange}>
              {_('Severity')}
            </Sort>
          </Layout>
        </TableHead>
        <TableHead rowSpan="2" width="6em">
          <Sort by="trend" onClick={this.onSortChange}>
            {_('Trend')}
          </Sort>
        </TableHead>
        <TableHead rowSpan="2" width="10em">{_('Actions')}</TableHead>
      </TableRow>,
      <TableRow key="2">
        <TableHead>
          <Sort by="total" onClick={this.onSortChange}>
            {_('Total')}
          </Sort>
        </TableHead>
        <TableHead>
          <Sort by="last" onClick={this.onSortChange}>
            {_('Last')}
          </Sort>
        </TableHead>
      </TableRow>
    ];
  }

  renderRow(task) {
    let {selection_type} = this.state;
    return (
      <TasksListRow
        key={task.id}
        task={task}
        selection={selection_type}
        onSelected={this.onSelect}
        onDeselected={this.onDeselect}
        onDelete={this.reload}
        onCloned={this.reload}/>
    );
  }

  renderDialogs() {
    let {filter} = this.state;
    let caps = this.context.capabilities;
    return (
      <span>
        {caps.mayOp('run_wizard') &&
          <span>
            <TaskWizard ref={ref => this.task_wizard = ref}
              onSave={this.reload}
              onNewClick={() => this.create_dialog.show()}/>
            <AdvancedTaskWizard ref={ref => this.advanced_task_wizard = ref}
              onSave={this.reload}/>
            <ModifyTaskWizard ref={ref => this.modify_task_wizard = ref}
              onSave={this.reload}/>
          </span>
        }

        {caps.mayCreate('task') &&
          <TaskDialog ref={ref => this.create_dialog = ref}
            title={_('Create new Task')} onClose={this.reload}
            onSave={this.reload}/>
        }

        <TaskFilterDialog
          filter={filter}
          ref={ref => this.filter_dialog = ref}
          onFilterChanged={this.onFilterUpdate}/>
      </span>
    );
  }

  renderToolbarIconButtons() {
    let caps = this.context.capabilities;
    return (
      <Layout flex>
        {this.renderHelpIcon()}

        {caps.mayOp('run_wizard') &&
          <IconMenu img="wizard.svg" size="small" title={_('Wizard')}
            onClick={() => this.task_wizard.show()}>
            <MenuEntry title={_('Task Wizard')}
              onClick={() => this.task_wizard.show()}/>
            <MenuEntry title={_('Advanced Task Wizard')}
              onClick={() => this.advanced_task_wizard.show()}/>
            <MenuEntry title={_('Modify Task Wizard')}
              onClick={ () => this.modify_task_wizard.show()}/>
          </IconMenu>
        }

        {caps.mayCreate('task') &&
          <Icon img="new.svg" title={_('New Task')}
            onClick={() => { this.create_dialog.show(); }}/>
        }
      </Layout>
    );
  }

  renderDashboard() {
    let {filter} = this.state;
    return (
      <Dashboard hide-filter-select
        filter={filter}
        config-pref-id="3d5db3c7-5208-4b47-8c28-48efc621b1e0"
        default-controllers-string={'task-by-severity-class|' +
          'task-by-most-high-results|task-by-status'}
        default-controller-string="task-by-cvss">
        <TaskCharts filter={filter}/>
      </Dashboard>
    );
  }
}

TasksPage.contextTypes = {
  gmp: React.PropTypes.object.isRequired,
  capabilities: React.PropTypes.object.isRequired,
};

export default TasksPage;

// vim: set ts=2 sw=2 tw=80:
