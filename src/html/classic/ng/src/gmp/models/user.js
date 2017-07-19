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

import {is_defined, is_empty, map} from '../utils.js';

import Model from '../model.js';

export const AUTH_METHOD_PASSWORD = 'password';
export const AUTH_METHOD_NEW_PASSWORD = 'newpassword';
export const AUTH_METHOD_LDAP = 'ldap';
export const AUTH_METHOD_RADIUS = 'radius';

class User extends Model {

  static entity_type = 'user';

  parseProperties(elem) {
    let ret = super.parseProperties(elem);

    ret.roles = map(elem.role, role => {
      return new Model(role, 'role');
    });

    delete ret.role;

    if (is_empty(elem.groups)) {
      ret.groups = [];
    }
    else {
      ret.groups = map(elem.groups.group, group => {
        return new Model(group, 'group');
      });
    }

    if (is_defined(elem.hosts)) {
      ret.hosts = {
        addresses: elem.hosts.__text,
        allow: elem.hosts._allow,
      };
    }
    else {
      ret.hosts = {};
    }

    if (is_defined(elem.ifaces)) {
      ret.ifaces = {
        addresses: elem.ifaces.__text,
        allow: elem.ifaces._allow,
      };
    }
    else {
      ret.ifaces = {};
    }

    const {source} = elem.sources;
    if (source === 'ldap_connect') {
      ret.auth_method = AUTH_METHOD_LDAP;
    }
    else if (source === 'radius_connect') {
      ret.auth_method = AUTH_METHOD_RADIUS;
    }
    else {
      ret.auth_method = AUTH_METHOD_PASSWORD;
    }
    delete ret.sources;

    return ret;
  }
}

export default User;

// vim: set ts=2 sw=2 tw=80:
