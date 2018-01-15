/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2017 - 2018 Greenbone Networks GmbH
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
import 'core-js/fn/string/includes';

import {is_defined} from '../../utils.js';

import {set_properties, parse_int, parse_severity} from '../../parser.js';

class ReportPort {

  constructor(elem) {
    this.parseProperties(elem);
  }

  addHost(host) {
    if (!(host.ip in this.hosts.hosts_by_ip)) {
      this.hosts.hosts_by_ip[host.ip] = host;
      this.hosts.count++;
    }
  }

  setSeverity(severity) {
    if (severity > this.severity) {
      this._severity = severity;
    }
  }

  parseProperties(elem) {
    const copy = {};
    const {__text: name} = elem;

    copy.id = name;
    copy.threat = elem.threat;

    if (name.includes('/')) {
      const [number, protocol] = name.split('/');

      copy.number = parse_int(number);

      if (!is_defined(copy.number)) {
        // port number wasn't a number (e.g. general)
        copy.number = 0;
      }

      copy.protocol = protocol;
    }

    copy.hosts = {
      hosts_by_ip: {},
      count: 0,
    };

    set_properties(copy, this);

    this._severity = parse_severity(elem.severity);

    return copy;
  }

  get severity() {
    return this._severity;
  }
}

export default ReportPort;

// vim: set ts=2 sw=2 tw=80:
