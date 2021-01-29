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

import {parseSeverity, parseInt} from 'gmp/parser';

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

import {totalCount, percent, riskFactorColorScale} from '../utils';
import {severityValue} from 'gmp/utils/number';

export const severityClassDataRow = row => [row.label, row.value];

const transformSeverityData = (data = {}) => {
  const {groups = []} = data;

  const sum = totalCount(groups);

  const severityClasses = groups.reduce((allSeverityClasses, group) => {
    let {value} = group;

    value = parseSeverity(value);
    if (!isDefined(value)) {
      value = NA_VALUE;
    }

    const riskFactor = resultSeverityRiskFactor(value);
    const severityClass = allSeverityClasses[riskFactor] || {};

    let {count = 0} = severityClass;
    count += parseInt(group.count);

    allSeverityClasses[riskFactor] = {
      count,
      riskFactor,
    };

    return allSeverityClasses;
  }, {});

  const {high, medium, low} = getSeverityLevels();

  const tdata = Object.values(severityClasses).map(severityClass => {
    const {count, riskFactor} = severityClass;
    const perc = percent(count, sum);
    const label = translateRiskFactor(riskFactor);

    let toolTip;
    let limit;
    let filterValue;

    switch (riskFactor) {
      case HIGH:
        toolTip = `${label} (${severityValue(high)} - 10.0)`;
        filterValue = {
          start: severityValue(high - 0.1),
          end: 10,
        };
        break;
      case MEDIUM:
        limit = severityValue(high - 0.1);
        toolTip = `${label} (${severityValue(medium)} - ${limit})`;
        filterValue = {
          start: severityValue(medium - 0.1),
          end: high,
        };
        break;
      case LOW:
        limit = severityValue(medium - 0.1);
        toolTip = `${label} (${severityValue(low)} - ${limit})`;
        filterValue = {
          start: low - 0.05, // to include 0.1 but exclude 0
          end: medium,
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
