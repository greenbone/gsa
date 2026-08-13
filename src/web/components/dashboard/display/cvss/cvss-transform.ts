/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {parseInt, parseSeverity, type NumberValue} from 'gmp/parser';
import {isDefined} from 'gmp/utils/identity';
import {DEFAULT_SEVERITY_RATING, type SeverityRating} from 'gmp/utils/severity';
import {type LegendData} from 'web/components/chart/base/Legend';
import {
  totalCount,
  percent,
  riskFactorColorScale,
} from 'web/components/dashboard/display/utils';
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

interface CvssDataGroup {
  value?: NumberValue;
  count?: NumberValue;
}

export interface CvssData {
  groups?: CvssDataGroup[];
}

interface CvssFilterValue {
  start?: string;
  end?: string;
}

export interface CvssDataPoint extends LegendData {
  x: string;
  y: number;
  filterValue?: CvssFilterValue;
}

interface TransformedCvssData extends Array<CvssDataPoint> {
  total: number;
}

export interface TransformCvssDataProps {
  severityRating?: SeverityRating;
}

export const cvssDataRow = ({x, y}: CvssDataPoint): [string, string] => [
  x,
  String(y),
];

const format = (value: number): string => value.toFixed(1);

const getSeverityClassLabel = (value: number): string => {
  switch (value) {
    case NA_VALUE:
      return String(_NA);
    case LOG_VALUE:
      return String(_LOG);
    case ERROR_VALUE:
      return String(_ERROR);
    case FALSE_POSITIVE_VALUE:
      return String(_FALSE_POSITIVE);
    default:
      return String(value);
  }
};

const transformCvssData = (
  data: CvssData = {},
  {severityRating = DEFAULT_SEVERITY_RATING}: TransformCvssDataProps = {},
): TransformedCvssData => {
  const {groups = []} = data;

  const sum = totalCount(groups);

  const cvssData: Record<number, number> = {
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
    const {value, count = 0} = group;

    const severity = parseSeverity(value);

    let cvss: number;
    if (!isDefined(severity)) {
      cvss = NA_VALUE;
    } else if (severity >= 0.1 && severity <= 0.9) {
      cvss = 0.1;
    } else {
      cvss = Math.floor(severity);
    }

    const parsedCount = parseInt(count) ?? 0;

    const currentCount = cvssData[cvss] || 0;

    cvssData[cvss] = currentCount + parsedCount;
  });

  const transformedData = Object.keys(cvssData)
    .sort((a, b) => {
      return Number(a) - Number(b);
    })
    .map(key => {
      const cvssGroup = Number(key);
      const count = cvssData[cvssGroup];
      const percentValue = percent(count, sum);

      const riskFactor = resultSeverityRiskFactor(cvssGroup, severityRating);
      const label = translateRiskFactor(riskFactor);

      let toolTip: string;
      let filterValue: CvssFilterValue;

      if (cvssGroup === 10) {
        filterValue = {
          start: String(cvssGroup),
        };
        toolTip = `10.0 (${label}): ${percentValue}% (${count})`;
      } else if (cvssGroup >= 1) {
        filterValue = {
          start: format(cvssGroup - 0.1),
          end: format(cvssGroup + 1),
        };
        toolTip = `${cvssGroup}.0 - ${cvssGroup}.9 (${label}): ${percentValue}% (${count})`;
      } else if (cvssGroup > 0) {
        filterValue = {
          start: format(cvssGroup - 0.1),
          end: '1.0',
        };
        toolTip = `${cvssGroup} - 0.9 (${label}): ${percentValue}% (${count})`;
      } else {
        filterValue = {
          start: String(cvssGroup),
        };
        toolTip = `${label}: ${percentValue}% (${count})`;
      }
      return {
        x: getSeverityClassLabel(cvssGroup),
        y: count,
        label,
        toolTip,
        color: riskFactorColorScale(riskFactor),
        filterValue,
      };
    });

  const result = transformedData as TransformedCvssData;
  result.total = sum;

  return result;
};

export default transformCvssData;
