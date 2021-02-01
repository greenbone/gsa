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

import Model, {parseModelFromElement} from 'gmp/model';
import {parseCsv} from 'gmp/parser';

import {map} from 'gmp/utils/array';
import {isDefined} from 'gmp/utils/identity';
import {isEmpty} from 'gmp/utils/string';

export const AUTH_METHOD_PASSWORD = 'password';
export const AUTH_METHOD_NEW_PASSWORD = 'newpassword';
export const AUTH_METHOD_LDAP = 'ldap';
export const AUTH_METHOD_RADIUS = 'radius';

export const ACCESS_ALLOW_ALL = '0';
export const ACCESS_DENY_ALL = '1';

const SUPERADMIN_ROLE_ID = '9c5a6ec6-6fe2-11e4-8cb6-406186ea4fc5';

class User extends Model {
  static entityType = 'user';

  static parseElement(element) {
    const ret = super.parseElement(element);

    ret.roles = map(element.role, role => parseModelFromElement(role, 'role'));

    delete ret.role;

    if (isEmpty(element.groups)) {
      ret.groups = [];
    } else {
      ret.groups = map(element.groups.group, group =>
        parseModelFromElement(group, 'group'),
      );
    }

    if (isDefined(element.hosts)) {
      ret.hosts = {
        addresses: parseCsv(element.hosts.__text),
        allow: element.hosts._allow,
      };
    } else {
      ret.hosts = {
        addresses: [],
      };
    }

    if (isDefined(element.ifaces)) {
      ret.ifaces = {
        addresses: parseCsv(element.ifaces.__text),
        allow: element.ifaces._allow,
      };
    } else {
      ret.ifaces = {
        addresses: [],
      };
    }

    if (isDefined(element.sources)) {
      const {source} = element.sources;
      if (source === 'ldap_connect') {
        ret.authMethod = AUTH_METHOD_LDAP;
      } else if (source === 'radius_connect') {
        ret.authMethod = AUTH_METHOD_RADIUS;
      }
      delete ret.sources;
    } else {
      ret.authMethod = AUTH_METHOD_PASSWORD;
    }

    return ret;
  }

  isSuperAdmin() {
    return isDefined(
      this.roles.find(element => element.id === SUPERADMIN_ROLE_ID),
    );
  }
}

export default User;

// vim: set ts=2 sw=2 tw=80:
