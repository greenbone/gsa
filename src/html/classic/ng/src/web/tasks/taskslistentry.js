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

import {translate as _, short_date} from '../../locale.js';
import {is_defined, is_string, is_empty} from '../../utils.js';

import Icon from '../icon.js';
import Layout from '../layout.js';
import SeverityBar from '../severitybar.js';
import LegacyLink from '../legacylink.js';

import Checkbox from '../form/checkbox.js';

import TaskDialog from './dialog.js';
import Trend from './trend.js';
import TaskStatusBar from './statusbar.js';

import {SLAVE_SCANNER_TYPE} from '../../gmp/commands/scanners.js';

export class TasksListEntry extends React.Component {

  constructor(props) {
    super(props);
    this.state = {task: this.props.task};
    this.progress = this.progress.bind(this);
    this.startTask = this.startTask.bind(this);
    this.stopTask = this.stopTask.bind(this);
    this.resumeTask = this.resumeTask.bind(this);
    this.deleteTask = this.deleteTask.bind(this);
    this.cloneTask = this.cloneTask.bind(this);
    this.reportDate = this.reportDate.bind(this);
    this.onSave = this.onSave.bind(this);
    this.onSelectionChange = this.onSelectionChange.bind(this);
  }

  progress(value) {
    if (!is_defined(value)) {
      return '0';
    }
    if (is_string(value)) {
      return value;
    }
    if (is_defined(value.__text)) {
      return value.__text;
    }
    return '0';
  }

  reportDate(report) {
    if (is_defined(report) && is_defined(report.timestamp)) {
      return short_date(new Date(report.timestamp));
    }
    return '';
  }

  startTask() {
    let {gmp} = this.context;
    gmp.task.start(this.state.task).then(task => {
      this.setState({task: task});
    });
  }

  stopTask() {
    let {gmp} = this.context;
    gmp.task.stop(this.state.task).then(task => {
      this.setState({task: task});
    });
  }

  deleteTask() {
    let {gmp} = this.context;
    gmp.task.delete(this.state.task).then(() => {
      if (is_defined(this.props.onDelete)) {
        this.props.onDelete(this.state.task);
      }
    });
  }

  resumeTask() {
    let {gmp} = this.context;
    gmp.task.resume(this.state.task).then(task => {
      this.setState({task});
    });
  }

  cloneTask() {
    let {gmp} = this.context;
    gmp.task.clone(this.state.task).then(task => {
      this.props.onCloned(task);
    });
  }

  onSave() {
    let {gmp} = this.context;
    gmp.task.get(this.state.task).then(task => {
      this.setState({task});
    });
  }

  onSelectionChange(value) {
    let {onDeselected, onSelected} = this.props;
    let {task} = this.state;

    if (value) {
      if (onSelected) {
        onSelected(task);
      }
    }
    else if (onDeselected) {
      onDeselected(task);
    }
  }

  componentWillReceiveProps(new_props) {
    this.setState({task: new_props.task});
  }

  renderSelection(task) {
    return (
      <td>
        <Layout flex align={['center', 'center']}>
          <Checkbox onChange={this.onSelectionChange}/>
        </Layout>
      </td>
    );
  }

  renderDeleteButton(task) {
    let {capabilities} = this.context;

    if (capabilities.mayOp('delete_task') && task.isWriteable() &&
      !task.isInUse()) {
      return (
        <Icon onClick={this.deleteTask} size="small" img="trashcan.svg"
          title={_('Delete')}/>
      );
    }

    let title;
    if (task.isInUse()) {
      title = _('Task is still in use');
    }
    else if (!task.isWriteable()) {
      title = _('Task is not writable');
    }
    else if (!capabilities.mayOp('delete_task')) { // eslint-disable-line no-negated-condition
      title = _('Permission to move Task to tashcan denied');
    }
    else {
      title = _('Cannot move to tashcan');
    }
    return (
      <Icon size="small" img="trashcan_inactive.svg"
        title={title}/>
    );
  }

  renderEditButton(task) {
    let {capabilities} = this.context;
    if (capabilities.mayOp('modify_task') && task.isWriteable()) {
      return (
        <Icon size="small" img="edit.svg" title={_('Edit')}
          onClick={() => { this.edit_dialog.show(); }}/>
      );
    }

    let title;
    if (!task.isWriteable()) {
      title = _('Task is not writable');
    }
    else if (!capabilities.mayOp('modify_task')) { // eslint-disable-line no-negated-condition

      title = _('Permission to edit Task denied');
    }
    else {
      title = _('Cannot modify Task');
    }
    return (
      <Icon size="small" img="edit_inactive.svg" title={title}/>
    );
  }

  renderStartButton(task) {
    let {capabilities} = this.context;

    if (!capabilities.mayOp('start_task')) {
      return (
        <Icon size="small" img="start_inactive.svg"
          title={_('Permission to start Task denied')}/>
      );
    }

    if (!task.isActive()) {
      return (
        <Icon onClick={this.startTask} size="small" img="start.svg"
          title={_('Start')}/>
      );
    }
    return (
      <Icon size="small" img="start_inactive.svg"
        title={_('Task is already active')}/>
    );
  }

  renderScheduleIcon(task) {
    let {schedule} = task;

    if (!is_defined(schedule) || !is_defined(schedule.id) ||
      schedule.id.length === 0) {
      return null;
    }

    if (is_defined(schedule.permissions) &&
      schedule.permissions.permission === 0) { // FIXME check if it must be '0'
      return (
        <Icon size="small" img="schedule_inactive.svg"
          title={_('Schedule Unavailable. Name: {{name}}, ID: {{id}}',
            {name: schedule.name, id: schedule.id})}/>
      );
    }
    let title;
    if (schedule.next_time === 'over') {
      title = _('View Details of Schedule {{name}} (Next due: over)',
        {name: schedule.name});
    }
    else if (task.schedule_periods === 1) {
      title = _('View Details of Schedule {{name}} (Next due: {{time}} Once)',
        {name: schedule.name, time: schedule.next_time});
    }
    else if (task.schedule_periods > 1) {
      title = _('View Details of Schedule {{name}} (Next due: ' +
        '{{next_time}}, {{periods}} more times )', {
          name: schedule.name,
          time: schedule.next_time,
          periods: task.schedule_periods,
        });
    }
    else {
      title = _('View Details of Schedule {{name}} (Next due: {{time}})',
        {name: schedule.name, time: schedule.next_time});
    }
    return (
      <LegacyLink cmd="get_schedule" schedule_id={schedule.id}
        title={title} className="icon">
        <Icon size="small" img="scheduled.svg"
          alt={_('Schedule Details')}/>
      </LegacyLink>
    );
  }

  renderResumeButton(task) {
    let {capabilities} = this.context;

    if (task.isContainer()) {
      return (
        <Icon img="resume_inactive.svg" alt={_('Resume')}
          title={_('Task is a container')}/>
      );
    }

    if (task.schedule.id && task.schedule.id.length > 0) {
      return (
        <Icon img="resume_inactive.svg" alt={_('Resume')}
          title={_('Task is scheduled')}/>
      );
    }

    if (task.isStopped()) {
      if (capabilities.mayOp('resume_task')) {
        return (
          <Icon onClick={this.resumeTask} size="small" img="resume.svg"
            title={_('Resume')}/>
        );
      }
      return (
        <Icon img="resume_inactive.svg" alt={_('Resume')}
          title={_('Permission to resume task denied')}/>
      );
    }

    return (
      <Icon img="resume_inactive.svg" alt={_('Resume')}
        title={_('Task is not stopped')}/>
    );
  }

  renderTableAction(task) {
    let {capabilities} = this.context;
    return (
      <td className="table-actions">
        {this.renderScheduleIcon(task) || this.renderStartButton(task)}

        {task.isRunning() &&
          <Icon onClick={this.stopTask} size="small" img="stop.svg"
            title={_('Stop')}/>
        }

        {this.renderResumeButton(task)}
        {this.renderDeleteButton(task)}

        {capabilities.mayClone('task') ?
          <Icon size="small" img="clone.svg" title={_('Clone')}
            onClick={this.cloneTask}/> :
              <Icon size="small" img="clone_inactive.svg"
                title={_('Permission to clone denied')}/>
        }

        {this.renderEditButton(task)}

        <LegacyLink cmd="export_task" task_id={task.id}>
          <Icon size="small" img="download.svg" title={_('Export')}/>
        </LegacyLink>

        <TaskDialog task={task} ref={ref => this.edit_dialog = ref}
          title={_('Edit task {{task}}', {task: task.name})}
          onSave={this.onSave}/>
      </td>
    );
  }

