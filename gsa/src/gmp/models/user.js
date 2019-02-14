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

import {isDefined} from '../utils/identity';
import {isEmpty} from '../utils/string';
import {map} from '../utils/array';

import Model from '../model.js';
import {parseCsv} from '../parser';

export const AUTH_METHOD_PASSWORD = 'password';
export const AUTH_METHOD_NEW_PASSWORD = 'newpassword';
export const AUTH_METHOD_LDAP = 'ldap';
export const AUTH_METHOD_RADIUS = 'radius';

export const ACCESS_ALLOW_ALL = '0';
export const ACCESS_DENY_ALL = '1';

class User extends Model {
  static entityType = 'user';

  parseProperties(elem) {
    const ret = super.parseProperties(elem);

    ret.roles = map(elem.role, role => {
      return new Model(role, 'role');
    });

    delete ret.role;

    if (isEmpty(elem.groups)) {
      ret.groups = [];
    } else {
      ret.groups = map(elem.groups.group, group => {
        return new Model(group, 'group');
      });
    }

    if (isDefined(elem.hosts)) {
      ret.hosts = {
        addresses: parseCsv(elem.hosts.__text),
        allow: elem.hosts._allow,
      };
    } else {
      ret.hosts = {
        addresses: [],
      };
    }

    if (isDefined(elem.ifaces)) {
      ret.ifaces = {
        addresses: parseCsv(elem.ifaces.__text),
        allow: elem.ifaces._allow,
      };
    } else {
      ret.ifaces = {
        addresses: [],
      };
    }

    if (isDefined(elem.sources)) {
      const {source} = elem.sources;
      if (source === 'ldap_connect') {
        ret.auth_method = AUTH_METHOD_LDAP;
      } else if (source === 'radius_connect') {
        ret.auth_method = AUTH_METHOD_RADIUS;
      }
      delete ret.sources;
    } else {
      ret.auth_method = AUTH_METHOD_PASSWORD;
    }

    return ret;
  }
}

export default User;

// vim: set ts=2 sw=2 tw=80:
