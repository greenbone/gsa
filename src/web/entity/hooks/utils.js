/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {isDefined} from 'gmp/utils/identity';

/**
 * Executes a promise and handles success and error callbacks.
 *
 * @param {Promise} promise - The promise to be executed.
 * @param {Function} [onSuccess] - Optional callback function to be called on successful resolution of the promise.
 * @param {Function} [onError] - Optional callback function to be called if the promise is rejected.
 * @returns {Promise<*>} - The result of the onSuccess callback if provided, otherwise the resolved value of the promise.
 *                         If the promise is rejected the result of the onError callback if provided.
 *                         Otherwise the error from the rejected promise is thrown.
 * @throws {*} - The error from the rejected promise if onError callback is not provided.
 */
export const actionFunction = async (promise, onSuccess, onError) => {
  try {
    const response = await promise;
    if (isDefined(onSuccess)) {
      return onSuccess(response);
    }
  } catch (error) {
    if (isDefined(onError)) {
      return onError(error);
    }
    throw error;
  }
};
