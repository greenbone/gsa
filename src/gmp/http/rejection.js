/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import _ from 'gmp/locale';

import {isDefined} from 'gmp/utils/identity';

class Rejection {
  static REASON_ERROR = 'error';
  static REASON_TIMEOUT = 'timeout';
  static REASON_CANCEL = 'cancel';
  static REASON_UNAUTHORIZED = 'unauthorized';

  constructor(
    xhr,
    reason = Rejection.REASON_ERROR,
    message = _('Unknown Error'),
    error,
  ) {
    this.name = 'Rejection';
    this.message = message;
    this.reason = reason;
    this.error = error;

    this._xhr = xhr;

    if (!isDefined(error)) {
      error = new Error();
    }

    this.stack = error.stack;
  }

  plainData(type = '') {
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

  setMessage(message) {
    this.message = message;
    return this;
  }

  get status() {
    return isDefined(this._xhr) ? this._xhr.status : undefined;
  }
}

export default Rejection;

// vim: set ts=2 sw=2 tw=80:
