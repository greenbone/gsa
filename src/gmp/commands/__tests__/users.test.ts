/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import {createHttp, createEntitiesResponse} from 'gmp/commands/testing';
import UsersCommand from 'gmp/commands/users';
import User from 'gmp/models/user';

describe('UsersCommand tests', () => {
  test('should fetch users with default params', async () => {
    const response = createEntitiesResponse('user', [
      {_id: '1', name: 'Alice'},
      {_id: '2', name: 'Bob'},
    ]);
    const fakeHttp = createHttp(response);

    const cmd = new UsersCommand(fakeHttp);
    const result = await cmd.get();
    expect(fakeHttp.request).toHaveBeenCalledWith('get', {
      args: {cmd: 'get_users'},
    });
    expect(result.data).toEqual([
      new User({id: '1', name: 'Alice'}),
      new User({id: '2', name: 'Bob'}),
    ]);
  });

  test('should fetch users with custom params', async () => {
    const response = createEntitiesResponse('user', [
      {_id: '3', name: 'Charlie'},
    ]);
    const fakeHttp = createHttp(response);

    const cmd = new UsersCommand(fakeHttp);
    const result = await cmd.get({filter: "name='Charlie'"});
    expect(fakeHttp.request).toHaveBeenCalledWith('get', {
      args: {cmd: 'get_users', filter: "name='Charlie'"},
    });
    expect(result.data).toEqual([new User({id: '3', name: 'Charlie'})]);
  });

  test('should fetch all users', async () => {
    const response = createEntitiesResponse('user', [
      {_id: '4', name: 'Dave'},
      {_id: '5', name: 'Eve'},
    ]);
    const fakeHttp = createHttp(response);

    const cmd = new UsersCommand(fakeHttp);
    const result = await cmd.getAll();
    expect(fakeHttp.request).toHaveBeenCalledWith('get', {
      args: {cmd: 'get_users', filter: 'first=1 rows=-1'},
    });
    expect(result.data).toEqual([
      new User({id: '4', name: 'Dave'}),
      new User({id: '5', name: 'Eve'}),
    ]);
  });
});
