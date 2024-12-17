/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {setProperties} from 'gmp/parser';
import {isDefined} from 'gmp/utils/identity';

class OperatingSystem {
  constructor() {
    this.hosts = {
      hostsByIp: {},
      complianceByIp: {},
      count: 0,
    };
  }

  addHost(host) {
    if (!(host.ip in this.hosts.hostsByIp)) {
      this.hosts.hostsByIp[host.ip] = host;
      this.hosts.count++;
    }
  }

  addHostCompliance(host, compliance) {
    if (!(host.ip in this.hosts.complianceByIp)) {
      this.hosts.complianceByIp[host.ip] = compliance;
    }
    const complianceByIpValues = Object.values(this.hosts.complianceByIp);

    const isNoInCompliance = complianceByIpValues.some(value => value === 'no');
    const isIncompleteInCompliance = complianceByIpValues.some(
      value => value === 'incomplete',
    );
    const isYesInCompliance = complianceByIpValues.some(
      value => value === 'yes',
    );

    if (isNoInCompliance) {
      this.compliance = 'no';
    } else if (isIncompleteInCompliance) {
      this.compliance = 'incomplete';
    } else if (isYesInCompliance) {
      this.compliance = 'yes';
    } else {
      this.compliance = 'undefined';
    }
  }

  setSeverity(severity) {
    if (!isDefined(this.severity) || this.severity < severity) {
      this.severity = severity;
    }
  }

  static fromElement(element) {
    const os = new OperatingSystem();

    setProperties(this.parseElement(element), os);

    return os;
  }

  static parseElement(element = {}) {
    const copy = {};

    const {best_os_cpe, best_os_txt} = element;

    copy.name = best_os_txt;
    copy.id = best_os_cpe;
    copy.cpe = best_os_cpe;

    return copy;
  }
}

export default OperatingSystem;

// vim: set ts=2 sw=2 tw=80:
