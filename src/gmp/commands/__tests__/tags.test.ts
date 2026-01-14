/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import TagsCommand from 'gmp/commands/tags';
import {createEntitiesResponse, createHttp} from 'gmp/commands/testing';
import Tag from 'gmp/models/tag';

describe('TagsCommand tests', () => {
  test('should fetch with default params', async () => {
    const response = createEntitiesResponse('tag', [
      {_id: '1', name: 'Tag 1', resources: {type: 'scanner'}},
      {_id: '2', name: 'Tag 2', resources: {type: 'task'}},
    ]);
    const fakeHttp = createHttp(response);

    const cmd = new TagsCommand(fakeHttp);
    const result = await cmd.get();
    expect(fakeHttp.request).toHaveBeenCalledWith('get', {
      args: {cmd: 'get_tags'},
    });
    expect(result.data).toEqual([
      new Tag({
        id: '1',
        name: 'Tag 1',
        resourceType: 'scanner',
      }),
      new Tag({
        id: '2',
        name: 'Tag 2',
        resourceType: 'task',
      }),
    ]);
  });

  test('should fetch with custom params', async () => {
    const response = createEntitiesResponse('tag', [
      {_id: '3', name: 'Tag 1', resources: {type: 'scanner'}},
    ]);
    const fakeHttp = createHttp(response);

    const cmd = new TagsCommand(fakeHttp);
    const result = await cmd.get({filter: "name='Tag 1'"});
    expect(fakeHttp.request).toHaveBeenCalledWith('get', {
      args: {cmd: 'get_tags', filter: "name='Tag 1'"},
    });
    expect(result.data).toEqual([
      new Tag({
        id: '3',
        name: 'Tag 1',
        resourceType: 'scanner',
      }),
    ]);
  });

  test('should get all tags', async () => {
    const response = createEntitiesResponse('tag', [
      {_id: '1', name: 'Tag 1', resources: {type: 'scanner'}},
      {_id: '2', name: 'Tag 2', resources: {type: 'task'}},
    ]);
    const fakeHttp = createHttp(response);

    const cmd = new TagsCommand(fakeHttp);
    const result = await cmd.getAll();
    expect(fakeHttp.request).toHaveBeenCalledWith('get', {
      args: {cmd: 'get_tags', filter: 'first=1 rows=-1'},
    });
    expect(result.data).toEqual([
      new Tag({
        id: '1',
        name: 'Tag 1',
        resourceType: 'scanner',
      }),
      new Tag({
        id: '2',
        name: 'Tag 2',
        resourceType: 'task',
      }),
    ]);
  });
});
