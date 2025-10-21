/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import RolesCommand from 'gmp/commands/roles';
import {createHttp, createEntitiesResponse} from 'gmp/commands/testing';
import Role from 'gmp/models/role';

describe('RolesCommand tests', () => {
  test('should fetch roles with default params', async () => {
    const response = createEntitiesResponse('role', [
      {_id: '1', name: 'Admin'},
      {_id: '2', name: 'User'},
    ]);
    const fakeHttp = createHttp(response);

    const cmd = new RolesCommand(fakeHttp);
    const result = await cmd.get();
    expect(fakeHttp.request).toHaveBeenCalledWith('get', {
      args: {cmd: 'get_roles'},
    });
    expect(result.data).toEqual([
      new Role({id: '1', name: 'Admin'}),
      new Role({id: '2', name: 'User'}),
    ]);
  });

  test('should fetch roles with custom params', async () => {
    const response = createEntitiesResponse('role', [
      {_id: '3', name: 'Guest'},
    ]);
    const fakeHttp = createHttp(response);

    const cmd = new RolesCommand(fakeHttp);
    const result = await cmd.get({filter: "name='Guest'"});
    expect(fakeHttp.request).toHaveBeenCalledWith('get', {
      args: {cmd: 'get_roles', filter: "name='Guest'"},
    });
    expect(result.data).toEqual([new Role({id: '3', name: 'Guest'})]);
  });

  test('should fetch all roles', async () => {
    const response = createEntitiesResponse('role', [
      {_id: '4', name: 'Manager'},
      {_id: '5', name: 'Editor'},
    ]);
    const fakeHttp = createHttp(response);

    const cmd = new RolesCommand(fakeHttp);
    const result = await cmd.getAll();
    expect(fakeHttp.request).toHaveBeenCalledWith('get', {
      args: {cmd: 'get_roles', filter: 'first=1 rows=-1'},
    });
    expect(result.data).toEqual([
      new Role({id: '4', name: 'Manager'}),
      new Role({id: '5', name: 'Editor'}),
    ]);
  });
});
