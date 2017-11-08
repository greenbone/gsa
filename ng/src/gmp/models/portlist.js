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

import {is_defined, map} from '../utils.js';
import {parse_int} from '../parser.js';

class PortRange extends Model {
  static entity_type = 'port_range';

  parseProperties(elem) {
    const ret = super.parseProperties(elem);
    ret.protocol_type = elem.type;
    return ret;
  }
}

class PortList extends Model {

  static entity_type = 'port_list';

  parseProperties(elem) {
    const ret = super.parseProperties(elem);
    const ranges = is_defined(ret.port_ranges) ?
      ret.port_ranges.port_range : [];

    ret.port_ranges = map(ranges, range => {
      range.port_list_id = ret.id;
      return new PortRange(range);
    });

    const {port_count} = elem;
    if (is_defined(port_count)) {
      ret.port_count = {
        all: is_defined(port_count.all) ? parse_int(port_count.all) : 0,
        tcp: is_defined(port_count.tcp) ? parse_int(port_count.tcp) : 0,
        udp: is_defined(port_count.udp) ? parse_int(port_count.udp) : 0,
      };
    }
    else {
      ret.port_count = {
        all: 0,
        tcp: 0,
        udp: 0,
      };
    }

    if (is_defined(elem.targets) && is_defined(elem.targets.target)) {
      ret.targets = map(elem.targets.target, target =>
        new Model(target, 'target'));
    }
    else {
      ret.targets = [];
    }
    return ret;
  }
}

export default PortList;

// vim: set ts=2 sw=2 tw=80:
