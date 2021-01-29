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

import {isDefined} from 'gmp/utils/identity';
import {map} from 'gmp/utils/array';
import {pluralizeType} from 'gmp/utils/entitytype';

const types = {
  audit: 'task',
  audits: 'task',
  host: 'asset',
  hosts: 'asset',
  os: 'asset',
  cve: 'info',
  cves: 'info',
  cpe: 'info',
  cpes: 'info',
  dfncert: 'info',
  dfncerts: 'info',
  nvt: 'info',
  nvts: 'info',
  operatingsystem: 'asset',
  operatingsystems: 'asset',
  ovaldefs: 'info',
  ovaldef: 'info',
  certbund: 'info',
  certbunds: 'info',
  secinfo: 'info',
  secinfos: 'info',
  policy: 'config',
  policies: 'config',
  portlist: 'port_list',
  portlists: 'port_list',
  reportformat: 'report_format',
  reportformats: 'report_format',
  scanconfig: 'config',
  scanconfigs: 'config',
  tlscertificate: 'tls_certificate',
  tlscertificates: 'tls_certificate',
};

const convertType = type => {
  const ctype = types[type];
  if (isDefined(ctype)) {
    return ctype;
  }
  return type;
};

class Capabilities {
  constructor(cap_names) {
    this._has_caps = isDefined(cap_names);

    let caps;

    if (this._has_caps) {
      caps = map(cap_names, name => name.toLowerCase());
    }

    this._capabilities = new Set(caps);
  }

  [Symbol.iterator]() {
    return this._capabilities[Symbol.iterator]();
  }

  map(func) {
    const result = [];

    let index = 0;
    this._capabilities.forEach((entry, set) => {
      result.push(func(entry, index, set));
      index += 1;
    });

    return result;
  }

  areDefined() {
    return this._has_caps;
  }

  has(name) {
    return this._capabilities.has(name.toLowerCase());
  }

  mayAccess(type) {
    return this.mayOp('get_' + pluralizeType(convertType(type)));
  }

  mayOp(value) {
    return this.has(value) || this.has('everything');
  }

  mayClone(type) {
    return this.mayOp('create_' + convertType(type));
  }

  mayEdit(type) {
    return this.mayOp('modify_' + convertType(type));
  }

  mayDelete(type) {
    return this.mayOp('delete_' + convertType(type));
  }

  mayCreate(type) {
    return this.mayOp('create_' + convertType(type));
  }

  get length() {
    return this._capabilities.size;
  }
}

export default Capabilities;

// vim: set ts=2 sw=2 tw=80:
