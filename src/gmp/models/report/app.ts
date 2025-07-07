/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {parseSeverity} from 'gmp/parser';
import {isDefined} from 'gmp/utils/identity';

interface AppElement {
  value?: string; // CPE string
  severity?: number;
}

interface AppProperties {
  id?: string; // CPE string
  name?: string; // CPE string
  severity?: number;
}

interface Host {
  ip: string;
}

class ReportApp {
  readonly id?: string;
  readonly name?: string;
  readonly severity?: number;
  readonly hosts: {
    hostsByIp: Record<string, Host>;
    count: number;
  };
  readonly occurrences: {
    details: number;
    withoutDetails: number;
    total: number;
  };

  constructor({id, name, severity}: AppProperties = {}) {
    this.id = id;
    this.name = name;
    this.severity = severity;

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

  addHost(host: Partial<Host>) {
    if (!isDefined(host?.ip)) {
      return;
    }

    if (!(host.ip in this.hosts.hostsByIp)) {
      this.hosts.hostsByIp[host.ip] = host as Host;
      this.hosts.count++;
    }
  }

  addOccurrence(count?: number) {
    if (isDefined(count)) {
      this.occurrences.details += count;
      this.occurrences.total += count;
    } else {
      this.occurrences.withoutDetails += 1;
      this.occurrences.total += 1;
    }
  }

  static fromElement(element: AppElement = {}): ReportApp {
    return new ReportApp(this.parseElement(element));
  }

  static parseElement(element: AppElement = {}): AppProperties {
    const copy: AppProperties = {};

    const {value: cpe} = element;

    copy.id = cpe;
    copy.name = cpe;

    copy.severity = parseSeverity(element.severity);

    return copy;
  }
}

export default ReportApp;
