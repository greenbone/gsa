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

import {isDefined} from 'gmp/utils/identity';

import FilterTerm from 'gmp/models/filter/filterterm';
import Filter from 'gmp/models/filter';

import {NA_VALUE} from 'web/utils/severity';

import PropTypes from 'web/utils/proptypes';

import DonutChart from 'web/components/chart/donut3d';

import DataDisplay from '../datadisplay';

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

      if (isDefined(filter) && filter.hasTerm(startTerm) &&
        filter.hasTerm(endTerm)) {
        return;
      }

      severityFilter = Filter.fromTerm(startTerm)
        .and(Filter.fromTerm(endTerm));
    }
    else {
      let severityTerm;
      if (start > 0) {
        severityTerm = FilterTerm.fromString(`severity>${start}`);
      }
      else if (start === NA_VALUE) {
        severityTerm = FilterTerm.fromString('severity=""');
      }
      else {
        severityTerm = FilterTerm.fromString(`severity=${start}`);
      }

      if (isDefined(filter) && filter.hasTerm(severityTerm)) {
        return;
      }

      severityFilter = Filter.fromTerm(severityTerm);
    }

    const newFilter = isDefined(filter) ? filter.copy().and(severityFilter) :
      severityFilter;

    onFilterChanged(newFilter);
  }

  render() {
    const {
      onFilterChanged,
      ...props
    } = this.props;
    return (
      <DataDisplay
        {...props}
        dataTransform={transformSeverityData}
      >
        {({width, height, data, svgRef}) => (
          <DonutChart
            svgRef={svgRef}
            width={width}
            height={height}
            data={data}
            onDataClick={isDefined(onFilterChanged) ?
              this.handleDataClick : undefined}
            onLegendItemClick={isDefined(onFilterChanged) ?
              this.handleDataClick : undefined}
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
