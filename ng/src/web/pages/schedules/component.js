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

import {is_defined} from 'gmp/utils';

import PropTypes from '../../utils/proptypes.js';
import withGmp from '../../utils/withGmp.js';

import Wrapper from '../../components/layout/wrapper.js';

import EntityComponent from '../../entity/component.js';

import ScheduleDialog from './dialog.js';

class ScheduleComponent extends React.Component {

  constructor(...args) {
    super(...args);

    this.state = {dialogVisible: false};

    this.closeScheduleDialog = this.closeScheduleDialog.bind(this);
    this.openScheduleDialog = this.openScheduleDialog.bind(this);
  }

  openScheduleDialog(schedule) {
    const {gmp} = this.props;

    if (is_defined(schedule)) {
      const date = schedule.first_time;

      this.setState({
        comment: schedule.comment,
        date,
        dialogVisible: true,
        duration: schedule.simple_duration.value,
        duration_unit: is_defined(schedule.simple_duration.unit) ?
          schedule.simple_duration.unit : 'hour',
        hour: date.hours(),
        id: schedule.id,
        minute: date.minutes(),
        name: schedule.name,
        period: schedule.simple_period.value,
        period_unit: is_defined(schedule.simple_period.unit) ?
          schedule.simple_period.unit : 'hour',
        title: _('Edit Schedule {{name}}', {name: schedule.name}),
      });
    }
    else {
      const {timezone} = gmp.globals;
      const now = moment().tz(timezone);
      this.setState({
        comment: undefined,
        dialogVisible: true,
        duration: undefined,
        duration_unit: undefined,
        id: undefined,
        name: undefined,
        period: undefined,
        period_unit: undefined,
        schedule: undefined,
        timezone,
        title: undefined,
        minute: now.minutes(),
        hour: now.hours(),
        date: now,
      });
    }
  }

  closeScheduleDialog() {
    this.setState({dialogVisible: false});
  }

  render() {
    const {
      children,
      onCloned,
      onCloneError,
      onCreated,
      onCreateError,
      onDeleted,
      onDeleteError,
      onDownloaded,
      onDownloadError,
      onSaved,
      onSaveError,
    } = this.props;

    const {
      comment,
      date,
      hour,
      dialogVisible,
      duration,
      duration_unit,
      id,
      minute,
      name,
      period,
      period_unit,
      schedule,
      timezone,
      title,
    } = this.state;

    return (
      <EntityComponent
        name="schedule"
        onCreated={onCreated}
        onCreateError={onCreateError}
        onCloned={onCloned}
        onCloneError={onCloneError}
        onDeleted={onDeleted}
        onDeleteError={onDeleteError}
        onDownloaded={onDownloaded}
        onDownloadError={onDownloadError}
        onSaved={onSaved}
        onSaveError={onSaveError}
      >
        {({
          save,
          ...other
        }) => (
          <Wrapper>
            {children({
              ...other,
              create: this.openScheduleDialog,
              edit: this.openScheduleDialog,
            })}
            {dialogVisible &&
              <ScheduleDialog
                comment={comment}
                date={date}
                duration={duration}
                duration_unit={duration_unit}
                hour={hour}
                id={id}
                minute={minute}
                name={name}
                period={period}
                period_unit={period_unit}
                schedule={schedule}
                timezone={timezone}
                title={title}
                onClose={this.closeScheduleDialog}
                onSave={save}
              />
            }
          </Wrapper>
        )}
      </EntityComponent>
    );
  }
}

ScheduleComponent.propTypes = {
  children: PropTypes.func.isRequired,
  gmp: PropTypes.gmp.isRequired,
  onCloneError: PropTypes.func,
  onCloned: PropTypes.func,
  onCreateError: PropTypes.func,
  onCreated: PropTypes.func,
  onDeleteError: PropTypes.func,
  onDeleted: PropTypes.func,
  onDownloadError: PropTypes.func,
  onDownloaded: PropTypes.func,
  onSaveError: PropTypes.func,
  onSaved: PropTypes.func,
};

export default withGmp(ScheduleComponent);

// vim: set ts=2 sw=2 tw=80:
