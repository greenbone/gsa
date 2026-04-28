/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import Response from 'gmp/http/response';
import {isDate} from 'gmp/models/date';
import Login, {type LoginData} from 'gmp/models/login';

describe('Login model tests', () => {
  test('should set all properties correctly', () => {
    const response = new Response<LoginData>({
      client_address: '1.2.3.4',
      i18n: 'en',
      session: 12345,
      timezone: 'UTC',
      token: '123abc',
      version: '1337',
    });
    const login = Login.fromElement(response);

    expect(login.clientAddress).toEqual('1.2.3.4');
    expect(login.gsadVersion).toEqual('1337');
    expect(login.locale).toEqual('en');
    expect(login.timezone).toEqual('UTC');
    expect(login.token).toEqual('123abc');
    expect(isDate(login.sessionTimeout)).toEqual(true);

    const login2 = Login.fromElement({} as unknown as Response<LoginData>);
    expect(login2.sessionTimeout).toBeUndefined();
  });
});
