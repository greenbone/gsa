/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2016 - 2017 Greenbone Networks GmbH
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
import {is_defined} from '../utils.js';

class Rejection {

  static REASON_ERROR = 'error';
  static REASON_TIMEOUT = 'timeout';
  static REASON_CANCEL = 'cancel';

  constructor(xhr, reason = Rejection.REASON_ERROR, message = '', error) {
    this.name = 'Rejection';
    this.message = message;
    this.reason = reason;
    this.xhr = xhr;

    if (!is_defined(error)) {
      error = new Error();
    }

    this.stack = error.stack;
  }

  isCancel() {
    return this.reason === Rejection.REASON_CANCEL;
  }

  isError() {
    return this.reason === Rejection.REASON_ERROR;
  }

  isTimeout() {
    return this.reason === Rejection.REASON_TIMEOUT;
  }

  setMessage(message) {
    this.message = message;
    return this;
  }
}

export default Rejection;

// vim: set ts=2 sw=2 tw=80:
