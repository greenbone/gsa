/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import _ from 'gmp/locale';
import {isDefined} from 'gmp/utils/identity';

class Rejection extends Error {
  static REASON_ERROR = 'error';
  static REASON_TIMEOUT = 'timeout';
  static REASON_CANCEL = 'cancel';
  static REASON_UNAUTHORIZED = 'unauthorized';

  reason: string;
  error?: Error;
  _xhr: XMLHttpRequest;

  constructor(
    xhr: XMLHttpRequest,
    reason: string = Rejection.REASON_ERROR,
    message: string = _('Unknown Error'),
    error?: Error | undefined,
  ) {
    super(message);
    this.name = 'Rejection';
    this.reason = reason;
    this.error = error;

    this._xhr = xhr;
  }

  plainData(
    type?: 'xml' | 'text' | undefined,
  ): Document | string | ArrayBuffer | null {
    if (type === 'xml') {
      return this._xhr.responseXML;
    }
    if (type === 'text') {
      return this._xhr.responseText;
    }
    return this._xhr.response;
  }

  isError() {
    return this.reason === Rejection.REASON_ERROR;
  }

  setMessage(message: string) {
    this.message = message;
    return this;
  }

  get status() {
    return isDefined(this._xhr) ? this._xhr.status : undefined;
  }
}

export default Rejection;
