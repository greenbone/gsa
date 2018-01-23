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
import 'core-js/fn/set';
import 'core-js/fn/symbol';

import {is_defined, map, pluralize_type} from '../utils.js';

const types = {
  host: 'asset',
  hosts: 'asset',
  os: 'asset',
  cve: 'info',
  cves: 'info',
  cpe: 'info',
  cpes: 'info',
  dfncertadv: 'info',
  dfncertadvs: 'info',
  ovaldefs: 'info',
  ovaldef: 'info',
  certbundadv: 'info',
  certbundadvs: 'info',
  portlist: 'port_list',
  portlists: 'port_list',
  reportformat: 'report_format',
  reportformats: 'report_format',
  scanconfig: 'config',
  scanconfigs: 'config',
};

const check_type = type => {
  const ctype = types[type];
  if (is_defined(ctype)) {
    return ctype;
  }
  return type;
};

class Capabilities {

  constructor(cap_names) {
    this._has_caps = is_defined(cap_names);

    let caps;

    if (this._has_caps) {
      caps = map(cap_names, name => name.toLowerCase());
    }

    this._capabilities = new Set(caps);
  }

  [Symbol.iterator]() {
    return this._capabilities[Symbol.iterator]();
  }

  get(name) {
    name = name.toLowerCase();
    const capability = this._capabilities.get(name);
    return is_defined(capability) ? capability : {};
  }

  areDefined() {
    return this._has_caps;
  }

  has(name) {
    return this._capabilities.has(name);
  }

  forEach(callback) {
    return this._capabilities.forEach(callback);
  }

  mayAccess(type) {
    return this.mayOp('get_' + pluralize_type(check_type(type)));
  }

  mayOp(value) {
    return this.has(value.toLowerCase()) || this.has('everything');
  }

  mayClone(type) {
    return this.mayOp('create_' + check_type(type));
  }

  mayEdit(type) {
    return this.mayOp('modify_' + check_type(type));
  }

  mayDelete(type) {
    return this.mayOp('delete_' + check_type(type));
  }

  mayCreate(type) {
    return this.mayOp('create_' + check_type(type));
  }

  get length() {
    return this._capabilities.size;
  }
}

export default Capabilities;

// vim: set ts=2 sw=2 tw=80:
