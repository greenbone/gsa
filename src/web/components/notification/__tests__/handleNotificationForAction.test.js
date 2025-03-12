/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {showSuccessNotification} from '@greenbone/opensight-ui-components-mantinev7';
import {describe, test, expect, beforeEach, testing} from '@gsa/testing';
import {handleNotificationForAction} from 'web/components/notification/handleNotificationForAction';

vi.mock('@greenbone/opensight-ui-components-mantinev7', () => ({
  showSuccessNotification: vi.fn(),
}));

describe('handleNotificationForAction', () => {
  beforeEach(() => {
    testing.resetAllMocks();
  });

  test('should call onSuccess and showSuccessNotification when promise resolves', async () => {
    const promise = Promise.resolve('success');
    const onSuccess = testing.fn();
    const onError = testing.fn();
    const successMessage = 'Action was successful';

    await handleNotificationForAction(
      promise,
      onSuccess,
      onError,
      successMessage,
    );

    expect(onSuccess).toHaveBeenCalledWith('success');
    expect(showSuccessNotification).toHaveBeenCalledWith('', successMessage);
    expect(onError).not.toHaveBeenCalled();
  });

  test('should not require onSuccess to be provided if promise resolves successfully', async () => {
    const promise = Promise.resolve('success');
    const successMessage = 'Action was successful';
    const onError = testing.fn();

    await handleNotificationForAction(
      promise,
      undefined,
      onError,
      successMessage,
    );

    expect(showSuccessNotification).toHaveBeenCalledWith('', successMessage);
    expect(onError).not.toHaveBeenCalled();
  });

  test('should call onError when promise rejects', async () => {
    const error = new Error('Action failed');
    const promise = Promise.reject(error);
    const onSuccess = testing.fn();
    const onError = testing.fn();
    const successMessage = 'Action was successful';

    const result = await handleNotificationForAction(
      promise,
      onSuccess,
      onError,
      successMessage,
    );

    expect(onSuccess).not.toHaveBeenCalled();
    expect(onError).toHaveBeenCalledWith(error);
    expect(showSuccessNotification).not.toHaveBeenCalled();
    expect(result).toBeUndefined();
  });

  test("should resolve with onError's return value if onError is provided and action promise rejects", async () => {
    const error = new Error('Action failed');
    const promise = Promise.reject(error);
    const onError = testing.fn(() => 'error handled');
    const successMessage = 'Action was successful';

    const result = await handleNotificationForAction(
      promise,
      undefined,
      onError,
      successMessage,
    );

    expect(result).toEqual('error handled');
    expect(showSuccessNotification).not.toHaveBeenCalled();
  });
});
