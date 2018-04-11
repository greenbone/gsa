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

import Filter from 'gmp/models/filter';

import {is_defined} from 'gmp/utils/identity';

import PropTypes from '../../../utils/proptypes';

import DonutChart from '../../../components/chart/donut3d';

import DataDisplay from '../../../components/dashboard2/display/datadisplay';
import {
  totalCount,
  percent,
} from '../../../components/dashboard2/display/utils';

import {TaskStatusLoader} from './loaders';
import FilterTerm from 'gmp/models/filter/filterterm';

const red = interpolateHcl('#d62728', '#ff9896');
const green = interpolateHcl('#2ca02c', '#98df8a');
const blue = interpolateHcl('#aec7e8', '#1f77b4');
const orange = interpolateHcl('#ff7f0e', '#ffbb78');

const taskStatusColorScale = scaleOrdinal()
  .domain([
    'Delete Requested',
    'Ultimate Delete Requested',
    'Internal Error',
    'New',
    'Requested',
    'Running',
    'Stop Requested',
    'Stopped',
    'Done',
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

class TasksStatusDisplay extends React.Component {

  constructor(...args) {
    super(...args);

    this.handleDataClick = this.handleDataClick.bind(this);
  }

  handleDataClick(data) {
    const {onFilterChanged, filter} = this.props;
    const {filterValue} = data;

    if (is_defined(filterValue) && is_defined(onFilterChanged)) {
      const statusTerm = FilterTerm.fromString(`status="${filterValue}"`);

      if (is_defined(filter) && filter.hasTerm(statusTerm)) {
        return;
      }

      const statusFilter = Filter.fromTerm(statusTerm);
      const newFilter = is_defined(filter) ? filter.copy().and(statusFilter) :
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
        {({data}) => (
          <DataDisplay
            {...props}
            data={data}
            dataTransform={transformStatusData}
            title={({data: tdata}) =>
              _('Tasks by Status (Total: {{count}})', {count: tdata.total})}
          >
            {({width, height, data: tdata}) => (
              <DonutChart
                width={width}
                height={height}
                data={tdata}
                onDataClick={this.handleDataClick}
                onLegendItemClick={this.handleDataClick}
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
  onFilterChanged: PropTypes.func.isRequired,
};

export default TasksStatusDisplay;

// vim: set ts=2 sw=2 tw=80:
