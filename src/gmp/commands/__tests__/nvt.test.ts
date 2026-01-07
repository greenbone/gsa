/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import NvtCommand from 'gmp/commands/nvt';
import {
  createResponse,
  createHttp,
  createActionResultResponse,
} from 'gmp/commands/testing';

describe('NvtCommand tests', () => {
  test('should request single nvt', async () => {
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
    const cmd = new NvtCommand(fakeHttp);
    const resp = await cmd.get({id: '1.2.3'});
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

  test('should return config nvt', async () => {
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
    const cmd = new NvtCommand(fakeHttp);
    const resp = await cmd.getConfigNvt({oid: '1.2.3', configId: 'c1'});
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

  test('should allow to clone a nvt', async () => {
    const response = createActionResultResponse({id: '456'});
    const fakeHttp = createHttp(response);
    const cmd = new NvtCommand(fakeHttp);
    const result = await cmd.clone({id: '123'});
    expect(fakeHttp.request).toHaveBeenCalledWith('post', {
      data: {
        cmd: 'clone',
        details: '1',
        info_type: 'nvt',
        id: '123',
        resource_type: 'info',
      },
    });
    expect(result.data.id).toEqual('456');
  });

  test('should allow to delete a nvt', async () => {
    const response = createActionResultResponse({id: '123'});
    const fakeHttp = createHttp(response);
    const cmd = new NvtCommand(fakeHttp);
    const result = await cmd.delete({id: '123'});
    expect(fakeHttp.request).toHaveBeenCalledWith('post', {
      data: {
        cmd: 'delete_info',
        details: '1',
        info_type: 'nvt',
        info_id: '123',
      },
    });
    expect(result).toBeUndefined();
  });
});
