/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import {OperatingSystemCommand, OperatingSystemsCommand} from 'gmp/commands/os';
import {
  createEntitiesResponse,
  createPlainResponse,
  createHttp,
} from 'gmp/commands/testing';
import Response from 'gmp/http/response';
import OperatingSystem from 'gmp/models/os';

describe('OperatingSystemsCommand tests', () => {
  test('should include asset_type=os in exportByIds', async () => {
    const response = createEntitiesResponse('asset', []);
    const fakeHttp = createHttp(response);

    const cmd = new OperatingSystemsCommand(fakeHttp);

    const ids = ['123', '456'];
    const asset_type = 'os';
    await cmd.exportByIds(ids, asset_type);

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
    const asset_type = 'os';
    await cmd.export(entities, asset_type);

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
});
