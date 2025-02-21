/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {parseSeverity, parseInt} from 'gmp/parser';
import {isDefined} from 'gmp/utils/identity';
import {severityValue} from 'gmp/utils/number';
import {
  totalCount,
  percent,
  riskFactorColorScale,
} from 'web/components/dashboard/utils';
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
  CRITICAL,
  severityRiskFactorToValue,
  CRITICAL_VALUE,
} from 'web/utils/severity';

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

  const {critical, high, medium, low} = getSeverityLevels();

  const tdata = Object.values(severityClasses)
    .toSorted(
      (a, b) =>
        severityRiskFactorToValue(a.riskFactor) -
        severityRiskFactorToValue(b.riskFactor),
    )
    .map(severityClass => {
      const {count, riskFactor} = severityClass;
      const perc = percent(count, sum);
      const label = translateRiskFactor(riskFactor);

      let toolTip;
      let limit;
      let filterValue;

      switch (riskFactor) {
        case CRITICAL:
          limit = severityValue(CRITICAL_VALUE);
          toolTip = `${label} (${severityValue(critical)} - ${limit})`;
          filterValue = {
            start: severityValue(critical - 0.1),
          };
          break;
        case HIGH:
          limit = severityValue(critical - 0.1);
          toolTip = `${label} (${severityValue(high)} - ${limit})`;
          filterValue = {
            start: severityValue(high - 0.1),
            end: critical,
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
            start: LOG_VALUE,
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
