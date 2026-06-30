/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import HostCommand from 'gmp/commands/host';
import {
  createPlainResponse,
  createHttp,
  createEntityResponse,
  createActionResultResponse,
  createResponse,
} from 'gmp/commands/testing';
import Response from 'gmp/http/response';

describe('HostCommand tests', () => {
  test('should include asset_type=host in export of host', async () => {
    const content = '<some><xml>exported-data</xml></some>';
    const response = createPlainResponse(content);
    const fakeHttp = createHttp(response);

    const cmd = new HostCommand(fakeHttp);
    const cmdResponse = await cmd.export({id: '123'});

    expect(fakeHttp.request).toHaveBeenCalledWith('post', {
      data: {
        cmd: 'bulk_export',
        resource_type: 'asset',
        asset_type: 'host',
        bulk_select: 1,
        'bulk_selected:123': 1,
      },
    });
    expect(cmdResponse).toBeInstanceOf(Response);
    expect(cmdResponse.data).toEqual(content);
  });

  test('should request single host', async () => {
    const response = createEntityResponse('asset', {_id: 'foo'});
    const fakeHttp = createHttp(response);

    const cmd = new HostCommand(fakeHttp);
    const resp = await cmd.get({id: 'foo'});
    expect(fakeHttp.request).toHaveBeenCalledWith('get', {
      args: {
        cmd: 'get_asset',
        asset_type: 'host',
        asset_id: 'foo',
      },
    });
    const {data} = resp;
    expect(data.id).toEqual('foo');
  });

  test('should allow to create a host', async () => {
    const response = createActionResultResponse();
    const fakeHttp = createHttp(response);

    const cmd = new HostCommand(fakeHttp);
    const resp = await cmd.create({
      name: 'host1',
      comment: 'This is a test host',
    });
    expect(fakeHttp.request).toHaveBeenCalledWith('post', {
      data: {
        cmd: 'create_host',
        asset_type: 'host',
        name: 'host1',
        comment: 'This is a test host',
      },
    });
    const {data} = resp;
    expect(data.id).toEqual('foo');
  });

  test('should allow to modify a host', async () => {
    const response = createActionResultResponse();
    const fakeHttp = createHttp(response);

    const cmd = new HostCommand(fakeHttp);
    const resp = await cmd.save({
      id: 'foo',
      comment: 'Updated comment',
    });
    expect(fakeHttp.request).toHaveBeenCalledWith('post', {
      data: {
        cmd: 'save_asset',
        asset_type: 'host',
        asset_id: 'foo',
        comment: 'Updated comment',
      },
    });
    const {data} = resp;
    expect(data.id).toEqual('foo');
  });

  test("should allow to delete a host's identifier", async () => {
    const response = createResponse();
    const fakeHttp = createHttp(response);

    const cmd = new HostCommand(fakeHttp);
    const resp = await cmd.deleteIdentifier({id: 'foo'});
    expect(fakeHttp.request).toHaveBeenCalledWith('post', {
      data: {
        cmd: 'delete_asset',
        asset_type: 'host',
        asset_id: 'foo',
      },
    });
    expect(resp).toBeUndefined();
  });
});
