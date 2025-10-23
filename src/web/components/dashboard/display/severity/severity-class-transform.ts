/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {parseSeverity, parseInt} from 'gmp/parser';
import {isDefined} from 'gmp/utils/identity';
import {severityValue} from 'gmp/utils/number';
import {type SeverityRating, DEFAULT_SEVERITY_RATING} from 'gmp/utils/severity';
import {
  totalCount,
  percent as percentFunc,
  riskFactorColorScale,
} from 'web/components/dashboard/display/utils';
import {
  NA_VALUE,
  translateRiskFactor,
  LOG,
  HIGH,
  MEDIUM,
  LOW,
  LOG_VALUE,
  CRITICAL,
  severityRiskFactorToValue,
  severityRiskFactor,
  type RiskFactor,
  getSeverityLevelBoundaries,
} from 'web/utils/severity';

interface SeverityDataGroup {
  value: string | undefined;
  count: number;
}

export interface SeverityData {
  groups?: SeverityDataGroup[];
}

interface SeverityClasses {
  [key: string]: {
    count: number;
    riskFactor: RiskFactor;
  };
}

interface FilterValue {
  start?: string;
  end?: string;
}

export interface SeverityClassData {
  value: number;
  label: string;
  toolTip: string;
  color: string;
  filterValue: FilterValue;
}

interface TransformedSeverityClassData extends Array<SeverityClassData> {
  total: number;
}

export interface TransformSeverityDataProps {
  severityRating?: SeverityRating;
}

const transformSeverityData = (
  data: SeverityData = {},
  {severityRating = DEFAULT_SEVERITY_RATING}: TransformSeverityDataProps = {},
) => {
  const {groups = []} = data;
  const sum = totalCount(groups);

  const severityClasses: SeverityClasses = groups.reduce(
    (allSeverityClasses, group) => {
      const {value} = group;

      let severity = parseSeverity(value);
      if (!isDefined(severity)) {
        severity = NA_VALUE;
      }

      const riskFactor = severityRiskFactor(severity, severityRating);
      const severityClass = allSeverityClasses[riskFactor] || {};

      let {count = 0} = severityClass;
      count += parseInt(group.count);

      allSeverityClasses[riskFactor] = {
        count,
        riskFactor,
      };

      return allSeverityClasses;
    },
    {},
  );

  const boundaries = getSeverityLevelBoundaries(severityRating);

  // @ts-expect-error
  const transformedData: TransformedSeverityClassData = Object.values(
    severityClasses,
  )
    .toSorted(
      (a, b) =>
        severityRiskFactorToValue(a.riskFactor) -
        severityRiskFactorToValue(b.riskFactor),
    )
    .map(severityClass => {
      const {count, riskFactor} = severityClass;
      const percent = percentFunc(count, sum);
      const label = translateRiskFactor(riskFactor);

      let end: string;
      let start: string;
      let toolTip: string = '';
      let filterValue: FilterValue = {};

      switch (riskFactor) {
        case CRITICAL:
          end = severityValue(boundaries.maxCritical as number) as string;
          start = severityValue(boundaries.minCritical as number) as string;
          toolTip = `${label} (${start} - ${end})`;
          filterValue = {
            start,
          };
          break;
        case HIGH:
          end = severityValue(boundaries.maxHigh) as string;
          start = severityValue(boundaries.minHigh) as string;
          toolTip = `${label} (${start} - ${end})`;
          filterValue = {
            start,
            end,
          };
          break;
        case MEDIUM:
          end = severityValue(boundaries.maxMedium) as string;
          start = severityValue(boundaries.minMedium) as string;
          toolTip = `${label} (${start} - ${end})`;
          filterValue = {
            start,
            end,
          };
          break;
        case LOW:
          end = severityValue(boundaries.maxLow) as string;
          start = severityValue(boundaries.minLow) as string;
          toolTip = `${label} (${start} - ${end})`;
          filterValue = {
            start,
            end,
          };
          break;
        case LOG:
          toolTip = `${label}`;
          filterValue = {
            start: String(LOG_VALUE),
          };
          break;
        default:
          break;
      }

      toolTip = `${toolTip}: ${percent}% (${count})`;

      return {
        value: count,
        label,
        toolTip,
        color: riskFactorColorScale(riskFactor),
        filterValue,
      };
    });

  transformedData.total = sum;

  return transformedData;
};

export default transformSeverityData;
