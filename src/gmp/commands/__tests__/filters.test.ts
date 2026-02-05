/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import {FilterCommand} from 'gmp/commands/filters';
import {
  createHttp,
  createActionResultResponse,
  createEntitiesResponse
} from 'gmp/commands/testing';

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

  test.each([
    {entityType: "host", resourceType: "host"},
    {entityType: "os", resourceType: "os"},
    {entityType: "report", resourceType: "report"},
    {entityType: "result", resourceType: "result"},
    {entityType: "task", resourceType: "task"},
  ])(
    'should create $entityType filter with $resourceType',
    async ({entityType, resourceType}) =>
  {
    const response = createActionResultResponse({
      action: 'create_filter',
      id: '123',
      message: 'Filter created successfully',
    });
    const fakeHttp = createHttp(response);

    const cmd = new FilterCommand(fakeHttp);
    const result = await cmd.create({type: entityType});
    expect(fakeHttp.request).toHaveBeenCalledWith('post', {
      data: {cmd: 'create_filter', comment: "", resource_type: resourceType},
    });
    expect(result.data.id).toEqual('123');
  });

});
