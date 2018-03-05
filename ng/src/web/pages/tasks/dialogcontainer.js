/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 * Steffen Waterkamp <steffen.waterkamp@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2017 - 2018 Greenbone Networks GmbH
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

import _ from 'gmp/locale.js';
import logger from 'gmp/log.js';

import Layout from '../../components/layout/layout.js';

import PropTypes from '../../utils/proptypes.js';

import ScheduleDialog from '../schedules/dialog.js';
import TargetDialogContainer from '../targets/dialogcontainer.js';
import AlertComponent from '../alerts/component.js';

import TaskDialog from './dialog.js';

const log = logger.getLogger('web.tasks.dialogcontainer');

class TaskDialogContainer extends React.Component {

  constructor(...args) {
    super(...args);

    const {alerts, alert_ids} = this.props;

    this.state = {
      scheduleDialogVisible: false,
      targetDialogVisible: false,
      alerts,
      alert_ids,
    };

    this.targets = [];

    this.handleAlertCreated = this.handleAlertCreated.bind(this);
    this.handleCreateSchedule = this.handleCreateSchedule.bind(this);
    this.handleCreateTarget = this.handleCreateTarget.bind(this);
    this.openScheduleDialog = this.openScheduleDialog.bind(this);
    this.closeScheduleDialog = this.closeScheduleDialog.bind(this);
    this.openTargetDialog = this.openTargetDialog.bind(this);
    this.closeTargetDialog = this.closeTargetDialog.bind(this);
  }

  handleCreateTarget(target) {
    const {targets} = this;

    targets.push(target);

    log.debug('adding target to task dialog', target, targets);

    this.setState({
      targets,
      target_id: target.id,
    });
  }

  handleCreateSchedule(data) {
    const {schedules} = this;
    const {gmp} = this.context;
    return gmp.schedule.create(data).then(response => {
      const schedule = response.data;

      schedules.push(schedule);

      this.setState({
        schedules,
        schedule_id: schedule.id,
      });
    });
  }

  handleAlertCreated(resp) {
    const {data} = resp;
    const {alert_ids} = this.state;

    const {gmp} = this.context;
    gmp.alerts.getAll().then(response => {
      const {data: alerts} = response;

      log.debug('adding alert to task dialog', data.id, alerts);

      this.setState({alerts, alert_ids: [...alert_ids, data.id]});
    });
  }

  openTargetDialog() {
    this.setState({
      targetDialogVisible: true,
    });
  }

  closeTargetDialog() {
    this.setState({targetDialogVisible: false});
  }

  openScheduleDialog() {
    const {gmp} = this.context;
    const {timezone} = gmp.globals;
    const now = moment().tz(timezone);

    this.setState({
      scheduleDialogVisible: true,
      timezone,
      minute: now.minutes(),
      hour: now.hours(),
      date: now,
    });
  }

  closeScheduleDialog() {
    this.setState({scheduleDialogVisible: false});
  }

  render() {
    const {onSave, ...props} = this.props;
    const {
      alerts,
      alert_ids,
      minute,
      hour,
      date,
      scheduleDialogVisible,
      schedules = [],
      target_id,
      targetDialogVisible,
      targets,
      timezone,
    } = this.state;
    return (
      <Layout>
        <AlertComponent
          onCreated={this.handleAlertCreated}
        >
          {({
            create: createalert,
          }) => (
            <TaskDialog
              {...props}
              alerts={alerts}
              alert_ids={alert_ids}
              onNewAlertClick={createalert}
              onNewTargetClick={this.openTargetDialog}
              onNewScheduleClick={this.openScheduleDialog}
              onSave={onSave}
            />
          )}
        </AlertComponent>
        {scheduleDialogVisible &&
          <ScheduleDialog
            schedules={schedules}
            timezone={timezone}
            minute={minute}
            hour={hour}
            date={date}
            title={_('Create new Schedule')}
            onClose={this.closeScheduleDialog}
            onSave={this.handleCreateSchedule}
          />
        }
        {targetDialogVisible &&
          <TargetDialogContainer
            targets={targets}
            target_id={target_id}
            title={_('Create new Target')}
            onClose={this.closeTargetDialog}
            onSave={this.handleCreateTarget}
          />
        }
      </Layout>
    );
  }
}

TaskDialogContainer.propTypes = {
  alert_ids: PropTypes.array,
  alerts: PropTypes.array,
  onSave: PropTypes.func,
};

TaskDialogContainer.contextTypes = {
  gmp: PropTypes.gmp.isRequired,
};

export default TaskDialogContainer;

// vim: set ts=2 sw=2 tw=80:
