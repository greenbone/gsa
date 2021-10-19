/* Copyright (C) 2018-2021 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License
 * as published by the Free Software Foundation, either version 3
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */
import {isDefined} from 'gmp/utils/identity';

import {parseInt, parseFloat, parseSeverity} from 'gmp/parser';

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

export const cvssDataRow = row => [row.x, row.y];

const format = value => value.toFixed(1);

const getSeverityClassLabel = value => {
  switch (value) {
    case NA_VALUE:
      return `${_NA}`;
    case LOG_VALUE:
      return `${_LOG}`;
    case ERROR_VALUE:
      return `${_ERROR}`;
    case FALSE_POSITIVE_VALUE:
      return `${_FALSE_POSITIVE}`;
    default:
      return value;
  }
};

const transformCvssData = (data = {}) => {
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

    const severity = parseSeverity(value);

    const cvss = isDefined(severity) ? Math.floor(severity) : NA_VALUE;

    count = parseInt(count);

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

      const value = parseFloat(key);

      const riskFactor = resultSeverityRiskFactor(value);
      const label = translateRiskFactor(riskFactor);

      let toolTip;
      let filterValue;

      if (value > 0) {
        filterValue = {
          start: format(value - 0.1),
          end: format(value + 1),
        };
        toolTip = `${value}.0 - ${value}.9 (${label}): ${perc}% (${count})`;
      } else {
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
