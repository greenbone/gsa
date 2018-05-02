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

import {parse_int, parse_float, parse_severity} from 'gmp/parser';

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
} from 'web/utils/severity';

import {totalCount, percent, riskFactorColorScale} from '../utils';

export const cvssDataRow = ({row}) => [row.x, row.y];

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

    const severity = parse_severity(value);

    const cvss = is_defined(severity) ? Math.ceil(severity) : NA_VALUE;

    count = parse_int(count);

    const currentCount = cvssData[cvss] || 0;

    cvssData[cvss] = currentCount + count;
  });

  const tdata = Object.keys(cvssData)
    .sort((a, b) => {
      return a - b;
    })
    .map(key => {
      const count = cvssData[key];
      const perc = percent(count, sum);

      const value = parse_float(key);

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
        filterValue = {
          start: value,
        };
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

export default transformCvssData;

// vim: set ts=2 sw=2 tw=80:
