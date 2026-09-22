/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {interpolateHcl} from 'd3-interpolate';
import {scaleOrdinal} from 'd3-scale';
import {_, _l} from 'gmp/locale/lang';
import {TASKS_FILTER_FILTER} from 'gmp/models/filter';
import {
  getTranslatableTaskStatus,
  TASK_STATUS,
  type TaskStatus,
} from 'gmp/models/task';
import createDisplay from 'web/components/dashboard/display/createDisplay';
import DataTableDisplay from 'web/components/dashboard/display/DataTableDisplay';
import StatusDisplay from 'web/components/dashboard/display/status/StatusDisplay';
import {totalCount, percent} from 'web/components/dashboard/display/utils';
import {registerDisplay} from 'web/components/dashboard/registry';
import {
  type TaskStatusData,
  TaskStatusLoader,
} from 'web/pages/tasks/dashboard/TaskLoaders';
import Theme from 'web/utils/theme';

interface TransformedTaskStatusDataItem {
  value: number;
  label: string;
  toolTip: string;
  color: string;
  filterValue: string;
}

interface TransformedTaskStatusData extends Array<TransformedTaskStatusDataItem> {
  total: number;
}

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
    TASK_STATUS.queued,
    TASK_STATUS.running,
    TASK_STATUS.stoprequested,
    TASK_STATUS.stopped,
    TASK_STATUS.done,
    TASK_STATUS.processing,
    'N/A',
  ])
  .range([
    red(1.0),
    red(0.5),
    red(0.0),
    green(1.0),
    green(0.5),
    Theme.severityWarnYellow,
    green(0.0),
    orange(1.0),
    orange(0.0),
    blue(0.5),
    green(-0.5),
    'silver',
  ]);

const transformStatusData = (
  data: TaskStatusData = {},
): TransformedTaskStatusData => {
  const {groups = []} = data;

  const sum = totalCount(groups);

  const transformedData = groups.map(group => {
    const {count, value} = group;
    const translatableValue = getTranslatableTaskStatus(value as TaskStatus);
    const perc = percent(count, sum);
    return {
      value: count,
      label: translatableValue,
      toolTip: `${translatableValue}: ${perc}% (${count})`,
      color: taskStatusColorScale(value),
      filterValue: value,
    } as TransformedTaskStatusDataItem;
  });

  const result = transformedData as TransformedTaskStatusData;
  result.total = sum;
  return result;
};

export const TasksStatusDisplay = createDisplay({
  loaderComponent: TaskStatusLoader,
  displayComponent: props => (
    <StatusDisplay
      {...props}
      dataTransform={transformStatusData}
      title={({data}) =>
        _('Tasks by Status (Total: {{count}})', {count: data.total})
      }
    />
  ),
  displayId: 'task-by-status',
  filtersFilter: TASKS_FILTER_FILTER,
});

export const TasksStatusTableDisplay = createDisplay({
  loaderComponent: TaskStatusLoader,
  displayComponent: props => (
    <DataTableDisplay
      {...props}
      dataRow={row => [row.label, row.value]}
      dataTitles={[_('Status'), _('# of Tasks')]}
      dataTransform={transformStatusData}
      title={({data}) =>
        _('Tasks by Status (Total: {{count}})', {count: data.total})
      }
    />
  ),
  displayId: 'task-by-status-table',
  displayName: 'TasksStatusTableDisplay',
  filtersFilter: TASKS_FILTER_FILTER,
});

registerDisplay(TasksStatusDisplay, _l('Chart: Tasks by Status'));

registerDisplay(TasksStatusTableDisplay, _l('Table: Tasks by Status'));
