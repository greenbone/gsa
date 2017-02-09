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

import IconMenu from '../menu/iconmenu.js';
import MenuEntry from '../menu/menuentry.js';

import TableRow from '../table/row.js';
import TableHead from '../table/head.js';
import TableHeader from '../table/header.js';

import TaskWizard from '../wizard/taskwizard.js';
import AdvancedTaskWizard from '../wizard/advancedtaskwizard.js';
import ModifyTaskWizard from '../wizard/modifytaskwizard.js';

import TaskDialog from './dialog.js';
import ContainerTaskDialog from './containerdialog.js';
import TaskFilterDialog from './filterdialog.js';
import TaskCharts from './charts.js';
import TasksListRow from './taskslistrow.js';

import {TASKS_FILTER_FILTER} from '../../gmp/models/filter.js';

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

    this.handleSaveContainerTask = this.handleSaveContainerTask.bind(this);
    this.showContainerTaskDialog = this.showContainerTaskDialog.bind(this);
    this.showTaskDialog = this.showTaskDialog.bind(this);
  }

  handleSaveContainerTask(data) {
    let {gmp} = this.context;
    let promise;

    if (is_defined(data.task)) {
      promise = gmp.task.saveContainer(data);
    }
    else {
      promise = gmp.task.createContainer(data);
    }

    return promise.then(() => this.reload());
  }

  showContainerTaskDialog(task) {
    this.container_dialog.show({
      task,
      name: task ? task.name : _('unnamed'),
      comment: task ? task.comment : '',
      id: task ? task.id : undefined,
      in_assets: task ? task.in_assets : undefined,
      auto_delete: task ? task.auto_delete : undefined,
      auto_delete_data: task ? task.auto_delete_data : undefined,
    }, {
      title: task ? _('Edit Container Task') : _('New Container Task'),
    });
  }

  showTaskDialog() {
    this.create_dialog.show();
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

    return (
      <TableHeader>
        <TableRow>
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
        </TableRow>
        <TableRow>
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
      </TableHeader>
    );
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
        onCloned={this.reload}
        onEditContainerTask={this.showContainerTaskDialog}/>
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
              onNewClick={this.showTaskDialog}/>
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
        {caps.mayCreate('task') &&
          <ContainerTaskDialog
            ref={ref => this.container_dialog = ref}
            onSave={this.handleSaveContainerTask}/>
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
          <IconMenu img="wizard.svg" size="small"
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
          <IconMenu img="new.svg" size="small"
            onClick={this.showTaskDialog}>
            <MenuEntry title={_('New Task')}
              onClick={this.showTaskDialog}/>
            <MenuEntry title={_('New Container Task')}
              onClick={this.showContainerTaskDialog}/>
          </IconMenu>
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
