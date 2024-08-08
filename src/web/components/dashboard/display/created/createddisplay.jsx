/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';

import {isDefined} from 'gmp/utils/identity';

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
