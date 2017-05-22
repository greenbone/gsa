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

import {is_defined, is_empty, map} from '../../utils.js';

import Model from '../model.js';

export class User extends Model {

  parseProperties(elem) {
    let ret = super.parseProperties(elem);

    ret.roles = map(elem.role, role => {
      return new Model(role);
    });

    delete ret.role;

    if (is_empty(elem.groups)) {
      ret.groups = [];
    }
    else {
      ret.groups = map(elem.groups.group, group => {
        return new Model(group);
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

    ret.auth_method = elem.sources.source;
    delete ret.sources;

    return ret;
  }
}

export default User;

// vim: set ts=2 sw=2 tw=80:
