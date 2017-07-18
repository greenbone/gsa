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

import Model from '../model.js';

import {is_defined, is_empty, map} from '../utils.js';

import {parse_int, parse_yesno} from '../parser.js';

import PortList from './portlist.js';

export const TARGET_CREDENTIAL_NAMES = [
  'smb_credential',
  'snmp_credential',
  'ssh_credential',
  'esxi_credential',
];

class Target extends Model {

  static entity_type = "target";

  parseProperties(elem) {
    let ret = super.parseProperties(elem);

    if (is_defined(elem.port_list) && !is_empty(elem.port_list._id)) {
      ret.port_list = new PortList(ret.port_list);
    }
    else {
      delete ret.port_list;
    }

    for (const name of TARGET_CREDENTIAL_NAMES) {
      const cred = ret[name];
      if (is_defined(cred) && !is_empty(cred._id)) {
        ret[name] = new Model(cred, 'credential');
      }
      else {
        delete ret[name];
      }
    }

    ret.hosts = is_empty(elem.hosts) ? [] :
      map(elem.hosts, host => host); // always get an array
    ret.exclude_hosts = is_empty(elem.exclude_hosts) ? [] :
      map(elem.exclude_hosts, host => host); // always get an array

    ret.max_hosts = parse_int(elem.max_hosts);

    ret.reverse_lookup_only = parse_yesno(elem.reverse_lookup_only);
    ret.reverse_lookup_unify = parse_yesno(elem.reverse_lookup_unify);

    if (is_defined(elem.tasks)) {
      ret.tasks = map(elem.tasks.task, task => new Model(task, 'task'));
    }

    return ret;
  }
}

export default Target;

// vim: set ts=2 sw=2 tw=80:
