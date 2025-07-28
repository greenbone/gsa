/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import actionFunction from 'web/entity/hooks/actionFunction';

describe('actionFunction', () => {
  test('should call onSuccess with response and show success notification if successMessage is defined', async () => {
    const promise = Promise.resolve('response');
    const onSuccess = testing.fn();
    const onError = testing.fn();
    const successMessage = 'Success!';
    const showSuccessNotification = testing.fn();

    await actionFunction(promise, {
      onSuccess,
      onError,
      successMessage,
      showSuccessNotification,
    });

    expect(onSuccess).toHaveBeenCalledWith('response');
    expect(showSuccessNotification).toHaveBeenCalledWith('', successMessage);
  });

  test('should call onSuccess with response and not show success notification if successMessage is not defined', async () => {
    const promise = Promise.resolve('response');
    const onSuccess = testing.fn();
    const onError = testing.fn();
    const showSuccessNotification = testing.fn();

    await actionFunction(promise, {
      onSuccess,
      onError,
      showSuccessNotification,
    });

    expect(onSuccess).toHaveBeenCalledWith('response');
    expect(showSuccessNotification).not.toHaveBeenCalled();
  });

  test('should call onError with error if promise rejects and onError is defined', async () => {
    const promise = Promise.reject('error');
    const onSuccess = testing.fn();
    const onError = testing.fn();

    await actionFunction(promise, {onSuccess, onError});

    expect(onError).toHaveBeenCalledWith('error');
  });

  test('should throw error if promise rejects and onError is not defined', async () => {
    const promise = Promise.reject('error');
    const onSuccess = testing.fn();
    const onError = undefined;

    await expect(actionFunction(promise, {onSuccess, onError})).rejects.toEqual(
      'error',
    );
  });
});
