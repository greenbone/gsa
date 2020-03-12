/* Copyright (C) 2017-2020 Greenbone Networks GmbH
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
import {isDefined} from 'gmp/utils/identity';

import {parseSeverity, setProperties} from 'gmp/parser';

class App {
  constructor() {
    this.hosts = {
      hostsByIp: {},
      count: 0,
    };

    this.occurrences = {
      details: 0,
      withoutDetails: 0,
      total: 0,
    };
  }

  addHost(host) {
    if (!(host.ip in this.hosts.hostsByIp)) {
      this.hosts.hostsByIp[host.ip] = host;
      this.hosts.count++;
    }
  }

  addOccurence(count) {
    if (isDefined(count)) {
      this.occurrences.details += count;
      this.occurrences.total += count;
    } else {
      this.occurrences.withoutDetails += 1;
      this.occurrences.total += 1;
    }
  }

  static fromElement(element) {
    const app = new App();

    setProperties(this.parseElement(element), app);

    return app;
  }

  static parseElement(element = {}) {
    const copy = {};

    const {value: cpe} = element;

    copy.id = cpe;
    copy.name = cpe;

    copy.severity = parseSeverity(element.severity);

    return copy;
  }
}

export default App;

// vim: set ts=2 sw=2 tw=80:
