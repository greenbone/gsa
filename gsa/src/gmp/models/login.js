/* Copyright (C) 2016-2019 Greenbone Networks GmbH
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
import {parseInt} from 'gmp/parser';

import moment from 'gmp/models/date';

import {isDefined} from 'gmp/utils/identity';

class Login {
  constructor(elem) {
    const {data = {}, meta = {}} = elem;
    this.clientAddress = data.client_address;
    this.guest = data.guest;
    this.locale = meta.i18n;
    this.role = data.role;
    this.severity = data.severity;
    this.timezone = meta.timezone;
    this.token = data.token;
    this.vendorVersion = meta.vendor_version;
    this.version = meta.version;
    const unixSeconds = parseInt(data.session);

    this.sessionTimeout = isDefined(unixSeconds)
      ? moment.unix(unixSeconds)
      : undefined;
  }
}

export default Login;

// vim: set ts=2 sw=2 tw=80:
