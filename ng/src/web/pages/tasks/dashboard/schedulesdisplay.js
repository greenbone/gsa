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
import _, {datetime} from 'gmp/locale';

import {is_defined} from 'gmp/utils/identity';

import ScheduleChart from 'web/components/chart/schedule';

import DataDisplay from 'web/components/dashboard2/display/datadisplay';
import DataTableDisplay from 'web/components/dashboard2/display/datatabledisplay'; // eslint-disable-line max-len
import DataTable from 'web/components/dashboard2/display/datatable';
import createDisplay from 'web/components/dashboard2/display/createDisplay';
import {registerDisplay} from 'web/components/dashboard2/registry';

import {TasksSchedulesLoader} from './loaders';

const transformScheduleData = (data = []) => {
  return data
    .filter(task => is_defined(task.schedule))
    .map(task => {
      const {schedule, name} = task;
      return {
        label: name,
        start: schedule.next_time,
        duration: schedule.duration,
        period: schedule.period,
        periods: schedule.periods,
        periodMonth: schedule.period_months,
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
});

export const TasksSchedulesTableDisplay = createDisplay({
  loaderComponent: TasksSchedulesLoader,
  displayComponent: DataTableDisplay,
  chartComponent: DataTable,
  dataTitles: [_('Task Name'), _('Next Schedule Time')],
  dataRow: row => [row.label, datetime(row.start)],
  dataTransform: transformScheduleData,
  title: () => _('Next Scheduled Tasks'),
  displayId: 'task-by-schedules-table',
  displayName: 'TasksSchedulesTableDisplay',
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
