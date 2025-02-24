/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {_l} from 'gmp/locale/lang';
import {isDefined} from 'gmp/utils/identity';

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

/**
 * Determines the severity risk factor based on the given value.
 *
 * @param {number} value - The value to evaluate for severity risk.
 * @returns {string} - The severity risk factor, which can be one of the following:
 *                     LOG, LOW, MEDIUM, HIGH, CRITICAL, or NA.
 */
export const severityRiskFactor = value => {
  const {low, medium, high, critical} = getSeverityLevels();

  if (value >= LOG_VALUE && isDefined(low) && value < low) {
    return LOG;
  }
  if (value >= low && isDefined(medium) && value < medium) {
    return LOW;
  }

  if (value >= medium && isDefined(high) && value < high) {
    return MEDIUM;
  }

  if (value >= high && isDefined(critical) && value < critical) {
    return HIGH;
  }

  if (isDefined(critical) && value >= critical) {
    return CRITICAL;
  }

  return NA;
};

const severityRiskFactorValues = {
  [CRITICAL]: CRITICAL_VALUE,
  [HIGH]: HIGH_VALUE,
  [MEDIUM]: MEDIUM_VALUE,
  [LOW]: LOW_VALUE,
  [LOG]: LOG_VALUE,
  [FALSE_POSITIVE]: FALSE_POSITIVE_VALUE,
};

export const severityRiskFactorToValue = factor =>
  severityRiskFactorValues[factor];

export const extraRiskFactor = (value = NA_VALUE) => {
  switch (value) {
    case LOG_VALUE:
      return LOG;
    case FALSE_POSITIVE_VALUE:
      return FALSE_POSITIVE;
    case DEBUG_VALUE:
      return DEBUG;
    case ERROR_VALUE:
      return ERROR;
    case NA_VALUE:
      return NA;
    default:
      return value;
  }
};

export const resultSeverityRiskFactor = value => {
  if (value > LOG_VALUE) {
    return severityRiskFactor(value);
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

export const translateRiskFactor = factor =>
  `${TRANSLATED_RISK_FACTORS[factor]}`;

export const translatedResultSeverityRiskFactor = value =>
  translateRiskFactor(resultSeverityRiskFactor(value));

/**
 * Returns an object representing different severity levels.
 *
 * The severity levels define the lower limit. The lower limit is included in the range.
 *
 * defines
 *  - log range from 0 to 1.0 including 0 and excluding 1.0 => [0, 1.0[
 *  - low range from 1.0 to 3.0 including 1.0 and excluding 3.0 => [1.0, 3.0[
 *  - medium range from 3.0 to 6.5 including 3.0 and excluding 6.5 => [3.0, 6.5[
 *  - high range from 6.5 to 8.9 including 6.5 and excluding 9 => [6.5, 9[
 *  - critical range from 9.0 to 10.0 => [9, 10]
 *
 * @returns {Object} An object with severity levels as keys and their corresponding numeric values.
 * @property {number} critical - The severity level for critical issues (10.0).
 * @property {number} high - The severity level for high issues (7.0).
 * @property {number} medium - The severity level for medium issues (4.0).
 * @property {number} low - The severity level for low issues (0.1).
 */
export const getSeverityLevels = () => {
  return {
    critical: 9.0,
    high: 7.0,
    medium: 4.0,
    low: 0.1,
  };
};

export const getSeverityLevelsOld = () => {
  return {
    max_high: 10.0,
    min_high: 7.0,
    max_medium: 6.9,
    min_medium: 4.0,
    max_low: 3.9,
    min_low: 0.1,
    max_log: 0.0,
  };
};
