/* Copyright (C) 2018-2021 Greenbone Networks GmbH
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

// vim: set ts=2 sw=2 tw=80:
