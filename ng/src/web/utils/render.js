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
import 'core-js/fn/string/starts-with';

import d3 from 'd3';
import React from 'react';

import _ from 'gmp/locale.js';
import logger from 'gmp/log.js';
import {is_defined, is_empty, map, shorten, split} from 'gmp/utils';

import Wrapper from '../components/layout/wrapper.js';

const log = logger.getLogger('web.render');

export const LOG = _('Log');
export const LOW = _('Low');
export const MEDIUM = _('Medium');
export const HIGH = _('High');
export const NONE = _('None');
export const FALSE_POSITIVE = _('False Positive');
export const ERROR = _('Error');
export const DEBUG = _('Debug');

export const N_A = _('N/A');

export const UNSET_VALUE = '0';
export const UNSET_LABEL = '--';

export function render_options(list, default_opt_value,
  default_opt = UNSET_LABEL) {
  const options = map(list, entry => {
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

/**
 * Render a entities list as items array
 *
 * @param {Array} list               The entities list
 * @param {*}     default_item_value (optional) Value for the default item
 * @param {*}     default_item_label (optional. Default is '--') Label to display for the default item
 *
 * @returns {Array} An array to be used as items for a Select component or undefined
 */
export const render_select_items = (
  list,
  default_item_value,
  default_item_label = UNSET_LABEL,
) => {
  const items = is_defined(list) ?
    list.map(item => ({label: item.name, value: item.id})) :
    undefined;

  if (!is_defined(default_item_value)) {
    return items;
  }

  const default_item = {
    value: default_item_value,
    label: default_item_label,
  };
  return is_defined(items) ? [default_item, ...items] : [default_item];
};

export const cvss_number_format = d3.format('0.1f');

export function cvss_risk_factor(score, type) {
  if (type === 'classic') {
    if (score === 0) {
      return LOG;
    }
    if (score > 0 && score <= 2) {
      return LOW;
    }
    if (score > 2 && score <= 5) {
      return MEDIUM;
    }
    if (score > 5 && score <= 10) {
      return HIGH;
    }
    return NONE;
  }
  if (type === 'pci-dss') {
    if (score === 0 && score < 4) {
      return LOG;
    }
    else if (score >= 4) {
      return HIGH;
    }
    return NONE;
  }

  if (score === 0) {
    return LOG;
  }
  else if (score > 0 && score < 4) {
    return LOW;
  }
  else if (score >= 4 && score < 7) {
    return MEDIUM;
  }
  else if (score >= 7 && score <= 10) {
    return HIGH;
  }
  return NONE;
}

export function result_cvss_risk_factor(score) {
  if (score > 0) {
    return cvss_risk_factor(score);
  }
  if (score === 0) {
    return LOG;
  }
  if (score === -1) {
    return FALSE_POSITIVE;
  }
  if (score === -2) {
    return DEBUG;
  }
  if (score === -3) {
    return ERROR;
  }
  return N_A;
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

export function render_nvt_name(nvt, length = 70) {
  if (!is_defined(nvt) || !is_defined(nvt.name)) {
    return '';
  }

  if (nvt.name.length < length) {
    return nvt.name;
  }

  return (
    <abbr title={nvt.name + ' (' + nvt.oid + ')'}>
      {shorten(nvt.name, length)}
    </abbr>
  );
}

export function render_component(Component, props = {}) {
  if (Component) {
    return <Component {...props}/>;
  }
  return null;
}

export function render_children(children) {
  if (React.Children.count(children) > 1) {
    return (
      <Wrapper>{children}</Wrapper>
    );
  }
  return children;
}

export const na = value => {
  return is_empty(value) ? N_A : value;
};

export const render_yesno = value => {
  switch (value) {
    case true:
    case 1:
    case '1':
    case 'yes':
    case 'Yes':
      return _('Yes');
    case false:
    case 0:
    case '0':
    case 'no':
    case 'No':
      return _('No');
    default:
      return _('Unknown');
  }
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
    case 'vulns':
      return _('Vulnerabilities');
    case '':
      return '';
    default:
      log.debug('Unknown type', type);
      return type;
  }
};

export function permission_description(name, resource, subject) {
  if (is_defined(subject) && !is_empty(subject.type)) {
    return permission_description_resource_with_subject(name, resource,
      subject);
  }
  return permission_description_resource(name, resource);
}

export function permission_description_resource(name, resource) {
  if (is_defined(resource) && !is_empty(resource.type)) {
    name = name.toLowerCase();
    const resource_type = {
      type: type_name(resource.type, false),
      name: resource.name,
    };

    if (name === 'super') {
      return _('Has super access to all resources of {{type}} {{name}}',
        resource_type);
    }

    const [type] = split(name, '_', 1);
    switch (type) {
      case 'create':
        return _('May create a new {{type}}', resource_type);
      case 'delete':
        return _('May delete {{type}} {{name}}', resource_type);
      case 'get':
        return _('Has read access to {{type}} {{name}}', resource_type);
      case 'modify':
        return _('Has write access to {{type}} {{name}}', resource_type);
      default:
        break;
    }
  }

  return simple_permission_description(name);
}

export function permission_description_resource_with_subject(name, resource,
  subject) {
  if (is_defined(resource) && !is_empty(resource.type)) {
    name = name.toLowerCase();
    const type = {
      subject_type: type_name(subject.type, false),
      subject_name: subject.name,
      resource_type: type_name(resource.type, false),
      resource_name: resource.name,
    };

    if (name === 'super') {
      return _('{{subject_type}} {{subject_name}} has super access to ' +
        'all resources of {{resource_type}} {{resource_name}}', type);
    }

    const [command_type, command_name] = split(name, '_', 1);
    type.resource_type = type_name(command_name, false);
    switch (command_type) {
      case 'create':
        return _('{{subject_type}} {{subject_name}} may create a new ' +
          '{{resource_type}}', type);
      case 'delete':
        return _('{{subject_type}} {{subject_name}} may delete ' +
          '{{resource_type}} {{resource_name}}', type);
      case 'get':
        return _('{{subject_type}} {{subject_name}} has read access to ' +
          '{{resource_type}} {{resource_name}}', type);
      case 'modify':
        return _('{{subject_type}} {{subject_name}} has write access to ' +
          '{{resource_type}} {{resource_name}}', type);
      default:
        break;
    }
  }

  return simple_permission_description_with_subject(name, subject);
}

export function simple_permission_description(name) {
  name = name.toLowerCase();
  switch (name) {
    case 'super':
      return _('Has super access');
    case 'authenticate':
      return _('May login');
    case 'commands':
      return _('May run multiple OMP commands in one');
    case 'everything':
      return _('Has permission to run all commands');
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

  const [type, res] = split(name, '_', 1);
  switch (type) {
    case 'create':
      return _('May create a new {{type}}', {type: type_name(res)});
    case 'delete':
      return _('May delete an existing {{type}}', {type: type_name(res)});
    case 'get':
      return _('Has read access to {{type}}', {type: type_name(res)});
    case 'modify':
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
      return name;
  }
}

export function simple_permission_description_with_subject(name, subject) {
  name = name.toLowerCase();
  let type = {
    subject_type: type_name(subject.type, false),
    subject_name: subject.name,
  };

  switch (name) {
    case 'super':
      return _('{{subject_type}} {{subject_name}} has super access', type);
    case 'authenticate':
      return _('{{subject_type}} {{subject_name}} may login', type);
    case 'commands':
      return _('{{subject_type}} {{subject_name}} may run multiple OMP ' +
        'commands in one', type);
    case 'everything':
      return _('{{subject_type}} {{subject_name}} has all permissions', type);
    case 'empty_trashcan':
      return _('{{subject_type}} {{subject_name}} may empty the ' +
        'trashcan', type);
    case 'get_dependencies':
      return _('{{subject_type}} {{subject_name}} may get the dependencies ' +
        'of NVTs', type);
    case 'get_version':
      return _('{{subject_type}} {{subject_name}} may get version ' +
        'information', type);
    case 'help':
      return _('{{subject_type}} {{subject_name}} may get the help text', type);
    case 'modify_auth':
      return _('{{subject_type}} {{subject_name}} has write access to the ' +
        'authentication configuration', type);
    case 'restore':
      return _('{{subject_type}} {{subject_name}} may restore items from ' +
        'the trashcan', type);
    case 'resume_task':
      return _('{{subject_type}} {{subject_name}} may resume Task', type);
    case 'start_task':
      return _('{{subject_type}} {{subject_name}} may start Task', type);
    case 'stop_task':
      return _('{{subject_type}} {{subject_name}} may stop Task', type);
    case 'run_wizard':
      return _('{{subject_type}} {{subject_name}} may run Wizard', type);
    case 'test_alert':
      return _('{{subject_type}} {{subject_name}} may test Alert', type);
    default:
      break;
  }

  const [command_type, res] = split(name, '_', 1);
  type = {
    subject_type: type_name(subject.type, false),
    subject_name: subject.name,
    resource_type: type_name(res),
  };
  switch (command_type) {
    case 'create':
      return _('{{subject_type}} {{subject_name}} may create a new ' +
        '{{resource_type}}', type);
    case 'delete':
      return _('{{subject_type}} {{subject_name}} may delete an existing ' +
        '{{resource_type}}', type);
    case 'get':
      return _('{{subject_type}} {{subject_name}} has read access to ' +
        '{{resource_type}}', type);
    case 'modify':
      return _('{{subject_type}} {{subject_name}} has write access to ' +
        '{{resource_type}}', type);
    case 'sync':
      if (res === 'cert') {
        return _('{{subject_type}} {{subject_name}} may sync the CERT ' +
          'feed', type);
      }
      if (res === 'feed') {
        return _('{{subject_type}} {{subject_name}} may sync the NVT ' +
          'feed', type);
      }
      if (res === 'scap') {
        return _('{{subject_type}} {{subject_name}} may sync the SCAP ' +
          'feed', type);
      }
      return _('{{subject_type}} {{subject_name}} may sync ' +
        '{{resource_type}}', type);
    case 'move':
      return _('{{subject_type}} {{subject_name}} may move ' +
        '{{resource_type}}', type);
    case 'verify':
      return _('{{subject_type}} {{subject_name}} may verify ' +
        '{{resource_type}}', type);
    default:
      return name;
  }
}

export const render_entities_counts = counts => {
  return _('{{filtered}} of {{all}}', counts);
};

export const render_section_title = (counts, title) => {
  if (!is_defined(counts)) {
    return title;
  }

  return _('{{title}} {{filtered}} of {{all}}', {
    title,
    ...counts,
  });
};

// vim: set ts=2 sw=2 tw=80:
