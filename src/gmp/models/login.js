/* Copyright (C) 2016-2021 Greenbone Networks GmbH
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

  static fromElement(element) {
    return new Login(element);
  }
}

export default Login;

// vim: set ts=2 sw=2 tw=80:
