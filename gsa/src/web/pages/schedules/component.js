/* Copyright (C) 2017-2021 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License
 * as published by the Free Software Foundation, either version 3
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */
import React, {useReducer} from 'react';

import {useSelector} from 'react-redux';

import _ from 'gmp/locale';

import {isDefined} from 'gmp/utils/identity';

import EntityComponent from 'web/entity/component';

import {useCreateSchedule, useModifySchedule} from 'web/graphql/schedules';

import {getTimezone} from 'web/store/usersettings/selectors';

import reducer, {updateState} from 'web/utils/stateReducer';
import PropTypes from 'web/utils/proptypes';

import ScheduleDialog from './dialog';

const ScheduleComponent = ({
  children,
  onCloned,
  onCloneError,
  onCreated,
  onCreateError,
  onDeleted,
  onDeleteError,
  onDownloaded,
  onDownloadError,
  onInteraction,
  onSaved,
  onSaveError,
}) => {
  const [state, dispatch] = useReducer(reducer, {dialogVisible: false});
  const timezone = useSelector(getTimezone);
  const [createSchedule] = useCreateSchedule();
  const [modifySchedule] = useModifySchedule();

  const openScheduleDialog = schedule => {
    if (isDefined(schedule)) {
      const {event} = schedule;
      const {startDate, recurrence = {}, duration, durationInSeconds} = event;

      const {interval, freq, monthdays, weekdays} = recurrence;

      dispatch(
        updateState({
          comment: schedule.comment,
          startDate,
          dialogVisible: true,
          duration: durationInSeconds > 0 ? duration : undefined,
          freq,
          id: schedule.id,
          interval,
          monthdays,
          name: schedule.name,
          title: _('Edit Schedule {{name}}', {name: schedule.name}),
          timezone: schedule.timezone,
          weekdays,
        }),
      );
    } else {
      dispatch(
        updateState({
          comment: undefined,
          dialogVisible: true,
          duration: undefined,
          freq: undefined,
          id: undefined,
          interval: undefined,
          monthdays: undefined,
          name: undefined,
          startDate: undefined,
          timezone,
          title: undefined,
          weekdays: undefined,
        }),
      );
    }

    handleInteraction();
  };

  const closeScheduleDialog = () => {
    dispatch(updateState({dialogVisible: false}));
  };

  const handleCloseScheduleDialog = () => {
    closeScheduleDialog();
    handleInteraction();
  };

  const handleInteraction = () => {
    if (isDefined(onInteraction)) {
      onInteraction();
    }
  };

  const handleSaveSchedule = data => {
    handleInteraction();

    const {id, ...other} = data;

    if (isDefined(id)) {
      return modifySchedule(data)
        .then(onSaved, onSaveError)
        .then(() => closeScheduleDialog());
    }

    return createSchedule(other)
      .then(onCreated, onCreateError)
      .then(() => closeScheduleDialog());
  };

  const {dialogVisible, ...dialogProps} = state;

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
      onInteraction={onInteraction}
      onSaved={onSaved}
      onSaveError={onSaveError}
    >
      {({save, ...other}) => (
        <React.Fragment>
          {children({
            ...other,
            create: openScheduleDialog,
            edit: openScheduleDialog,
          })}
          {dialogVisible && (
            <ScheduleDialog
              {...dialogProps}
              onClose={handleCloseScheduleDialog}
              onSave={handleSaveSchedule}
            />
          )}
        </React.Fragment>
      )}
    </EntityComponent>
  );
};

ScheduleComponent.propTypes = {
  children: PropTypes.func.isRequired,
  onCloneError: PropTypes.func,
  onCloned: PropTypes.func,
  onCreateError: PropTypes.func,
  onCreated: PropTypes.func,
  onDeleteError: PropTypes.func,
  onDeleted: PropTypes.func,
  onDownloadError: PropTypes.func,
  onDownloaded: PropTypes.func,
  onInteraction: PropTypes.func.isRequired,
  onSaveError: PropTypes.func,
  onSaved: PropTypes.func,
};

export default ScheduleComponent;

// vim: set ts=2 sw=2 tw=80:
