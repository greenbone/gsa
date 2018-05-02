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
  LOG_VALUE,
  FALSE_POSITIVE_VALUE,
  ERROR_VALUE,
} from 'web/utils/severity';

import {
  totalCount,
  percent,
  riskFactorColorScale,
} from '../utils';

const format = value => value.toFixed(1);

export const severityClassDataRow = ({row}) => [row.label, row.value];

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
        toolTip = `${label} (${format(high)} - 10.0)`;
        filterValue = {
          start: high,
          end: 10,
        };
        break;
      case MEDIUM:
        limit = format(high - 0.1);
        toolTip = `${label} (${format(medium)} - ${limit})`;
        filterValue = {
          start: medium,
          end: limit,
        };
        break;
      case LOW:
        limit = format(medium - 0.1);
        toolTip = `${label} (${format(low)} - ${limit})`;
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

export default transformSeverityData;

// vim: set ts=2 sw=2 tw=80:
