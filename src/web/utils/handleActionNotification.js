/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {
  showSuccessNotification,
  showErrorNotification,
} from '@greenbone/opensight-ui-components-mantinev7';

/**
 * Handles action notifications by displaying success or error messages based on the result of a promise.
 *
 * @param {Promise} promise - The promise representing the action to be performed.
 * @param {Function} onSuccess - The callback function to be called if the promise resolves successfully.
 * @param {Function} onError - The callback function to be called if the promise is rejected.
 * @param {string} successMessage - The message to display if the action is successful.
 * @param {string} errorMessage - The message to display if the action fails.
 * @returns {Promise} The original promise with success and error handlers attached.
 */

export const handleActionNotification = async (
  promise,
  onSuccess,
  onError,
  successMessage,
  errorMessage,
) => {
  try {
    const result = await promise;
    onSuccess(result);
    showSuccessNotification('', successMessage);
  } catch (error) {
    onError(error);
    showErrorNotification('', errorMessage);
  }
};
