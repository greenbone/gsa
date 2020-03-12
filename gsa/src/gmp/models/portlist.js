/* Copyright (C) 2016-2020 Greenbone Networks GmbH
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
import {isDefined} from '../utils/identity';
import {map} from '../utils/array';

import Model, {parseModelFromElement} from '../model';

import {parseInt} from '../parser';

class PortRange extends Model {
  static entityType = 'portrange';

  parseProperties(element) {
    return PortRange.parseElement(element);
  }

  static parseElement(element) {
    const ret = super.parseElement(element);
    ret.protocol_type = element.type;
    return ret;
  }
}

class PortList extends Model {
  static entityType = 'portlist';

  static parseElement(element) {
    const ret = super.parseElement(element);

    const ranges = isDefined(ret.port_ranges) ? ret.port_ranges.port_range : [];

    ret.port_ranges = map(ranges, range => {
      range.port_list_id = ret.id;
      return PortRange.fromElement(range);
    });

    const {port_count} = element;
    if (isDefined(port_count)) {
      ret.port_count = {
        all: isDefined(port_count.all) ? parseInt(port_count.all) : 0,
        tcp: isDefined(port_count.tcp) ? parseInt(port_count.tcp) : 0,
        udp: isDefined(port_count.udp) ? parseInt(port_count.udp) : 0,
      };
    } else {
      ret.port_count = {
        all: 0,
        tcp: 0,
        udp: 0,
      };
    }

    if (isDefined(element.targets) && isDefined(element.targets.target)) {
      ret.targets = map(element.targets.target, target =>
        parseModelFromElement(target, 'target'),
      );
    } else {
      ret.targets = [];
    }
    return ret;
  }
}

export default PortList;

// vim: set ts=2 sw=2 tw=80:
