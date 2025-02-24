/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {_, _l} from 'gmp/locale/lang';
import date from 'gmp/models/date';
import {ReccurenceFrequency} from 'gmp/models/event';
import {TASKS_FILTER_FILTER} from 'gmp/models/filter';
import {isDefined} from 'gmp/utils/identity';
import ScheduleChart from 'web/components/chart/Schedule';
import createDisplay from 'web/components/dashboard/display/createDisplay';
import DataDisplay from 'web/components/dashboard/display/DataDisplay';
import DataTable from 'web/components/dashboard/display/DataTable';
import DataTableDisplay from 'web/components/dashboard/display/DataTableDisplay';
import {registerDisplay} from 'web/components/dashboard/Registry';
import {TasksSchedulesLoader} from 'web/pages/tasks/dashboard/Loaders';
import {formattedUserSettingDateTimeWithTimeZone} from 'web/utils/userSettingTimeDateFormatters';


const today = date().startOf('day');
const week = today.clone().add(7, 'days');

const transformScheduleData = (data = [], {endDate}) => {
  return data
    .filter(task => isDefined(task.schedule))
    .map(task => {
      const {schedule, name} = task;
      const {event = {}, timezone} = schedule;
      const {durationInSeconds: duration, recurrence = {}} = event;
      const {freq, interval = 1} = recurrence;
      let period;
      if (freq === ReccurenceFrequency.MINUTELY) {
        period = interval * 60;
      } else if (freq === ReccurenceFrequency.SECONDLY) {
        period = interval;
      }

      return {
        label: name,
        duration,
        nextStart: formattedUserSettingDateTimeWithTimeZone(event.nextDate),
        starts: event.getNextDates(endDate),
        timezone,
        isInfinite: isDefined(recurrence.isFinite) && !recurrence.isFinite(),
        period,
      };
    });
};

export const TasksSchedulesDisplay = createDisplay({
  loaderComponent: TasksSchedulesLoader,
  displayComponent: DataDisplay,
  chartComponent: ScheduleChart,
  dataTransform: transformScheduleData,
  title: () => _('Next Scheduled Tasks'),
  displayName: 'TasksScheduleDisplay',
  displayId: 'task-by-schedules',
  filtersFilter: TASKS_FILTER_FILTER,
  startDate: today,
  endDate: week,
  showToggleLegend: false,
});

export const TasksSchedulesTableDisplay = createDisplay({
  loaderComponent: TasksSchedulesLoader,
  displayComponent: DataTableDisplay,
  chartComponent: DataTable,
  dataTitles: [_l('Task Name'), _l('Next Schedule Time')],
  dataRow: row => [row.label, isDefined(row.nextStart) ? row.nextStart : '-'],
  dataTransform: transformScheduleData,
  title: () => _('Next Scheduled Tasks'),
  displayId: 'task-by-schedules-table',
  displayName: 'TasksSchedulesTableDisplay',
  filtersFilter: TASKS_FILTER_FILTER,
  startDate: today,
  endDate: week,
});

registerDisplay(TasksSchedulesDisplay.displayId, TasksSchedulesDisplay, {
  title: _l('Chart: Next Scheduled Tasks'),
});

registerDisplay(
  TasksSchedulesTableDisplay.displayId,
  TasksSchedulesTableDisplay,
  {
    title: _l('Table: Next Scheduled Tasks'),
  },
);
