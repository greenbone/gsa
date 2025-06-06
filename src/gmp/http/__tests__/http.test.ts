/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing, beforeEach} from '@gsa/testing';
import {vi} from 'vitest';
import Http from 'gmp/http/http';
import Rejection from 'gmp/http/rejection';
import DefaultTransform from 'gmp/http/transform/default';

const mockGetFeedAccessStatusMessage = testing.fn();
const mockFindActionInXMLString = testing.fn();

vi.mock('gmp/http/utils', async () => {
  return {
    getFeedAccessStatusMessage: () => mockGetFeedAccessStatusMessage(),
    findActionInXMLString: () => mockFindActionInXMLString(),
  };
});

// @ts-expect-error
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
      instance = new Http('http://www.greenbone.net', {
        transform: DefaultTransform,
      });
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

    test('404 error should not append additional message', async () => {
      xhr.status = 404;
      mockFindActionInXMLString.mockReturnValue(false);

      await instance.handleResponseError(resolve, reject, xhr, options);
      expect(mockGetFeedAccessStatusMessage).not.toHaveBeenCalled();

      expect(reject).toHaveBeenCalledWith(expect.any(Rejection));
      const rejectedResponse = reject.mock.calls[0][0];
      expect(rejectedResponse.message).toContain('Unknown Error');
    });
  });
});
