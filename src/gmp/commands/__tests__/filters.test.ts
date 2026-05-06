/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import {FilterCommand, FiltersCommand} from 'gmp/commands/filters';
import {
  createHttp,
  createActionResultResponse,
  createResponse,
} from 'gmp/commands/testing';
import type {EntityType} from 'gmp/utils/entity-type';

interface FilterResourceMapping {
  entityType: EntityType;
  resourceType: string;
}

describe('FilterCommand tests', () => {
  test('should create a new filter', async () => {
    const response = createActionResultResponse({
      action: 'create_filter',
      id: '123',
      message: 'Filter created successfully',
    });
    const fakeHttp = createHttp(response);

    const cmd = new FilterCommand(fakeHttp);
    const result = await cmd.create({
      name: 'Test Filter 1',
      type: 'host',
      term: 'name=Test',
    });
    expect(fakeHttp.request).toHaveBeenCalledWith('post', {
      data: {
        cmd: 'create_filter',
        name: 'Test Filter 1',
        comment: '',
        resource_type: 'host',
        term: 'name=Test',
      },
    });
    expect(result.data.id).toEqual('123');
  });

  test('should save an existing filter', async () => {
    const response = createActionResultResponse({
      action: 'save_filter',
      id: '123',
      message: 'Filter saved successfully',
    });
    const fakeHttp = createHttp(response);

    const cmd = new FilterCommand(fakeHttp);
    const result = await cmd.save({
      id: '123',
      name: 'Test Filter 1',
      type: 'host',
      term: 'name=Test',
    });
    expect(fakeHttp.request).toHaveBeenCalledWith('post', {
      data: {
        cmd: 'save_filter',
        filter_id: '123',
        name: 'Test Filter 1',
        comment: '',
        resource_type: 'host',
        term: 'name=Test',
      },
    });
    expect(result.data.id).toEqual('123');
  });

  test.each<FilterResourceMapping>([
    {entityType: 'host', resourceType: 'host'},
    {entityType: 'operatingsystem', resourceType: 'os'},
    {entityType: 'report', resourceType: 'report'},
    {entityType: 'result', resourceType: 'result'},
    {entityType: 'task', resourceType: 'task'},
  ])(
    'should create $entityType filter with $resourceType',
    async ({entityType, resourceType}) => {
      const response = createActionResultResponse({
        action: 'create_filter',
        id: '123',
        message: 'Filter created successfully',
      });
      const fakeHttp = createHttp(response);

      const cmd = new FilterCommand(fakeHttp);
      const result = await cmd.create({
        name: 'Test Filter',
        term: 'name=Test',
        type: entityType,
      });
      expect(fakeHttp.request).toHaveBeenCalledWith('post', {
        data: {
          cmd: 'create_filter',
          name: 'Test Filter',
          comment: '',
          resource_type: resourceType,
          term: 'name=Test',
        },
      });
      expect(result.data.id).toEqual('123');
    },
  );
});

describe('FiltersCommand tests', () => {
  test('should parse filter meta and collection counts from response', async () => {
    const response = createResponse({
      get_filters: {
        get_filters_response: {
          filter: [{_id: 'f1', term: 'name=Alpha'}],
          filters: [{term: 'name=Alpha'}, {_start: 3, _max: 20}],
          filter_count: {page: 1, __text: 42, filtered: 7},
        },
      },
    });

    const fakeHttp = createHttp(response);
    const cmd = new FiltersCommand(fakeHttp);
    const resp = await cmd.get();

    expect(fakeHttp.request).toHaveBeenCalledWith('get', {
      args: {
        cmd: 'get_filters',
      },
    });
    expect(resp.data.length).toEqual(1);
    expect(resp.meta.filter.toFilterString()).toContain('name=Alpha');
    expect(resp.meta.counts.first).toEqual(3);
    expect(resp.meta.counts.rows).toEqual(20);
    expect(resp.meta.counts.length).toEqual(1);
    expect(resp.meta.counts.all).toEqual(42);
    expect(resp.meta.counts.filtered).toEqual(7);
  });

  test('should return default collection counts when meta is missing', async () => {
    const response = createResponse({
      get_filters: {
        get_filters_response: {
          filter: [{_id: 'f1', term: 'name=Alpha'}],
          filters: [{term: 'name=Alpha'}],
        },
      },
    });

    const fakeHttp = createHttp(response);
    const cmd = new FiltersCommand(fakeHttp);
    const resp = await cmd.get();

    expect(resp.meta.counts.first).toEqual(0);
    expect(resp.meta.counts.rows).toEqual(0);
    expect(resp.meta.counts.length).toEqual(0);
    expect(resp.meta.counts.all).toEqual(0);
    expect(resp.meta.counts.filtered).toEqual(0);
  });
});
