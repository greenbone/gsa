/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing, beforeEach} from '@gsa/testing';

import Http from 'gmp/http/http';
import Rejection from '../rejection';
import {vi} from 'vitest';

const mockGetFeedAccessStatusMessage = testing.fn();

vi.mock('gmp/http/utils', async () => {
  return {
    getFeedAccessStatusMessage: () => mockGetFeedAccessStatusMessage(),
  };
});

global.XMLHttpRequest = testing.fn(() => ({
  open: testing.fn(),
  send: testing.fn(),
  setRequestHeader: testing.fn(),
  status: 0,
  responseText: '',
  onreadystatechange: null,
  readyState: 0,
}));

describe('Http', () => {
  describe('handleResponseError', () => {
    let instance;
    let reject;
    let resolve;
    let xhr;
    let options;

    beforeEach(() => {
      instance = new Http();
      resolve = testing.fn();
      reject = testing.fn();
      xhr = {status: 500};
      options = {};
      testing.clearAllMocks();
    });
    test('should handle response error without error handlers', async () => {
      await instance.handleResponseError(xhr, reject, resolve, options);
      expect(reject).toHaveBeenCalledWith(expect.any(Rejection));
    });

    test('401 error should call error handler', async () => {
      xhr.status = 401;
      await instance.handleResponseError(resolve, reject, xhr, options);
      expect(reject).toHaveBeenCalledWith(expect.any(Rejection));
      expect(reject.mock.calls[0][0].reason).toBe(
        Rejection.REASON_UNAUTHORIZED,
      );
    });

    test('404 error should append additional message', async () => {
      xhr.status = 404;
      const additionalMessage = 'Additional feed access status message';
      mockGetFeedAccessStatusMessage.mockResolvedValue(additionalMessage);

      await instance.handleResponseError(resolve, reject, xhr, options);
      expect(mockGetFeedAccessStatusMessage).toHaveBeenCalled();

      expect(reject).toHaveBeenCalledWith(expect.any(Rejection));
      const rejectedResponse = reject.mock.calls[0][0];
      expect(rejectedResponse.message).toContain(additionalMessage);
    });
  });
});
