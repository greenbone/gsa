/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';

import {isDefined} from 'gmp/utils/identity';

import FilterTerm from 'gmp/models/filter/filterterm';
import Filter from 'gmp/models/filter';

import PropTypes from 'web/utils/proptypes';

import DonutChart from 'web/components/chart/donut';

import DataDisplay from '../datadisplay';
import {renderDonutChartIcons} from '../datadisplayicons';

import transformSeverityData from './severityclasstransform';

class SeverityClassDisplay extends React.Component {
  constructor(...args) {
    super(...args);

    this.handleDataClick = this.handleDataClick.bind(this);
  }

  handleDataClick(data) {
    const {onFilterChanged, filter} = this.props;
    const {filterValue} = data;

    let severityFilter;
    if (!isDefined(onFilterChanged)) {
      return;
    }

    const {start, end} = filterValue;
    if (start > 0 && end < 10) {
      const startTerm = FilterTerm.fromString(`severity>${start}`);
      const endTerm = FilterTerm.fromString(`severity<${end}`);

      if (
        isDefined(filter) &&
        filter.hasTerm(startTerm) &&
        filter.hasTerm(endTerm)
      ) {
        return;
      }

      severityFilter = Filter.fromTerm(startTerm).and(Filter.fromTerm(endTerm));
    } else {
      let severityTerm;
      if (start > 0) {
        severityTerm = FilterTerm.fromString(`severity>${start}`);
      } else {
        severityTerm = FilterTerm.fromString(`severity=${start}`);
      }

      if (isDefined(filter) && filter.hasTerm(severityTerm)) {
        return;
      }

      severityFilter = Filter.fromTerm(severityTerm);
    }

    const newFilter = isDefined(filter)
      ? filter.copy().and(severityFilter)
      : severityFilter;

    onFilterChanged(newFilter);
  }

  render() {
    const {onFilterChanged, ...props} = this.props;
    return (
      <DataDisplay
        {...props}
        initialState={{
          show3d: true,
        }}
        dataTransform={transformSeverityData}
        icons={renderDonutChartIcons}
      >
        {({width, height, data, svgRef, state}) => (
          <DonutChart
            svgRef={svgRef}
            width={width}
            height={height}
            data={data}
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

SeverityClassDisplay.propTypes = {
  filter: PropTypes.filter,
  severityClass: PropTypes.severityClass,
  title: PropTypes.func.isRequired,
  onFilterChanged: PropTypes.func,
};

export default SeverityClassDisplay;

// vim: set ts=2 sw=2 tw=80:
