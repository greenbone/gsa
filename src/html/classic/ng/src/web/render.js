/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2016 - 2017 Greenbone Networks GmbH
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

import d3 from 'd3';
import React from 'react';

import _ from '../locale.js';
import {is_defined, is_empty, map, shorten} from '../utils.js';

/* eslint-disable no-unused-vars */
/* add variables for translation message extractions */

const LOG = _('Log');
const LOW = _('Low');
const MEDIUM = _('Medium');
const HIGH = _('High');
const NONE = _('None');
const FALSE_POSITIVE = _('False Positive');
const ERROR = _('Error');
const DEBUG = _('Debug');

/* eslint-enable no-unused-vars */

export const N_A = _('N/A');

export function render_options(list, default_opt_value, default_opt = '--') {
  let options = map(list, entry => {
    return (
      <option key={entry.id} value={entry.id}>{entry.name}</option>
    );
  });
  if (is_defined(default_opt_value)) {
    options.unshift(
      <option key={default_opt_value} value={default_opt_value}>
        {default_opt}
      </option>
    );
  }
  return options;
}

export const cvss_number_format = d3.format('0.1f');

export function cvss_risk_factor(score, type) {
  if (type === 'classic') {
    if (score === 0) {
      return 'Log';
    }
    if (score > 0 && score <= 2) {
      return 'Low';
    }
    if (score > 2 && score <= 5) {
      return 'Medium';
    }
    if (score > 5 && score <= 10) {
      return 'High';
    }
    return 'None';
  }
  if (type === 'pci-dss') {
    if (score === 0 && score < 4) {
      return 'Log';
    }
    else if (score >= 4) {
      return 'High';
    }
    return 'None';
  }

  if (score === 0) {
    return 'Log';
  }
  else if (score > 0 && score < 4) {
    return 'Low';
  }
  else if (score >= 4 && score < 7) {
    return 'Medium';
  }
  else if (score >= 7 && score <= 10) {
    return 'High';
  }
  return 'None';
}

export function result_cvss_risk_factor(score) {
  if (score > 0) {
    return cvss_risk_factor(score);
  }
  if (score === 0) {
    return 'Log';
  }
  if (score === -1) {
    return 'False Positive';
  }
  if (score === -2) {
    return 'Debug';
  }
  if (score === -3) {
    return 'Error';
  }
  return 'N/A';
}

export function get_severity_levels(type) {
  if (type === 'classic') {
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
  if (type === 'pci-dss') {
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
}

export function render_nvt_name(nvt) {
  if (!is_defined(nvt) || !is_defined(nvt.name)) {
    return '';
  }

  if (nvt.name.length < 70) {
    return nvt.name;
  }

  return (
    <abbr title={nvt.name + ' (' + nvt.oid + ')'}>
      {shorten(nvt.name, 70)}
    </abbr>
  );
}

export function render_component(Component, props = {}) {
  if (Component) {
    return <Component {...props}/>;
  }
  return null;
}

export const withComponentDefaults = (Component, options = {}) => {
  const CompentWrapper = props => <Component {...options} {...props}/>;
  return CompentWrapper;
};

export const na = value => {
  return is_empty(value) ? N_A : value;
};

export const withPrefix = Component => {
  const CompentWrapper = ({prefix, ...props}) => {
    if (is_defined(prefix)) {
      prefix += '_';
    }
    else {
      prefix = '';
    }
    return <Component {...props} prefix={prefix}/>;
  };

  CompentWrapper.propTypes = {
    prefix: React.PropTypes.string,
  };

  return CompentWrapper;
};

export function type_name(type) {
  switch (type) {
    case 'agent':
      return _('Agent');
    case 'alert':
      return _('Alert');
    case 'allinfo':
      return _('All SecInfo');
    case 'config':
      return _('Scan Config');
    case 'cpe':
      return _('CPE');
    case 'cve':
      return _('CVE');
    case 'credential':
      return _('Credential');
    case 'cert_bund_adv':
      return _('CERT-Bund Advisory');
    case 'dfn_cert_adv':
      return _('DFN-CERT Advisory');
    case 'filter':
      return _('Filter');
    case 'group':
      return _('Group');
    case 'host':
      return _('Host');
    case 'os':
      return _('Operating System');
    case 'ovaldef':
      return _('OVAL Definition');
    case 'note':
      return _('Note');
    case 'nvt':
      return _('NVT');
    case 'override':
      return _('Override');
    case 'permission':
      return _('Permission');
    case 'port_list':
      return _('Port List');
    case 'report':
      return _('Report');
    case 'report_format':
      return _('Report Format');
    case 'result':
      return _('Result');
    case 'role':
      return _('Role');
    case 'scanner':
      return _('Scanner');
    case 'schedule':
      return _('Schedule');
    case 'target':
      return _('Target');
    case 'task':
      return _('Task');
    case 'user':
      return _('User');
    case 'vuln':
      return _('Vulnerability');
    case '':
      return '';
    default:
      return _('Unkonwn');
  }
};

// vim: set ts=2 sw=2 tw=80:
