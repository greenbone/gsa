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
import withGmp from '../../utils/withGmp';

import ScheduleDialog from '../schedules/dialog.js';
import AlertComponent from '../alerts/component.js';
import TargetComponent from '../targets/component';

import TaskDialog from './dialog.js';

const log = logger.getLogger('web.tasks.dialogcontainer');

class TaskDialogContainer extends React.Component {

  constructor(...args) {
    super(...args);

    const {
      alerts,
      alert_ids,
      targets,
      target_id,
    } = this.props;

    this.state = {
      scheduleDialogVisible: false,
      alerts,
      alert_ids,
      targets,
      target_id,
    };

    this.handleAlertCreated = this.handleAlertCreated.bind(this);
    this.handleAlertsChange = this.handleAlertsChange.bind(this);
    this.handleTargetCreated = this.handleTargetCreated.bind(this);
    this.handleCreateSchedule = this.handleCreateSchedule.bind(this);
    this.handleTargetChange = this.handleTargetChange.bind(this);

    this.openScheduleDialog = this.openScheduleDialog.bind(this);
    this.closeScheduleDialog = this.closeScheduleDialog.bind(this);
  }

  handleCreateSchedule(data) {
    const {schedules} = this;
    const {gmp} = this.props;
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

    const {gmp} = this.props;
    gmp.alerts.getAll().then(response => {
      const {data: alerts} = response;

      log.debug('adding alert to task dialog', data.id, alerts);

      this.setState({alerts, alert_ids: [...alert_ids, data.id]});
    });
  }

  handleTargetCreated(resp) {
    const {data} = resp;
    const {gmp} = this.props;

    gmp.targets.getAll().then(reponse => {
      const {data: alltargets} = reponse;

      log.debug('adding target to task dialog', alltargets, data.id);

      this.setState({targets: alltargets, target_id: data.id});
    });
  }

  openScheduleDialog() {
    const {gmp} = this.props;
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

  handleTargetChange(target_id) {
    this.setState({target_id});
  }

  handleAlertsChange(alert_ids) {
    this.setState({alert_ids});
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
      targets,
      timezone,
    } = this.state;
    return (
      <Layout>
        <TargetComponent
          onCreated={this.handleTargetCreated}
        >
          {({create: createtarget}) => (
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
                  target_id={target_id}
                  targets={targets}
                  onNewAlertClick={createalert}
                  onNewTargetClick={createtarget}
                  onNewScheduleClick={this.openScheduleDialog}
                  onSave={onSave}
                  onTargetChange={this.handleTargetChange}
                  onAlertsChange={this.handleAlertsChange}
                />
              )}
            </AlertComponent>
          )}
        </TargetComponent>

        {scheduleDialogVisible &&
          <ScheduleDialog
            schedules={schedules}
            timezone={timezone}
            minute={minute}
            hour={hour}
            date={date}
            title={_('New Schedule')}
            onClose={this.closeScheduleDialog}
            onSave={this.handleCreateSchedule}
          />
        }
      </Layout>
    );
  }
}

TaskDialogContainer.propTypes = {
  alert_ids: PropTypes.array,
  alerts: PropTypes.array,
  gmp: PropTypes.gmp.isRequired,
  target_id: PropTypes.idOrZero,
  targets: PropTypes.array,
  onSave: PropTypes.func,
};

export default withGmp(TaskDialogContainer);

// vim: set ts=2 sw=2 tw=80:
