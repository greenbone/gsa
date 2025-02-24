/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import Rejection from 'gmp/http/rejection';

describe('Rejection tests', () => {
  test('should create error rejection by default', () => {
    const rejection = new Rejection();

    expect(rejection.reason).toEqual(Rejection.REASON_ERROR);
    expect(rejection.message).toEqual('Unknown Error');
    expect(rejection.error).toBeUndefined();
    expect(rejection.stack).toBeDefined();
    expect(rejection.isError()).toEqual(true);
    expect(rejection.status).toBeUndefined();
  });

  test('should create error rejection', () => {
    const xhr = {status: 123};
    const error = new Error('foobar');
    const rejection = new Rejection(
      xhr,
      Rejection.REASON_ERROR,
      'an error',
      error,
    );

    expect(rejection.reason).toEqual(Rejection.REASON_ERROR);
    expect(rejection.message).toEqual('an error');
    expect(rejection.error).toEqual(error);
    expect(rejection.stack).toBeDefined();
    expect(rejection.isError()).toEqual(true);
    expect(rejection.status).toEqual(123);
  });

  test('should create unauthorized rejection', () => {
    const xhr = {status: 123};
    const rejection = new Rejection(
      xhr,
      Rejection.REASON_UNAUTHORIZED,
      'Unauthorized',
    );

    expect(rejection.reason).toEqual(Rejection.REASON_UNAUTHORIZED);
    expect(rejection.message).toEqual('Unauthorized');
    expect(rejection.error).toBeUndefined();
    expect(rejection.stack).toBeDefined();
    expect(rejection.isError()).toEqual(false);
    expect(rejection.status).toEqual(123);
  });

  test('should create cancel rejection', () => {
    const xhr = {status: 123};
    const rejection = new Rejection(xhr, Rejection.REASON_CANCEL, 'foo');

    expect(rejection.reason).toEqual(Rejection.REASON_CANCEL);
    expect(rejection.message).toEqual('foo');
    expect(rejection.error).toBeUndefined();
    expect(rejection.stack).toBeDefined();
    expect(rejection.isError()).toEqual(false);
    expect(rejection.status).toEqual(123);
  });

  test('should create timeout rejection', () => {
    const xhr = {status: 123};
    const rejection = new Rejection(xhr, Rejection.REASON_TIMEOUT, 'foo');

    expect(rejection.reason).toEqual(Rejection.REASON_TIMEOUT);
    expect(rejection.message).toEqual('foo');
    expect(rejection.error).toBeUndefined();
    expect(rejection.stack).toBeDefined();
    expect(rejection.isError()).toEqual(false);
    expect(rejection.status).toEqual(123);
  });

  test('should allow to change message', () => {
    const rejection = new Rejection({}, Rejection.REASON_ERROR, 'foo');

    expect(rejection.message).toEqual('foo');

    rejection.setMessage('bar');

    expect(rejection.message).toEqual('bar');
  });

  test('should allow to get plain data', () => {
    const xhr = {
      response: 'foo',
      responseText: 'bar',
      responseXML: 'ipsum',
    };
    const rejection = new Rejection(xhr, Rejection.REASON_ERROR, 'foo');

    expect(rejection.plainData()).toEqual('foo');
    expect(rejection.plainData('text')).toEqual('bar');
    expect(rejection.plainData('xml')).toEqual('ipsum');
  });
});
