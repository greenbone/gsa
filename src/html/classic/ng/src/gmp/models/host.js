/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2017 Greenbone Networks GmbH
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

import {is_defined, is_empty, for_each, map} from '../utils.js';

import {
  new_properties,
  parse_int,
  parse_properties,
  parse_severity,
  parse_yesno,
  set_properties,
} from '../parser.js';

import Asset from './asset.js';

const get_identifier = (identifiers, name) => identifiers.filter(
  identifier => identifier.name === name)[0];

class Identifier {

  constructor(element) {
    const props = parse_properties(element);

    if (is_defined(props.source)) {
      props.source = new_properties({
        ...props.source,
        source_type: props.source.type,
      });
    }

    if (is_defined(props.os)) {
      props.os = new_properties(props.os);
    }

    set_properties(props, this);
  }
}

class Host extends Asset {

  static asset_type = 'host';

  parseProperties(elem) {
    let ret = super.parseProperties(elem);

    if (is_defined(ret.host) && is_defined(ret.host.severity)) {
      ret.severity = parse_severity(ret.host.severity.value);
    }

    if (is_defined(ret.identifiers)) {
      ret.identifiers = map(ret.identifiers.identifier, identifier => {
        return new Identifier(identifier);
      });
    }
    else {
      ret.identifiers = [];
    }

    let hostname = get_identifier(ret.identifiers, 'hostname');

    if (!is_defined(hostname)) {
      hostname = get_identifier(ret.identifiers, 'DNS-via-TargetDefinition');
    }

    const ip = get_identifier(ret.identifiers, 'ip');

    ret.hostname = is_defined(hostname) ? hostname.value : undefined;
    ret.ip = is_defined(ip) ? ip.value : undefined;

    ret.details = {};

    if (is_defined(ret.host)) {
      for_each(ret.host.detail, details => {
        ret.details[details.name] = {
          value: details.value,
          source: new_properties(details.source),
        };
      });

      if (is_defined(ret.host.routes)) {
        ret.routes = map(ret.host.routes.route, route =>
          map(route.host, host => ({
            ip: host.ip,
            id: is_empty(host._id) ? undefined : host._id,
            distance: parse_int(host._distance),
            same_source: parse_yesno(host._same_source), // host/hop was found in the same scan
          }))
        );
      }

      delete ret.host;
    }
    else {
      ret.routes = [];
    }

    return ret;
  }
}

export default Host;

// vim: set ts=2 sw=2 tw=80:
