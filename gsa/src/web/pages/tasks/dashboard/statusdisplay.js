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
import React from 'react';

import {scaleOrdinal} from 'd3-scale';

import {interpolateHcl} from 'd3-interpolate';

import _ from 'gmp/locale';

import Filter, {TASKS_FILTER_FILTER} from 'gmp/models/filter';
import {TASK_STATUS} from 'gmp/models/task';

import {isDefined} from 'gmp/utils/identity';

import FilterTerm from 'gmp/models/filter/filterterm';

import PropTypes from 'web/utils/proptypes';

import DonutChart from 'web/components/chart/donut3d';

import DataDisplay from 'web/components/dashboard/display/datadisplay';
import DataTable from 'web/components/dashboard/display/datatable';
import DataTableDisplay from 'web/components/dashboard/display/datatabledisplay'; // eslint-disable-line max-len
import createDisplay from 'web/components/dashboard/display/createDisplay';
import withFilterSelection from 'web/components/dashboard/display/withFilterSelection'; // eslint-disable-line max-len
import {registerDisplay} from 'web/components/dashboard/registry';
import {
  totalCount,
  percent,
} from 'web/components/dashboard/display/utils';

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
    const perc = percent(count, sum);
    return {
      value: count,
      label: value,
      toolTip: `${value}: ${perc}% (${count})`,
      color: taskStatusColorScale(value),
      filterValue: value,
    };
  });

  tdata.total = sum;

  return tdata;
};

export class TasksStatusDisplay extends React.Component {

  constructor(...args) {
    super(...args);

    this.handleDataClick = this.handleDataClick.bind(this);
  }

  handleDataClick(data) {
    const {onFilterChanged, filter} = this.props;
    const {filterValue} = data;

    if (isDefined(filterValue) && isDefined(onFilterChanged)) {
      const statusTerm = FilterTerm.fromString(`status="${filterValue}"`);

      if (isDefined(filter) && filter.hasTerm(statusTerm)) {
        return;
      }

      const statusFilter = Filter.fromTerm(statusTerm);
      const newFilter = isDefined(filter) ? filter.copy().and(statusFilter) :
        statusFilter;

      onFilterChanged(newFilter);
    }
  }

  render() {
    const {
      filter,
      onFilterChanged,
      ...props
    } = this.props;
    return (
      <TaskStatusLoader
        filter={filter}
      >
        {loaderProps => (
          <DataDisplay
            {...props}
            {...loaderProps}
            filter={filter}
            dataTransform={transformStatusData}
            title={({data: tdata}) =>
              _('Tasks by Status (Total: {{count}})', {count: tdata.total})}
          >
            {({width, height, data: tdata, svgRef}) => (
              <DonutChart
                svgRef={svgRef}
                width={width}
                height={height}
                data={tdata}
                onDataClick={isDefined(onFilterChanged) ?
                  this.handleDataClick : undefined}
                onLegendItemClick={isDefined(onFilterChanged) ?
                  this.handleDataClick : undefined}
              />
            )}
          </DataDisplay>
        )}
      </TaskStatusLoader>
    );
  }
}

TasksStatusDisplay.propTypes = {
  filter: PropTypes.filter,
  onFilterChanged: PropTypes.func,
};

TasksStatusDisplay.displayId = 'task-by-status';

TasksStatusDisplay = withFilterSelection({
  filtersFilter: TASKS_FILTER_FILTER,
})(TasksStatusDisplay);

export const TasksStatusTableDisplay = createDisplay({
  chartComponent: DataTable,
  displayComponent: DataTableDisplay,
  loaderComponent: TaskStatusLoader,
  dataTransform: transformStatusData,
  dataTitles: [_('Status'), _('# of Tasks')],
  dataRow: row => [row.label, row.value],
  title: ({data: tdata}) =>
    _('Tasks by Status (Total: {{count}})', {count: tdata.total}),
  displayId: 'task-by-status-table',
  displayName: 'TasksStatusTableDisplay',
  filtersFilter: TASKS_FILTER_FILTER,
});

registerDisplay(TasksStatusDisplay.displayId, TasksStatusDisplay, {
  title: _('Chart: Tasks by Status'),
});

registerDisplay(TasksStatusTableDisplay.displayId, TasksStatusTableDisplay, {
  title: _('Table: Tasks by Status'),
});

// vim: set ts=2 sw=2 tw=80:
