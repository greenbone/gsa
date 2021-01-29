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
