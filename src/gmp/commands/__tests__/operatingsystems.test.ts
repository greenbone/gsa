/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import {OperatingSystemsCommand} from 'gmp/commands/os';
import {createEntitiesResponse, createHttp} from 'gmp/commands/testing';
import OperatingSystem from 'gmp/models/os';

describe('OperatingSystemsCommand tests', () => {
  test('should include assetType=os in exportByIds', async () => {
    const response = createEntitiesResponse('asset', []);
    const fakeHttp = createHttp(response);

    const cmd = new OperatingSystemsCommand(fakeHttp);

    const ids = ['123', '456'];
    const assetType = 'os';
    await cmd.exportByIds(ids, assetType);

    expect(fakeHttp.request).toHaveBeenCalledWith('post', {
      data: {
        'bulk_selected:123': 1,
        'bulk_selected:456': 1,
        cmd: 'bulk_export',
        resource_type: 'asset',
        assetType: 'os',
        bulk_select: 1,
      },
    });
  });

  test('should include assetType=host in export of operating systems', async () => {
    const response = createEntitiesResponse('asset', []);
    const fakeHttp = createHttp(response);

    const cmd = new OperatingSystemsCommand(fakeHttp);

    const entities = [
      new OperatingSystem({id: '123'}),
      new OperatingSystem({id: '456'}),
    ];
    const assetType = 'os';
    await cmd.export(entities, assetType);

    expect(fakeHttp.request).toHaveBeenCalledWith('post', {
      data: {
        'bulk_selected:123': 1,
        'bulk_selected:456': 1,
        cmd: 'bulk_export',
        resource_type: 'asset',
        assetType: 'os',
        bulk_select: 1,
      },
    });
  });
});
