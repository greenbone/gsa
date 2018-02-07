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

import {is_defined} from 'gmp/utils/identity';

import {parse_severity} from 'gmp/parser.js';

import Asset from 'gmp/models/asset.js';

class App extends Asset {

  static asset_type = 'app';

  addHost(host) {
    if (!(host.ip in this.hosts.hosts_by_ip)) {
      this.hosts.hosts_by_ip[host.ip] = host;
      this.hosts.count++;
    }
  }

  addOccurence(count) {
    if (is_defined(count)) {
      this.occurrences.detail += count;
      this.occurrences.total += count;
    }
    else {
      this.occurrences.without_details += 1;
      this.occurrences.total += 1;
    }
  }

  parseProperties(elem) {
    const copy = {};

    const {value: cpe} = elem;

    copy.id = cpe;
    copy.name = cpe;

    copy.hosts = {
      hosts_by_ip: {},
      count: 0,
    };

    copy.occurrences = {
      detail: 0,
      without_detail: 0,
      total: 0,
    };

    copy.severity = parse_severity(elem.severity);

    return copy;
  }
}

export default App;

// vim: set ts=2 sw=2 tw=80:
