/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import PermissionsCommand, {
  INCLUDE_RELATED_CURRENT_RESOURCE_ONLY,
} from 'gmp/commands/permissions';
import {
  createHttp,
  createEntitiesResponse,
  createActionResultResponse,
} from 'gmp/commands/testing';
import Permission from 'gmp/models/permission';

describe('PermissionsCommand tests', () => {
  test('should fetch permissions with default params', async () => {
    const response = createEntitiesResponse('permission', [
      {_id: '1', name: 'perm1'},
      {_id: '2', name: 'perm2'},
    ]);
    const fakeHttp = createHttp(response);

    const cmd = new PermissionsCommand(fakeHttp);
    const result = await cmd.get();
    expect(fakeHttp.request).toHaveBeenCalledWith('get', {
      args: {cmd: 'get_permissions'},
    });
    expect(result.data).toEqual([
      new Permission({id: '1', name: 'perm1'}),
      new Permission({id: '2', name: 'perm2'}),
    ]);
  });

  test('should fetch permissions with custom params', async () => {
    const response = createEntitiesResponse('permission', [
      {_id: '3', name: 'perm3'},
    ]);
    const fakeHttp = createHttp(response);

    const cmd = new PermissionsCommand(fakeHttp);
    const result = await cmd.get({filter: "name='perm3'"});
    expect(fakeHttp.request).toHaveBeenCalledWith('get', {
      args: {cmd: 'get_permissions', filter: "name='perm3'"},
    });
    expect(result.data).toEqual([new Permission({id: '3', name: 'perm3'})]);
  });

  test('should fetch all permissions', async () => {
    const response = createEntitiesResponse('permission', [
      {_id: '4', name: 'perm4'},
      {_id: '5', name: 'perm5'},
    ]);
    const fakeHttp = createHttp(response);

    const cmd = new PermissionsCommand(fakeHttp);
    const result = await cmd.getAll();
    expect(fakeHttp.request).toHaveBeenCalledWith('get', {
      args: {cmd: 'get_permissions', filter: 'first=1 rows=-1'},
    });
    expect(result.data).toEqual([
      new Permission({id: '4', name: 'perm4'}),
      new Permission({id: '5', name: 'perm5'}),
    ]);
  });

  test('should allow to create several permissions at once', async () => {
    const response = createActionResultResponse();
    const fakeHttp = createHttp(response);

    const cmd = new PermissionsCommand(fakeHttp);
    const result = await cmd.create({
      id: 'resource-id',
      permission: 'read',
      entityType: 'host',
      subjectType: 'group',
      groupId: 'group-id',
      includeRelated: INCLUDE_RELATED_CURRENT_RESOURCE_ONLY,
    });
    expect(fakeHttp.request).toHaveBeenCalledWith('post', {
      data: {
        cmd: 'create_permissions',
        comment: '',
        permission_type: 'read',
        permission_group_id: 'group-id',
        permission_role_id: undefined,
        permission_user_id: undefined,
        resource_id: 'resource-id',
        resource_type: 'asset',
        subject_type: 'group',
        include_related: '0',
      },
    });
    expect(result).toBeUndefined();
  });
});
