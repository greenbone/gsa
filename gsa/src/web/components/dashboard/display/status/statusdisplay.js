/* Copyright (C) 2019-2021 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License
 * as published by the Free Software Foundation, either version 3
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */
import React from 'react';

import Filter from 'gmp/models/filter';
import FilterTerm from 'gmp/models/filter/filterterm';

import {isDefined} from 'gmp/utils/identity';

import DonutChart from 'web/components/chart/donut';

import DataDisplay from 'web/components/dashboard/display/datadisplay';
import {renderDonutChartIcons} from 'web/components/dashboard/display/datadisplayicons';

import PropTypes from 'web/utils/proptypes';

class StatusDisplay extends React.Component {
  constructor(...args) {
    super(...args);

    this.handleDataClick = this.handleDataClick.bind(this);
  }

  handleDataClick(data) {
    const {onFilterChanged, filter, filterTerm = 'status'} = this.props;
    const {filterValue} = data;

    if (isDefined(filterValue) && isDefined(onFilterChanged)) {
      const statusTerm = FilterTerm.fromString(
        `${filterTerm}="${filterValue}"`,
      );

      if (isDefined(filter) && filter.hasTerm(statusTerm)) {
        return;
      }

      const statusFilter = Filter.fromTerm(statusTerm);
      const newFilter = isDefined(filter)
        ? filter.copy().and(statusFilter)
        : statusFilter;

      onFilterChanged(newFilter);
    }
  }

  render() {
    const {filter, onFilterChanged, ...props} = this.props;
    return (
      <DataDisplay
        {...props}
        initialState={{
          show3d: true,
        }}
        filter={filter}
        icons={renderDonutChartIcons}
      >
        {({width, height, data: tdata, svgRef, state}) => (
          <DonutChart
            svgRef={svgRef}
            width={width}
            height={height}
            data={tdata}
            show3d={state.show3d}
            showLegend={state.showLegend}
            onDataClick={
              isDefined(onFilterChanged) ? this.handleDataClick : undefined
            }
            onLegendItemClick={
              isDefined(onFilterChanged) ? this.handleDataClick : undefined
            }
          />
        )}
      </DataDisplay>
    );
  }
}

StatusDisplay.propTypes = {
  filter: PropTypes.filter,
  filterTerm: PropTypes.string,
  onFilterChanged: PropTypes.func,
};

export default StatusDisplay;
