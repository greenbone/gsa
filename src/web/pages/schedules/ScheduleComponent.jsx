/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useState} from 'react';
import {useSelector} from 'react-redux';
import {isDefined} from 'gmp/utils/identity';
import EntityComponent from 'web/entity/EntityComponent';
import useTranslation from 'web/hooks/useTranslation';
import ScheduleDialog from 'web/pages/schedules/Dialog';
import {getTimezone} from 'web/store/usersettings/selectors';
import PropTypes from 'web/utils/PropTypes';

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
  onSaved,
  onSaveError,
}) => {
  const [_] = useTranslation();
  const timezone = useSelector(getTimezone);

  const [dialogVisible, setDialogVisible] = useState(false);

  const [comment, setComment] = useState();
  const [startDate, setStartDate] = useState();
  const [duration, setDuration] = useState();
  const [freq, setFreq] = useState();
  const [id, setId] = useState();
  const [interval, setInterval] = useState();
  const [monthDays, setMonthDays] = useState();
  const [name, setName] = useState();
  const [title, setTitle] = useState();
  const [scheduleTimezone, setScheduleTimezone] = useState(timezone);
  const [weekdays, setWeekdays] = useState();

  const openScheduleDialog = schedule => {
    if (isDefined(schedule)) {
      const {event} = schedule;
      const {
        startDate: eventStartDate,
        recurrence = {},
        duration: eventDuration,
        durationInSeconds,
      } = event;

      const {
        interval: recInterval,
        freq: recFreq,
        monthdays: recMonthdays,
        weekdays: recWeekdays,
      } = recurrence;

      setComment(schedule.comment);
      setStartDate(eventStartDate);
      setDialogVisible(true);
      setDuration(durationInSeconds > 0 ? eventDuration : undefined);
      setFreq(recFreq);
      setId(schedule.id);
      setInterval(recInterval);
      setMonthDays(recMonthdays);
      setName(schedule.name);
      setTitle(_('Edit Schedule {{name}}', {name: schedule.name}));
      setScheduleTimezone(schedule.timezone);
      setWeekdays(recWeekdays);
    } else {
      setComment(undefined);
      setDialogVisible(true);
      setDuration(undefined);
      setFreq(undefined);
      setId(undefined);
      setInterval(undefined);
      setMonthDays(undefined);
      setName(undefined);
      setStartDate(undefined);
      setScheduleTimezone(timezone);
      setTitle(undefined);
      setWeekdays(undefined);
    }
  };

  const closeScheduleDialog = () => {
    setDialogVisible(false);
  };

  const handleCloseScheduleDialog = () => {
    closeScheduleDialog();
  };

  return (
    <EntityComponent
      name="schedule"
      onCloneError={onCloneError}
      onCloned={onCloned}
      onCreateError={onCreateError}
      onCreated={onCreated}
      onDeleteError={onDeleteError}
      onDeleted={onDeleted}
      onDownloadError={onDownloadError}
      onDownloaded={onDownloaded}
      onSaveError={onSaveError}
      onSaved={onSaved}
    >
      {({save, create, ...other}) => (
        <>
          {children({
            ...other,
            create: openScheduleDialog,
            edit: openScheduleDialog,
          })}
          {dialogVisible && (
            <ScheduleDialog
              comment={comment}
              duration={duration}
              freq={freq}
              id={id}
              interval={interval}
              monthdays={monthDays}
              name={name}
              startDate={startDate}
              timezone={scheduleTimezone}
              title={title}
              weekdays={weekdays}
              onClose={handleCloseScheduleDialog}
              onSave={d => {
                const promise = isDefined(d.id) ? save(d) : create(d);
                return promise.then(() => closeScheduleDialog());
              }}
            />
          )}
        </>
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
  onSaveError: PropTypes.func,
  onSaved: PropTypes.func,
};

export default ScheduleComponent;
