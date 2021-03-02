/* Copyright (C) 2018-2021 Greenbone Networks GmbH
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

import LineChart, {lineDataPropType} from 'web/components/chart/line';

import DataDisplay from 'web/components/dashboard/display/datadisplay';

import PropTypes from 'web/utils/proptypes';

import transformCreated from './createdtransform';

class CreatedDisplay extends React.Component {
  constructor(...args) {
    super(...args);

    this.handleRangeSelect = this.handleRangeSelect.bind(this);
  }

  handleRangeSelect(start, end) {
    const {filter, onFilterChanged} = this.props;

    if (!isDefined(onFilterChanged)) {
      return;
    }

    let {x: startDate} = start;
    let {x: endDate} = end;
    const dateFormat = 'YYYY-MM-DDTHH:mm';

    let newFilter = isDefined(filter) ? filter.copy() : new Filter();

    if (isDefined(startDate)) {
      if (startDate.isSame(endDate)) {
        startDate = startDate.clone().subtract(1, 'day');
        endDate = endDate.clone().add(1, 'day');
      }

      const startTerm = FilterTerm.fromString(
        `created>${startDate.format(dateFormat)}`,
      );

      if (!newFilter.hasTerm(startTerm)) {
        newFilter = newFilter.and(Filter.fromTerm(startTerm));
      }
    }

    if (isDefined(endDate)) {
      const endTerm = FilterTerm.fromString(
        `created<${endDate.format(dateFormat)}`,
      );

      if (!newFilter.hasTerm(endTerm)) {
        newFilter = newFilter.and(Filter.fromTerm(endTerm));
      }
    }

    onFilterChanged(newFilter);
  }

  render() {
    const {
      dataTransform = transformCreated,
      filter,
      xAxisLabel,
      yAxisLabel,
      y2AxisLabel,
      yLine,
      y2Line,
      onFilterChanged,
      ...props
    } = this.props;
    return (
      <DataDisplay {...props} dataTransform={dataTransform} filter={filter}>
        {({width, height, data: tdata, svgRef, state}) => (
          <LineChart
            timeline
            svgRef={svgRef}
            width={width}
            height={height}
            data={tdata}
            yAxisLabel={yAxisLabel}
            y2AxisLabel={y2AxisLabel}
            xAxisLabel={xAxisLabel}
            yLine={yLine}
            y2Line={y2Line}
            showLegend={state.showLegend}
            onRangeSelected={
              isDefined(onFilterChanged) ? this.handleRangeSelect : undefined
            }
          />
        )}
      </DataDisplay>
    );
  }
}

CreatedDisplay.propTypes = {
  dataTransform: PropTypes.func,
  filter: PropTypes.filter,
  xAxisLabel: PropTypes.toString,
  y2AxisLabel: PropTypes.toString,
  y2Line: lineDataPropType,
  yAxisLabel: PropTypes.toString,
  yLine: lineDataPropType,
  onFilterChanged: PropTypes.func,
};

export default CreatedDisplay;

// vim: set ts=2 sw=2 tw=80:
