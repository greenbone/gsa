/* Copyright (C) 2016-2021 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License
 * as published by the Free Software Foundation, either version 3
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */

import {format} from 'd3-format';

import React from 'react';

import {_} from 'gmp/locale/lang';
import {dateFormat} from 'gmp/locale/date';

import {isDefined, isFunction, isObject} from 'gmp/utils/identity';
import {isEmpty, shorten, split} from 'gmp/utils/string';
import {typeName, getEntityType} from 'gmp/utils/entitytype';

export const UNSET_VALUE = null;
export const UNSET_LABEL = '--';

/**
 * Render a entities list as items array
 *
 * @param {Array} list               The entities list
 * @param {*}     default_item_value (optional) Value for the default item
 * @param {*}     default_item_label (optional. Default is '--') Label to display for the default item
 *
 * @returns {Array} An array to be used as items for a Select component or undefined
 */
export const renderSelectItems = (
  list,
  default_item_value,
  default_item_label = UNSET_LABEL,
) => {
  const items = isDefined(list)
    ? list.map(item => ({label: item.name, value: item.id}))
    : undefined;

  if (!isDefined(default_item_value)) {
    return items;
  }

  const default_item = {
    value: default_item_value,
    label: default_item_label,
  };
  return isDefined(items) ? [default_item, ...items] : [default_item];
};

export const severityFormat = format('0.1f');

export const renderNvtName = (oid, name, length = 70) => {
  if (!isDefined(name)) {
    return oid;
  }

  if (name.length < length) {
    return name;
  }

  return <abbr title={name + ' (' + oid + ')'}>{shorten(name, length)}</abbr>;
};

export const renderComponent = (Component, props = {}) =>
  Component ? <Component {...props} /> : null;

export const renderChildren = children =>
  React.Children.count(children) > 1 ? (
    <React.Fragment>{children}</React.Fragment>
  ) : (
    children
  );

export const na = value => {
  return isEmpty(value) ? _('N/A') : value;
};

export const renderYesNo = value => {
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

export const getTranslatableSeverityOrigin = origin => {
  switch (origin) {
    case 'Third Party':
      return _('Third Party');
    case 'Vendor':
      return _('Vendor');
    case 'Greenbone':
      return _('Greenbone');
    case 'NVD':
      return _('NVD');
    default:
      return origin;
  }
};

const getPermissionTypeName = type => {
  switch (type) {
    case 'aggregates':
      return _('Aggregates');
    case 'alerts':
      return _('Alerts');
    case 'assets':
      return _('Assets');
    case 'configs':
      return _('Scan Configs');
    case 'cpes':
      return _('CPEs');
    case 'cves':
      return _('CVEs');
    case 'credentials':
      return _('Credentials');
    case 'cert_bund_advs':
      return _('CERT-Bund Advisories');
    case 'dfn_cert_advs':
      return _('DFN-CERT Advisories');
    case 'feeds':
      return _('Feeds');
    case 'filters':
      return _('Filters');
    case 'groups':
      return _('Groups');
    case 'hosts':
      return _('Hosts');
    case 'info':
      return _('SecInfo');
    case 'os':
      return _('Operating Systems');
    case 'ovaldefs':
      return _('OVAL Definitions');
    case 'notes':
      return _('Notes');
    case 'nvts':
      return _('NVTs');
    case 'nvt_families':
      return _('NVT Families');
    case 'overrides':
      return _('Overrides');
    case 'permissions':
      return _('Permissions');
    case 'port_lists':
      return _('Port Lists');
    case 'port_ranges':
      return _('Port Ranges');
    case 'preferences':
      return _('Preferences');
    case 'reports':
      return _('Reports');
    case 'report_formats':
      return _('Report Formats');
    case 'results':
      return _('Results');
    case 'roles':
      return _('Roles');
    case 'scanners':
      return _('Scanners');
    case 'schedules':
      return _('Schedules');
    case 'settings':
      return _('Settings');
    case 'system_reports':
      return _('System Reports');
    case 'tags':
      return _('Tags');
    case 'targets':
      return _('Targets');
    case 'tasks':
      return _('Tasks');
    case 'tickets':
      return _('Tickets');
    case 'tlscertificates':
      return _('TLS Certificates');
    case 'users':
      return _('Users');
    case 'vulns':
      return _('Vulnerabilities');
    default:
      return type;
  }
};

export const permissionDescription = (name, resource, subject) =>
  isDefined(subject)
    ? permissionDescriptionResourceWithSubject(name, resource, subject)
    : permissionDescriptionResource(name, resource);

export const permissionDescriptionResource = (name, resource) => {
  if (isDefined(resource)) {
    name = name.toLowerCase();
    const resourceType = {
      type: typeName(getEntityType(resource)),
      name: resource.name,
    };

    if (name === 'super') {
      return _(
        'Has super access to all resources of {{type}} {{name}}',
        resourceType,
      );
    }

    const [type] = split(name, '_', 1);
    switch (type) {
      case 'create':
        return _('May create a new {{type}}', resourceType);
      case 'delete':
        return _('May delete {{type}} {{name}}', resourceType);
      case 'get':
        return _('Has read access to {{type}} {{name}}', resourceType);
      case 'modify':
        return _('Has write access to {{type}} {{name}}', resourceType);
      default:
        break;
    }
  }

  return simplePermissionDescription(name);
};

export const permissionDescriptionResourceWithSubject = (
  name,
  resource,
  subject,
) => {
  if (isDefined(resource)) {
    name = name.toLowerCase();
    const type = {
      subjectType: typeName(getEntityType(subject)),
      subjectName: subject.name,
      resourceType: typeName(getEntityType(resource)),
      resourceName: resource.name,
    };

    if (name === 'super') {
      return _(
        '{{subjectType}} {{subjectName}} has super access to ' +
          'all resources of {{resourceType}} {{resourceName}}',
        type,
      );
    }

    const [commandType] = split(name, '_', 1);
    switch (commandType) {
      case 'create':
        return _(
          '{{subjectType}} {{subjectName}} may create a new ' +
            '{{resourceType}}',
          type,
        );
      case 'delete':
        return _(
          '{{subjectType}} {{subjectName}} may delete ' +
            '{{resourceType}} {{resourceName}}',
          type,
        );
      case 'get':
        return _(
          '{{subjectType}} {{subjectName}} has read access to ' +
            '{{resourceType}} {{resourceName}}',
          type,
        );
      case 'modify':
        return _(
          '{{subjectType}} {{subjectName}} has write access to ' +
            '{{resourceType}} {{resourceName}}',
          type,
        );
      default:
        break;
    }
  }

  return simplePermissionDescriptionWithSubject(name, subject);
};

export const simplePermissionDescription = name => {
  name = name.toLowerCase();
  switch (name) {
    case 'super':
      return _('Has super access');
    case 'authenticate':
      return _('May login');
    case 'commands':
      return _('May run multiple GMP commands in one');
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

  const [commandType, res] = split(name, '_', 1);
  const entityType =
    commandType === 'get' ? getPermissionTypeName(res) : typeName(res);

  switch (commandType) {
    case 'create':
      return _('May create a new {{entityType}}', {entityType});
    case 'delete':
      return _('May delete an existing {{entityType}}', {entityType});
    case 'get':
      return _('Has read access to {{entityType}}', {entityType});
    case 'modify':
      return _('Has write access to {{entityType}}', {entityType});
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
      return _('May sync {{entityType}}', {entityType});
    case 'move':
      return _('May move {{entityType}}', {entityType});
    case 'verify':
      return _('May verify {{entityType}}', {entityType});
    default:
      return name;
  }
};

export const simplePermissionDescriptionWithSubject = (name, subject) => {
  name = name.toLowerCase();
  let type = {
    subjectType: typeName(getEntityType(subject)),
    subjectName: subject.name,
  };

  switch (name) {
    case 'super':
      return _('{{subjectType}} {{subjectName}} has super access', type);
    case 'authenticate':
      return _('{{subjectType}} {{subjectName}} may login', type);
    case 'commands':
      return _(
        '{{subjectType}} {{subjectName}} may run multiple GMP ' +
          'commands in one',
        type,
      );
    case 'everything':
      return _('{{subjectType}} {{subjectName}} has all permissions', type);
    case 'empty_trashcan':
      return _('{{subjectType}} {{subjectName}} may empty the trashcan', type);
    case 'get_dependencies':
      return _(
        '{{subjectType}} {{subjectName}} may get the dependencies of NVTs',
        type,
      );
    case 'get_version':
      return _(
        '{{subjectType}} {{subjectName}} may get version information',
        type,
      );
    case 'help':
      return _('{{subjectType}} {{subjectName}} may get the help text', type);
    case 'modify_auth':
      return _(
        '{{subjectType}} {{subjectName}} has write access to the ' +
          'authentication configuration',
        type,
      );
    case 'restore':
      return _(
        '{{subjectType}} {{subjectName}} may restore items from ' +
          'the trashcan',
        type,
      );
    case 'resume_task':
      return _('{{subjectType}} {{subjectName}} may resume Task', type);
    case 'start_task':
      return _('{{subjectType}} {{subjectName}} may start Task', type);
    case 'stop_task':
      return _('{{subjectType}} {{subjectName}} may stop Task', type);
    case 'run_wizard':
      return _('{{subjectType}} {{subjectName}} may run Wizard', type);
    case 'test_alert':
      return _('{{subjectType}} {{subjectName}} may test Alert', type);
    default:
      break;
  }

  const [commandType, res] = split(name, '_', 1);
  type = {
    subjectType: typeName(getEntityType(subject)),
    subjectName: subject.name,
    resourceType:
      commandType === 'get' ? getPermissionTypeName(res) : typeName(res),
  };
  switch (commandType) {
    case 'create':
      return _(
        '{{subjectType}} {{subjectName}} may create a new ' +
          '{{resourceType}}',
        type,
      );
    case 'delete':
      return _(
        '{{subjectType}} {{subjectName}} may delete an existing ' +
          '{{resourceType}}',
        type,
      );
    case 'get':
      return _(
        '{{subjectType}} {{subjectName}} has read access to ' +
          '{{resourceType}}',
        type,
      );
    case 'modify':
      return _(
        '{{subjectType}} {{subjectName}} has write access to ' +
          '{{resourceType}}',
        type,
      );
    case 'sync':
      if (res === 'cert') {
        return _(
          '{{subjectType}} {{subjectName}} may sync the CERT feed',
          type,
        );
      }
      if (res === 'feed') {
        return _('{{subjectType}} {{subjectName}} may sync the NVT feed', type);
      }
      if (res === 'scap') {
        return _(
          '{{subjectType}} {{subjectName}} may sync the SCAP feed',
          type,
        );
      }
      return _(
        '{{subjectType}} {{subjectName}} may sync {{resourceType}}',
        type,
      );
    case 'move':
      return _(
        '{{subjectType}} {{subjectName}} may move {{resourceType}}',
        type,
      );
    case 'verify':
      return _(
        '{{subjectType}} {{subjectName}} may verify {{resourceType}}',
        type,
      );
    default:
      return name;
  }
};

export const setRef = (...refs) => ref => {
  for (const rf of refs) {
    if (isFunction(rf)) {
      rf(ref);
    } else if (isObject(rf) && isDefined(rf.current)) {
      rf.current = ref;
    }
  }
};

export const generateFilename = ({
  creationTime,
  extension = 'xml',
  fileNameFormat,
  reportFormat = 'XML',
  id = 'list',
  modificationTime,
  resourceName,
  resourceType,
  username,
}) => {
  let fileName = isDefined(fileNameFormat) ? fileNameFormat : '';
  const currentTime = new Date();
  const cTime = isDefined(creationTime) ? creationTime : currentTime;

  let mTime = isDefined(modificationTime) ? modificationTime : creationTime;
  if (!isDefined(mTime)) {
    mTime = currentTime;
  }

  const percentC = dateFormat(cTime, 'YYYYMMDD');
  const percentc = dateFormat(cTime, 'HHMMSS');
  const percentD = dateFormat(currentTime, 'YYYYMMDD');
  const percentt = dateFormat(currentTime, 'HHMMSS');
  const percentM = dateFormat(mTime, 'YYYYMMDD');
  const percentm = dateFormat(mTime, 'HHMMSS');
  const percentN = isDefined(resourceName) ? resourceName : resourceType;

  const fileNameMap = {
    '%C': percentC, // The creation date in the format YYYYMMDD. Changed to the current date if a creation date is not available.
    '%c': percentc, // The creation time in the format HHMMSS. Changed to the current time if a creation time is not available.
    '%D': percentD, // The current date in the format YYYYMMDD.
    '%F': reportFormat, // The name of the format plug-in used (XML for lists and types other than reports).
    '%M': percentM, // The modification date in the format YYYYMMDD. Changed to the creation date or to the current date if a modification date is not available.
    '%m': percentm, // The modification time in the format HHMMSS. Changed to the creation time or to the current time if a modification time is not available.
    '%N': percentN, // The name for the resource or the associated task for reports. Lists and types without a name will use the type (see %T).
    '%T': resourceType, // The resource type, e.g. “task”, “port_list”. Pluralized for list pages.
    '%t': percentt, // The current time in the format HHMMSS.
    '%U': id, // The unique ID of the resource or “list” for lists of multiple resources.
    '%u': username, // The name for the currently logged in user.
    '%%': '%',
  };
  const regExp = new RegExp(Object.keys(fileNameMap).join('|'), 'gi');

  fileName = fileName.replace(regExp, match => fileNameMap[match]);

  fileName += '.' + extension;

  if (fileName === '.' + extension) {
    // if something went wrong, make sure to always have a filename
    fileName = 'unnamed.unknown';
  }

  return fileName;
};

// vim: set ts=2 sw=2 tw=80:
