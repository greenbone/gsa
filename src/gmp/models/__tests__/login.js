/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import {isDate} from 'gmp/models/date';
import Login from 'gmp/models/login';

describe('Login model tests', () => {
  test('should set all properties correctly', () => {
    const elem = {
      data: {
        client_address: '1.2.3.4',
        guest: '0',
        role: 'admin',
        severity: '8.5',
        token: '123abc',
        session: '12345',
      },
      meta: {
        i18n: 'en',
        timezone: 'UTC',
        vendor_version: '42',
        version: '1337',
      },
    };
    const login = Login.fromElement(elem);
    const login2 = Login.fromElement({});

    expect(login.clientAddress).toEqual('1.2.3.4');
    expect(login.guest).toEqual('0');
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
