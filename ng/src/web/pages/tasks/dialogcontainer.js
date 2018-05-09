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

import logger from 'gmp/log.js';

import Layout from '../../components/layout/layout.js';

import PropTypes from '../../utils/proptypes.js';
import withGmp from '../../utils/withGmp';

import ScheduleComponent from '../schedules/component.js';
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
      schedule_id,
      schedules,
    } = this.props;

    this.state = {
      alerts,
      alert_ids,
      targets,
      target_id,
      schedule_id,
      schedules,
    };

    this.handleAlertCreated = this.handleAlertCreated.bind(this);
    this.handleAlertsChange = this.handleAlertsChange.bind(this);
    this.handleTargetCreated = this.handleTargetCreated.bind(this);
    this.handleTargetChange = this.handleTargetChange.bind(this);
    this.handleScheduleCreated = this.handleScheduleCreated.bind(this);
    this.handleScheduleChange = this.handleScheduleChange.bind(this);
  }

  handleScheduleCreated(resp) {
    const {data} = resp;
    const {gmp} = this.props;

    return gmp.schedules.getAll().then(response => {
      const {data: schedules} = response;

      this.setState({
        schedules,
        schedule_id: data.id,
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

  handleTargetChange(target_id) {
    this.setState({target_id});
  }

  handleAlertsChange(alert_ids) {
    this.setState({alert_ids});
  }

  handleScheduleChange(schedule_id) {
    this.setState({schedule_id});
  }

  render() {
    const {onSave, ...props} = this.props;
    const {
      alerts,
      alert_ids,
      schedules,
      schedule_id,
      target_id,
      targets,
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
                <ScheduleComponent
                  onCreated={this.handleScheduleCreated}
                >
                  {({
                    create: createschedule,
                  }) => (
                    <TaskDialog
                      {...props}
                      alerts={alerts}
                      alert_ids={alert_ids}
                      target_id={target_id}
                      targets={targets}
                      schedule_id={schedule_id}
                      schedules={schedules}
                      onNewAlertClick={createalert}
                      onNewTargetClick={createtarget}
                      onNewScheduleClick={createschedule}
                      onSave={onSave}
                      onTargetChange={this.handleTargetChange}
                      onAlertsChange={this.handleAlertsChange}
                      onScheduleChange={this.handleScheduleChange}
                    />
                  )}
                </ScheduleComponent>
              )}
            </AlertComponent>
          )}
        </TargetComponent>
      </Layout>
    );
  }
}

TaskDialogContainer.propTypes = {
  alert_ids: PropTypes.array,
  alerts: PropTypes.array,
  gmp: PropTypes.gmp.isRequired,
  schedule_id: PropTypes.idOrZero,
  schedules: PropTypes.array,
  target_id: PropTypes.idOrZero,
  targets: PropTypes.array,
  onSave: PropTypes.func,
};

export default withGmp(TaskDialogContainer);

// vim: set ts=2 sw=2 tw=80:
