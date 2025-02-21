/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {parseInt, parseFloat, parseSeverity} from 'gmp/parser';
import {isDefined} from 'gmp/utils/identity';
import {totalCount, percent, riskFactorColorScale} from 'web/components/dashboard/display/Utils';
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
    0.1: 0,
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

    let cvss;
    if (!isDefined(severity)) {
      cvss = NA_VALUE;
    } else if (severity >= 0.1 && severity <= 0.9) {
      cvss = 0.1;
    } else {
      cvss = Math.floor(severity);
    }

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

      if (value === 10) {
        filterValue = {
          start: value,
        };
        toolTip = `10.0 (${label}): ${perc}% (${count})`;
      } else if (value >= 1) {
        filterValue = {
          start: format(value - 0.1),
          end: format(value + 1),
        };
        toolTip = `${value}.0 - ${value}.9 (${label}): ${perc}% (${count})`;
      } else if (value > 0) {
        filterValue = {
          start: format(value - 0.1),
          end: '1.0',
        };
        toolTip = `${value} - 0.9 (${label}): ${perc}% (${count})`;
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
