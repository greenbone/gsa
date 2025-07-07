/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {COMPLIANCE, ComplianceType} from 'gmp/models/compliance';
import {isDefined} from 'gmp/utils/identity';

interface Host {
  ip: string;
}

interface ReportOperatingSystemElement {
  best_os_cpe?: string;
  best_os_txt?: string;
}

interface ReportOperatingSystemProperties {
  id?: string; // CPE string
  name?: string; // CPE string
  cpe?: string; // CPE string
  compliance?: ComplianceType;
  severity?: number;
}

class ReportOperatingSystem {
  readonly hosts: {
    hostsByIp: Record<string, Host>;
    complianceByIp: Record<string, ComplianceType>;
    count: number;
  };
  readonly id?: string; // CPE string
  readonly name?: string; // CPE string
  readonly cpe?: string; // CPE string
  compliance: ComplianceType;
  severity?: number;

  constructor({
    id,
    name,
    cpe,
    compliance = COMPLIANCE.UNDEFINED,
    severity,
  }: ReportOperatingSystemProperties = {}) {
    this.id = id;
    this.name = name;
    this.cpe = cpe;
    this.compliance = compliance;
    this.severity = severity;

    this.hosts = {
      hostsByIp: {},
      complianceByIp: {},
      count: 0,
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

  addHostCompliance(host: Partial<Host>, compliance?: ComplianceType) {
    if (!isDefined(host?.ip) || !isDefined(compliance)) {
      return;
    }

    if (!(host.ip in this.hosts.complianceByIp)) {
      this.hosts.complianceByIp[host.ip] = compliance;
    }
    const complianceByIpValues = Object.values(this.hosts.complianceByIp);

    const isNoInCompliance = complianceByIpValues.some(
      value => value === COMPLIANCE.NO,
    );
    const isIncompleteInCompliance = complianceByIpValues.some(
      value => value === COMPLIANCE.INCOMPLETE,
    );
    const isYesInCompliance = complianceByIpValues.some(
      value => value === COMPLIANCE.YES,
    );

    if (isNoInCompliance) {
      this.compliance = COMPLIANCE.NO;
    } else if (isIncompleteInCompliance) {
      this.compliance = COMPLIANCE.INCOMPLETE;
    } else if (isYesInCompliance) {
      this.compliance = COMPLIANCE.YES;
    } else {
      this.compliance = COMPLIANCE.UNDEFINED;
    }
  }

  setSeverity(severity: number) {
    if (!isDefined(this.severity) || this.severity < severity) {
      this.severity = severity;
    }
  }

  static fromElement(
    element: ReportOperatingSystemElement = {},
  ): ReportOperatingSystem {
    return new ReportOperatingSystem(this.parseElement(element));
  }

  static parseElement(
    element: ReportOperatingSystemElement = {},
  ): ReportOperatingSystemProperties {
    const copy: ReportOperatingSystemProperties = {};

    const {best_os_cpe: bestOsCpe, best_os_txt: bestOsTxt} = element;

    copy.name = bestOsTxt;
    copy.id = bestOsCpe;
    copy.cpe = bestOsCpe;

    return copy;
  }
}

export default ReportOperatingSystem;
