/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {parseSeverity, parseInt} from 'gmp/parser';
import {isDefined} from 'gmp/utils/identity';
import {severityValue} from 'gmp/utils/number';
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
} from 'web/utils/Severity';

import {totalCount, percent, riskFactorColorScale} from '../Utils';

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
