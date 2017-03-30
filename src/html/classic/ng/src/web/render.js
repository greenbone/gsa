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
import logger from '../log.js';
import {is_defined, is_empty, map, shorten, split} from '../utils.js';

const log = logger.getLogger('web.render');

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

export function type_name(type, plural = true) {
  if (!plural && type.endsWith('s')) {
    type = type.slice(0, -1);
  }
  switch (type) {
    case 'agent':
      return _('Agent');
    case 'agents':
      return _('Agents');
    case 'aggregates':
      return _('Aggregates');
    case 'alert':
      return _('Alert');
    case 'alerts':
      return _('Alerts');
    case 'allinfo':
      return _('All SecInfo');
    case 'asset':
      return _('Asset');
    case 'assets':
      return _('Assets');
    case 'config':
      return _('Scan Config');
    case 'configs':
      return _('Scan Configs');
    case 'cpe':
      return _('CPE');
    case 'cve':
      return _('CVE');
    case 'credential':
      return _('Credential');
    case 'credentials':
      return _('Credentials');
    case 'cert_bund_adv':
      return _('CERT-Bund Advisory');
    case 'dfn_cert_adv':
      return _('DFN-CERT Advisory');
    case 'feeds':
      return _('Feeds');
    case 'filter':
      return _('Filter');
    case 'filters':
      return _('Filters');
    case 'group':
      return _('Group');
    case 'groups':
      return _('Groups');
    case 'host':
      return _('Host');
    case 'info':
      return _('SecInfo');
    case 'os':
      return _('Operating System');
    case 'ovaldef':
      return _('OVAL Definition');
    case 'note':
      return _('Note');
    case 'notes':
      return _('Notes');
    case 'nvt':
      return _('NVT');
    case 'nvts':
      return _('NVTs');
    case 'nvt_families':
      return _('NVT Families');
    case 'override':
      return _('Override');
    case 'overrides':
      return _('Overrides');
    case 'permission':
      return _('Permission');
    case 'permissions':
      return _('Permissions');
    case 'port_list':
      return _('Port List');
    case 'port_lists':
      return _('Port Lists');
    case 'port_range':
      return _('Port Range');
    case 'preferences':
      return _('Preferences');
    case 'report':
      return _('Report');
    case 'reports':
      return _('Reports');
    case 'report_format':
      return _('Report Format');
    case 'report_formats':
      return _('Report Formats');
    case 'result':
      return _('Result');
    case 'results':
      return _('Results');
    case 'role':
      return _('Role');
    case 'roles':
      return _('Roles');
    case 'scanner':
      return _('Scanner');
    case 'scanners':
      return _('Scanners');
    case 'schedule':
      return _('Schedule');
    case 'schedules':
      return _('Schedules');
    case 'setting':
      return _('Setting');
    case 'settings':
      return _('Settings');
    case 'system_reports':
      return _('System Reports');
    case 'tag':
      return _('Tag');
    case 'tags':
      return _('Tags');
    case 'target':
      return _('Target');
    case 'targets':
      return _('Targets');
    case 'task':
      return _('Task');
    case 'tasks':
      return _('Tasks');
    case 'user':
      return _('User');
    case 'users':
      return _('Users');
    case 'vuln':
      return _('Vulnerability');
    case '':
      return '';
    default:
      log.debug('Unknown type', type);
      return type;
  }
};

export function permission_description(name, resource) {
  const has_resource = is_defined(resource) && !is_empty(resource.type);

  if (has_resource && name === 'super') {
    return _('Has super access to {{type}} {{name}}', {
      type: type_name(resource.type),
      name: resource.name,
    });
  }

  switch (name) {
    case 'super':
    case 'Super':
      return _('Has super access to all users');
    case 'authenticate':
      return _('May login');
    case 'commands':
      return _('May run multiple OMP commands in one');
    case 'everything':
    case 'Everything':
      return _('Has all permissions');
    case 'empty_trashcan':
      return _('May empty the trashcan');
    case 'get_dependencies':
      return _('May get the dependencies of NVTs');
    case 'get_version':
      return _('May get version information');
    case 'help':
      return _('May get the help text');
    case 'modify_auth':
      return _('Has write access to the authentication configuration');
    case 'restore':
      return _('May restore items from the trashcan');
    case 'resume_task':
      return _('May resume Task');
    case 'start_task':
      return _('May start Task');
    case 'stop_task':
      return _('May stop Task');
    case 'run_wizard':
      return _('May run Wizard');
    case 'test_alert':
      return _('May test Alert');
    default:
      break;
  }

  let [type, res] = split(name, '_', 1);
  switch (type) {
    case 'create':
      return _('May create a new {{type}}', {type: type_name(res)});
    case 'delete':
      if (has_resource) {
        return _('May delete {{type}} {{name}}', {
          type: type_name(res, false),
          name: resource.name,
        });
      }
      return _('May delete an existing {{type}}', {type: type_name(res)});
    case 'get':
      if (has_resource) {
        return _('Has read access to {{type}} {{name}}', {
          type: type_name(res, false),
          name: resource.name,
        });
      }
      return _('Has read access to {{type}}', {type: type_name(res)});
    case 'modify':
      if (has_resource) {
        return _('Has write access to {{type}} {{name}}', {
          type: type_name(res, false),
          name: resource.name,
        });
      }
      return _('Has write access to {{type}}', {type: type_name(res)});
    case 'sync':
      if (res === 'cert') {
        return _('May sync the CERT feed');
      }
      if (res === 'feed') {
        return _('May sync the NVT feed');
      }
      if (res === 'scap') {
        return _('May sync the SCAP feed');
      }
      return _('May sync {{type}}', {type: res});
    case 'move':
      return _('May move {{type}}', {type: type_name(res)});
    case 'verify':
      return _('May verify {{type}}', {type: type_name(res)});
    default:
      break;
  }

  return name;
}

// vim: set ts=2 sw=2 tw=80:
