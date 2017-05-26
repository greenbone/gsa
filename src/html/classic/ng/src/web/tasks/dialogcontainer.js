/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2017 Greenbone Networks GmbH
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

import moment from 'moment-timezone';

import _ from '../../locale.js';
import logger from '../../log.js';
import {is_defined} from '../../utils.js';

import Layout from '../layout.js';
import PropTypes from '../proptypes.js';

import ScheduleDialog from '../schedules/dialog.js';
import TargetDialogContainer from '../targets/dialogcontainer.js';
import AlertDialogContainer from '../alerts/dialogcontainer.js';

import TaskDialog from './dialog.js';

const log = logger.getLogger('web.tasks.dialogcontainer');

class TaskDialogContainer extends React.Component {

  constructor(...args) {
    super(...args);

    this.targets = [];
    this.alerts = [];

    this.handleCreateAlert = this.handleCreateAlert.bind(this);
    this.handleCreateSchedule = this.handleCreateSchedule.bind(this);
    this.handleCreateTarget = this.handleCreateTarget.bind(this);
    this.handleSaveTask = this.handleSaveTask.bind(this);
    this.openAlertDialog = this.openAlertDialog.bind(this);
    this.openScheduleDialog = this.openScheduleDialog.bind(this);
    this.openTargetDialog = this.openTargetDialog.bind(this);
  }

  handleCreateTarget(target) {
    let {targets} = this;

    targets.push(target);

    log.debug('adding target to task dialog', target, targets);

    this.task_dialog.setValue('targets', targets);
    this.task_dialog.setValue('target_id', target.id);
  }

  handleSaveTask(data) {
    let {gmp} = this.context;
    let {onSave} = this.props;

    let promise;
    if (data && data.id) {
      promise = gmp.task.save(data);
    }
    else {
      promise = gmp.task.create(data);
    }
    return promise.then(response => {
      let task = response.data;
      if (onSave) {
        return onSave(task);
      }
      return undefined;
    });
  }

  handleCreateSchedule(data) {
    let {schedules} = this;
    let {gmp} = this.context;
    return gmp.schedule.create(data).then(response => {
      let schedule = response.data;

      schedules.push(schedule);

      this.task_dialog.setValue('schedules', schedules);
      this.task_dialog.setValue('schedule_id', schedule.id);
    });
  }

  handleCreateAlert(alert) {
    let {alerts = [], alert_ids = []} = this;

    alerts.push(alert);
    alert_ids.push(alert.id);

    log.debug('adding alert to task dialog', alert, alerts);

    this.task_dialog.setValue('alerts', alerts);
    this.task_dialog.setValue('alert_ids', alert_ids);
  }

  openTargetDialog() {
    this.target_dialog.show({});
  }

  openAlertDialog() {
    this.alert_dialog.show({});
  }

  openScheduleDialog() {
    let {gmp} = this.context;
    let timezone = gmp.globals.timezone;
    let now = moment().tz(timezone);

    this.schedule_dialog.show({
      timezone,
      minute: now.minutes(),
      hour: now.hours(),
      date: now,
    });
  }

  show(state, options) {
    this.schedules = is_defined(state) && is_defined(state.schedules) ?
      state.schedules : [];
    this.targets = is_defined(state) && is_defined(state.targets) ?
      state.targets : [];
    this.alerts = is_defined(state) && is_defined(state.alerts) ?
      state.alerts : [];
    this.alert_ids = is_defined(state) && is_defined(state.alert_ids) ?
      state.alert_ids : [];

    this.task_dialog.show(state, options);
  }

  render() {
    return (
      <Layout>
        <TaskDialog
          ref={ref => this.task_dialog = ref}
          onNewAlertClick={this.openAlertDialog}
          onNewTargetClick={this.openTargetDialog}
          onNewScheduleClick={this.openScheduleDialog}
          onSave={this.handleSaveTask}/>
        <ScheduleDialog
          title={_('Create new Schedule')}
          ref={ref => this.schedule_dialog = ref}
          onSave={this.handleCreateSchedule}/>
        <TargetDialogContainer
          ref={ref => this.target_dialog = ref}
          onSave={this.handleCreateTarget}/>
        <AlertDialogContainer
          ref={ref => this.alert_dialog = ref}
          onSave={this.handleCreateAlert}/>
      </Layout>
    );
  }
}

TaskDialogContainer.propTypes = {
  onSave: PropTypes.func,
};

TaskDialogContainer.contextTypes = {
  gmp: PropTypes.gmp.isRequired,
};

export default TaskDialogContainer;

// vim: set ts=2 sw=2 tw=80:
