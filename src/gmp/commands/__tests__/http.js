/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';

import HttpCommand from '../http';

describe('HttpCommand tests', () => {
  test('should return itself from setting default param', () => {
    const cmd = new HttpCommand({});

    expect(cmd.setDefaultParam('foo', 'bar')).toBe(cmd);
  });

  test('should allow to get and set default params', () => {
    const cmd = new HttpCommand({});

    cmd.setDefaultParam('foo', 'bar');
    cmd.setDefaultParam('bar', 1);

    expect(cmd.getDefaultParam('foo')).toEqual('bar');
    expect(cmd.getDefaultParam('bar')).toEqual(1);
  });

  test('should init with default params', () => {
    const cmd = new HttpCommand({}, {foo: 'bar', bar: 1});

    expect(cmd.getDefaultParam('foo')).toEqual('bar');
    expect(cmd.getDefaultParam('bar')).toEqual(1);
  });

  test('should create http get request', () => {
    const retval = {};
    const http = {
      request: testing.fn().mockReturnValue(retval),
    };

    const cmd = new HttpCommand(http);

    expect(cmd.httpGet({foo: 'bar'})).toBe(retval);

    expect(http.request).toHaveBeenCalledWith('get', {args: {foo: 'bar'}});
  });

  test('should create http get request with default params', () => {
    const retval = {};
    const http = {
      request: testing.fn().mockReturnValue(retval),
    };

    const cmd = new HttpCommand(http, {bar: 1});

    cmd.setDefaultParam('lorem', 'ipsum');

    expect(cmd.httpGet({foo: 'bar'})).toBe(retval);

    expect(http.request).toHaveBeenCalledWith('get', {
      args: {foo: 'bar', bar: 1, lorem: 'ipsum'},
    });
  });

  test('should create http get request with overriding default params', () => {
    const retval = {};
    const http = {
      request: testing.fn().mockReturnValue(retval),
    };

    const cmd = new HttpCommand(http, {bar: 1});

    cmd.setDefaultParam('foo', 'foo');

    expect(cmd.getDefaultParam('foo')).toEqual('foo');

    expect(cmd.httpGet({foo: 'bar', bar: 2, lorem: 'ipsum'})).toBe(retval);

    expect(http.request).toHaveBeenCalledWith('get', {
      args: {foo: 'bar', bar: 2, lorem: 'ipsum'},
    });
  });

  test('should create http get request with extra params', () => {
    const retval = {};
    const http = {
      request: testing.fn().mockReturnValue(retval),
    };

    const cmd = new HttpCommand(http, {bar: 1});

    expect(cmd.httpGet({foo: 'bar'}, {extraParams: {lorem: 'ipsum'}})).toBe(
      retval,
    );

    expect(http.request).toHaveBeenCalledWith('get', {
      args: {foo: 'bar', bar: 1, lorem: 'ipsum'},
    });
  });

  test('should create http get request with extra params taking precedence', () => {
    const retval = {};
    const http = {
      request: testing.fn().mockReturnValue(retval),
    };

    const cmd = new HttpCommand(http, {bar: 1, a: 1});

    expect(
      cmd.httpGet(
        {foo: 'bar', b: 2},
        {extraParams: {a: 3, b: 4, lorem: 'ipsum'}},
      ),
    ).toBe(retval);

    expect(http.request).toHaveBeenCalledWith('get', {
      args: {foo: 'bar', bar: 1, a: 3, b: 4, lorem: 'ipsum'},
    });
  });

  test('should create http get request with ignoring default params', () => {
    const retval = {};
    const http = {
      request: testing.fn().mockReturnValue(retval),
    };

    const cmd = new HttpCommand(http, {bar: 1});

    expect(
      cmd.httpGet(
        {foo: 'bar'},
        {
          extraParams: {
            lorem: 'ipsum',
          },
          includeDefaultParams: false,
        },
      ),
    ).toBe(retval);

    expect(http.request).toHaveBeenCalledWith('get', {
      args: {foo: 'bar', lorem: 'ipsum'},
    });
  });

  test('should create http post request with default params', () => {
    const retval = {};
    const http = {
      request: testing.fn().mockReturnValue(retval),
    };

    const cmd = new HttpCommand(http, {bar: 1});

    cmd.setDefaultParam('lorem', 'ipsum');

    expect(cmd.httpPost({foo: 'bar'})).toBe(retval);

    expect(http.request).toHaveBeenCalledWith('post', {
      data: {foo: 'bar', bar: 1, lorem: 'ipsum'},
    });
  });

  test('should create http post request with overriding default params', () => {
    const retval = {};
    const http = {
      request: testing.fn().mockReturnValue(retval),
    };

    const cmd = new HttpCommand(http, {bar: 1});

    cmd.setDefaultParam('foo', 'foo');

    expect(cmd.getDefaultParam('foo')).toEqual('foo');

    expect(cmd.httpPost({foo: 'bar', bar: 2, lorem: 'ipsum'})).toBe(retval);

    expect(http.request).toHaveBeenCalledWith('post', {
      data: {foo: 'bar', bar: 2, lorem: 'ipsum'},
    });
  });

  test('should create http post request with extra params', () => {
    const retval = {};
    const http = {
      request: testing.fn().mockReturnValue(retval),
    };

    const cmd = new HttpCommand(http, {bar: 1});

    expect(cmd.httpPost({foo: 'bar'}, {extraParams: {lorem: 'ipsum'}})).toBe(
      retval,
    );

    expect(http.request).toHaveBeenCalledWith('post', {
      data: {foo: 'bar', bar: 1, lorem: 'ipsum'},
    });
  });

  test('should create http post request with extra params taking precedence', () => {
    const retval = {};
    const http = {
      request: testing.fn().mockReturnValue(retval),
    };

    const cmd = new HttpCommand(http, {bar: 1, a: 1});

    expect(
      cmd.httpPost(
        {foo: 'bar', b: 2},
        {extraParams: {a: 3, b: 4, lorem: 'ipsum'}},
      ),
    ).toBe(retval);

    expect(http.request).toHaveBeenCalledWith('post', {
      data: {foo: 'bar', bar: 1, a: 3, b: 4, lorem: 'ipsum'},
    });
  });

  test('should create http post request with ignoring default params', () => {
    const retval = {};
    const http = {
      request: testing.fn().mockReturnValue(retval),
    };

    const cmd = new HttpCommand(http, {bar: 1});

    expect(
      cmd.httpPost(
        {foo: 'bar'},
        {
          extraParams: {
            lorem: 'ipsum',
          },
          includeDefaultParams: false,
        },
      ),
    ).toBe(retval);

    expect(http.request).toHaveBeenCalledWith('post', {
      data: {foo: 'bar', lorem: 'ipsum'},
    });
  });
});
