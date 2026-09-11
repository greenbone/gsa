/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import RoleCommand from 'gmp/commands/role';
import {createHttp, createActionResultResponse} from 'gmp/commands/testing';

describe('RoleCommand tests', () => {
  test('should create a new role', async () => {
    const response = createActionResultResponse({
      action: 'create_role',
      id: '123',
      message: 'Role created successfully',
    });
    const fakeHttp = createHttp(response);

    const cmd = new RoleCommand(fakeHttp);
    const result = await cmd.create({
      name: 'Test Role',
      comment: 'A test role',
      users: 'user-1',
    });
    expect(fakeHttp.request).toHaveBeenCalledWith('post', {
      data: {
        cmd: 'create_role',
        name: 'Test Role',
        comment: 'A test role',
        users: '',
      },
    });
    expect(result.data).toEqual({id: '123'});
  });

  test('should create a role with users', async () => {
    const response = createActionResultResponse({id: '123'});
    const fakeHttp = createHttp(response);
    const cmd = new RoleCommand(fakeHttp);

    await cmd.create({
      name: 'Role with users',
      users: ['user-1', 'user-2'],
    });

    expect(fakeHttp.request).toHaveBeenCalledWith('post', {
      data: {
        cmd: 'create_role',
        name: 'Role with users',
        comment: '',
        users: 'user-1,user-2',
      },
    });
  });

  test('should save an existing role', async () => {
    const response = createActionResultResponse({
      action: 'save_role',
      id: '123',
      message: 'Role saved successfully',
    });
    const fakeHttp = createHttp(response);

    const cmd = new RoleCommand(fakeHttp);
    const result = await cmd.save({
      id: '123',
      name: 'Updated Role',
      comment: 'Updated comment',
      users: ['user-1', 'user-2'],
    });
    expect(fakeHttp.request).toHaveBeenCalledWith('post', {
      data: {
        cmd: 'save_role',
        role_id: '123',
        name: 'Updated Role',
        comment: 'Updated comment',
        users: 'user-1,user-2',
      },
    });
    expect(result).toBeUndefined();
  });

  test('should get the role element from the response root', () => {
    const cmd = new RoleCommand(createHttp());
    const role = {_id: '123', name: 'Test Role'};
    const root = {
      get_role: {
        get_roles_response: {
          role,
        },
      },
    };

    expect(cmd.getElementFromRoot(root)).toEqual(role);
  });

  test('should omit non-array users values', async () => {
    const fakeHttp = createHttp(createActionResultResponse());
    const cmd = new RoleCommand(fakeHttp);

    await cmd.save({
      id: '123',
      name: 'Role with invalid users value',
      users: 'user-1',
    });

    expect(fakeHttp.request).toHaveBeenCalledWith('post', {
      data: expect.objectContaining({
        users: '',
      }),
    });
  });
});
