/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import PermissionCommand from 'gmp/commands/permission';
import {createHttp, createActionResultResponse} from 'gmp/commands/testing';

describe('PermissionCommand tests', () => {
  test('should create a new permission', async () => {
    const response = createActionResultResponse({
      id: '123',
    });
    const fakeHttp = createHttp(response);

    const cmd = new PermissionCommand(fakeHttp);
    const result = await cmd.create({
      name: 'Test Permission',
      comment: 'A test permission',
    });
    expect(fakeHttp.request).toHaveBeenCalledWith('post', {
      data: {
        cmd: 'create_permission',
        permission: 'Test Permission',
        comment: 'A test permission',
        id_or_empty: undefined,
        optional_resource_type: undefined,
        permission_group_id: undefined,
        permission_role_id: undefined,
        permission_user_id: undefined,
        subject_type: undefined,
      },
    });
    expect(result.data).toEqual({id: '123'});
  });

  test('should save an existing permission', async () => {
    const response = createActionResultResponse({
      id: '123',
    });
    const fakeHttp = createHttp(response);

    const cmd = new PermissionCommand(fakeHttp);
    const result = await cmd.save({
      id: '123',
      name: 'Updated Permission',
      comment: 'Updated comment',
    });
    expect(fakeHttp.request).toHaveBeenCalledWith('post', {
      data: {
        cmd: 'save_permission',
        permission_id: '123',
        permission: 'Updated Permission',
        comment: 'Updated comment',
        id_or_empty: undefined,
        optional_resource_type: undefined,
        resource_id: undefined,
        group_id: undefined,
        role_id: undefined,
        user_id: undefined,
        subject_type: undefined,
      },
    });
    expect(result.data).toEqual({id: '123'});
  });
});
