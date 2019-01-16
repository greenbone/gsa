/* Copyright (C) 2016-2019 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
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

export const _NA = _l('N/A');

export const HIGH = 'High';
export const MEDIUM = 'Medium';
export const LOW = 'Low';
export const NA = 'N/A';
export const LOG = 'Log';
export const FALSE_POSITIVE = 'False Positive';
export const ERROR = 'Error';
export const DEBUG = 'Debug';

export const NA_VALUE = -99;
export const HIGH_VALUE = 10;
export const MEDIUM_VALUE = 5;
export const LOW_VALUE = 2;
export const LOG_VALUE = 0;
export const FALSE_POSITIVE_VALUE = -1;
export const DEBUG_VALUE = -2;
export const ERROR_VALUE = -3;

export const severityRiskFactor = (value, type) => {
  const {low, medium, high} = getSeverityLevels(type);

  if (value >= LOG_VALUE && isDefined(low) && value < low) {
    return LOG;
  }
  if (value >= low && isDefined(medium) && value < medium) {
    return LOW;
  }

  if (value >= medium && isDefined(high) && value < high) {
    return MEDIUM;
  }

  if (isDefined(high) && value >= high) {
    return HIGH;
  }

  return NA;
};

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

export const resultSeverityRiskFactor = (value, type) => {
  if (value > LOG_VALUE) {
    return severityRiskFactor(value, type);
  }

  return extraRiskFactor(value);
};

const TRANSLATED_RISK_FACTORS = {
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

export const SEVERITY_CLASS_PCI_DSS = 'pci-dss';
export const SEVERITY_CLASS_NIST = 'nist';
export const SEVERITY_CLASS_BSI = 'bsi';

/*
 * The severity levels define the lower limit
 *
 * The lower limit is included in the range. E.g.
 *
 * {
 *   high: 6.5,
 *   medium: 3.0,
 *   low: 1.0,
 * }
 *
 * defines
 *  - log range from 0 to 1.0 including 0 and excluding 1.0 => [0, 1.0[
 *  - low range from 1.0 to 3.0 including 1.0 and excluding 3.0 => [1.0, 3.0[
 *  - medium range from 3.0 to 6.5 including 3.0 and excluding 6.5 => [3.0, 6.5[
 *  - high range from 6.5 to 10 [6.5, 10]
 */

/*
 The original version form xslt used
  {
    high: 4.0,
    medium: 3.9,
    low: 3.9,
  }
  for PCI-DSS
*/
const SEVERITY_LEVELS_PCI_DSS = {
  high: 7.0,
  medium: 4.0,
  low: 0.1,
};

const SEVERITY_LEVELS_DEFAULT = {
  high: 7.0,
  medium: 4.0,
  low: 0.1,
};

export const getSeverityLevels = type => {
  switch (type) {
    case SEVERITY_CLASS_PCI_DSS:
      return SEVERITY_LEVELS_PCI_DSS;
    default:
      return SEVERITY_LEVELS_DEFAULT;
  }
};

export const getSeverityLevelsOld = type => {
  if (type === SEVERITY_CLASS_PCI_DSS) {
    return {
      max_high: 10.0,
      min_high: 4.0,
      max_medium: 3.9,
      min_medium: 3.9,
      max_low: 3.9,
      min_low: 3.9,
      max_log: 3.9,
    };
  }

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

// vim: set ts=2 sw=2 tw=80:
