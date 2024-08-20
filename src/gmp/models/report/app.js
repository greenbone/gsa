/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
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
