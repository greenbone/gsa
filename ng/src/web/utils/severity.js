/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2016 - 2018 Greenbone Networks GmbH
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
import _ from 'gmp/locale';

export const _LOG = _('Log');
export const _LOW = _('Low');
export const _MEDIUM = _('Medium');
export const _HIGH = _('High');
export const _NONE = _('None');
export const _FALSE_POSITIVE = _('False Positive');
export const _ERROR = _('Error');
export const _DEBUG = _('Debug');

export const _NA = _('N/A');

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
  if (type === 'classic') {
    if (value === 0) {
      return LOG;
    }
    if (value > 0 && value <= 2) {
      return LOW;
    }
    if (value > 2 && value <= 5) {
      return MEDIUM;
    }
    if (value > 5 && value <= 10) {
      return HIGH;
    }
    return NA;
  }

  if (type === 'pci-dss') {
    if (value === 0 && value < 4) {
      return LOG;
    }
    else if (value >= 4) {
      return HIGH;
    }
    return NA;
  }

  if (value === 0) {
    return LOG;
  }
  else if (value > 0 && value < 4) {
    return LOW;
  }
  else if (value >= 4 && value < 7) {
    return MEDIUM;
  }
  else if (value >= 7 && value <= 10) {
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

export const resultSeverityRiskFactor = value => {
  if (value > LOG_VALUE) {
    return severityRiskFactor(value);
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

export const translateRiskFactor = factor => TRANSLATED_RISK_FACTORS[factor];

export const translatedResultSeverityRiskFactor = value =>
  translateRiskFactor(resultSeverityRiskFactor(value));

export const SEVERITY_CLASS_CLASSIC = 'classic';
export const SEVERITY_CLASS_PCI_DSS = 'pci-dss';
export const SEVERITY_CLASS_NIST = 'nist';
export const SEVERITY_CLASS_BSI = 'bsi';

export const getSeverityLevels = type => {
  if (type === SEVERITY_CLASS_CLASSIC) {
    return {
      max_high: 10.0,
      min_high: 5.1,
      max_medium: 5.0,
      min_medium: 2.1,
      max_low: 2.0,
      min_low: 0.1,
      max_log: 0.0,
    };
  }
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