  render() {
    let {gmp} = this.context;
    let {task} = this.state;
    let {selection = false} = this.props;

    let report_id;
    if (is_defined(task.current_report)) {
      report_id = task.current_report.id;
    }
    else if (is_defined(task.last_report)) {
      report_id = task.last_report.id;
    }
    return (
      <tr>
        <td>
          <Layout flex>
            <LegacyLink cmd="get_task" task_id={task.id}
              className="auto">{task.name}</LegacyLink>
            {task.alterable === 1 &&
              <Icon size="small" img="alterable.svg"
                title={_('Task is alterable')}/>
            }
            {task.scanner.type === SLAVE_SCANNER_TYPE &&
              <Icon size="small" img="sensor.svg"
                title={_('Task is configured to run on slave scanner {{name}}',
                  {name: task.scanner.name})}/>
            }
            {task.owner.name !== gmp.username &&
              <Icon size="small" img="view_other.svg"
                title={_('Observing task owned by {{user}}',
                  {user: task.owner.name})}/>
            }
            {!is_empty(task.observers) &&
              <Icon size="small" img="provide_view.svg"
                title={_('Task made visible for: {{user}}',
                  {user: task.observers})}/> // TODO observer roles and groups
            }
          </Layout>
          {!is_empty(task.comment) &&
            <div className="comment">({task.comment})</div>
          }
        </td>
        <td>
          <Layout flex align="center">
            {report_id ? (
              <LegacyLink cmd="get_report" report_id={report_id}
                result_hosts_only="1" notes="1">
                <TaskStatusBar status={task.status}
                  progress={this.progress(task.progress)}/>
              </LegacyLink>
            ) :
              <TaskStatusBar status={task.status}
                progress={this.progress(task.progress)}/>
            }
          </Layout>
        </td>
        <td>
          {task.report_count.total > 0 &&
            <span>
              <LegacyLink cmd="get_reports" replace_task_id="1"
                filter={'task_id=' + task.id +
                  ' and status=Done sort-reverse=date'}
                filt_id="-2"
                title={_('View list of all finished reports for Task {{name}}',
                  {name: task.name})}>
                {task.report_count.finished}
              </LegacyLink>
              (<LegacyLink cmd="get_reports" replace_task_id="1"
                filter={'task_id=' + task.id + ' sort-reverse=date'}
                filt_id="-2"
                title={_('View list of all reports for Task {{name}},' +
                  ' including unfinished ones', {name: task.name})}>
                {task.report_count.total}
              </LegacyLink>)
            </span>
          }
        </td>
        <td>{task.last_report &&
          <LegacyLink cmd="get_report" report_id={task.last_report.id}>
            {this.reportDate(task.last_report)}
          </LegacyLink>
        }
        </td>
        <td>
          {task.last_report &&
            <Layout flex align="center">
              <SeverityBar severity={task.last_report.severity}/>
            </Layout>
          }
        </td>
        <td>
          <Layout flex align="center">
            <Trend name={task.trend}/>
          </Layout>
        </td>
        {selection ? this.renderSelection(task) : this.renderTableAction(task)}
      </tr>
    );
  }
}

TasksListEntry.contextTypes = {
  gmp: React.PropTypes.object.isRequired,
  capabilities: React.PropTypes.object.isRequired,
};

TasksListEntry.propTypes = {
  task: React.PropTypes.object.isRequired,
  selection: React.PropTypes.bool,
  onDelete: React.PropTypes.func,
  onCloned: React.PropTypes.func,
  onSelected: React.PropTypes.func,
  onDeselected: React.PropTypes.func,
};

export default TasksListEntry;

// vim: set ts=2 sw=2 tw=80:
