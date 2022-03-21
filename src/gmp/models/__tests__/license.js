/* Copyright (C) 2022 Greenbone Networks GmbH
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

import {parseDate} from 'gmp/parser';

import {License} from '../license';

describe('License tests', () => {
  test('should init license data via constructor', () => {
    const license = new License({
      status: 'active',
      id: '12345',
      version: '1.0.0',
      title: 'Test License',
      type: 'trial',
      customerName: 'Monsters Inc.',
      created: parseDate('2021-08-27T06:05:21Z'),
      begins: parseDate('2021-08-27T07:05:21Z'),
      expires: parseDate('2021-09-04T07:05:21Z'),
      comment: 'foo',
      applianceModel: 'trial',
      applianceModelType: 'virtual',
      sensor: false,
    });

    expect(license.id).toEqual('12345');
    expect(license.customerName).toEqual('Monsters Inc.');
    expect(license.version).toEqual('1.0.0');
    expect(license.created).toEqual(parseDate('2021-08-27T06:05:21Z'));
    expect(license.begins).toEqual(parseDate('2021-08-27T07:05:21Z'));
    expect(license.expires).toEqual(parseDate('2021-09-04T07:05:21Z'));
    expect(license.comment).toEqual('foo');
    expect(license.applianceModel).toEqual('trial');
    expect(license.applianceModelType).toEqual('virtual');
    expect(license.type).toEqual('trial');
  });

  test('should parse license data from element', () => {
    const license = License.fromElement({
      status: 'active',
      content: {
        meta: {
          id: '12345',
          version: '1.0.0',
          title: 'Test License',
          type: 'trial',
          customer_name: 'Monsters Inc.',
          created: '2021-08-27T06:05:21Z',
          begins: '2021-08-27T07:05:21Z',
          expires: '2021-09-04T07:05:21Z',
          comment: 'foo',
        },
        appliance: {
          model: 'trial',
          model_type: 'virtual',
          sensor: false,
        },
      },
    });

    expect(license.id).toEqual('12345');
    expect(license.customerName).toEqual('Monsters Inc.');
    expect(license.version).toEqual('1.0.0');
    expect(license.created).toEqual(parseDate('2021-08-27T06:05:21Z'));
    expect(license.begins).toEqual(parseDate('2021-08-27T07:05:21Z'));
    expect(license.expires).toEqual(parseDate('2021-09-04T07:05:21Z'));
    expect(license.comment).toEqual('foo');
    expect(license.applianceModel).toEqual('trial');
    expect(license.applianceModelType).toEqual('virtual');
    expect(license.type).toEqual('trial');
  });
});
