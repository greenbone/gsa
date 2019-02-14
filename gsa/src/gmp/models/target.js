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
import Model from '../model';

import {isDefined} from '../utils/identity';
import {isEmpty} from '../utils/string';
import {map} from '../utils/array';

import {parseInt, parseYesNo, parseCsv} from '../parser';

import PortList from './portlist';

export const TARGET_CREDENTIAL_NAMES = [
  'smb_credential',
  'snmp_credential',
  'ssh_credential',
  'esxi_credential',
];

class Target extends Model {
  static entityType = 'target';

  parseProperties(elem) {
    const ret = super.parseProperties(elem);

    if (isDefined(elem.port_list) && !isEmpty(elem.port_list._id)) {
      ret.port_list = new PortList(ret.port_list);
    } else {
      delete ret.port_list;
    }

    for (const name of TARGET_CREDENTIAL_NAMES) {
      const cred = ret[name];
      if (isDefined(cred) && !isEmpty(cred._id)) {
        ret[name] = new Model(cred, 'credential');
      } else {
        delete ret[name];
      }
    }

    ret.hosts = parseCsv(elem.hosts);
    ret.exclude_hosts = parseCsv(elem.exclude_hosts);

    ret.max_hosts = parseInt(elem.max_hosts);

    ret.reverse_lookup_only = parseYesNo(elem.reverse_lookup_only);
    ret.reverse_lookup_unify = parseYesNo(elem.reverse_lookup_unify);

    if (isDefined(elem.tasks)) {
      ret.tasks = map(elem.tasks.task, task => new Model(task, 'task'));
    }

    return ret;
  }
}

export default Target;

// vim: set ts=2 sw=2 tw=80:
