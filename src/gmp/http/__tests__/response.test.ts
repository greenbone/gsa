/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import Response from 'gmp/http/response';

describe('Response tests', () => {
  test('should create response with xhr data', () => {
    const data = '{"foo": "bar"}';
    const response = new Response(data);

    expect(response.data).toEqual('{"foo": "bar"}');
    expect(response.meta).toEqual({});
  });
  test('should create response with data and meta', () => {
    const data = {foo: 'bar'};
    const meta = {status: 200};
    const response = new Response<typeof data, typeof meta>(data, meta);

    expect(response.data).toEqual(data);
    expect(response.meta).toEqual(meta);
  });

  test('should create response with undefined data', () => {
    const response = new Response<undefined>(undefined);

    expect(response.data).toBeUndefined();
    expect(response.meta).toEqual({});
  });

  test('should allow to set response data', () => {
    const response = new Response<string>('foo');

    expect(response.data).toEqual('foo');
    expect(response.meta).toEqual({});

    const response2 = response.setData('bar');

    expect(response2.data).toEqual('bar');
    expect(response2.meta).toEqual({});
    expect(response).not.toBe(response2);
  });

  test('should allow to set response meta', () => {
    const response = new Response<string>('foo');

    expect(response.data).toEqual('foo');
    expect(response.meta).toEqual({});

    const meta = {status: 200};
    const response2 = response.setMeta(meta);

    expect(response2.data).toEqual('foo');
    expect(response2.meta).toEqual(meta);
    expect(response).not.toBe(response2);
  });
});
