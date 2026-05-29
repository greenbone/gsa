/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {COMPLIANCE, type ComplianceType} from 'gmp/models/compliance';
import {parseInt} from 'gmp/parser';
import {isDefined} from 'gmp/utils/identity';

interface ReportOperatingSystemElement {
  best_os_cpe?: string;
  best_os_txt?: string;
  hosts_count?: number | string;
}

interface ReportOperatingSystemProperties {
  id?: string; // CPE string
  name?: string; // CPE string
  cpe?: string; // CPE string
  compliance?: ComplianceType;
  severity?: number;
  hostsCount?: number;
}

class ReportOperatingSystem {
  readonly hosts: {
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
    hostsCount = 0,
  }: ReportOperatingSystemProperties = {}) {
    this.id = id;
    this.name = name;
    this.cpe = cpe;
    this.compliance = compliance;
    this.severity = severity;
    this.hosts = {
      count: hostsCount,
    };
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

    const hostsCount = parseInt(element.hosts_count);
    if (isDefined(hostsCount)) {
      copy.hostsCount = hostsCount;
    }

    return copy;
  }
}

export default ReportOperatingSystem;
