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

type ExecutorFunc = (reason: string) => void;
type Executor = (cancel: ExecutorFunc) => void;

interface Source {
  cancel: ExecutorFunc;
  token: CancelToken;
}

class CancelToken {
  canceled: boolean;
  reason?: string;
  promise: Promise<string>;

  constructor(executor: Executor) {
    this.canceled = false;

    this.promise = new Promise(resolve => {
      executor(reason => {
        this.reason = reason;
        this.canceled = true;

        resolve(reason);
      });
    });
  }

  static source(): Source {
    let cancel: ExecutorFunc;
    const token = new CancelToken(func => (cancel = func));
    return {
      // @ts-expect-error
      cancel,
      token,
    };
  }
}

export default CancelToken;
