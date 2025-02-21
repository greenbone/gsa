/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import Filter from 'gmp/models/filter';
import FilterTerm from 'gmp/models/filter/filterterm';
import {isDefined} from 'gmp/utils/identity';
import React from 'react';
import LineChart, {lineDataPropType} from 'web/components/chart/Line';
import transformCreated from 'web/components/dashboard/display/created/CreatedTransform';
import DataDisplay from 'web/components/dashboard/display/DataDisplay';
import PropTypes from 'web/utils/PropTypes';

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
            data={tdata}
            height={height}
            showLegend={state.showLegend}
            svgRef={svgRef}
            width={width}
            xAxisLabel={xAxisLabel}
            y2AxisLabel={y2AxisLabel}
            y2Line={y2Line}
            yAxisLabel={yAxisLabel}
            yLine={yLine}
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
