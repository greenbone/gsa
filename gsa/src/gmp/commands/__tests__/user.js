/* Copyright (C) 2019 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301 USA.
 */
import {UserCommand} from '../users';

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
                  value: 'true',
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
});
