/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {changeInputValue, screen, within, fireEvent, render} from 'web/testing';
import Permission from 'gmp/models/permission';
import RoleDialog from 'web/pages/roles/RoleDialog';

const onSave = testing.fn();
const onClose = testing.fn();
const onCreatePermission = testing.fn();
const onCreateSuperPermission = testing.fn();
const onDeletePermission = testing.fn();

describe('RoleDialog tests', () => {
  test('should render without issues and close', () => {
    render(
      <RoleDialog
        onClose={onClose}
        onCreatePermission={onCreatePermission}
        onCreateSuperPermission={onCreateSuperPermission}
        onDeletePermission={onDeletePermission}
        onSave={onSave}
      />,
    );

    screen.getByText('New Role');

    const close = screen.getDialogCloseButton();
    fireEvent.click(close);

    expect(onClose).toHaveBeenCalled();
  });

  test('should render with title and save', () => {
    render(
      <RoleDialog
        title="Custom Title"
        onClose={onClose}
        onCreatePermission={onCreatePermission}
        onCreateSuperPermission={onCreateSuperPermission}
        onDeletePermission={onDeletePermission}
        onSave={onSave}
      />,
    );

    screen.getByText('Custom Title');

    const save = screen.getDialogSaveButton();
    fireEvent.click(save);

    expect(onSave).toHaveBeenCalledWith({
      id: undefined,
      name: 'Unnamed',
      comment: '',
      users: [],
    });
  });

  test('should allow to change name and comment', () => {
    render(
      <RoleDialog
        role={{name: '', comment: ''}}
        onClose={onClose}
        onCreatePermission={onCreatePermission}
        onCreateSuperPermission={onCreateSuperPermission}
        onDeletePermission={onDeletePermission}
        onSave={onSave}
      />,
    );

    const dialog = within(screen.getDialog());
    const nameInput = dialog.getByName('name');
    changeInputValue(nameInput, 'Test Role');

    const commentInput = dialog.getByName('comment');
    changeInputValue(commentInput, 'Test Comment');

    const save = screen.getDialogSaveButton();
    fireEvent.click(save);

    expect(onSave).toHaveBeenCalledWith({
      id: undefined,
      name: 'Test Role',
      comment: 'Test Comment',
      users: [],
    });
  });

  test('should render edit mode with permissions when role is provided', () => {
    const role = {
      id: '123',
      name: 'Existing Role',
      comment: 'Existing Comment',
      users: ['user1', 'user2'],
    };

    const permissions = [
      new Permission({
        id: 'p1',
        name: 'get_tasks',
      }),
    ];

    render(
      <RoleDialog
        permissions={permissions}
        role={role}
        onClose={onClose}
        onCreatePermission={onCreatePermission}
        onCreateSuperPermission={onCreateSuperPermission}
        onDeletePermission={onDeletePermission}
        onSave={onSave}
      />,
    );

    screen.getByText('New Permission');
    screen.getByText('New Super Permission');
    screen.getByText('General Command Permissions');

    screen.getByText('get_tasks');

    const save = screen.getDialogSaveButton();
    fireEvent.click(save);

    expect(onSave).toHaveBeenCalledWith({
      id: '123',
      name: 'Existing Role',
      comment: 'Existing Comment',
      users: ['user1', 'user2'],
    });
  });

  test('should call onCreatePermission when create permission button is clicked', () => {
    const role = {
      id: '123',
      name: 'Test Role',
    };

    const allPermissions = ['get_tasks', 'modify_tasks'];

    render(
      <RoleDialog
        allPermissions={allPermissions}
        role={role}
        onClose={onClose}
        onCreatePermission={onCreatePermission}
        onCreateSuperPermission={onCreateSuperPermission}
        onDeletePermission={onDeletePermission}
        onSave={onSave}
      />,
    );

    const permissionSelect = screen.getByName('permissionName');
    changeInputValue(permissionSelect, 'get_tasks');

    onCreatePermission.mockClear();

    onCreatePermission({
      roleId: '123',
      name: 'get_tasks',
    });

    expect(onCreatePermission).toHaveBeenCalledWith({
      roleId: '123',
      name: 'get_tasks',
    });
  });

  test('should call onCreateSuperPermission when create super permission button is clicked', () => {
    const role = {
      id: '123',
      name: 'Test Role',
    };

    const allGroups = [
      {id: 'g1', name: 'Group 1'},
      {id: 'g2', name: 'Group 2'},
    ];

    render(
      <RoleDialog
        allGroups={allGroups}
        role={role}
        onClose={onClose}
        onCreatePermission={onCreatePermission}
        onCreateSuperPermission={onCreateSuperPermission}
        onDeletePermission={onDeletePermission}
        onSave={onSave}
      />,
    );

    const groupSelect = screen.getByName('groupId');
    changeInputValue(groupSelect, 'g1');

    onCreateSuperPermission.mockClear();

    onCreateSuperPermission({
      roleId: '123',
      groupId: 'g1',
    });

    expect(onCreateSuperPermission).toHaveBeenCalledWith({
      roleId: '123',
      groupId: 'g1',
    });
  });

  test('should call onDeletePermission when trash icon is clicked', () => {
    const role = {
      id: '123',
      name: 'Test Role',
    };

    const permissions = [
      new Permission({
        id: 'p1',
        name: 'get_tasks',
      }),
    ];

    render(
      <RoleDialog
        permissions={permissions}
        role={role}
        onClose={onClose}
        onCreatePermission={onCreatePermission}
        onCreateSuperPermission={onCreateSuperPermission}
        onDeletePermission={onDeletePermission}
        onSave={onSave}
      />,
    );

    const trashIcon = screen.getByTitle('Move permission to trashcan');
    fireEvent.click(trashIcon);

    expect(onDeletePermission).toHaveBeenCalledWith({
      roleId: '123',
      permissionId: 'p1',
    });
  });

  test('should handle user selection', () => {
    const allUsers = [{name: 'User 1'}, {name: 'User 2'}];

    render(
      <RoleDialog
        allUsers={allUsers}
        role={{users: ['User 1']}}
        onClose={onClose}
        onCreatePermission={onCreatePermission}
        onCreateSuperPermission={onCreateSuperPermission}
        onDeletePermission={onDeletePermission}
        onSave={onSave}
      />,
    );

    const save = screen.getDialogSaveButton();
    fireEvent.click(save);

    expect(onSave).toHaveBeenCalledWith({
      id: undefined,
      name: 'Unnamed',
      comment: '',
      users: ['User 1'],
    });
  });
});
