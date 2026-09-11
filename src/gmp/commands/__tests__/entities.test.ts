/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import EntitiesCommand from 'gmp/commands/entities';
import {
  createActionResultResponse,
  createAggregatesResponse,
  createEntitiesResponse,
  createHttp,
  createHttpMany,
  createResponse,
} from 'gmp/commands/testing';
import type Http from 'gmp/http/http';
import Filter, {ALL_FILTER} from 'gmp/models/filter';
import QueryFilter from 'gmp/models/filter/query-filter';
import Model, {type Element} from 'gmp/models/model';

class Foo extends Model {}

class FooCommand extends EntitiesCommand<Foo> {
  constructor(http: Http) {
    super(http, 'foo', Foo);
  }

  getEntitiesResponse(data: Element) {
    return data;
  }
}

class FooWithAssetTypeCommand extends EntitiesCommand<Foo> {
  constructor(http: Http) {
    super(http, 'foo', Foo);
    this.setDefaultParam('asset_type', 'test_asset');
  }

  getEntitiesResponse(data: Element) {
    return data;
  }
}

describe('EntitiesCommand tests', () => {
  test('should add filter parameter', async () => {
    const filter = QueryFilter.fromString('foo=bar');
    const response = createEntitiesResponse('foo', []);
    const fakeHttp = createHttp(response);
    const cmd = new FooCommand(fakeHttp);
    await cmd.get({filter});
    expect(fakeHttp.request).toHaveBeenCalledWith('get', {
      args: {
        cmd: 'get_foos',
        filter: 'foo=bar',
      },
    });
  });

  test('should add filter_id parameter', async () => {
    const filter = Filter.fromElement({_id: 'bar'});
    const response = createEntitiesResponse('foo', []);
    const fakeHttp = createHttp(response);
    const cmd = new FooCommand(fakeHttp);
    await cmd.get({filter});
    expect(fakeHttp.request).toHaveBeenCalledWith('get', {
      args: {
        cmd: 'get_foos',
        filter_id: 'bar',
      },
    });
  });

  test('should add all parameters when using getAll', async () => {
    const response = createEntitiesResponse('foo', []);
    const fakeHttp = createHttp(response);
    const cmd = new FooCommand(fakeHttp);
    const filter = QueryFilter.fromString('foo=bar');

    await cmd.getAll({filter: filter.toFilterString()});

    expect(fakeHttp.request).toHaveBeenCalledWith('get', {
      args: {
        cmd: 'get_foos',
        filter: filter.all().toFilterString(),
      },
    });
  });

  test('should use the all filter when getAll has no filter', async () => {
    const response = createEntitiesResponse('foo', []);
    const fakeHttp = createHttp(response);
    const cmd = new FooCommand(fakeHttp);

    await cmd.getAll();

    expect(fakeHttp.request).toHaveBeenCalledWith('get', {
      args: {
        cmd: 'get_foos',
        filter: ALL_FILTER.toFilterString(),
      },
    });
  });

  test('should apply all filter terms to a filter object in getAll', async () => {
    const response = createEntitiesResponse('foo', []);
    const fakeHttp = createHttp(response);
    const cmd = new FooCommand(fakeHttp);
    const filter = QueryFilter.fromString('foo=bar');

    await cmd.getAll({filter});

    expect(fakeHttp.request).toHaveBeenCalledWith('get', {
      args: {
        cmd: 'get_foos',
        filter: filter.all().toFilterString(),
      },
    });
  });

  test('should prefer filter_id over filter parameter', async () => {
    const filter = QueryFilter.fromResponseElement({
      _id: 'bar',
      keywords: {
        keyword: {relation: '=', value: 'bar', column: 'foo'},
      },
    });
    const response = createEntitiesResponse('foo', []);
    const fakeHttp = createHttp(response);

    expect(filter.toFilterString()).toEqual('foo=bar');

    const cmd = new FooCommand(fakeHttp);
    await cmd.get({filter});
    expect(fakeHttp.request).toHaveBeenCalledWith('get', {
      args: {
        cmd: 'get_foos',
        filter_id: 'bar',
      },
    });
  });

  test('deleteByIds() should should call bulk_delete with correct ids', async () => {
    const response = createEntitiesResponse('foo', []);
    const fakeHttp = createHttp(response);

    const ids = ['123', '456'];

    const cmd = new FooCommand(fakeHttp);
    await cmd.deleteByIds(ids);
    expect(fakeHttp.request).toHaveBeenCalledWith('post', {
      data: {
        'bulk_selected:123': 1,
        'bulk_selected:456': 1,
        cmd: 'bulk_delete',
        resource_type: 'foo',
      },
    });
  });

  test('should delete entities and return the deleted entities', async () => {
    const response = createActionResultResponse();
    const fakeHttp = createHttp(response);
    const entities = [new Foo({id: '123'}), new Foo({id: '456'})];
    const cmd = new FooCommand(fakeHttp);

    const result = await cmd.delete(entities, {comment: 'cleanup'});

    expect(fakeHttp.request).toHaveBeenCalledWith('post', {
      data: {
        'bulk_selected:123': 1,
        'bulk_selected:456': 1,
        cmd: 'bulk_delete',
        resource_type: 'foo',
        comment: 'cleanup',
      },
    });
    expect(result.data).toEqual(entities);
  });

  test('should delete entities by filter', async () => {
    const entitiesResponse = createResponse({
      foo: [{_id: '123'}, {_id: '456'}],
    });
    const deleteResponse = createActionResultResponse();
    const fakeHttp = createHttpMany([entitiesResponse, deleteResponse]);
    const cmd = new FooCommand(fakeHttp);
    const filter = QueryFilter.fromString('foo=bar');

    const result = await cmd.deleteByFilter(filter, {comment: 'cleanup'});

    expect(fakeHttp.request).toHaveBeenNthCalledWith(1, 'get', {
      args: {
        cmd: 'get_foos',
        filter: 'foo=bar',
      },
    });
    expect(fakeHttp.request).toHaveBeenNthCalledWith(2, 'post', {
      data: {
        'bulk_selected:123': 1,
        'bulk_selected:456': 1,
        cmd: 'bulk_delete',
        resource_type: 'foo',
        comment: 'cleanup',
      },
    });
    expect(result.data).toEqual([new Foo({id: '123'}), new Foo({id: '456'})]);
  });

  test('should allow to export by filter', async () => {
    const response = createEntitiesResponse('foo', []);
    const fakeHttp = createHttp(response);

    const filter = QueryFilter.fromString('foo=bar');

    const cmd = new FooCommand(fakeHttp);
    await cmd.exportByFilter(filter);
    expect(fakeHttp.request).toHaveBeenCalledWith('post', {
      data: {
        cmd: 'bulk_export',
        resource_type: 'foo',
        bulk_select: 0,
        filter: 'foo=bar',
      },
    });
  });

  test('should allow to export by ids', async () => {
    const response = createEntitiesResponse('foo', []);
    const fakeHttp = createHttp(response);

    const ids = ['123', '456'];

    const cmd = new FooCommand(fakeHttp);
    await cmd.exportByIds(ids);
    expect(fakeHttp.request).toHaveBeenCalledWith('post', {
      data: {
        'bulk_selected:123': 1,
        'bulk_selected:456': 1,
        cmd: 'bulk_export',
        resource_type: 'foo',
        bulk_select: 1,
      },
    });
  });

  test('should allow to export entities', async () => {
    const response = createEntitiesResponse('foo', []);
    const fakeHttp = createHttp(response);

    const entities = [new Foo({id: '123'}), new Foo({id: '456'})];

    const cmd = new FooCommand(fakeHttp);
    await cmd.export(entities);
    expect(fakeHttp.request).toHaveBeenCalledWith('post', {
      data: {
        'bulk_selected:123': 1,
        'bulk_selected:456': 1,
        cmd: 'bulk_export',
        resource_type: 'foo',
        bulk_select: 1,
      },
    });
  });

  test('should include asset_type when defined via setDefaultParam in export by filter', async () => {
    const response = createEntitiesResponse('foo', []);
    const fakeHttp = createHttp(response);

    const filter = QueryFilter.fromString('foo=bar');

    const cmd = new FooWithAssetTypeCommand(fakeHttp);
    await cmd.exportByFilter(filter);

    expect(fakeHttp.request).toHaveBeenCalledWith('post', {
      data: {
        cmd: 'bulk_export',
        resource_type: 'foo',
        asset_type: 'test_asset',
        bulk_select: 0,
        filter: 'foo=bar',
      },
    });
  });

  test('should transform aggregate groups with text and stats', async () => {
    const response = createAggregatesResponse({
      group: [
        {
          value: 'foo',
          count: 2,
          c_count: 3,
          text: [{_column: 'name', __text: 'Foo'}],
          stats: [
            {
              _column: 'severity',
              c_sum: 10,
              max: 5,
              mean: 3,
              min: 1,
              sum: 7,
            },
          ],
        },
      ],
    });
    const fakeHttp = createHttp(response);
    const cmd = new FooCommand(fakeHttp);

    const result = await cmd.getAggregates({
      dataColumns: ['severity'],
      textColumns: ['name'],
      sort: [{field: 'severity', direction: 'descending', stat: 'max'}],
      aggregateMode: 'count',
      maxGroups: 10,
      subgroupColumn: 'type',
      filter: 'foo=bar',
    });

    expect(fakeHttp.request).toHaveBeenCalledWith('get', {
      args: {
        cmd: 'get_aggregate',
        'data_columns:0': 'severity',
        'text_columns:0': 'name',
        'sort_fields:0': 'severity',
        'sort_orders:0': 'descending',
        'sort_stats:0': 'max',
        aggregate_mode: 'count',
        max_groups: '10',
        subgroup_column: 'type',
        filter: 'foo=bar',
      },
    });
    expect(result.data).toEqual({
      groups: [
        {
          value: 'foo',
          count: 2,
          c_count: 3,
          text: {name: 'Foo'},
          stats: {
            severity: {
              c_sum: 10,
              max: 5,
              mean: 3,
              min: 1,
              sum: 7,
            },
          },
        },
      ],
    });
  });

  test('should use aggregate defaults when no groups are returned', async () => {
    const fakeHttp = createHttp(createAggregatesResponse());
    const cmd = new FooCommand(fakeHttp);

    const result = await cmd.getAggregates();

    expect(fakeHttp.request).toHaveBeenCalledWith('get', {
      args: {cmd: 'get_aggregate'},
    });
    expect(result.data).toEqual({groups: []});
  });

  test('should omit optional text and stats when they are not returned', async () => {
    const fakeHttp = createHttp(
      createAggregatesResponse({
        group: [{value: 'foo', count: 1, c_count: 1}],
      }),
    );
    const cmd = new FooCommand(fakeHttp);

    const result = await cmd.getAggregates();

    expect(result.data).toEqual({
      groups: [{value: 'foo', count: 1, c_count: 1}],
    });
  });

  test('should reject aggregate responses without aggregate data', async () => {
    const fakeHttp = createHttp(createResponse({}));
    const cmd = new FooCommand(fakeHttp);

    await expect(cmd.getAggregates()).rejects.toThrow(
      'Invalid response: get_aggregate not found',
    );
  });
});
