/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {showSuccessNotification as mantineShowSuccessNotification} from '@greenbone/opensight-ui-components-mantinev7';
import {isDefined} from 'gmp/utils/identity';

interface ActionFunctionOptions<
  ResponseType,
  ErrorType = unknown,
  ReturnType = void,
> {
  onSuccess?: (response: ResponseType) => ReturnType;
  onError?: (error: ErrorType) => ReturnType;
  successMessage?: string;
  showSuccessNotification?: (message: string, title?: string) => void;
}

/**
 * Executes a promise and handles success and error callbacks.
 *
 * @param {Promise} promise - The promise to be executed.
 * @param {Function} [onSuccess] - Optional callback function to be called on successful resolution of the promise.
 * @param {Function} [onError] - Optional callback function to be called if the promise is rejected.
 * @param {string} [successMessage] - Optional message to display if the action is successful.
 * @returns {Promise<*>} - The result of the onSuccess callback if provided, otherwise the resolved value of the promise.
 *                         If the promise is rejected the result of the onError callback if provided.
 *                         Otherwise the error from the rejected promise is thrown.
 * @throws {*} - The error from the rejected promise if onError callback is not provided.
 */
const actionFunction = async <
  ResponseType = unknown,
  ErrorType = unknown,
  ReturnType = void,
>(
  promise: Promise<ResponseType>,
  {
    onSuccess,
    onError,
    successMessage,
    showSuccessNotification = mantineShowSuccessNotification,
  }: ActionFunctionOptions<ResponseType, ErrorType, ReturnType> = {},
): Promise<ReturnType | ResponseType> => {
  try {
    const response = await promise;
    if (isDefined(onSuccess)) {
      if (isDefined(successMessage)) {
        showSuccessNotification('', successMessage);
      }
      return onSuccess(response);
    }
    return response;
  } catch (error) {
    if (isDefined(onError)) {
      return onError(error as ErrorType);
    }
    throw error;
  }
};

export default actionFunction;
