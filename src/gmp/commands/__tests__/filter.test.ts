/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import {FilterCommand} from 'gmp/commands/filter';
import {createHttp, createActionResultResponse} from 'gmp/commands/testing';
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

  test('should save an existing filter with a comment', async () => {
    const response = createActionResultResponse({
      action: 'save_filter',
      id: '123',
      message: 'Filter saved successfully',
    });
    const fakeHttp = createHttp(response);

    const cmd = new FilterCommand(fakeHttp);
    await cmd.save({
      id: '123',
      name: 'Test Filter 1',
      type: 'host',
      term: 'name=Test',
      comment: 'A saved filter',
    });

    expect(fakeHttp.request).toHaveBeenCalledWith('post', {
      data: {
        cmd: 'save_filter',
        filter_id: '123',
        name: 'Test Filter 1',
        comment: 'A saved filter',
        resource_type: 'host',
        term: 'name=Test',
      },
    });
  });

  test('should get the filter element from the response root', () => {
    const cmd = new FilterCommand(createHttp());
    const filter = {_id: '123', name: 'Test Filter'};
    const root = {
      get_filter: {
        get_filters_response: {
          filter,
        },
      },
    };

    expect(cmd.getElementFromRoot(root)).toEqual(filter);
  });

  test('should return an empty filter element when the response is incomplete', () => {
    const cmd = new FilterCommand(createHttp());

    expect(cmd.getElementFromRoot({})).toEqual({});
    expect(
      cmd.getElementFromRoot({get_filter: {get_filters_response: {}}}),
    ).toEqual({});
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
