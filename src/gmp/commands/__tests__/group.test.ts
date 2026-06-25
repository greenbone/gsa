/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import GroupCommand from 'gmp/commands/group';
import {
  createActionResultResponse,
  createEntityResponse,
  createHttp,
  createHttpMany,
} from 'gmp/commands/testing';

const createGroupResponse = (data: Record<string, unknown>) =>
  createEntityResponse('group', data);

describe('GroupCommand tests', () => {
  test('should allow to get a group', async () => {
    const entityResponse = createGroupResponse({
      _id: '324',
      name: 'Admins',
      users: 'alice,bob',
    });
    const http = createHttp(entityResponse);
    const command = new GroupCommand(http);
    const result = await command.get({id: '324'});

    expect(http.request).toHaveBeenCalledWith('get', {
      args: {cmd: 'get_group', group_id: '324'},
    });
    expect(result.data.id).toEqual('324');
    expect(result.data.name).toEqual('Admins');
    expect(result.data.users).toEqual(['alice', 'bob']);
  });

  test('should allow to delete a group', async () => {
    const response = createActionResultResponse();
    const http = createHttp(response);
    const command = new GroupCommand(http);

    await command.delete({id: '324'});

    expect(http.request).toHaveBeenCalledWith('post', {
      data: {cmd: 'delete_group', group_id: '324'},
    });
  });

  test('should allow to create a group', async () => {
    const entityResponse = createActionResultResponse({id: '324'});
    const http = createHttp(entityResponse);
    const command = new GroupCommand(http);

    const result = await command.create({
      name: 'Test Group',
      comment: 'some comment',
      grant_full: true,
      users: ['alice', 'bob'],
    });

    expect(http.request).toHaveBeenCalledWith('post', {
      data: {
        cmd: 'create_group',
        name: 'Test Group',
        comment: 'some comment',
        grant_full: 1,
        users: 'alice,bob',
      },
    });
    expect(result.data.id).toEqual('324');
  });

  test('should allow to save a group', async () => {
    const entityResponse = createActionResultResponse({id: '324'});
    const http = createHttp(entityResponse);
    const command = new GroupCommand(http);

    const result = await command.save({
      id: '324',
      name: 'Updated Group',
      comment: 'updated comment',
      grant_full: false,
      users: ['charlie'],
    });

    expect(http.request).toHaveBeenCalledWith('post', {
      data: {
        cmd: 'save_group',
        group_id: '324',
        name: 'Updated Group',
        comment: 'updated comment',
        grant_full: 0,
        users: 'charlie',
      },
    });
    expect(result.data.id).toEqual('324');
  });

  test('should allow create and save without grant_full', async () => {
    const createResponse = createActionResultResponse({id: '111'});
    const saveResponse = createActionResultResponse({id: '222'});
    const http = createHttpMany([createResponse, saveResponse]);
    const command = new GroupCommand(http);

    await command.create({
      name: 'No Grant Group',
      users: ['alice'],
    });

    await command.save({
      id: '324',
      name: 'No Grant Group Updated',
      users: ['bob'],
    });

    expect(http.request).toHaveBeenNthCalledWith(1, 'post', {
      data: {
        cmd: 'create_group',
        name: 'No Grant Group',
        comment: '',
        grant_full: undefined,
        users: 'alice',
      },
    });

    expect(http.request).toHaveBeenNthCalledWith(2, 'post', {
      data: {
        cmd: 'save_group',
        group_id: '324',
        name: 'No Grant Group Updated',
        comment: '',
        grant_full: undefined,
        users: 'bob',
      },
    });
  });

  test('should allow to clone a group', async () => {
    const entityResponse = createActionResultResponse({id: '999'});
    const http = createHttp(entityResponse);
    const command = new GroupCommand(http);

    const result = await command.clone({id: '324'});

    expect(http.request).toHaveBeenCalledWith('post', {
      data: {
        cmd: 'clone',
        resource_type: 'group',
        id: '324',
      },
    });
    expect(result.data.id).toEqual('999');
  });

  test('should allow to export a group', async () => {
    const fakeFile = new ArrayBuffer(8);
    const http = createHttp(fakeFile);
    const command = new GroupCommand(http);

    const result = await command.export({id: '324'});

    expect(http.request).toHaveBeenCalledWith('post', {
      data: {
        cmd: 'bulk_export',
        resource_type: 'group',
        bulk_select: 1,
        ['bulk_selected:324']: 1,
      },
    });
    expect(result).toBe(fakeFile);
  });
});
