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

import {is_defined} from 'gmp/utils/identity';

import Filter from 'gmp/models/filter';
import FilterTerm from 'gmp/models/filter/filterterm';

import PropTypes from 'web/utils/proptypes';

import LineChart, {lineDataPropType} from '../../../chart/line';

import transformCreated from './createdtransform';
import DataDisplay from '../datadisplay';

class CreatedDisplay extends React.Component {

  constructor(...args) {
    super(...args);

    this.handleRangeSelect = this.handleRangeSelect.bind(this);
  }

  handleRangeSelect(start, end) {
    const {filter, onFilterChanged} = this.props;

    if (!is_defined(onFilterChanged)) {
      return;
    }

    let {x: startDate} = start;
    let {x: endDate} = end;
    const dateFormat = 'YYYY-MM-DDTHH:mm';

    let newFilter = is_defined(filter) ? filter.copy() : new Filter();

    if (is_defined(startDate)) {

      if (startDate.isSame(endDate)) {
        startDate = startDate.clone().subtract(1, 'day');
        endDate = endDate.clone().add(1, 'day');
      }

      const startTerm = FilterTerm.fromString(
        `created>${startDate.format(dateFormat)}`);

      if (!newFilter.hasTerm(startTerm)) {
        newFilter = newFilter.and(Filter.fromTerm(startTerm));
      }
    }

    if (is_defined(endDate)) {
      const endTerm = FilterTerm.fromString(
        `created<${endDate.format(dateFormat)}`);

      if (!newFilter.hasTerm(endTerm)) {
        newFilter = newFilter.and(Filter.fromTerm(endTerm));
      }
    }

    onFilterChanged(newFilter);
  }

  render() {
    const {
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
      <DataDisplay
        {...props}
        dataTransform={transformCreated}
        filter={filter}
      >
        {({width, height, data: tdata, svgRef}) => (
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
            onRangeSelected={is_defined(onFilterChanged) ?
              this.handleRangeSelect : undefined}
          />
        )}
      </DataDisplay>
    );
  }
}

CreatedDisplay.propTypes = {
  filter: PropTypes.filter,
  xAxisLabel: PropTypes.string,
  y2AxisLabel: PropTypes.string,
  y2Line: lineDataPropType,
  yAxisLabel: PropTypes.string,
  yLine: lineDataPropType,
  onFilterChanged: PropTypes.func,
};

export default CreatedDisplay;

// vim: set ts=2 sw=2 tw=80:
