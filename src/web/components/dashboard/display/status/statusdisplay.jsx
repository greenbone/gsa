/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */


import Filter from 'gmp/models/filter';
import FilterTerm from 'gmp/models/filter/filterterm';
import {isDefined} from 'gmp/utils/identity';
import React from 'react';
import DonutChart from 'web/components/chart/donut';
import PropTypes from 'web/utils/proptypes';

import DataDisplay from '../datadisplay';
import {renderDonutChartIcons} from '../datadisplayicons';

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
        filter={filter}
        icons={renderDonutChartIcons}
        initialState={{
          show3d: true,
        }}
      >
        {({width, height, data: tdata, svgRef, state}) => (
          <DonutChart
            data={tdata}
            height={height}
            show3d={state.show3d}
            showLegend={state.showLegend}
            svgRef={svgRef}
            width={width}
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
