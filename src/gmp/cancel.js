/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
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
