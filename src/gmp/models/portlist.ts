/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import Model, {
  Element,
  ModelElement,
  ModelProperties,
  parseModelFromElement,
} from 'gmp/model';
import {parseInt, parseBoolean} from 'gmp/parser';
import {map} from 'gmp/utils/array';
import {isDefined} from 'gmp/utils/identity';

export type ProtocolType = 'tcp' | 'udp';

interface PortRangeElement extends ModelElement {
  type: ProtocolType;
  port_list_id?: string;
  start: number;
  end: number;
  [key: string]: unknown;
}

interface PortRangeProperties extends ModelProperties {
  protocolType: ProtocolType;
  portListId: string;
  start: number;
  end: number;
}

export interface PortListElement extends ModelElement {
  id?: string;
  port_ranges?: {
    port_range: PortRangeElement[];
  };
  port_count?: {
    all?: string;
    tcp?: string;
    udp?: string;
  };
  targets?: {
    target: ModelElement[];
  };
  predefined?: string;
}

interface PortCount {
  all: number;
  tcp: number;
  udp: number;
}

interface PortListProperties extends ModelProperties {
  port_ranges?: PortRangeProperties[];
  port_count: {
    all: number;
    tcp: number;
    udp: number;
  };
  targets?: Model[];
  predefined?: boolean;
}

export class PortRange extends Model {
  static entityType = 'portrange';
  protocolType!: ProtocolType;
  portListId!: string;
  start!: number;
  end!: number;

  parseProperties(element: PortRangeElement): PortRangeProperties {
    return PortRange.parseElement(element);
  }

  static parseElement(element: PortRangeElement): PortRangeProperties {
    const ret = super.parseElement(element) as PortRangeProperties;
    ret.protocolType = element.type;
    return ret;
  }
}

class PortList extends Model {
  static entityType = 'portlist';
  port_ranges!: PortRange[];
  port_count!: PortCount;
  targets!: Model[];
  predefined!: boolean;

  static parseElement(element: PortListElement): PortListProperties {
    const ret = super.parseElement(element) as PortListProperties;

    const ranges =
      isDefined(ret.port_ranges) && isDefined(element.port_ranges)
        ? element.port_ranges.port_range
        : [];

    ret.port_ranges = map(ranges, (range: PortRangeElement) => {
      range.portListId = ret.id;
      return PortRange.fromElement(range as Element);
    });

    const {port_count} = element;
    ret.port_count = {
      all: parseInt(port_count?.all) || 0,
      tcp: parseInt(port_count?.tcp) || 0,
      udp: parseInt(port_count?.udp) || 0,
    };

    ret.targets = map(element?.targets?.target, target =>
      parseModelFromElement(target, 'target'),
    );

    ret.predefined = parseBoolean(element.predefined);

    return ret;
  }
}

export default PortList;
