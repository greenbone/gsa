/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import Model, {parseModelFromElement} from 'gmp/model';
import {parseInt, parseBoolean} from 'gmp/parser';
import {map} from 'gmp/utils/array';
import {isDefined} from 'gmp/utils/identity';

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

    ret.predefined = parseBoolean(element.predefined);

    return ret;
  }
}

export default PortList;
