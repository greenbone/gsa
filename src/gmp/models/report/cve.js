/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {isDefined} from '../../utils/identity';

import {setProperties, parseSeverity} from '../../parser';

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
