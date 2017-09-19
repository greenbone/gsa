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
import {is_defined} from '../../utils.js';

import {set_properties, parse_severity} from '../../parser.js';

import Nvt from '../nvt.js';

class ReportCve {

  constructor(elem) {
    this.parseProperties(elem);

    this.occurrences = 0;
  }

  addHost(host) {
    if (!(host.ip in this.hosts.hosts_by_ip)) {
      this.hosts.hosts_by_ip[host.ip] = host;
      this.hosts.count++;
    }
  }

  addResult(result) {
    this.occurrences += 1;

    const severity = parse_severity(result.severity);

    if (!is_defined(this.severity) || severity > this.severity) {
      this.severity = severity;
    }
  }

  parseProperties(elem) {
    const copy = {};

    const nvt = new Nvt(elem);

    copy.id = nvt.id;
    copy.cves = nvt.cves;

    copy.hosts = {
      hosts_by_ip: {},
      count: 0,
    };

    set_properties(copy, this);

    return copy;
  }
}

export default ReportCve;

// vim: set ts=2 sw=2 tw=80:
