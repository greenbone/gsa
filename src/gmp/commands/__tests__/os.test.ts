/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import {OperatingSystemCommand, OperatingSystemsCommand} from 'gmp/commands/os';
import OperatingSystem from 'gmp/models/os';
import {
  createEntitiesResponse,
  createPlainResponse,
  createHttp,
} from 'gmp/commands/testing';
import Response from 'gmp/http/response';

describe('OperatingSystemsCommand tests', () => {
  test('should include asset_type=os in exportByIds', async () => {
    const response = createEntitiesResponse('asset', []);
    const fakeHttp = createHttp(response);

    const cmd = new OperatingSystemsCommand(fakeHttp);

    const ids = ['123', '456'];
    await cmd.exportByIds(ids);

    expect(fakeHttp.request).toHaveBeenCalledWith('post', {
      data: {
        'bulk_selected:123': 1,
        'bulk_selected:456': 1,
        cmd: 'bulk_export',
        resource_type: 'asset',
        asset_type: 'os',
        bulk_select: 1,
      },
    });
  });

  test('should include asset_type=host in export of operating systems', async () => {
    const response = createEntitiesResponse('asset', []);
    const fakeHttp = createHttp(response);

    const cmd = new OperatingSystemsCommand(fakeHttp);

    const entities = [
      new OperatingSystem({id: '123'}),
      new OperatingSystem({id: '456'}),
    ];
    await cmd.export(entities);

    expect(fakeHttp.request).toHaveBeenCalledWith('post', {
      data: {
        'bulk_selected:123': 1,
        'bulk_selected:456': 1,
        cmd: 'bulk_export',
        resource_type: 'asset',
        asset_type: 'os',
        bulk_select: 1,
      },
    });
  });

  test('should include asset_type=os in export of operating system', async () => {
    const content = '<some><xml>exported-data</xml></some>';
    const response = createPlainResponse(content);
    const fakeHttp = createHttp(response);

    const cmd = new OperatingSystemCommand(fakeHttp);
    const cmdResponse = await cmd.export({id: '123'});

    expect(fakeHttp.request).toHaveBeenCalledWith('post', {
      data: {
        cmd: 'bulk_export',
        resource_type: 'asset',
        asset_type: 'os',
        bulk_select: 1,
        'bulk_selected:123': 1,
      },
    });
    expect(cmdResponse).toBeInstanceOf(Response);
    expect(cmdResponse.data).toEqual(content);
  });
});
