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

    switch (riskFactor) {
      case HIGH:
        toolTip = `${format(high)} - 10.0 (${label})`;
        break;
      case MEDIUM:
        limit = format(high - 0.1);
        toolTip = `${format(medium)} - ${limit} (${label})`;
        break;
      case LOW:
        limit = format(medium - 0.1);
        toolTip = `${format(low)} - ${limit} (${label})`;
        break;
      case LOG:
      case FALSE_POSITIVE:
      case ERROR:
      case NA:
      default:
        toolTip = `${label}`;
        break;
    }

    toolTip = `${toolTip}: ${perc}% (${count})`;

    return {
      value: count,
      label,
      toolTip,
      color: riskFactorColorScale(riskFactor),
    };
  });

  tdata.total = sum;

  return tdata;
};

const SeverityClassDisplay = ({
  severityClass,
  title,
  ...props
}) => (
  <DataDisplay
    {...props}
    severityClass={severityClass}
    dataTransform={transformSeverityData}
    title={title}
  >
    {({width, height, data}) => (
      <DonutChart
        width={width}
        height={height}
        data={data}
      />
    )}
  </DataDisplay>
);

SeverityClassDisplay.propTypes = {
  severityClass: PropTypes.severityClass,
  title: PropTypes.func.isRequired,
};

export default SeverityClassDisplay;

// vim: set ts=2 sw=2 tw=80:
