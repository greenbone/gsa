/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import {RoleCommand} from 'gmp/commands/roles';
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
    });
    expect(fakeHttp.request).toHaveBeenCalledWith('post', {
      data: {
        cmd: 'save_role',
        role_id: '123',
        name: 'Updated Role',
        comment: 'Updated comment',
        users: '',
      },
    });
    expect(result).toBeUndefined();
  });
});
