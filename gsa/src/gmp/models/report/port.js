/* Copyright (C) 2017-2019 Greenbone Networks GmbH
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
import 'core-js/fn/string/includes';

import {isDefined} from '../../utils/identity';

import {setProperties, parseInt, parseSeverity} from '../../parser';

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

      copy.number = parseInt(number);

      if (!isDefined(copy.number)) {
        // port number wasn't a number (e.g. general)
        copy.number = 0;
      }

      copy.protocol = protocol;
    }

    copy.hosts = {
      hosts_by_ip: {},
      count: 0,
    };

    setProperties(copy, this);

    this._severity = parseSeverity(elem.severity);

    return copy;
  }

  get severity() {
    return this._severity;
  }
}

export default ReportPort;

// vim: set ts=2 sw=2 tw=80:
