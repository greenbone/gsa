/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing, beforeEach} from '@gsa/testing';
import Http from 'gmp/http/http';
import Rejection from 'gmp/http/rejection';

const mockGetFeedAccessStatusMessage = testing.fn();
const mockFindActionInXMLString = testing.fn();

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
    let instance: Http;
    let reject: (reason?: string | Error) => void;
    let xhr: XMLHttpRequest;

    beforeEach(() => {
      instance = new Http({
        apiServer: 'https://example.com',
        apiProtocol: 'https:',
      });
      reject = testing.fn();
      xhr = {status: 500} as unknown as XMLHttpRequest;
      testing.clearAllMocks();
    });

    test('should handle response error without error handlers', async () => {
      instance.handleResponseError(reject, xhr);
      expect(reject).toHaveBeenCalledWith(expect.any(Rejection));
    });

    test('401 error should call error handler', async () => {
      // @ts-expect-error
      xhr.status = 401;
      instance.handleResponseError(reject, xhr);
      expect(reject).toHaveBeenCalledWith(expect.any(Rejection));
    });

    test('404 error should not append additional message', async () => {
      // @ts-expect-error
      xhr.status = 404;
      mockFindActionInXMLString.mockReturnValue(false);

      instance.handleResponseError(reject, xhr);
      expect(mockGetFeedAccessStatusMessage).not.toHaveBeenCalled();

      expect(reject).toHaveBeenCalledWith(expect.any(Rejection));
      // @ts-expect-error
      const rejectedResponse = reject.mock.calls[0][0];
      expect(rejectedResponse.message).toEqual('Response error');
    });
  });
});
