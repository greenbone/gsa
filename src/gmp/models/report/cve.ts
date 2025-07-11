/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import Nvt, {NvtElement} from 'gmp/models/nvt';
import {parseSeverity} from 'gmp/parser';
import {isDefined} from 'gmp/utils/identity';

interface Host {
  ip: string;
}

type ReportCveElement = NvtElement;

interface ReportCveProperties {
  cves?: string[];
  id?: string;
  nvtName?: string;
}

class ReportCve {
  readonly cves: string[];
  readonly id?: string;
  readonly nvtName?: string;
  readonly hosts: {
    hostsByIp: Record<string, Host>;
    count: number;
  };
  occurrences: number;
  severity?: number;

  constructor({cves = [], id, nvtName}: ReportCveProperties = {}) {
    this.cves = cves;
    this.id = id;
    this.nvtName = nvtName;

    this.occurrences = 0;

    this.hosts = {
      hostsByIp: {},
      count: 0,
    };
  }

  static fromElement(element: ReportCveElement = {}): ReportCve {
    return new ReportCve(this.parseElement(element));
  }

  static parseElement(element: ReportCveElement = {}): ReportCveProperties {
    const copy: ReportCveProperties = {};

    const nvt = Nvt.fromElement(element);

    copy.id = nvt.id;
    copy.nvtName = nvt.name;
    copy.cves = nvt.cves;

    return copy;
  }

  addHost(host: Partial<Host>) {
    if (!isDefined(host?.ip)) {
      return;
    }
    if (!(host.ip in this.hosts.hostsByIp)) {
      this.hosts.hostsByIp[host.ip] = host as Host;
      this.hosts.count++;
    }
  }

  addResult({severity: resultSeverity}: {severity?: number}) {
    this.occurrences += 1;

    const severity = parseSeverity(resultSeverity);

    if (
      isDefined(severity) &&
      (!isDefined(this.severity) || severity > this.severity)
    ) {
      this.severity = severity;
    }
  }
}

export default ReportCve;
