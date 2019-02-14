/* Copyright (C) 2017-2019 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301 USA.
 */
import 'core-js/fn/object/entries';

import {isDefined} from '../../utils/identity';

import {parseInt} from '../../parser';

class TLSCertificate {
  constructor(fingerprint) {
    this.fingerprint = fingerprint;
    this.ports = [];
  }

  addPort(port) {
    let c_port = parseInt(port);
    if (!isDefined(c_port)) {
      // port wasn't a number
      c_port = port;
    }

    this.ports.push(port);
  }

  copy() {
    const cert = new TLSCertificate(this.fingerprint);
    for (const [key, value] of Object.entries(this)) {
      cert[key] = value;
    }
    return cert;
  }

  get id() {
    return this.ip + ':' + this.port + ':' + this.fingerprint;
  }
}

export default TLSCertificate;

// vim: set ts=2 sw=2 tw=80:
