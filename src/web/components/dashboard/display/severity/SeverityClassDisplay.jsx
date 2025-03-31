/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import Filter from 'gmp/models/filter';
import {isDefined} from 'gmp/utils/identity';
import React from 'react';
import DonutChart from 'web/components/chart/Donut';
import DataDisplay from 'web/components/dashboard/display/DataDisplay';
import {renderDonutChartIcons} from 'web/components/dashboard/display/DataDisplayIcons';
import transformSeverityData from 'web/components/dashboard/display/severity/severityClassTransform';
import {filterValueToFilterTerms} from 'web/components/dashboard/display/severity/utils';
import PropTypes from 'web/utils/PropTypes';

const SeverityClassDisplay = ({onFilterChanged, filter, ...props}) => {
  const handleDataClick = data => {
    const {filterValue} = data;

    let severityFilter;
    if (!isDefined(onFilterChanged)) {
      return;
    }

    const [startTerm, endTerm] = filterValueToFilterTerms(filterValue);
    if (isDefined(endTerm)) {
      if (
        isDefined(filter) &&
        filter.hasTerm(startTerm) &&
        filter.hasTerm(endTerm)
      ) {
        return;
      }

      severityFilter = Filter.fromTerm(startTerm).and(Filter.fromTerm(endTerm));
    } else {
      if (isDefined(filter) && filter.hasTerm(startTerm)) {
        return;
      }

      severityFilter = Filter.fromTerm(startTerm);
    }

    const newFilter = isDefined(filter)
      ? filter.copy().and(severityFilter)
      : severityFilter;

    onFilterChanged(newFilter);
  };
  return (
    <DataDisplay
      {...props}
      dataTransform={transformSeverityData}
      filter={filter}
      icons={renderDonutChartIcons}
      initialState={{
        show3d: true,
      }}
    >
      {({width, height, data, svgRef, state}) => (
        <DonutChart
          data={data}
          height={height}
          show3d={state.show3d}
          showLegend={state.showLegend}
          svgRef={svgRef}
          width={width}
          onDataClick={isDefined(onFilterChanged) ? handleDataClick : undefined}
          onLegendItemClick={
            isDefined(onFilterChanged) ? handleDataClick : undefined
          }
        />
      )}
    </DataDisplay>
  );
};

SeverityClassDisplay.propTypes = {
  filter: PropTypes.filter,
  severityClass: PropTypes.severityClass,
  title: PropTypes.func.isRequired,
  onFilterChanged: PropTypes.func,
};

export default SeverityClassDisplay;
