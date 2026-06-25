/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import GroupsCommand from 'gmp/commands/groups';
import {createHttp, createEntitiesResponse} from 'gmp/commands/testing';
import Group from 'gmp/models/group';

describe('GroupsCommand tests', () => {
  test('should fetch groups with default params', async () => {
    const response = createEntitiesResponse('group', [
      {_id: '1', name: 'Admins', users: 'alice,bob'},
      {_id: '2', name: 'Auditors', users: 'charlie'},
    ]);
    const fakeHttp = createHttp(response);

    const cmd = new GroupsCommand(fakeHttp);
    const result = await cmd.get();
    expect(fakeHttp.request).toHaveBeenCalledWith('get', {
      args: {cmd: 'get_groups'},
    });
    expect(result.data).toEqual([
      new Group({id: '1', name: 'Admins', users: ['alice', 'bob']}),
      new Group({id: '2', name: 'Auditors', users: ['charlie']}),
    ]);
  });

  test('should fetch groups with custom params', async () => {
    const response = createEntitiesResponse('group', [
      {_id: '3', name: 'DevOps', users: 'dana'},
    ]);
    const fakeHttp = createHttp(response);

    const cmd = new GroupsCommand(fakeHttp);
    const result = await cmd.get({filter: "name='DevOps'"});
    expect(fakeHttp.request).toHaveBeenCalledWith('get', {
      args: {cmd: 'get_groups', filter: "name='DevOps'"},
    });
    expect(result.data).toEqual([
      new Group({id: '3', name: 'DevOps', users: ['dana']}),
    ]);
  });

  test('should fetch all groups', async () => {
    const response = createEntitiesResponse('group', [
      {_id: '4', name: 'Operators', users: 'erin'},
      {_id: '5', name: 'Guests', users: ''},
    ]);
    const fakeHttp = createHttp(response);

    const cmd = new GroupsCommand(fakeHttp);
    const result = await cmd.getAll();
    expect(fakeHttp.request).toHaveBeenCalledWith('get', {
      args: {cmd: 'get_groups', filter: 'first=1 rows=-1'},
    });
    expect(result.data).toEqual([
      new Group({id: '4', name: 'Operators', users: ['erin']}),
      new Group({id: '5', name: 'Guests', users: []}),
    ]);
  });
});
