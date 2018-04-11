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

import {parse_severity, parse_int} from 'gmp/parser';

import FilterTerm from 'gmp/models/filter/filterterm';
import Filter from 'gmp/models/filter';

import {
  NA_VALUE,
  resultSeverityRiskFactor,
  translateRiskFactor,
  getSeverityLevels,
  LOG,
  FALSE_POSITIVE,
  ERROR,
  NA,
  HIGH,
  MEDIUM,
  LOW,
  LOG_VALUE,
  FALSE_POSITIVE_VALUE,
  ERROR_VALUE,
} from '../../../utils/severity';

import PropTypes from '../../../utils/proptypes';

import DonutChart from '../../chart/donut3d';

import DataDisplay from './datadisplay';

import {
  totalCount,
  percent,
  riskFactorColorScale,
} from './utils';

const format = value => value.toFixed(1);

const transformSeverityData = (
  data = {},
  {severityClass: severityClassType}
) => {
  const {groups = []} = data;

  const sum = totalCount(groups);

  const severityClasses = groups.reduce((allSeverityClasses, group) => {
    let {value} = group;

    value = parse_severity(value);
    if (!is_defined(value)) {
      value = NA_VALUE;
    }

    const riskFactor = resultSeverityRiskFactor(value, severityClassType);
    const severityClass = allSeverityClasses[riskFactor] || {};

    let {count = 0} = severityClass;
    count += parse_int(group.count);

    allSeverityClasses[riskFactor] = {
      count,
      riskFactor,
    };

    return allSeverityClasses;
  }, {});

  const {high, medium, low} = getSeverityLevels(severityClassType);

  const tdata = Object.values(severityClasses).map(severityClass => {
    const {count, riskFactor} = severityClass;
    const perc = percent(count, sum);
    const label = translateRiskFactor(riskFactor);

    let toolTip;
    let limit;
    let filterValue;

    switch (riskFactor) {
      case HIGH:
        toolTip = `${format(high)} - 10.0 (${label})`;
        filterValue = {
          start: high,
          end: 10,
        };
        break;
      case MEDIUM:
        limit = format(high - 0.1);
        toolTip = `${format(medium)} - ${limit} (${label})`;
        filterValue = {
          start: medium,
          end: limit,
        };
        break;
      case LOW:
        limit = format(medium - 0.1);
        toolTip = `${format(low)} - ${limit} (${label})`;
        filterValue = {
          start: low,
          end: limit,
        };
        break;
      case LOG:
        toolTip = `${label}`;
        filterValue = {
          start: LOG_VALUE,
        };
        break;
      case FALSE_POSITIVE:
        toolTip = `${label}`;
        filterValue = {
          start: FALSE_POSITIVE_VALUE,
        };
        break;
      case ERROR:
        toolTip = `${label}`;
        filterValue = {
          start: ERROR_VALUE,
        };
        break;
      case NA:
        toolTip = `${label}`;
        filterValue = {
          start: NA_VALUE,
        };
        break;
      default:
        break;
    }

    toolTip = `${toolTip}: ${perc}% (${count})`;

    return {
      value: count,
      label,
      toolTip,
      color: riskFactorColorScale(riskFactor),
      filterValue,
    };
  });

  tdata.total = sum;

  return tdata;
};

class SeverityClassDisplay extends React.Component {

  constructor(...args) {
    super(...args);

    this.handleDataClick = this.handleDataClick.bind(this);
  }

  handleDataClick(data) {
    const {onFilterChanged, filter} = this.props;
    const {filterValue} = data;


    let severityFilter;
    if (!is_defined(onFilterChanged)) {
      return;
    }

    const {start, end} = filterValue;
    if (start > 0 && end < 10) {
      const startTerm = FilterTerm.fromString(`severity>${start}`);
      const endTerm = FilterTerm.fromString(`severity<${end}`);

      if (is_defined(filter) && filter.hasTerm(startTerm) &&
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

      if (is_defined(filter) && filter.hasTerm(severityTerm)) {
        return;
      }

      severityFilter = Filter.fromTerm(severityTerm);
    }

    const newFilter = is_defined(filter) ? filter.copy().and(severityFilter) :
      severityFilter;

    onFilterChanged(newFilter);
  }

  render() {
    const {
      ...props
    } = this.props;
    return (
      <DataDisplay
        {...props}
        dataTransform={transformSeverityData}
      >
        {({width, height, data}) => (
          <DonutChart
            width={width}
            height={height}
            data={data}
            onDataClick={this.handleDataClick}
            onLegendItemClick={this.handleDataClick}
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
  onFilterChanged: PropTypes.func.isRequired,
};

export default SeverityClassDisplay;

// vim: set ts=2 sw=2 tw=80:
