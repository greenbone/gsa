/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import Http, {type HttpOptions} from 'gmp/http/http';
import Rejection from 'gmp/http/rejection';

const mockGetFeedAccessStatusMessage = testing.fn();
const mockFindActionInXMLString = testing.fn();

const createHttp = (options?: Partial<HttpOptions>) => {
  return new Http({
    apiServer: 'example.com',
    apiProtocol: 'https:',
    ...options,
  });
};

const createXHR = (status: number, response = '') => {
  return {
    status,
    response,
    open: testing.fn(),
    send: testing.fn(),
  } as unknown as XMLHttpRequest;
};

describe('Http', () => {
  test('should handle response error without error handlers', async () => {
    const http = createHttp();
    const xhr = createXHR(500);
    const reject = testing.fn();
    http.handleResponseError(reject, xhr);
    expect(reject).toHaveBeenCalledWith(expect.any(Rejection));
  });

  test('should call error handler on 401 error ', async () => {
    const http = createHttp();
    const xhr = createXHR(401);
    const reject = testing.fn();
    http.handleResponseError(reject, xhr);
    expect(reject).toHaveBeenCalledWith(expect.any(Rejection));
  });

  test('should not append additional message on 404 error', async () => {
    const http = createHttp();
    const xhr = createXHR(404);
    const reject = testing.fn();
    mockFindActionInXMLString.mockReturnValue(false);

    http.handleResponseError(reject, xhr);
    expect(mockGetFeedAccessStatusMessage).not.toHaveBeenCalled();

    expect(reject).toHaveBeenCalledWith(expect.any(Rejection));
    const rejectedResponse = reject.mock.calls[0][0];
    expect(rejectedResponse.message).toEqual('Response error');
  });

  test('should allow to get params', () => {
    const http = createHttp({token: '123'});
    expect(http.getParams()).toEqual({
      token: '123',
    });
  });

  test('should allow to add error handlers and call them on error', async () => {
    const http = createHttp();
    const handler1 = testing.fn();
    const handler2 = testing.fn();

    http.addErrorHandler(handler1);
    http.addErrorHandler(handler2);

    const xhr = createXHR(500);
    const reject = testing.fn();

    http.handleResponseError(reject, xhr);

    expect(handler1).toHaveBeenCalledWith(xhr);
    expect(handler2).toHaveBeenCalledWith(xhr);
  });

  test('should allow to remove error handlers', async () => {
    const http = createHttp();
    const handler1 = testing.fn();
    const handler2 = testing.fn();

    const xhr = createXHR(500);
    const reject = testing.fn();

    const removeHandler1 = http.addErrorHandler(handler1);
    http.addErrorHandler(handler2);

    removeHandler1();

    http.handleResponseError(reject, xhr);

    expect(handler1).not.toHaveBeenCalled();
    expect(handler2).toHaveBeenCalledWith(xhr);
  });

  test('should allow to create get requests', async () => {
    const xhr = createXHR(200, 'some data');
    // @ts-expect-error
    Http.XHR = testing.fn(() => {
      return xhr;
    });

    const http = createHttp();
    const promise = http.request('get', {args: {cmd: 'get_tasks'}});
    // @ts-expect-error
    xhr.onload();

    const response = await promise;
    expect(response.data).toEqual('some data');
    expect(xhr.open).toHaveBeenCalledWith(
      'GET',
      'https://example.com/gmp?cmd=get_tasks',
      true,
    );
    expect(xhr.timeout).toBeUndefined();
    expect(xhr.withCredentials).toEqual(true);
    expect(xhr.send).toHaveBeenCalledWith(undefined);
  });

  test('should allow to create post requests', async () => {
    const formData = new FormData();
    formData.append('cmd', 'get_tasks');
    const xhr = createXHR(200, 'some data');
    // @ts-expect-error
    Http.XHR = testing.fn(() => {
      return xhr;
    });

    const http = createHttp();
    const promise = http.request('post', {data: {cmd: 'get_tasks'}});
    // @ts-expect-error
    xhr.onload();

    const response = await promise;
    expect(response.data).toEqual('some data');
    expect(xhr.open).toHaveBeenCalledWith(
      'POST',
      'https://example.com/gmp',
      true,
    );
    expect(xhr.withCredentials).toEqual(true);
    expect(xhr.timeout).toBeUndefined();
    expect(xhr.send).toHaveBeenCalledWith(formData);
  });

  test('should allow to handle a request with timeout', async () => {
    const xhr = createXHR(200, 'some data');
    // @ts-expect-error
    Http.XHR = testing.fn(() => {
      return xhr;
    });

    const http = createHttp({timeout: 5000});
    const promise = http.request('get', {args: {cmd: 'get_tasks'}});
    // @ts-expect-error
    xhr.ontimeout();

    await expect(promise).rejects.toBeInstanceOf(Rejection);
    expect(xhr.open).toHaveBeenCalledWith(
      'GET',
      'https://example.com/gmp?cmd=get_tasks',
      true,
    );
    expect(xhr.withCredentials).toEqual(true);
    expect(xhr.timeout).toEqual(5000);
    expect(xhr.send).toHaveBeenCalledWith(undefined);
  });

  test('should allow to handle an error during a request', async () => {
    const xhr = createXHR(200, 'some data');
    // @ts-expect-error
    Http.XHR = testing.fn(() => {
      return xhr;
    });

    const http = createHttp();
    const promise = http.request('get', {args: {cmd: 'get_tasks'}});
    // @ts-expect-error
    xhr.onerror();

    await expect(promise).rejects.toBeInstanceOf(Rejection);
    expect(xhr.open).toHaveBeenCalledWith(
      'GET',
      'https://example.com/gmp?cmd=get_tasks',
      true,
    );
    expect(xhr.withCredentials).toEqual(true);
    expect(xhr.send).toHaveBeenCalledWith(undefined);
  });
});
