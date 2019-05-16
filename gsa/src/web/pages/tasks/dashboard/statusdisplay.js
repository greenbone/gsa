/* Copyright (C) 2018-2019 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
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
import {scaleOrdinal} from 'd3-scale';

import {interpolateHcl} from 'd3-interpolate';

import {_, _l} from 'gmp/locale/lang';

import {TASKS_FILTER_FILTER} from 'gmp/models/filter';
import {getTranslatableTaskStatus, TASK_STATUS} from 'gmp/models/task';

import {registerDisplay} from 'web/components/dashboard/registry';
import {totalCount, percent} from 'web/components/dashboard/display/utils';

import createDisplay from 'web/components/dashboard/display/createDisplay';
import DataTable from 'web/components/dashboard/display/datatable';
import DataTableDisplay from 'web/components/dashboard/display/datatabledisplay'; // eslint-disable-line max-len

import StatusDisplay from 'web/components/dashboard/display/status/statusdisplay'; // eslint-disable-line max-len

import {TaskStatusLoader} from './loaders';

const red = interpolateHcl('#d62728', '#ff9896');
const green = interpolateHcl('#2ca02c', '#98df8a');
const blue = interpolateHcl('#aec7e8', '#1f77b4');
const orange = interpolateHcl('#ff7f0e', '#ffbb78');

const taskStatusColorScale = scaleOrdinal()
  .domain([
    TASK_STATUS.deleterequested,
    TASK_STATUS.ultimatedeleterequested,
    TASK_STATUS.interrupted,
    TASK_STATUS.new,
    TASK_STATUS.requested,
    TASK_STATUS.running,
    TASK_STATUS.stoprequested,
    TASK_STATUS.stopped,
    TASK_STATUS.done,
    'N/A',
  ])
  .range([
    red(1.0),
    red(0.5),
    red(0.0),
    green(1.0),
    green(0.5),
    green(0.0),
    orange(1.0),
    orange(0.0),
    blue(0.5),
    'silver',
  ]);

const transformStatusData = (data = {}) => {
  const {groups = []} = data;

  const sum = totalCount(groups);

  const tdata = groups.map(group => {
    const {count, value} = group;
    const translatableValue = getTranslatableTaskStatus(value);
    const perc = percent(count, sum);
    return {
      value: count,
      label: translatableValue,
      toolTip: `${translatableValue}: ${perc}% (${count})`,
      color: taskStatusColorScale(value),
      filterValue: value,
    };
  });

  tdata.total = sum;

  return tdata;
};

export const TasksStatusDisplay = createDisplay({
  dataTransform: transformStatusData,
  displayComponent: StatusDisplay,
  displayId: 'task-by-status',
  title: ({data: tdata}) =>
    _('Tasks by Status (Total: {{count}})', {count: tdata.total}),
  filtersFilter: TASKS_FILTER_FILTER,
  loaderComponent: TaskStatusLoader,
});

export const TasksStatusTableDisplay = createDisplay({
  chartComponent: DataTable,
  displayComponent: DataTableDisplay,
  loaderComponent: TaskStatusLoader,
  dataTransform: transformStatusData,
  dataTitles: [_l('Status'), _l('# of Tasks')],
  dataRow: row => [row.label, row.value],
  title: ({data: tdata}) =>
    _('Tasks by Status (Total: {{count}})', {count: tdata.total}),
  displayId: 'task-by-status-table',
  displayName: 'TasksStatusTableDisplay',
  filtersFilter: TASKS_FILTER_FILTER,
});

registerDisplay(TasksStatusDisplay.displayId, TasksStatusDisplay, {
  title: _l('Chart: Tasks by Status'),
});

registerDisplay(TasksStatusTableDisplay.displayId, TasksStatusTableDisplay, {
  title: _l('Table: Tasks by Status'),
});

// vim: set ts=2 sw=2 tw=80:
