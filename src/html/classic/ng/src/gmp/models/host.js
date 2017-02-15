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

import Model from '../model.js';

import {is_defined, for_each} from '../../utils.js';


export class Host extends Model {

  parseProperties(elem) {
    elem = super.parseProperties(elem);

    elem.severity = is_defined(elem.host.severity) ? elem.host.severity.value :
      undefined;

    let identifiers = {};
    if (is_defined(elem.identifiers)) {
      for_each(elem.identifiers.identifier, identifier => {
        identifiers[identifier.name] = new Model(identifier);
      });
    }

    elem.identifiers = identifiers;

    let hostname = elem.identifiers.hostname ||
      elem.identifiers['DNS-via-TargetDefinition'];
    let ip = elem.identifiers.ip;

    elem.hostname = is_defined(hostname) ? hostname.value : undefined;
    elem.ip = is_defined(ip) ? ip.value : undefined;

    elem.details = {};

    if (is_defined(elem.host)) {
      for_each(elem.host.detail, details => {
        elem.details[details.name] = {
          value: details.value,
          source: new Model(details.source),
        };
      });
    }

    delete elem.host;

    return elem;
  }
}

export default Host;

// vim: set ts=2 sw=2 tw=80:
