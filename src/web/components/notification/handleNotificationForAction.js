/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {showSuccessNotification} from '@greenbone/opensight-ui-components-mantinev7';

/**
 * Handles notifications by displaying success messages based on the result of a promise.
 *
 * @param {Promise} action - The action representing the action to be performed.
 * @param {Function} onSuccess - The callback function to be called if the promise resolves successfully.
 * @param {Function} onError - The callback function to be called if the promise is rejected.
 * @param {string} successMessage - The message to display if the action is successful.
 * @returns {Promise} The original promise with success and error handlers attached.
 */

export const handleNotificationForAction = async (
  action,
  onSuccess,
  onError,
  successMessage,
) => {
  try {
    const result = await action;
    onSuccess(result);
    showSuccessNotification('', successMessage);
  } catch (error) {
    onError(error);
  }
};
