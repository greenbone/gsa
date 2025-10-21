/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import HttpCommand from 'gmp/commands/http';
import {createHttp, createResponse} from 'gmp/commands/testing';

describe('HttpCommand tests', () => {
  test('should return itself from setting default param', () => {
    const http = createHttp();
    const cmd = new HttpCommand(http);

    // @ts-expect-error
    expect(cmd.setDefaultParam('foo', 'bar')).toEqual(cmd);
  });

  test('should init with default params', () => {
    const http = createHttp();
    const cmd = new HttpCommand(http, {foo: 'bar', bar: 1});

    // @ts-expect-error
    expect(cmd.getParams()).toEqual({foo: 'bar', bar: 1});
  });

  test('should create http get request', async () => {
    const httpResponse = createResponse();
    const http = createHttp(httpResponse);
    const cmd = new HttpCommand(http);

    // @ts-expect-error
    await cmd.httpGetWithTransform({foo: 'bar'});
    expect(http.request).toHaveBeenCalledWith('get', {
      args: {foo: 'bar'},
    });
  });

  test('should create http get request with default params', async () => {
    const httpResponse = createResponse();
    const http = createHttp(httpResponse);
    const cmd = new HttpCommand(http, {bar: 1});

    // @ts-expect-error
    await cmd.httpGetWithTransform({foo: 'bar'});
    expect(http.request).toHaveBeenCalledWith('get', {
      args: {foo: 'bar', bar: 1},
    });
  });

  test('should create http get request with overriding default params', async () => {
    const httpResponse = createResponse();
    const http = createHttp(httpResponse);
    const cmd = new HttpCommand(http, {bar: 1});

    // @ts-expect-error
    cmd.setDefaultParam('foo', 'foo');

    // @ts-expect-error
    await cmd.httpGetWithTransform({
      foo: 'bar',
      bar: 2,
      lorem: 'ipsum',
    });
    expect(http.request).toHaveBeenCalledWith('get', {
      args: {foo: 'bar', bar: 2, lorem: 'ipsum'},
    });
  });

  test('should create http get request with extra params', async () => {
    const httpResponse = createResponse();
    const http = createHttp(httpResponse);
    const cmd = new HttpCommand(http, {bar: 1});

    // @ts-expect-error
    await cmd.httpGetWithTransform(
      {foo: 'bar'},
      {extraParams: {lorem: 'ipsum'}},
    );
    expect(http.request).toHaveBeenCalledWith('get', {
      args: {foo: 'bar', bar: 1, lorem: 'ipsum'},
    });
  });

  test('should create http get request with extra params taking precedence', async () => {
    const httpResponse = createResponse();
    const http = createHttp(httpResponse);
    const cmd = new HttpCommand(http, {bar: 1, a: 1});

    // @ts-expect-error
    await cmd.httpGetWithTransform(
      {foo: 'bar', b: 2},
      {extraParams: {a: 3, b: 4, lorem: 'ipsum'}},
    );
    expect(http.request).toHaveBeenCalledWith('get', {
      args: {foo: 'bar', bar: 1, a: 3, b: 4, lorem: 'ipsum'},
    });
  });

  test('should create http get request with ignoring default params', async () => {
    const httpResponse = createResponse();
    const http = createHttp(httpResponse);
    const cmd = new HttpCommand(http, {bar: 1});

    // @ts-expect-error
    await cmd.httpGetWithTransform(
      {foo: 'bar'},
      {
        extraParams: {
          lorem: 'ipsum',
        },
        includeDefaultParams: false,
      },
    );
    expect(http.request).toHaveBeenCalledWith('get', {
      args: {foo: 'bar', lorem: 'ipsum'},
    });
  });

  test('should create http post request with default params', async () => {
    const httpResponse = createResponse();
    const http = createHttp(httpResponse);
    const cmd = new HttpCommand(http, {bar: 1});

    // @ts-expect-error
    cmd.setDefaultParam('lorem', 'ipsum');

    // @ts-expect-error
    await cmd.httpPostWithTransform({foo: 'bar'});
    expect(http.request).toHaveBeenCalledWith('post', {
      data: {foo: 'bar', bar: 1, lorem: 'ipsum'},
    });
  });

  test('should create http post request with overriding default params', async () => {
    const httpResponse = createResponse();
    const http = createHttp(httpResponse);
    const cmd = new HttpCommand(http, {bar: 1});

    // @ts-expect-error
    cmd.setDefaultParam('foo', 'foo');

    // @ts-expect-error
    await cmd.httpPostWithTransform({
      foo: 'bar',
      bar: 2,
      lorem: 'ipsum',
    });
    expect(http.request).toHaveBeenCalledWith('post', {
      data: {foo: 'bar', bar: 2, lorem: 'ipsum'},
    });
  });

  test('should create http post request with extra params', async () => {
    const httpResponse = createResponse();
    const http = createHttp(httpResponse);
    const cmd = new HttpCommand(http, {bar: 1});

    // @ts-expect-error
    await cmd.httpPostWithTransform(
      {foo: 'bar'},
      {extraParams: {lorem: 'ipsum'}},
    );
    expect(http.request).toHaveBeenCalledWith('post', {
      data: {foo: 'bar', bar: 1, lorem: 'ipsum'},
    });
  });

  test('should create http post request with extra params taking precedence', async () => {
    const httpResponse = createResponse();
    const http = createHttp(httpResponse);
    const cmd = new HttpCommand(http, {bar: 1, a: 1});

    // @ts-expect-error
    await cmd.httpPostWithTransform(
      {foo: 'bar', b: 2},
      {extraParams: {a: 3, b: 4, lorem: 'ipsum'}},
    );
    expect(http.request).toHaveBeenCalledWith('post', {
      data: {foo: 'bar', bar: 1, a: 3, b: 4, lorem: 'ipsum'},
    });
  });

  test('should create http post request with ignoring default params', async () => {
    const httpResponse = createResponse();
    const http = createHttp(httpResponse);
    const cmd = new HttpCommand(http, {bar: 1});

    // @ts-expect-error
    await cmd.httpPostWithTransform(
      {foo: 'bar'},
      {
        extraParams: {
          lorem: 'ipsum',
        },
        includeDefaultParams: false,
      },
    );
    expect(http.request).toHaveBeenCalledWith('post', {
      data: {foo: 'bar', lorem: 'ipsum'},
    });
  });
});
