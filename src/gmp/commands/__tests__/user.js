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
import {UserCommand, transformSettingName} from '../users';

import {createResponse, createHttp} from '../testing';
describe('UserCommand tests', () => {
  test('should parse auth settinngs in currentAuthSettings', () => {
    const response = createResponse({
      auth_settings: {
        describe_auth_response: {
          group: [
            {
              _name: 'foo',
              auth_conf_setting: [
                {
                  key: 'enable',
                  value: true,
                },
              ],
            },
            {
              _name: 'bar',
              auth_conf_setting: [
                {
                  key: 'foo',
                  value: 'true',
                },
                {
                  certificate_info: 'ipsum',
                },
              ],
            },
          ],
        },
      },
    });
    const fakeHttp = createHttp(response);

    expect.hasAssertions();

    const cmd = new UserCommand(fakeHttp);
    return cmd.currentAuthSettings().then(resp => {
      expect(fakeHttp.request).toHaveBeenCalledWith('get', {
        args: {
          cmd: 'auth_settings',
          name: '--',
        },
      });

      const {data: settings} = resp;

      expect(settings.has('foo')).toEqual(true);
      expect(settings.has('bar')).toEqual(true);
      expect(settings.has('ipsum')).toEqual(false);

      const fooSettings = settings.get('foo');
      expect(fooSettings.enabled).toEqual(true);

      const barSettings = settings.get('bar');
      expect(barSettings.foo).toEqual('true');
      expect(barSettings.certificateInfo).toEqual('ipsum');
    });
  });

  test('should return the first single setting value if given an array', () => {
    const response = createResponse({
      get_settings: {
        get_settings_response: {
          setting: [
            {
              _id: '123',
              name: 'Rows Per Page',
              value: '42',
            },
            {
              _id: '123',
              name: 'Rows Per Page',
              value: '21',
            },
          ],
        },
      },
    });
    const fakeHttp = createHttp(response);

    expect.hasAssertions();

    const cmd = new UserCommand(fakeHttp);
    return cmd.getSetting({id: '123'}).then(resp => {
      expect(fakeHttp.request).toHaveBeenCalledWith('get', {
        args: {
          cmd: 'get_setting',
          setting_id: {
            id: '123',
          },
        },
      });

      const {data} = resp;

      expect(data).toEqual({_id: '123', name: 'Rows Per Page', value: '42'});
    });
  });
});

describe('UserCommand transformSettingName() function tests', () => {
  test('should transform string to lower case and remove -', () => {
    const str1 = 'foo';
    const str2 = 'fooBar';
    const str3 = 'foo-bar';
    const str4 = 'foo-Bar';
    expect(transformSettingName(str1)).toEqual('foo');
    expect(transformSettingName(str2)).toEqual('foobar');
    expect(transformSettingName(str3)).toEqual('foobar');
    expect(transformSettingName(str4)).toEqual('foobar');
  });
});
