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
import {isDefined} from '../utils/identity';

class Rejection {
  static REASON_ERROR = 'error';
  static REASON_TIMEOUT = 'timeout';
  static REASON_CANCEL = 'cancel';
  static REASON_UNAUTHORIZED = 'unauthorized';

  constructor(xhr, reason = Rejection.REASON_ERROR, message = '', error) {
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
