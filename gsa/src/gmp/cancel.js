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

/*
 * The CancelToken class is based on the cancelable-promises tc39 proposal
 *
 * https://github.com/tc39/proposal-cancelable-promises/blob/0e769fda8e16bff0feffe964fddc43dcd86668ba/Cancel%20Tokens.md
 *
 * Usage:
 *
 * const cancel_token = new CancelToken(cancel => {
 *   // store `cancel` for later
 *   // e.g. do_cancel = cancel;
 *   // or in a class this.doCancel = cancel
 * });
 *
 * // pass it to a cancelable function that returns a promise
 * doCancelableThing(cancelToken);
 *
 * // ... or another example
 * doOtherCancelableThing({token: cancel_token});
 *
 * // call cancel later
 * do_cancel('my reason');
 *
 * // or in a class
 * this.doCancel('my reason');
 *
 * In a consumer implement something like
 *
 * const delay = (ms, cancel_token) => {
 *   return new Promise((resolve, reject) => {
 *     const id = setTimeout(resolve, ms);
 *
 *     if (cancel_token) {
 *       cancelToken.promise.then(reason => {
 *         reject(reason);
 *         clearTimeout(id);
 *       });
 *     }
 *   });
 * };
 */

class CancelToken {
  constructor(executor) {
    this.canceled = false;

    this.promise = new Promise(resolve => {
      executor(reason => {
        this.reason = reason;
        this.canceled = true;

        resolve(reason);
      });
    });
  }

  static source() {
    let cancel;
    const token = new CancelToken(func => (cancel = func));
    return {
      cancel,
      token,
    };
  }
}

export default CancelToken;

// vim: set ts=2 sw=2 tw=80:
