/* Copyright (C) 2019-2021 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License
 * as published by the Free Software Foundation, either version 3
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */

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
      request: jest.fn().mockReturnValue(retval),
    };

    const cmd = new HttpCommand(http);

    expect(cmd.httpGet({foo: 'bar'})).toBe(retval);

    expect(http.request).toHaveBeenCalledWith('get', {args: {foo: 'bar'}});
  });

  test('should create http get request with default params', () => {
    const retval = {};
    const http = {
      request: jest.fn().mockReturnValue(retval),
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
      request: jest.fn().mockReturnValue(retval),
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
      request: jest.fn().mockReturnValue(retval),
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
      request: jest.fn().mockReturnValue(retval),
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
      request: jest.fn().mockReturnValue(retval),
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
      request: jest.fn().mockReturnValue(retval),
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
      request: jest.fn().mockReturnValue(retval),
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
      request: jest.fn().mockReturnValue(retval),
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
      request: jest.fn().mockReturnValue(retval),
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
      request: jest.fn().mockReturnValue(retval),
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
