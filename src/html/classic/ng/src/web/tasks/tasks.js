/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2016 Greenbone Networks GmbH
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

import {autobind} from '../../utils.js';
import  _ from '../../locale.js';

import Section from '../section.js';
import Icon from '../icon.js';
import HelpIcon from '../helpicon.js';
import Toolbar from '../toolbar.js';
import PowerFilter from '../powerfilter.js';

import EntitiesComponent from '../entities/component.js';

import {Dashboard, DashboardControls} from '../dashboard/dashboard.js';

import TaskDialog from './dialog.js';
import TasksList from './taskslist.js';
import TaskFilterDialog from './filterdialog.js';
import TaskCharts from './charts.js';

import IconMenu from '../menu/iconmenu.js';
import MenuEntry from '../menu/menuentry.js';

import TaskWizard from '../wizard/taskwizard.js';
import AdvancedTaskWizard from '../wizard/advancedtaskwizard.js';
import ModifyTaskWizard from '../wizard/modifytaskwizard.js';

import {TASKS_FILTER_FILTER} from '../../gmp/commands/filters.js';

export class Tasks extends EntitiesComponent {

  constructor(props) {
    super(props);

    autobind(this, 'on');
  }

  load(filter) {
    this.context.gmp.tasks.get(filter).then(tasks => {
      filter = tasks.getFilter();
      this.setState({tasks, filter});
    });
  }

  loadFilters() {
    this.context.gmp.filters.get(TASKS_FILTER_FILTER).then(filters => {
      this.setState({filters});
    });
  }

  getCounts() {
    return this.state.tasks.getCounts();
  }

  onDeleteTask(task) {
    this.reload();
  }

  onClonedTask(task) {
    this.reload();
  }

  onNewTask() {
    this.reload();
  }

  render() {
    let {filters, filter} = this.state;
    return (
      <div>
        <Toolbar>
          <HelpIcon page="tasks"/>
          <IconMenu img="wizard.svg" title={_('Wizard')}
            onClick={() => this.task_wizard.show()}>
            <MenuEntry title={_('Task Wizard')}
              onClick={() => this.task_wizard.show()}/>
            <MenuEntry title={_('Advanced Task Wizard')}
              onClick={() => this.advanced_task_wizard.show()}/>
            <MenuEntry title={_('Modify Task Wizard')}
              onClick={ () => this.modify_task_wizard.show()}/>
          </IconMenu>
          <Icon img="new.svg" title={_('New Task')}
            onClick={() => { this.create_dialog.show(); }}/>
          <TaskWizard ref={ref => this.task_wizard = ref}
            onSave={this.onNewTask}
            onNewClick={() => this.create_dialog.show()}/>
          <AdvancedTaskWizard ref={ref => this.advanced_task_wizard = ref}
            onSave={this.onNewTask}/>
          <ModifyTaskWizard ref={ref => this.modify_task_wizard = ref}
            onSave={this.onNewTask}/>
          <TaskDialog ref={ref => this.create_dialog = ref}
            title={_('Create new Task')} onClose={this.reload}
            onSave={this.onNewTask}/>
          <PowerFilter
            filter={filter}
            filters={filters}
            onFilterCreated={this.onFilterCreated}
            onResetClick={this.onFilterReset}
            onEditClick={() => this.filter_dialog.show()}
            onUpdate={this.onFilterUpdate}/>
          <TaskFilterDialog
            filter={filter}
            ref={ref => this.filter_dialog = ref}
            onSave={this.onFilterUpdate}/>
        </Toolbar>

        <Section title={_('Tasks')} img="task.svg" extra={<DashboardControls/>}>
          <Dashboard hide-filter-select
            filter={filter}
            config-pref-id="3d5db3c7-5208-4b47-8c28-48efc621b1e0"
            default-controllers-string={'task-by-severity-class|' +
              'task-by-most-high-results|task-by-status'}
            default-controller-string="task-by-cvss">
            <TaskCharts filter={filter}/>
          </Dashboard>

          <TasksList tasks={this.state.tasks}
            onDelete={this.onDeleteTask}
            onCloned={this.onClonedTask}
            onDeleteBulk={this.reload}
            onFirstClick={this.onFirst}
            onLastClick={this.onLast}
            onNextClick={this.onNext}
            onPreviousClick={this.onPrevious}
            onToggleOverridesClick={this.onToggleOverrides}/>
        </Section>
      </div>
    );
  }
}

Tasks.contextTypes = {
  gmp: React.PropTypes.object.isRequired,
};

export default Tasks;

// vim: set ts=2 sw=2 tw=80:
