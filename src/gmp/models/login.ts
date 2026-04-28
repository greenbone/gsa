/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {type default as Response} from 'gmp/http/response';
import {type Envelope} from 'gmp/http/transform/fast-xml';
import date, {type Date} from 'gmp/models/date';
import {parseInt} from 'gmp/parser';
import {isDefined} from 'gmp/utils/identity';

export type LoginData = Envelope;
type LoginElement = Response<LoginData>;

class Login {
  readonly clientAddress?: string;
  readonly gsadVersion?: string;
  readonly locale?: string;
  readonly sessionTimeout?: Date;
  readonly timezone?: string;
  readonly token?: string;

  constructor(elem: LoginElement) {
    const {data = {}} = elem;
    this.clientAddress = data.client_address;
    this.gsadVersion = data.version;
    this.locale = data.i18n;
    this.timezone = data.timezone;
    this.token = data.token;

    const unixSeconds = parseInt(data.session);

    this.sessionTimeout = isDefined(unixSeconds)
      ? date.unix(unixSeconds)
      : undefined;
  }

  static fromElement(element: LoginElement) {
    return new Login(element);
  }
}

export default Login;
