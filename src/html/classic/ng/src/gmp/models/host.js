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

import {is_defined, for_each} from '../../utils.js';

import Model from '../model.js';
import {parse_severity} from '../parser.js';

export class Host extends Model {

  parseProperties(elem) {
    let ret = super.parseProperties(elem);

    if (is_defined(ret.host) && is_defined(ret.host.severity)) {
      ret.severity = parse_severity(ret.host.severity.value);
    }

    let identifiers = {};
    if (is_defined(ret.identifiers)) {
      for_each(ret.identifiers.identifier, identifier => {
        identifiers[identifier.name] = new Model(identifier);
      });
    }

    ret.identifiers = identifiers;

    let hostname = ret.identifiers.hostname ||
      ret.identifiers['DNS-via-TargetDefinition'];
    let ip = ret.identifiers.ip;

    ret.hostname = is_defined(hostname) ? hostname.value : undefined;
    ret.ip = is_defined(ip) ? ip.value : undefined;

    ret.details = {};

    if (is_defined(ret.host)) {
      for_each(ret.host.detail, details => {
        ret.details[details.name] = {
          value: details.value,
          source: new Model(details.source),
        };
      });
    }

    delete ret.host;

    return ret;
  }
}

export default Host;

// vim: set ts=2 sw=2 tw=80:
