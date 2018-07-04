/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2018 Greenbone Networks GmbH
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
import _ from '../locale';

import {is_defined} from './identity';

export const getEntityType = (model = {}) => {
  const {entity_type: entityType} = model;
  if (entityType === 'info' && is_defined(model.info_type)) {
    return model.info_type;
  }
  if (entityType === 'asset' && is_defined(model.asset_type)) {
    return model.asset_type;
  }
  return entityType;
};

export const pluralizeType = type => type[type.length - 1] === 's' ||
  type === 'info' || type === 'version' ? type : type + 's';

const types = {
  config: 'scanconfig',
  cert_bund_adv: 'certbund',
  dfn_cert_adv: 'dfncert',
  os: 'operatingsystem',
  port_list: 'portlist',
  report_format: 'reportformat',
};

export const normalizeType = type => {
  const ctype = types[type];
  return is_defined(ctype) ? ctype : type;
};

export const typeName = type => {
  type = normalizeType(type);
  switch (type) {
    case 'agent':
      return _('Agent');
    case 'alert':
      return _('Alert');
    case 'allinfo':
      return _('All SecInfo');
    case 'asset':
      return _('Asset');
    case 'cpe':
      return _('CPE');
    case 'cve':
      return _('CVE');
    case 'credential':
      return _('Credential');
    case 'certbund':
      return _('CERT-Bund Advisory');
    case 'dfncert':
      return _('DFN-CERT Advisory');
    case 'filter':
      return _('Filter');
    case 'group':
      return _('Group');
    case 'host':
      return _('Host');
    case 'info':
      return _('SecInfo');
    case 'operatingsystem':
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
    case 'portlist':
      return _('Port List');
    case 'portrange':
      return _('Port Range');
    case 'report':
      return _('Report');
    case 'reportformat':
      return _('Report Format');
    case 'result':
      return _('Result');
    case 'role':
      return _('Role');
    case 'scanconfig':
      return _('Scan Config');
    case 'scanner':
      return _('Scanner');
    case 'schedule':
      return _('Schedule');
    case 'tag':
      return _('Tag');
    case 'target':
      return _('Target');
    case 'task':
      return _('Task');
    case 'user':
      return _('User');
    case 'vuln':
      return _('Vulnerability');
    default:
      return type;
  }
};

// vim: set ts=2 sw=2 tw=80:
