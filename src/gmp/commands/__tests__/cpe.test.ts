/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import CpeCommand from 'gmp/commands/cpe';
import {
  createActionResultResponse,
  createHttp,
  createInfoResponse,
} from 'gmp/commands/testing';

describe('CpeCommand tests', () => {
  test('should get a cpe', async () => {
    const response = createInfoResponse({
      id: '123',
      name: 'Test cpe',
      cpe: 'cpe:/a:test:test:1.0',
      comment: 'A test cpe',
    });
    const fakeHttp = createHttp(response);
    const cmd = new CpeCommand(fakeHttp);
    const result = await cmd.get({
      id: '123',
    });
    expect(fakeHttp.request).toHaveBeenCalledWith('get', {
      args: {
        cmd: 'get_info',
        details: '1',
        info_type: 'cpe',
        info_id: '123',
      },
    });
    expect(result.data.id).toEqual('123');
  });

  test('should allow to clone a cpe', async () => {
    const response = createActionResultResponse({id: '456'});
    const fakeHttp = createHttp(response);
    const cmd = new CpeCommand(fakeHttp);
    const result = await cmd.clone({id: '123'});
    expect(fakeHttp.request).toHaveBeenCalledWith('post', {
      data: {
        cmd: 'clone',
        details: '1',
        info_type: 'cpe',
        id: '123',
        resource_type: 'info',
      },
    });
    expect(result.data.id).toEqual('456');
  });

  test('should allow to delete a cpe', async () => {
    const response = createActionResultResponse({id: '123'});
    const fakeHttp = createHttp(response);
    const cmd = new CpeCommand(fakeHttp);
    const result = await cmd.delete({id: '123'});
    expect(fakeHttp.request).toHaveBeenCalledWith('post', {
      data: {
        cmd: 'delete_info',
        details: '1',
        info_type: 'cpe',
        info_id: '123',
      },
    });
    expect(result).toBeUndefined();
  });
});
