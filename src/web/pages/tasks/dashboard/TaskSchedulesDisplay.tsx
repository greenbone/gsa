/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {_, _l} from 'gmp/locale/lang';
import date, {type Date} from 'gmp/models/date';
import {RecurrenceFrequency, type default as Event} from 'gmp/models/event';
import {TASKS_FILTER_FILTER} from 'gmp/models/filter';
import {isDefined} from 'gmp/utils/identity';
import ScheduleChart from 'web/components/chart/ScheduleChart';
import createDisplay from 'web/components/dashboard/display/createDisplay';
import DataDisplay, {
  type DataDisplayProps,
} from 'web/components/dashboard/display/DataDisplay';
import DataTableDisplay from 'web/components/dashboard/display/DataTableDisplay';
import {registerDisplay} from 'web/components/dashboard/registry';
import {
  type TaskScheduleData,
  TasksSchedulesLoader,
} from 'web/pages/tasks/dashboard/TaskLoaders';
import {formattedUserSettingDateTimeWithTimeZone} from 'web/utils/user-setting-time-date-formatters';

interface TransformedTaskScheduleDataItem {
  color: string;
  label: string;
  duration: number;
  nextStart?: string;
  starts: Date[];
  timezone?: string;
  isInfinite: boolean;
  period?: number;
}

type TransformedTaskScheduleData = TransformedTaskScheduleDataItem[];

const today = date().startOf('day');
const week = today.clone().add(7, 'days');

const transformScheduleData = (
  data: TaskScheduleData | undefined = [],
): TransformedTaskScheduleData => {
  return data
    .filter(task => isDefined(task.schedule))
    .map(task => {
      const {schedule, name} = task;
      const event = schedule?.event as Event;
      const timezone = schedule?.timezone;
      const {durationInSeconds: duration, recurrence} = event;
      const {freq, interval = 1} = recurrence;
      let period: number | undefined;
      if (freq === RecurrenceFrequency.MINUTELY) {
        period = interval * 60;
      } else if (freq === RecurrenceFrequency.SECONDLY) {
        period = interval;
      }

      return {
        label: name,
        duration,
        nextStart: formattedUserSettingDateTimeWithTimeZone(event.nextDate),
        starts: event.getNextDates(week),
        timezone,
        isInfinite: isDefined(freq),
        period,
      } as TransformedTaskScheduleDataItem;
    });
};

export const TasksSchedulesDisplay = createDisplay({
  loaderComponent: TasksSchedulesLoader,
  displayComponent: props => (
    <DataDisplay<
      TaskScheduleData,
      DataDisplayProps<TaskScheduleData, TransformedTaskScheduleData>,
      TransformedTaskScheduleData
    >
      {...props}
      dataTransform={transformScheduleData}
      showToggleLegend={false}
      title={() => _('Next Scheduled Tasks')}
    >
      {chartProps => <ScheduleChart {...chartProps} />}
    </DataDisplay>
  ),
  displayId: 'task-by-schedules',
  displayName: 'TasksScheduleDisplay',
  filtersFilter: TASKS_FILTER_FILTER,
});

export const TasksSchedulesTableDisplay = createDisplay({
  loaderComponent: TasksSchedulesLoader,
  displayComponent: props => (
    <DataTableDisplay
      {...props}
      dataRow={row => [
        row.label,
        isDefined(row.nextStart) ? row.nextStart : '-',
      ]}
      dataTitles={[_('Task Name'), _('Next Schedule Time')]}
      dataTransform={transformScheduleData}
      endDate={week}
      title={() => _('Next Scheduled Tasks')}
    />
  ),
  displayId: 'task-by-schedules-table',
  displayName: 'TasksSchedulesTableDisplay',
  filtersFilter: TASKS_FILTER_FILTER,
});

registerDisplay(TasksSchedulesDisplay, _l('Chart: Next Scheduled Tasks'));

registerDisplay(TasksSchedulesTableDisplay, _l('Table: Next Scheduled Tasks'));
