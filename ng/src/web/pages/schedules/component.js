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

import _ from 'gmp/locale';

import {is_defined} from 'gmp/utils';

import {ReccurenceFrequency} from 'gmp/models/event';

import PropTypes from '../../utils/proptypes.js';
import withGmp from '../../utils/withGmp.js';

import Wrapper from '../../components/layout/wrapper.js';

import EntityComponent from '../../entity/component.js';

import ScheduleDialog from './dialog.js';

const PERIOD_UNIT = {
  [ReccurenceFrequency.MINUTELY]: 'minute',
  [ReccurenceFrequency.HOURLY]: 'hour',
  [ReccurenceFrequency.DAILY]: 'day',
  [ReccurenceFrequency.WEEKLY]: 'week',
  [ReccurenceFrequency.MONTHLY]: 'month',
};

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
      const {event} = schedule;
      const {startDate, recurrence = {}, duration, durationInSeconds} = event;
      const {freq, interval = 1} = recurrence;

      this.setState({
        comment: schedule.comment,
        startDate,
        dialogVisible: true,
        duration: durationInSeconds > 0 ? duration : undefined,
        id: schedule.id,
        name: schedule.name,
        period: is_defined(freq) ? interval : undefined,
        period_unit: is_defined(freq) ? PERIOD_UNIT[freq] : 'hour',
        title: _('Edit Schedule {{name}}', {name: schedule.name}),
        timezone: schedule.timezone,
      });
    }
    else {
      const {timezone} = gmp.globals;
      this.setState({
        comment: undefined,
        dialogVisible: true,
        duration: undefined,
        duration_unit: undefined,
        id: undefined,
        name: undefined,
        period: undefined,
        period_unit: undefined,
        startDate: undefined,
        timezone,
        title: undefined,
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
      startDate,
      dialogVisible,
      duration,
      id,
      name,
      period,
      period_unit,
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
                startDate={startDate}
                duration={duration}
                id={id}
                name={name}
                period={period}
                period_unit={period_unit}
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
