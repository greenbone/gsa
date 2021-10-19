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
import {setLocale} from 'gmp/locale/lang';

import Rejection from '../rejection';

setLocale('en');

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
