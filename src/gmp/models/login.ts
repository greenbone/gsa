/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {type default as Response, type Meta} from 'gmp/http/response';
import date, {type Date} from 'gmp/models/date';
import {parseInt} from 'gmp/parser';
import {isDefined} from 'gmp/utils/identity';

export interface LoginData {
  client_address?: string;
  guest?: boolean;
  role?: string;
  severity?: string;
  session?: string;
  token?: string;
}

export interface LoginMeta extends Meta {
  i18n?: string;
  timezone?: string;
  vendor_version?: string;
  version?: string;
}

type LoginElement = Response<LoginData, LoginMeta>;

class Login {
  readonly locale?: string;
  readonly sessionTimeout?: Date;
  readonly timezone?: string;
  readonly token?: string;

  constructor(elem: LoginElement) {
    const {data = {}, meta = {}} = elem;
    this.locale = meta.i18n;
    this.timezone = meta.timezone;
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
