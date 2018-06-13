/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2018 Greenbone Networks GmbH
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
import moment from 'moment-timezone';

import _ from 'gmp/locale';
import {longDate} from 'gmp/locale/date';

import {is_defined} from 'gmp/utils/identity';

import {TASKS_FILTER_FILTER} from 'gmp/models/filter';
import {ReccurenceFrequency} from 'gmp/models/schedule';

import ScheduleChart from 'web/components/chart/schedule';

import DataDisplay from 'web/components/dashboard/display/datadisplay';
import DataTableDisplay from 'web/components/dashboard/display/datatabledisplay'; // eslint-disable-line max-len
import DataTable from 'web/components/dashboard/display/datatable';
import createDisplay from 'web/components/dashboard/display/createDisplay';
import {registerDisplay} from 'web/components/dashboard/registry';

import {TasksSchedulesLoader} from './loaders';

const today = moment().startOf('day');
const week = today.clone().add(7, 'days');

const transformScheduleData = (data = [], {endDate}) => {
  return data
    .filter(task => is_defined(task.schedule))
    .map(task => {
      const {schedule, name} = task;
      const {event = {}} = schedule;
      const {
        durationInSeconds: duration,
        recurrence = {},
      } = event;
      const {freq, interval = 1} = recurrence;
      let period;
      if (freq === ReccurenceFrequency.MINUTELY) {
        period = interval * 60;
      }
      else if (freq === ReccurenceFrequency.SECONDLY) {
        period = interval;
      }
      return {
        label: name,
        duration,
        nextStart: event.nextDate,
        starts: event.getNextDates(endDate),
        isInfinite: is_defined(recurrence.isFinite) && !recurrence.isFinite(),
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
});

export const TasksSchedulesTableDisplay = createDisplay({
  loaderComponent: TasksSchedulesLoader,
  displayComponent: DataTableDisplay,
  chartComponent: DataTable,
  dataTitles: [_('Task Name'), _('Next Schedule Time')],
  dataRow: row => [
    row.label,
    is_defined(row.nextStart) ? longDate(row.nextStart) : '-',
  ],
  dataTransform: transformScheduleData,
  title: () => _('Next Scheduled Tasks'),
  displayId: 'task-by-schedules-table',
  displayName: 'TasksSchedulesTableDisplay',
  filtersFilter: TASKS_FILTER_FILTER,
  startDate: today,
  endDate: week,
});

registerDisplay(TasksSchedulesDisplay.displayId, TasksSchedulesDisplay, {
  title: _('Chart: Next Scheduled Tasks'),
});

registerDisplay(TasksSchedulesTableDisplay.displayId,
  TasksSchedulesTableDisplay, {
    title: _('Table: Next Scheduled Tasks'),
  },
);

// vim: set ts=2 sw=2 tw=80:
