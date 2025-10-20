/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import Rejection, {
  CanceledRejection,
  RequestRejection,
  ResponseRejection,
  TimeoutRejection,
} from 'gmp/http/rejection';

describe('Rejection tests', () => {
  test('should create unknown error rejection by default', () => {
    const rejection = new Rejection();

    expect(rejection.message).toEqual('Unknown Error');
    expect(rejection.error).toBeUndefined();
    expect(rejection.stack).toBeDefined();
  });

  test('should create rejection with custom message and error', () => {
    const error = new Error('foobar');
    const rejection = new Rejection('an error', error);

    expect(rejection.message).toEqual('an error');
    expect(rejection.error).toEqual(error);
    expect(rejection.stack).toBeDefined();
  });

  test('should create rejection with custom message only', () => {
    const rejection = new Rejection('an error');

    expect(rejection.message).toEqual('an error');
    expect(rejection.error).toBeUndefined();
    expect(rejection.stack).toBeDefined();
  });

  test('should create rejection with custom error only', () => {
    const error = new Error('foobar');
    const rejection = new Rejection(undefined, error);

    expect(rejection.message).toEqual('Unknown Error');
    expect(rejection.error).toEqual(error);
    expect(rejection.stack).toBeDefined();
  });

  test("should allow to set rejection's message", () => {
    const rejection = new Rejection('an error');

    expect(rejection.message).toEqual('an error');

    rejection.setMessage('another error');

    expect(rejection.message).toEqual('another error');
  });

  test('should support toString method', () => {
    const rejection = new Rejection('an error');
    expect(rejection.toString()).toEqual('Rejection: an error');
  });
});

describe('ResponseRejection tests', () => {
  test('should create error rejection', () => {
    const xhr = {status: 123} as XMLHttpRequest;
    const rejection = new ResponseRejection(xhr);

    expect(rejection.message).toEqual('Response error');
    expect(rejection.stack).toBeDefined();
    expect(rejection.status).toEqual(123);
  });

  test('should create error rejection with custom message', () => {
    const xhr = {status: 123} as XMLHttpRequest;
    const rejection = new ResponseRejection(xhr, 'an error');

    expect(rejection.message).toEqual('an error');
    expect(rejection.stack).toBeDefined();
    expect(rejection.status).toEqual(123);
  });

  test('should support toString method', () => {
    const xhr = {status: 123} as XMLHttpRequest;
    const rejection = new ResponseRejection(xhr, 'an error');
    expect(String(rejection)).toEqual('ResponseRejection: an error');
  });
});

describe('CanceledRejection tests', () => {
  test('should create cancel rejection', () => {
    const rejection = new CanceledRejection();

    expect(rejection.message).toEqual('Request canceled');
    expect(rejection.error).toBeUndefined();
    expect(rejection.stack).toBeDefined();
  });

  test('should create cancel rejection with custom message', () => {
    const rejection = new CanceledRejection('foo');

    expect(rejection.message).toEqual('foo');
    expect(rejection.error).toBeUndefined();
    expect(rejection.stack).toBeDefined();
  });

  test('should support toString method', () => {
    const rejection = new CanceledRejection('an error');
    expect(String(rejection)).toEqual('CanceledRejection: an error');
  });
});

describe('RequestRejection tests', () => {
  test('should create request rejection', () => {
    const xhr = {} as XMLHttpRequest;
    const rejection = new RequestRejection(xhr);

    expect(rejection.message).toEqual('Request failed');
    expect(rejection.stack).toBeDefined();
    expect(rejection.request).toBe(xhr);
  });

  test('should create request rejection with custom message', () => {
    const xhr = {} as XMLHttpRequest;
    const rejection = new RequestRejection(xhr, 'an error');

    expect(rejection.message).toEqual('an error');
    expect(rejection.stack).toBeDefined();
    expect(rejection.request).toBe(xhr);
  });

  test('should support toString method', () => {
    const xhr = {} as XMLHttpRequest;
    const rejection = new RequestRejection(xhr, 'an error');
    expect(String(rejection)).toEqual('RequestRejection: an error');
  });
});

describe('TimeoutRejection tests', () => {
  test('should create timeout rejection', () => {
    const rejection = new TimeoutRejection();

    expect(rejection.message).toEqual('Request timed out');
    expect(rejection.error).toBeUndefined();
    expect(rejection.stack).toBeDefined();
  });

  test('should create timeout rejection with custom message', () => {
    const rejection = new TimeoutRejection('foo');

    expect(rejection.message).toEqual('foo');
    expect(rejection.error).toBeUndefined();
    expect(rejection.stack).toBeDefined();
  });

  test('should support toString method', () => {
    const rejection = new TimeoutRejection('an error');
    expect(String(rejection)).toEqual('TimeoutRejection: an error');
  });
});
