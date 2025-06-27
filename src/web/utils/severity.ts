/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {_l} from 'gmp/locale/lang';
import {isDefined, isNumber} from 'gmp/utils/identity';
import {
  DEFAULT_SEVERITY_RATING,
  SEVERITY_RATING_CVSS_2,
  SEVERITY_RATING_CVSS_3,
  SeverityRating,
} from 'gmp/utils/severity';

export const _LOG = _l('Log');
export const _LOW = _l('Low');
export const _MEDIUM = _l('Medium');
export const _HIGH = _l('High');
export const _NONE = _l('None');
export const _FALSE_POSITIVE = _l('False Positive');
export const _ERROR = _l('Error');
export const _DEBUG = _l('Debug');
export const _CRITICAL = _l('Critical');
export const _NA = _l('N/A');

export const CRITICAL = 'Critical';
export const HIGH = 'High';
export const MEDIUM = 'Medium';
export const LOW = 'Low';
export const NA = 'N/A';
export const LOG = 'Log';
export const FALSE_POSITIVE = 'False Positive';
export const ERROR = 'Error';
export const DEBUG = 'Debug';

export const NA_VALUE = -99;
export const CRITICAL_VALUE = 10;
export const HIGH_VALUE = 9;
export const MEDIUM_VALUE = 5;
export const LOW_VALUE = 2;
export const LOG_VALUE = 0;
export const FALSE_POSITIVE_VALUE = -1;
export const DEBUG_VALUE = -2;
export const ERROR_VALUE = -3;

const severityRiskFactorValues = {
  [CRITICAL]: CRITICAL_VALUE,
  [HIGH]: HIGH_VALUE,
  [MEDIUM]: MEDIUM_VALUE,
  [LOW]: LOW_VALUE,
  [LOG]: LOG_VALUE,
} as const;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const extraRiskFactorValues = {
  [LOG]: LOG_VALUE,
  [FALSE_POSITIVE]: FALSE_POSITIVE_VALUE,
  [DEBUG]: DEBUG_VALUE,
  [ERROR]: ERROR_VALUE,
  [NA]: NA_VALUE,
} as const;

const SEVERITY_LEVELS = {
  [SEVERITY_RATING_CVSS_3]: {
    critical: 9.0,
    high: 7.0,
    medium: 4.0,
    low: 0.1,
  },
  [SEVERITY_RATING_CVSS_2]: {
    high: 7.0,
    medium: 4.0,
    low: 0.1,
  },
} as const;

const SEVERITY_LEVEL_BOUNDARIES = {
  [SEVERITY_RATING_CVSS_2]: {
    maxHigh: 10.0,
    minHigh: 7.0,
    maxMedium: 6.9,
    minMedium: 4.0,
    maxLow: 3.9,
    minLow: 0.1,
    maxLog: 0.0,
  },
  [SEVERITY_RATING_CVSS_3]: {
    maxCritical: 10.0,
    minCritical: 9.0,
    maxHigh: 8.9,
    minHigh: 7.0,
    maxMedium: 6.9,
    minMedium: 4.0,
    maxLow: 3.9,
    minLow: 0.1,
    maxLog: 0.0,
  },
};

export type RiskFactor = keyof typeof severityRiskFactorValues;
export type ExtraRiskFactor = keyof typeof extraRiskFactorValues;
export type ResultSeverityRiskFactor = RiskFactor | ExtraRiskFactor;

interface SeverityLevels {
  critical?: number;
  high: number;
  medium: number;
  low: number;
}

interface SeverityLevelBoundaries {
  maxCritical?: number;
  minCritical?: number;
  maxHigh: number;
  minHigh: number;
  maxMedium: number;
  minMedium: number;
  maxLow: number;
  minLow: number;
  maxLog: number;
}

/**
 * Determines the severity risk factor based on the given value.
 *
 * @param value - The value to evaluate for severity risk.
 * @param [rating] - The rating system to use (default is CVSSv3).
 * @returns - The severity risk factor, which can be one of the following:
 *            LOG, LOW, MEDIUM, HIGH, CRITICAL, or NA.
 */
export const severityRiskFactor = (
  value: number,
  rating: SeverityRating = DEFAULT_SEVERITY_RATING,
): RiskFactor | typeof NA => {
  const {low, medium, high, critical} = getSeverityLevels(rating);

  if (value >= LOG_VALUE && value < low) {
    return LOG;
  }
  if (value >= low && value < medium) {
    return LOW;
  }

  if (value >= medium && value < high) {
    return MEDIUM;
  }

  if (
    value >= high &&
    ((isDefined(critical) && value < critical) || !isDefined(critical))
  ) {
    return HIGH;
  }

  if (isDefined(critical) && value >= critical) {
    return CRITICAL;
  }

  return NA;
};

export const severityRiskFactorToValue = (factor: RiskFactor) =>
  severityRiskFactorValues[factor];

export const extraRiskFactor = (value = NA_VALUE): ExtraRiskFactor => {
  switch (value) {
    case LOG_VALUE:
      return LOG;
    case FALSE_POSITIVE_VALUE:
      return FALSE_POSITIVE;
    case DEBUG_VALUE:
      return DEBUG;
    case ERROR_VALUE:
      return ERROR;
    default:
      return NA;
  }
};

export const resultSeverityRiskFactor = (
  value: number,
  rating: SeverityRating = DEFAULT_SEVERITY_RATING,
): ResultSeverityRiskFactor => {
  if (value >= LOG_VALUE) {
    return severityRiskFactor(value, rating);
  }

  return extraRiskFactor(value);
};

const TRANSLATED_RISK_FACTORS = {
  [CRITICAL]: _CRITICAL,
  [HIGH]: _HIGH,
  [MEDIUM]: _MEDIUM,
  [LOW]: _LOW,
  [NA]: _NA,
  [LOG]: _LOG,
  [FALSE_POSITIVE]: _FALSE_POSITIVE,
  [ERROR]: _ERROR,
  [DEBUG]: _DEBUG,
};

export const translateRiskFactor = (factor: ResultSeverityRiskFactor) =>
  `${TRANSLATED_RISK_FACTORS[factor]}`;

export const translatedResultSeverityRiskFactor = (
  value: number,
  rating: SeverityRating = DEFAULT_SEVERITY_RATING,
) => translateRiskFactor(resultSeverityRiskFactor(value, rating));

/**
 * Returns an object representing different severity levels.
 *
 * The severity levels define the lower limit. The lower limit is included in the range.
 */
export const getSeverityLevels = (
  rating: SeverityRating = DEFAULT_SEVERITY_RATING,
): SeverityLevels => SEVERITY_LEVELS[rating];

export const getSeverityLevelBoundaries = (
  rating: SeverityRating = DEFAULT_SEVERITY_RATING,
): SeverityLevelBoundaries => SEVERITY_LEVEL_BOUNDARIES[rating];

export const printPercentile = (
  percentile: number,
): string => {
  if (isNumber(percentile)) {
    if (percentile.toFixed(0) % 10 > 3 ||
        percentile.toFixed(0) % 10 === 0 )
      return (`${percentile.toFixed(0)}th`);
    if (percentile.toFixed(0) % 10 === 1)
      return (`${percentile.toFixed(0)}st`);
    if (percentile.toFixed(0) % 10 === 2)
      return (`${percentile.toFixed(0)}nd`);
    if (percentile.toFixed(0) % 10 === 3)
      return (`${percentile.toFixed(0)}rd`);
  }
  return ('N/A');
 }
