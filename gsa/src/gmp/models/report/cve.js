/* Copyright (C) 2017-2021 Greenbone Networks GmbH
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

import {setProperties, parseSeverity} from 'gmp/parser';

import Nvt from '../nvt';

class ReportCve {
  constructor() {
    this.occurrences = 0;

    this.hosts = {
      hostsByIp: {},
      count: 0,
    };
  }

  static fromElement(element) {
    const cve = new ReportCve();

    setProperties(this.parseElement(element), cve);

    return cve;
  }

  addHost(host) {
    if (!(host.ip in this.hosts.hostsByIp)) {
      this.hosts.hostsByIp[host.ip] = host;
      this.hosts.count++;
    }
  }

  addResult({severity: resultSeverity}) {
    this.occurrences += 1;

    const severity = parseSeverity(resultSeverity);

    if (!isDefined(this.severity) || severity > this.severity) {
      this.severity = severity;
    }
  }

  static parseElement(element) {
    const copy = {};

    const nvt = Nvt.fromElement(element);

    copy.id = nvt.id;
    copy.nvtName = nvt.name;
    copy.cves = nvt.cves;

    return copy;
  }
}

export default ReportCve;

// vim: set ts=2 sw=2 tw=80:
