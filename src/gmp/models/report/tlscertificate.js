/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */


import {isDefined} from 'gmp/utils/identity';

import {setProperties, parseInt} from 'gmp/parser';

class TLSCertificate {
  constructor() {
    this.ports = [];
  }

  addPort(port) {
    let parsedPort = parseInt(port);
    if (!isDefined(parsedPort)) {
      // port wasn't a number
      parsedPort = port;
    }

    this.ports.push(parsedPort);
  }

  copy() {
    const cert = TLSCertificate.fromElement({fingerprint: this.fingerprint});

    for (const [key, value] of Object.entries(this)) {
      if (key === 'fingerprint') {
        continue;
      }
      cert[key] = value;
    }

    return cert;
  }

  get id() {
    return this.ip + ':' + this.port + ':' + this.fingerprint;
  }

  static fromElement(element) {
    const cert = new TLSCertificate();

    setProperties(this.parseElement(element), cert);

    return cert;
  }

  static parseElement(element = {}) {
    const {fingerprint} = element;
    return {fingerprint};
  }
}

export default TLSCertificate;

// vim: set ts=2 sw=2 tw=80:
