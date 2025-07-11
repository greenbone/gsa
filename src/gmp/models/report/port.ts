/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {parseInt, parseSeverity} from 'gmp/parser';
import {isDefined} from 'gmp/utils/identity';

interface Host {
  ip: string;
}

interface ReportPortElement {
  __text?: string; // port number and protocol, e.g. "80/tcp"
  threat?: string;
  severity?: number;
}

interface ReportPortProperties {
  id?: string; // port number and protocol, e.g. "80/tcp"
  threat?: string;
  number?: number;
  protocol?: string;
  severity?: number;
}

class ReportPort {
  readonly id?: string;
  readonly hosts: {
    hostsByIp: Record<string, Host>;
    count: number;
  };
  readonly threat?: string;
  readonly number: number;
  readonly protocol?: string;
  severity?: number;

  constructor({
    id,
    threat,
    number = 0,
    protocol,
    severity,
  }: ReportPortProperties = {}) {
    this.id = id;
    this.threat = threat;
    this.number = number;
    this.protocol = protocol;
    this.severity = severity;

    this.hosts = {
      hostsByIp: {},
      count: 0,
    };
  }

  addHost(host?: Partial<Host>) {
    if (!isDefined(host?.ip)) {
      return;
    }

    if (!(host.ip in this.hosts.hostsByIp)) {
      this.hosts.hostsByIp[host.ip] = host as Host;
      this.hosts.count++;
    }
  }

  setSeverity(severity?: number) {
    if (!isDefined(severity)) {
      return;
    }

    if (!isDefined(this.severity) || this.severity < severity) {
      this.severity = severity;
    }
  }

  static fromElement(element: ReportPortElement = {}): ReportPort {
    return new ReportPort(this.parseElement(element));
  }

  static parseElement(element: ReportPortElement = {}): ReportPortProperties {
    const copy: ReportPortProperties = {};
    const {__text: name} = element;

    copy.id = name;
    copy.threat = element.threat;

    if (isDefined(name) && name.includes('/')) {
      const [number, protocol] = name.split('/');

      copy.number = parseInt(number);

      if (!isDefined(copy.number)) {
        // port number wasn't a number (e.g. general)
        copy.number = 0;
      }

      copy.protocol = protocol;
    }

    copy.severity = parseSeverity(element.severity);

    return copy;
  }
}

export default ReportPort;
