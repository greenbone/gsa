/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import OperatingSystemsCommand from 'gmp/commands/operatingsystems';
import {
  createAggregatesResponse,
  createEntitiesResponse,
  createHttp,
} from 'gmp/commands/testing';
import OperatingSystem from 'gmp/models/os';

describe('OperatingSystemsCommand tests', () => {
  test('should fetch operating systems with default params', async () => {
    const response = createEntitiesResponse('asset', [
      {
        _id: '1',
        title: 'Operating System 1',
      },
      {
        _id: '2',
        title: 'Operating System 2',
      },
    ]);
    const fakeHttp = createHttp(response);

    const cmd = new OperatingSystemsCommand(fakeHttp);
    const result = await cmd.get();
    expect(fakeHttp.request).toHaveBeenCalledWith('get', {
      args: {
        cmd: 'get_assets',
        asset_type: 'os',
      },
    });
    expect(result.data).toEqual([
      new OperatingSystem({
        id: '1',
        title: 'Operating System 1',
      }),
      new OperatingSystem({
        id: '2',
        title: 'Operating System 2',
      }),
    ]);
  });

  test('should fetch operating systems with custom params', async () => {
    const response = createEntitiesResponse('asset', [
      {
        _id: '1',
        title: 'Operating System 1',
      },
    ]);
    const fakeHttp = createHttp(response);

    const cmd = new OperatingSystemsCommand(fakeHttp);
    const result = await cmd.get({filter: "name='Operating System 1'"});
    expect(fakeHttp.request).toHaveBeenCalledWith('get', {
      args: {
        cmd: 'get_assets',
        asset_type: 'os',
        filter: "name='Operating System 1'",
      },
    });
    expect(result.data).toEqual([
      new OperatingSystem({
        id: '1',
        title: 'Operating System 1',
      }),
    ]);
  });

  test('should fetch all operating systems', async () => {
    const response = createEntitiesResponse('asset', [
      {
        _id: '1',
        title: 'Operating System 1',
      },
      {
        _id: '2',
        title: 'Operating System 2',
      },
    ]);
    const fakeHttp = createHttp(response);

    const cmd = new OperatingSystemsCommand(fakeHttp);
    const result = await cmd.getAll();
    expect(fakeHttp.request).toHaveBeenCalledWith('get', {
      args: {cmd: 'get_assets', asset_type: 'os', filter: 'first=1 rows=-1'},
    });
    expect(result.data).toEqual([
      new OperatingSystem({
        id: '1',
        title: 'Operating System 1',
      }),
      new OperatingSystem({
        id: '2',
        title: 'Operating System 2',
      }),
    ]);
  });

  test('should export operating systems by IDs', async () => {
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

  test('should export operating systems', async () => {
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

  test('should fetch average severity aggregates for operating systems', async () => {
    const response = createAggregatesResponse({
      group: [
        {value: 'high', count: 10},
        {value: 'medium', count: 7},
      ],
    });
    const fakeHttp = createHttp(response);

    const cmd = new OperatingSystemsCommand(fakeHttp);
    const result = await cmd.getAverageSeverityAggregates();
    expect(fakeHttp.request).toHaveBeenCalledWith('get', {
      args: {
        cmd: 'get_aggregate',
        asset_type: 'os',
        aggregate_type: 'os',
        group_column: 'average_severity',
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

    const cmd = new OperatingSystemsCommand(fakeHttp);
    const result = await cmd.getVulnScoreAggregates({max: 10});
    expect(fakeHttp.request).toHaveBeenCalledWith('get', {
      args: {
        cmd: 'get_aggregate',
        asset_type: 'os',
        aggregate_type: 'os',
        'data_columns:0': 'average_severity',
        'data_columns:1': 'average_severity_score',
        group_column: 'uuid',
        max_groups: '10',
        'sort_fields:0': 'average_severity_score',
        'sort_fields:1': 'modified',
        'sort_orders:0': 'descending',
        'sort_orders:1': 'descending',
        'sort_stats:0': 'max',
        'sort_stats:1': 'value',
        'text_columns:0': 'name',
        'text_columns:1': 'hosts',
        'text_columns:2': 'modified',
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
