/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import Response from 'gmp/http/response';
import {isDate} from 'gmp/models/date';
import Login, {LoginData, LoginMeta} from 'gmp/models/login';

describe('Login model tests', () => {
  test('should set all properties correctly', () => {
    const response = new Response<LoginData, LoginMeta>(
      {} as XMLHttpRequest,
      {
        client_address: '1.2.3.4',
        guest: false,
        role: 'admin',
        severity: '8.5',
        token: '123abc',
        session: '12345',
      },
      {
        i18n: 'en',
        timezone: 'UTC',
        vendor_version: '42',
        version: '1337',
      },
    );
    const login = Login.fromElement(response);
    const login2 = Login.fromElement(
      {} as unknown as Response<LoginData, LoginMeta>,
    );

    expect(login.clientAddress).toEqual('1.2.3.4');
    expect(login.guest).toEqual(false);
    expect(login.locale).toEqual('en');
    expect(login.role).toEqual('admin');
    expect(login.severity).toEqual('8.5');
    expect(login.timezone).toEqual('UTC');
    expect(login.token).toEqual('123abc');
    expect(login.vendorVersion).toEqual('42');
    expect(login.version).toEqual('1337');
    expect(isDate(login.sessionTimeout)).toEqual(true);
    expect(login2.sessionTimeout).toBeUndefined();
  });
});
