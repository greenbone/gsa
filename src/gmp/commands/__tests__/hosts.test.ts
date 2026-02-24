/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import {HostsCommand} from 'gmp/commands/hosts';
import {createEntitiesResponse, createHttp} from 'gmp/commands/testing';
import Host from 'gmp/models/host';

describe('HostsCommand tests', () => {
  test('should include assetType=host in exportByIds', async () => {
    const response = createEntitiesResponse('asset', []);
    const fakeHttp = createHttp(response);

    const cmd = new HostsCommand(fakeHttp);

    const ids = ['123', '456'];
    const assetType = 'host';

    await cmd.exportByIds(ids, assetType);

    expect(fakeHttp.request).toHaveBeenCalledWith('post', {
      data: {
        'bulk_selected:123': 1,
        'bulk_selected:456': 1,
        cmd: 'bulk_export',
        resource_type: 'asset',
        assetType: 'host',
        bulk_select: 1,
      },
    });
  });

  test('should include assetType=host in export of hosts', async () => {
    const response = createEntitiesResponse('asset', []);
    const fakeHttp = createHttp(response);

    const cmd = new HostsCommand(fakeHttp);

    const entities = [new Host({id: '123'}), new Host({id: '456'})];
    const assetType = 'host';

    await cmd.export(entities, assetType);

    expect(fakeHttp.request).toHaveBeenCalledWith('post', {
      data: {
        'bulk_selected:123': 1,
        'bulk_selected:456': 1,
        cmd: 'bulk_export',
        resource_type: 'asset',
        assetType: 'host',
        bulk_select: 1,
      },
    });
  });
});
