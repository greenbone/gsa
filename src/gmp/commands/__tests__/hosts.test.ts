/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import HostsCommand from 'gmp/commands/hosts';
import {
  createAggregatesResponse,
  createEntitiesResponse,
  createHttp,
} from 'gmp/commands/testing';
import Host, {Identifier} from 'gmp/models/host';

describe('HostsCommand tests', () => {
  test('should fetch hosts with default params', async () => {
    const response = createEntitiesResponse('asset', [
      {
        _id: '1',
        identifiers: {
          identifier: {
            name: 'hostname',
            value: 'host1',
          },
        },
      },
      {
        _id: '2',
        identifiers: {
          identifier: {
            name: 'hostname',
            value: 'host2',
          },
        },
      },
    ]);
    const fakeHttp = createHttp(response);

    const cmd = new HostsCommand(fakeHttp);
    const result = await cmd.get();
    expect(fakeHttp.request).toHaveBeenCalledWith('get', {
      args: {
        cmd: 'get_assets',
        asset_type: 'host',
      },
    });
    expect(result.data).toEqual([
      new Host({
        id: '1',
        hostname: 'host1',
        identifiers: [new Identifier({name: 'hostname', value: 'host1'})],
      }),
      new Host({
        id: '2',
        hostname: 'host2',
        identifiers: [new Identifier({name: 'hostname', value: 'host2'})],
      }),
    ]);
  });

  test('should fetch hosts with custom params', async () => {
    const response = createEntitiesResponse('asset', [
      {
        _id: '1',
        identifiers: {
          identifier: {
            name: 'hostname',
            value: 'host1',
          },
        },
      },
    ]);
    const fakeHttp = createHttp(response);

    const cmd = new HostsCommand(fakeHttp);
    const result = await cmd.get({filter: "name='host1'"});
    expect(fakeHttp.request).toHaveBeenCalledWith('get', {
      args: {
        cmd: 'get_assets',
        asset_type: 'host',
        filter: "name='host1'",
      },
    });
    expect(result.data).toEqual([
      new Host({
        id: '1',
        hostname: 'host1',
        identifiers: [new Identifier({name: 'hostname', value: 'host1'})],
      }),
    ]);
  });

  test('should fetch all hosts', async () => {
    const response = createEntitiesResponse('asset', [
      {
        _id: '1',
        identifiers: {
          identifier: {
            name: 'hostname',
            value: 'host1',
          },
        },
      },
      {
        _id: '2',
        identifiers: {
          identifier: {
            name: 'hostname',
            value: 'host2',
          },
        },
      },
    ]);
    const fakeHttp = createHttp(response);

    const cmd = new HostsCommand(fakeHttp);
    const result = await cmd.getAll();
    expect(fakeHttp.request).toHaveBeenCalledWith('get', {
      args: {cmd: 'get_assets', asset_type: 'host', filter: 'first=1 rows=-1'},
    });
    expect(result.data).toEqual([
      new Host({
        id: '1',
        hostname: 'host1',
        identifiers: [new Identifier({name: 'hostname', value: 'host1'})],
      }),
      new Host({
        id: '2',
        hostname: 'host2',
        identifiers: [new Identifier({name: 'hostname', value: 'host2'})],
      }),
    ]);
  });
  test('should allow to export hosts by ids', async () => {
    const response = createEntitiesResponse('asset', []);
    const fakeHttp = createHttp(response);

    const cmd = new HostsCommand(fakeHttp);

    const ids = ['123', '456'];

    await cmd.exportByIds(ids);

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

  test('should allow to export hosts', async () => {
    const response = createEntitiesResponse('asset', []);
    const fakeHttp = createHttp(response);

    const cmd = new HostsCommand(fakeHttp);

    const entities = [new Host({id: '123'}), new Host({id: '456'})];

    await cmd.export(entities);

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

  test('should fetch modified aggregates', async () => {
    const response = createAggregatesResponse({
      group: [
        {value: '2023-01-01', count: 5},
        {value: '2023-01-02', count: 3},
      ],
    });
    const fakeHttp = createHttp(response);

    const cmd = new HostsCommand(fakeHttp);
    const result = await cmd.getModifiedAggregates();
    expect(fakeHttp.request).toHaveBeenCalledWith('get', {
      args: {
        cmd: 'get_aggregate',
        asset_type: 'host',
        aggregate_type: 'host',
        group_column: 'modified',
        subgroup_column: 'severity_level',
      },
    });
    expect(result.data).toEqual({
      groups: [
        {value: '2023-01-01', count: 5},
        {value: '2023-01-02', count: 3},
      ],
    });
  });

  test('should fetch severity aggregates', async () => {
    const response = createAggregatesResponse({
      group: [
        {value: 'high', count: 10},
        {value: 'medium', count: 7},
      ],
    });
    const fakeHttp = createHttp(response);

    const cmd = new HostsCommand(fakeHttp);
    const result = await cmd.getSeverityAggregates();
    expect(fakeHttp.request).toHaveBeenCalledWith('get', {
      args: {
        cmd: 'get_aggregate',
        asset_type: 'host',
        aggregate_type: 'host',
        group_column: 'severity',
      },
    });
    expect(result.data).toEqual({
      groups: [
        {value: 'high', count: 10},
        {value: 'medium', count: 7},
      ],
    });
  });

  test('should fetch vulnerability score aggregates', async () => {
    const response = createAggregatesResponse({
      group: [
        {value: 9.8, count: 4},
        {value: 7.5, count: 6},
      ],
    });
    const fakeHttp = createHttp(response);

    const cmd = new HostsCommand(fakeHttp);
    const result = await cmd.getVulnScoreAggregates({max: 10});
    expect(fakeHttp.request).toHaveBeenCalledWith('get', {
      args: {
        cmd: 'get_aggregate',
        asset_type: 'host',
        aggregate_type: 'host',
        'data_columns:0': 'severity',
        group_column: 'uuid',
        max_groups: '10',
        'sort_fields:0': 'severity',
        'sort_fields:1': 'modified',
        'sort_orders:0': 'descending',
        'sort_orders:1': 'descending',
        'sort_stats:0': 'max',
        'sort_stats:1': 'value',
        'text_columns:0': 'name',
        'text_columns:1': 'modified',
      },
    });
    expect(result.data).toEqual({
      groups: [
        {value: 9.8, count: 4},
        {value: 7.5, count: 6},
      ],
    });
  });
});
