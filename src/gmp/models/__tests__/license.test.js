/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import {License} from 'gmp/models/license';
import {parseDate} from 'gmp/parser';


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
