/* Copyright (C) 2021 Greenbone Networks GmbH
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
              },
              appliance: {
                model: 'trial',
                model_type: '450',
                sensor: false,
              },
              keys: {
                key: {
                  _name: 'feed',
                  __text: '*base64 GSF key*',
                },
              },
              signatures: {
                license: '*base64 signature*',
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
      expect(license.creationDate).toEqual(parseDate('2021-08-27T06:05:21Z'));
      expect(license.version).toEqual('1.0.0');
      expect(license.begins).toEqual(parseDate('2021-08-27T07:05:21Z'));
      expect(license.expires).toEqual(parseDate('2021-09-04T07:05:21Z'));
      expect(license.model).toEqual('trial');
      expect(license.modelType).toEqual('450');
      expect(license.key.name).toEqual('feed');
      expect(license.key.value).toEqual('*base64 GSF key*');
    });
  });
});
