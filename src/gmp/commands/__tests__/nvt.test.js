/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';

import {NvtCommand} from '../nvt';
import {createResponse, createHttp} from '../testing';

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
