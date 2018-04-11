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

import {is_empty} from 'gmp/utils/string';
import {is_defined} from 'gmp/utils/identity';

import {parse_int, parse_float} from 'gmp/parser';

import {
  NA_VALUE,
  LOG_VALUE,
  FALSE_POSITIVE_VALUE,
  ERROR_VALUE,
  _NA,
  _LOG,
  _ERROR,
  _FALSE_POSITIVE,
  resultSeverityRiskFactor,
  translateRiskFactor,
} from '../../../utils/severity';
import PropTypes from '../../../utils/proptypes';

import BarChart from '../../chart/bar';

import DataDisplay from './datadisplay';

import {totalCount, percent, riskFactorColorScale} from './utils';
import FilterTerm from 'gmp/models/filter/filterterm';
import Filter from 'gmp/models/filter';

const getSeverityClassLabel = value => {
  switch (value) {
    case NA_VALUE:
      return _NA;
    case LOG_VALUE:
      return _LOG;
    case ERROR_VALUE:
      return _ERROR;
    case FALSE_POSITIVE_VALUE:
      return _FALSE_POSITIVE;
    default:
      return value;
  }
};

const transformCvssData = (data = {}, {severityClass}) => {
  const {groups = []} = data;

  const sum = totalCount(groups);

  const cvssData = {
    [NA_VALUE]: 0,
    [LOG_VALUE]: 0,
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
    6: 0,
    7: 0,
    8: 0,
    9: 0,
    10: 0,
  };

  groups.forEach(group => {
    let {value, count = 0} = group;
    if (is_empty(value)) {
      value = NA_VALUE;
    }
    count = parse_int(count);

    cvssData[value] = count;
  });

  const tdata = Object.keys(cvssData)
    .sort((a, b) => {
      return a - b;
    })
    .map(key => {
      const count = cvssData[key];
      const perc = percent(count, sum);

      const value = Math.ceil(parse_float(key));

      const riskFactor = resultSeverityRiskFactor(value, severityClass);
      const label = translateRiskFactor(riskFactor);

      let toolTip;
      let filterValue;

      if (value > 0) {
        const start = value - 1;
        const end = value;

        filterValue = {
          start,
          end,
        };

        toolTip = `${start}.1 - ${end}.0 (${label}): ${perc}% (${count})`;
      }
      else {
        if (value === 0) {
          filterValue = {
            start: 0,
            end: 0,
          };
        }
        toolTip = `${label}: ${perc}% (${count})`;
      }
      return {
        x: getSeverityClassLabel(value),
        y: count,
        label,
        toolTip,
        color: riskFactorColorScale(riskFactor),
        filterValue,
      };
    });

  tdata.total = sum;

  return tdata;
};

class CvssDisplay extends React.Component {

  constructor(...args) {
    super(...args);

    this.handleDataClick = this.handleDataClick.bind(this);
  }

  handleDataClick(data) {
    const {onFilterChanged, filter} = this.props;

    if (!is_defined(onFilterChanged)) {
      return;
    }

    const {filterValue = {}} = data;
    const {start, end} = filterValue;

    let statusFilter;

    if (is_defined(start) && start > 0 && end < 10) {
      const startTerm = FilterTerm.fromString(`severity>${start}`);

      // use end + 0.1 as upper limit
      // this is a bit hackish and only works for severity
      // it would be better if gvmd does support <=
      const endVal = (end + 0.1).toFixed(1);
      const endTerm = FilterTerm.fromString(`severity<${endVal}`);

      if (is_defined(filter) && filter.hasTerm(startTerm) &&
        filter.hasTerm(endTerm)) {
        return;
      }

      statusFilter = Filter.fromTerm(startTerm).and(Filter.fromTerm(endTerm));
    }
    else {
      let statusTerm;

      if (is_defined(start)) {

        if (start > 0) {
          statusTerm = FilterTerm.fromString(`severity>${start}`);
        }
        else {
          statusTerm = FilterTerm.fromString(`severity=${start}`);
        }
      }
      else {
        statusTerm = FilterTerm.fromString(`severity=""`);
      }

      if (is_defined(filter) && filter.hasTerm(statusTerm)) {
        return;
      }

      statusFilter = Filter.fromTerm(statusTerm);
    }

    const newFilter = is_defined(filter) ? filter.copy().and(statusFilter) :
      statusFilter;

    onFilterChanged(newFilter);
  }

  render() {
    const {
      title,
      ...props
    } = this.props;
    return (
      <DataDisplay
        {...props}
        dataTransform={transformCvssData}
        title={title}
      >
        {({width, height, data}) => (
          <BarChart
            displayLegend={false}
            width={width}
            height={height}
            data={data}
            onDataClick={this.handleDataClick}
          />
        )}
      </DataDisplay>
    );
  }
}

CvssDisplay.propTypes = {
  filter: PropTypes.filter,
  title: PropTypes.func.isRequired,
  onFilterChanged: PropTypes.func.isRequired,
};

export default CvssDisplay;

// vim: set ts=2 sw=2 tw=80:
