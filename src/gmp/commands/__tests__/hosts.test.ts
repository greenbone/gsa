/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import {HostCommand, HostsCommand} from 'gmp/commands/hosts';
import {
  createEntitiesResponse,
  createPlainResponse,
  createHttp,
} from 'gmp/commands/testing';
import Response from 'gmp/http/response';
import Host from 'gmp/models/host';

describe('HostsCommand tests', () => {
  test('should include asset_type=host in exportByIds', async () => {
    const response = createEntitiesResponse('asset', []);
    const fakeHttp = createHttp(response);

    const cmd = new HostsCommand(fakeHttp);

    const ids = ['123', '456'];
    const asset_type = 'host';

    await cmd.exportByIds(ids, asset_type);

    expect(fakeHttp.request).toHaveBeenCalledWith('post', {
      data: {
        'bulk_selected:123': 1,
        'bulk_selected:456': 1,
        cmd: 'bulk_export',
        resource_type: 'asset',
        asset_type: 'host',
        bulk_select: 1,
      },
    });
  });

  test('should include asset_type=host in export of hosts', async () => {
    const response = createEntitiesResponse('asset', []);
    const fakeHttp = createHttp(response);

    const cmd = new HostsCommand(fakeHttp);

    const entities = [new Host({id: '123'}), new Host({id: '456'})];
    const asset_type = 'host';

    await cmd.export(entities, asset_type);

    expect(fakeHttp.request).toHaveBeenCalledWith('post', {
      data: {
        'bulk_selected:123': 1,
        'bulk_selected:456': 1,
        cmd: 'bulk_export',
        resource_type: 'asset',
        asset_type: 'host',
        bulk_select: 1,
      },
    });
  });
});
