/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import moment from 'gmp/models/date';
import {parseInt} from 'gmp/parser';
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
