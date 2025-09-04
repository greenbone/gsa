/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing, beforeEach} from '@gsa/testing';
import {
  changeInputValue,
  getSelectItemElementsForSelect,
  screen,
  within,
  fireEvent,
  rendererWith,
} from 'web/testing';
import Capabilities from 'gmp/capabilities/capabilities';
import Group from 'gmp/models/group';
import Permission from 'gmp/models/permission';
import Role from 'gmp/models/role';
import User from 'gmp/models/user';
import PermissionDialog from 'web/pages/permissions/PermissionDialog';

let onSave;
let onClose;

describe('PermissionDialog tests', () => {
  beforeEach(() => {
    onSave = testing.fn();
    onClose = testing.fn();
  });
  test('should render without issues and close', () => {
    const gmp = {};

    const {render} = rendererWith({
      gmp,
      capabilities: true,
      store: true,
      router: true,
    });

    render(<PermissionDialog onClose={onClose} onSave={onSave} />);

    screen.getByText('New Permission');

    const close = screen.getDialogCloseButton();
    fireEvent.click(close);

    expect(onClose).toHaveBeenCalled();
  });

  test('should render with title and save', () => {
    const gmp = {};

    const {render} = rendererWith({
      gmp,
      capabilities: true,
      store: true,
      router: true,
    });

    render(
      <PermissionDialog
        title="Custom Permission Title"
        onClose={onClose}
        onSave={onSave}
      />,
    );

    screen.getByText('Custom Permission Title');

    const save = screen.getDialogSaveButton();
    fireEvent.click(save);

    expect(onSave).toHaveBeenCalledWith({
      comment: '',
      groupId: undefined,
      id: undefined,
      name: 'Super',
      permission: undefined,
      resourceId: '',
      resourceName: undefined,
      resourceType: undefined,
      roleId: undefined,
      subjectType: undefined,
      title: 'Custom Permission Title',
      userId: undefined,
    });
  });

  test('should allow to change name and comment', async () => {
    const gmp = {};

    const testCapabilities = new Capabilities(['get_tasks']);

    const {render} = rendererWith({
      gmp,
      capabilities: testCapabilities,
      store: true,
      router: true,
    });

    render(<PermissionDialog onClose={onClose} onSave={onSave} />);

    const dialog = within(screen.getDialog());
    const nameSelect = dialog.getByName('name') as HTMLSelectElement;

    const selectItems = await getSelectItemElementsForSelect(nameSelect);

    const getTasksOption = selectItems.find(item =>
      item.textContent?.includes('get_tasks'),
    );
    expect(getTasksOption).toBeDefined();
    if (getTasksOption) {
      fireEvent.click(getTasksOption);
    }

    const commentInput = dialog.getByName('comment');
    changeInputValue(commentInput, 'Test Permission Comment');

    const save = screen.getDialogSaveButton();
    fireEvent.click(save);

    expect(onSave).toHaveBeenCalledWith({
      comment: 'Test Permission Comment',
      groupId: undefined,
      id: undefined,
      name: 'get_tasks',
      permission: undefined,
      resourceId: '',
      resourceName: undefined,
      resourceType: undefined,
      roleId: undefined,
      subjectType: undefined,
      title: 'New Permission',
      userId: undefined,
    });
  });

  test('should render with existing permission data', () => {
    const gmp = {};

    const {render} = rendererWith({
      gmp,
      capabilities: true,
      store: true,
      router: true,
    });

    const permission = Permission.fromElement({
      _id: 'p123',
      name: 'get_tasks',
      comment: 'Existing permission comment',
    });

    render(
      <PermissionDialog
        comment="Existing permission comment"
        id="p123"
        name="get_tasks"
        permission={permission}
        onClose={onClose}
        onSave={onSave}
      />,
    );

    const dialog = within(screen.getDialog());
    const nameSelect = dialog.getByName('name') as HTMLSelectElement;
    expect(nameSelect.value).toBe('get_tasks');

    const commentInput = dialog.getByName('comment') as HTMLInputElement;
    expect(commentInput.value).toBe('Existing permission comment');

    const save = screen.getDialogSaveButton();
    fireEvent.click(save);

    expect(onSave).toHaveBeenCalledWith({
      comment: 'Existing permission comment',
      groupId: undefined,
      id: 'p123',
      name: 'get_tasks',
      permission: permission,
      resourceId: '',
      resourceName: undefined,
      resourceType: undefined,
      roleId: undefined,
      subjectType: undefined,
      title: 'New Permission',
      userId: undefined,
    });
  });

  test('should handle user subject type selection', () => {
    const gmp = {};

    const {render} = rendererWith({
      gmp,
      capabilities: true,
      store: true,
      router: true,
    });

    const users = [
      User.fromElement({_id: 'u1', name: 'User 1'}),
      User.fromElement({_id: 'u2', name: 'User 2'}),
    ];

    render(
      <PermissionDialog
        subjectType="user"
        userId="u1"
        users={users}
        onClose={onClose}
        onSave={onSave}
      />,
    );

    const dialog = within(screen.getDialog());

    // Check user radio button is selected
    const userRadio = dialog.getByRole('radio', {name: 'User'});
    expect(userRadio).toBeChecked();

    // Check user select has correct value
    const userSelect = dialog.getByName('userId') as HTMLSelectElement;
    expect(userSelect.value).toBe('u1');

    const save = screen.getDialogSaveButton();
    fireEvent.click(save);

    expect(onSave).toHaveBeenCalledWith({
      comment: '',
      groupId: undefined,
      id: undefined,
      name: 'Super',
      permission: undefined,
      resourceId: '',
      resourceName: undefined,
      resourceType: undefined,
      roleId: undefined,
      subjectType: 'user',
      title: 'New Permission',
      userId: 'u1',
    });
  });

  test('should handle role subject type selection', () => {
    const gmp = {};

    const {render} = rendererWith({
      gmp,
      capabilities: true,
      store: true,
      router: true,
    });

    const roles = [
      Role.fromElement({_id: 'r1', name: 'Role 1'}),
      Role.fromElement({_id: 'r2', name: 'Role 2'}),
    ];

    render(
      <PermissionDialog
        roleId="r2"
        roles={roles}
        subjectType="role"
        onClose={onClose}
        onSave={onSave}
      />,
    );

    const dialog = within(screen.getDialog());

    // Check role radio button is selected
    const roleRadio = dialog.getByRole('radio', {name: 'Role'});
    expect(roleRadio).toBeChecked();

    // Check role select has correct value
    const roleSelect = dialog.getByName('roleId') as HTMLSelectElement;
    expect(roleSelect.value).toBe('r2');

    const save = screen.getDialogSaveButton();
    fireEvent.click(save);

    expect(onSave).toHaveBeenCalledWith({
      comment: '',
      groupId: undefined,
      id: undefined,
      name: 'Super',
      permission: undefined,
      resourceId: '',
      resourceName: undefined,
      resourceType: undefined,
      roleId: 'r2',
      subjectType: 'role',
      title: 'New Permission',
      userId: undefined,
    });
  });

  test('should handle group subject type selection', () => {
    const gmp = {};

    const {render} = rendererWith({
      gmp,
      capabilities: true,
      store: true,
      router: true,
    });

    const groups = [
      Group.fromElement({_id: 'g1', name: 'Group 1'}),
      Group.fromElement({_id: 'g2', name: 'Group 2'}),
    ];

    render(
      <PermissionDialog
        groupId="g1"
        groups={groups}
        subjectType="group"
        onClose={onClose}
        onSave={onSave}
      />,
    );

    const dialog = within(screen.getDialog());

    // Check group radio button is selected
    const groupRadio = dialog.getByRole('radio', {name: 'Group'});
    expect(groupRadio).toBeChecked();

    // Check group select has correct value
    const groupSelect = dialog.getByName('groupId') as HTMLSelectElement;
    expect(groupSelect.value).toBe('g1');

    const save = screen.getDialogSaveButton();
    fireEvent.click(save);

    expect(onSave).toHaveBeenCalledWith({
      comment: '',
      groupId: 'g1',
      id: undefined,
      name: 'Super',
      permission: undefined,
      resourceId: '',
      resourceName: undefined,
      resourceType: undefined,
      roleId: undefined,
      subjectType: 'group',
      title: 'New Permission',
      userId: undefined,
    });
  });

  test('should handle Super permission with resource type', async () => {
    const gmp = {};

    const {render} = rendererWith({
      gmp,
      capabilities: true,
      store: true,
      router: true,
    });

    render(
      <PermissionDialog
        name="Super"
        resourceType="user"
        onClose={onClose}
        onSave={onSave}
      />,
    );

    const dialog = within(screen.getDialog());

    // Check that resource type select is visible for Super permission
    const resourceTypeSelect = dialog.getByName(
      'resourceType',
    ) as HTMLSelectElement;
    expect(resourceTypeSelect.value).toBe('user');

    // Open the select dropdown and get available options
    const selectItems =
      await getSelectItemElementsForSelect(resourceTypeSelect);

    // Find the 'role' option and click it
    const roleOption = selectItems.find(item =>
      item.textContent?.includes('Role'),
    );
    expect(roleOption).toBeDefined();
    if (roleOption) {
      fireEvent.click(roleOption);
    }

    const save = screen.getDialogSaveButton();
    fireEvent.click(save);

    expect(onSave).toHaveBeenCalledWith({
      comment: '',
      groupId: undefined,
      id: undefined,
      name: 'Super',
      permission: undefined,
      resourceId: '',
      resourceName: undefined,
      resourceType: 'role',
      roleId: undefined,
      subjectType: undefined,
      title: 'New Permission',
      userId: undefined,
    });
  });

  test('should show resource ID field for permissions that need it', () => {
    const gmp = {};

    const {render} = rendererWith({
      gmp,
      capabilities: true,
      store: true,
      router: true,
    });

    render(
      <PermissionDialog
        name="get_tasks"
        resourceId="task123"
        onClose={onClose}
        onSave={onSave}
      />,
    );

    const dialog = within(screen.getDialog());

    const resourceIdInput = dialog.getByName('resourceId') as HTMLInputElement;
    expect(resourceIdInput.value).toBe('task123');

    changeInputValue(resourceIdInput, 'task456');

    const save = screen.getDialogSaveButton();
    fireEvent.click(save);

    expect(onSave).toHaveBeenCalledWith({
      comment: '',
      groupId: undefined,
      id: undefined,
      name: 'get_tasks',
      permission: undefined,
      resourceId: 'task456',
      resourceName: undefined,
      resourceType: undefined,
      roleId: undefined,
      subjectType: undefined,
      title: 'New Permission',
      userId: undefined,
    });
  });

  test('should handle fixed resource', () => {
    const gmp = {};

    const {render} = rendererWith({
      gmp,
      capabilities: true,
      store: true,
      router: true,
    });

    render(
      <PermissionDialog
        fixedResource={true}
        name="get_tasks"
        resourceId="task123"
        onClose={onClose}
        onSave={onSave}
      />,
    );

    const dialog = within(screen.getDialog());

    const resourceIdInput = dialog.getByName('resourceId') as HTMLInputElement;
    expect(resourceIdInput).toBeDisabled();
    expect(resourceIdInput.value).toBe('task123');
  });

  test('should change subject type when radio button is clicked', () => {
    const gmp = {};

    const {render} = rendererWith({
      gmp,
      capabilities: true,
      store: true,
      router: true,
    });

    const users = [User.fromElement({_id: 'u1', name: 'User 1'})];
    const roles = [Role.fromElement({_id: 'r1', name: 'Role 1'})];

    render(
      <PermissionDialog
        roles={roles}
        subjectType="user"
        userId="u1"
        users={users}
        onClose={onClose}
        onSave={onSave}
      />,
    );

    const dialog = within(screen.getDialog());

    const userRadio = dialog.getByRole('radio', {name: 'User'});
    expect(userRadio).toBeChecked();

    const roleRadio = dialog.getByRole('radio', {name: 'Role'});
    fireEvent.click(roleRadio);

    expect(roleRadio).toBeChecked();
    expect(userRadio).not.toBeChecked();

    const save = screen.getDialogSaveButton();
    fireEvent.click(save);

    expect(onSave).toHaveBeenCalledWith({
      comment: '',
      groupId: undefined,
      id: undefined,
      name: 'Super',
      permission: undefined,
      resourceId: '',
      resourceName: undefined,
      resourceType: undefined,
      roleId: undefined,
      subjectType: 'role',
      title: 'New Permission',
      userId: 'u1',
    });
  });

  test('should clear resourceType when name changes from Super to another permission', async () => {
    const gmp = {};

    const testCapabilities = new Capabilities(['get_tasks']);

    const {render} = rendererWith({
      gmp,
      capabilities: testCapabilities,
      store: true,
      router: true,
    });

    render(
      <PermissionDialog
        name="Super"
        resourceType="user"
        onClose={onClose}
        onSave={onSave}
      />,
    );

    const dialog = within(screen.getDialog());

    const nameSelect = dialog.getByName('name') as HTMLSelectElement;

    const selectItems = await getSelectItemElementsForSelect(nameSelect);

    const getTasksOption = selectItems.find(item =>
      item.textContent?.includes('get_tasks'),
    );

    expect(getTasksOption).toBeDefined();

    if (getTasksOption) {
      fireEvent.click(getTasksOption);
    }

    const save = screen.getDialogSaveButton();
    fireEvent.click(save);

    expect(onSave).toHaveBeenCalledWith({
      comment: '',
      groupId: undefined,
      id: undefined,
      name: 'get_tasks',
      permission: undefined,
      resourceId: '',
      resourceName: undefined,
      resourceType: undefined,
      roleId: undefined,
      subjectType: undefined,
      title: 'New Permission',
      userId: undefined,
    });
  });

  test('should handle resource name and type for display', () => {
    const gmp = {};

    const {render} = rendererWith({
      gmp,
      capabilities: true,
      store: true,
      router: true,
    });

    render(
      <PermissionDialog
        name="get_tasks"
        resourceName="Test Task"
        resourceType="task"
        onClose={onClose}
        onSave={onSave}
      />,
    );

    const save = screen.getDialogSaveButton();
    fireEvent.click(save);

    expect(onSave).toHaveBeenCalledWith({
      comment: '',
      groupId: undefined,
      id: undefined,
      name: 'get_tasks',
      permission: undefined,
      resourceId: '',
      resourceName: 'Test Task',
      resourceType: 'task',
      roleId: undefined,
      subjectType: undefined,
      title: 'New Permission',
      userId: undefined,
    });
  });

  test('should render description field', () => {
    const gmp = {};

    const {render} = rendererWith({
      gmp,
      capabilities: true,
      store: true,
      router: true,
    });

    render(
      <PermissionDialog name="get_tasks" onClose={onClose} onSave={onSave} />,
    );

    screen.getByText('Description');
  });
});
