/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';

import {createResponse, createHttp} from '../testing';

import {parseDate} from 'gmp/parser';

import {LicenseCommand} from '../license';

describe('LicenseCommand tests', () => {
  test('should request license', () => {
    const response = createResponse({
      get_license: {
        get_license_response: {
          license: {
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
          },
        },
      },
    });

    const fakeHttp = createHttp(response);

    const cmd = new LicenseCommand(fakeHttp);
    return cmd.getLicenseInformation().then(resp => {
      expect(fakeHttp.request).toHaveBeenCalledWith('get', {
        args: {
          cmd: 'get_license',
        },
      });
      const {data: license} = resp;
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
});
