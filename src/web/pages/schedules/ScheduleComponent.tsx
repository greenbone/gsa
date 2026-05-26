/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useState} from 'react';
import {type Duration, type Date} from 'gmp/models/date';
import {
  type default as Event,
  type RecurrenceFrequencyType,
  type WeekDays,
} from 'gmp/models/event';
import type Schedule from 'gmp/models/schedule';
import {isDefined} from 'gmp/utils/identity';
import EntityComponent from 'web/entity/EntityComponent';
import {type EntityCloneResponse} from 'web/entity/hooks/useEntityClone';
import {type EntityCreateResponse} from 'web/entity/hooks/useEntityCreate';
import {type OnDownloadedFunc} from 'web/entity/hooks/useEntityDownload';
import useTranslation from 'web/hooks/useTranslation';
import useUserTimezone from 'web/hooks/useUserTimezone';
import ScheduleDialog from 'web/pages/schedules/ScheduleDialog';

interface ScheduleRenderProps {
  create: () => void;
  edit: (schedule: Schedule) => void;
}

interface ScheduleComponentProps {
  children: (props: ScheduleRenderProps) => React.ReactNode;
  onCloned?: (data: EntityCloneResponse) => void;
  onCloneError?: (error: Error) => void;
  onCreated?: (data: EntityCreateResponse) => void;
  onCreateError?: (error: Error) => void;
  onDeleted?: () => void;
  onDeleteError?: (error: Error) => void;
  onDownloaded?: OnDownloadedFunc;
  onDownloadError?: (error: Error) => void;
  onSaved?: () => void;
  onSaveError?: (error: Error) => void;
}

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
}: ScheduleComponentProps) => {
  const [_] = useTranslation();
  const [timezone] = useUserTimezone();

  const [dialogVisible, setDialogVisible] = useState<boolean>(false);

  const [comment, setComment] = useState<string | undefined>();
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [duration, setDuration] = useState<Duration | undefined>();
  const [freq, setFreq] = useState<RecurrenceFrequencyType | undefined>();
  const [id, setId] = useState<string | undefined>();
  const [interval, setInterval] = useState<number | undefined>();
  const [monthDays, setMonthDays] = useState<number[] | undefined>();
  const [name, setName] = useState<string | undefined>();
  const [title, setTitle] = useState<string | undefined>();
  const [scheduleTimezone, setScheduleTimezone] = useState<string | undefined>(
    timezone,
  );
  const [weekdays, setWeekdays] = useState<WeekDays | undefined>();

  const openCreateScheduleDialog = () => {
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
  };

  const openEditScheduleDialog = (schedule: Schedule) => {
    const {event} = schedule;
    const {
      startDate: eventStartDate,
      recurrence,
      duration: eventDuration,
      durationInSeconds,
    } = event as Event;

    const {
      interval: recInterval,
      freq: recFreq,
      monthdays: recMonthdays,
      weekdays: recWeekdays,
    } = recurrence ?? {};

    setComment(schedule.comment);
    setStartDate(eventStartDate);
    setDialogVisible(true);
    setDuration(durationInSeconds > 0 ? eventDuration : undefined);
    setFreq(recFreq);
    setId(schedule.id);
    setInterval(recInterval);
    setMonthDays(recMonthdays);
    setName(schedule.name);
    setTitle(_('Edit Schedule {{- name}}', {name: schedule.name as string}));
    setScheduleTimezone(schedule.timezone);
    setWeekdays(recWeekdays);
  };

  const closeScheduleDialog = () => {
    setDialogVisible(false);
  };

  const handleCloseScheduleDialog = () => {
    closeScheduleDialog();
  };

  return (
    <EntityComponent<Schedule>
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
            create: openCreateScheduleDialog,
            edit: openEditScheduleDialog,
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

export default ScheduleComponent;
