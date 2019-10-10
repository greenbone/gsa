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
import {createResponse, createHttp} from '../testing';

import {NvtCommand} from '../nvt';

describe('NvtCommand tests', () => {
  test('should request single nvt', () => {
    const response = createResponse({
      get_info: {
        get_info_response: {
          info: [
            {
              nvt: {
                _oid: '1.2.3',
              },
            },
          ],
        },
      },
    });
    const fakeHttp = createHttp(response);

    expect.hasAssertions();

    const cmd = new NvtCommand(fakeHttp);
    return cmd.get({id: '1.2.3'}).then(resp => {
      expect(fakeHttp.request).toHaveBeenCalledWith('get', {
        args: {
          cmd: 'get_info',
          info_id: '1.2.3',
          details: '1',
          info_type: 'nvt',
        },
      });

      const {data: nvt} = resp;
      expect(nvt.id).toEqual('1.2.3');
    });
  });

  test('should return config nvt', () => {
    const response = createResponse({
      get_config_nvt_response: {
        get_nvts_response: {
          nvt: {
            _oid: '1.2.3',
          },
        },
      },
    });
    const fakeHttp = createHttp(response);

    expect.hasAssertions();

    const cmd = new NvtCommand(fakeHttp);
    return cmd.getConfigNvt({oid: '1.2.3', configId: 'c1'}).then(resp => {
      expect(fakeHttp.request).toHaveBeenCalledWith('get', {
        args: {
          cmd: 'get_config_nvt',
          config_id: 'c1',
          oid: '1.2.3',
        },
      });

      const {data: nvt} = resp;
      expect(nvt.id).toEqual('1.2.3');
    });
  });
});
