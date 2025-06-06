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
  onInteraction,
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

    handleInteraction();
  };

  const closeScheduleDialog = () => {
    setDialogVisible(false);
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
      onInteraction={onInteraction}
      onSaveError={onSaveError}
      onSaved={onSaved}
    >
      {({save, ...other}) => (
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
                handleInteraction();
                return save(d).then(() => closeScheduleDialog());
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
  onInteraction: PropTypes.func.isRequired,
  onSaveError: PropTypes.func,
  onSaved: PropTypes.func,
};

export default ScheduleComponent;
