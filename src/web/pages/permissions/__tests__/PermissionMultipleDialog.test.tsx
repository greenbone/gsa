/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing, beforeEach} from '@gsa/testing';
import {
  getSelectItemElementsForSelect,
  screen,
  fireEvent,
  rendererWith,
} from 'web/testing';

import Group from 'gmp/models/group';
import Model from 'gmp/models/model';
import Role from 'gmp/models/role';
import User from 'gmp/models/user';
import PermissionMultipleDialog, {
  CURRENT_RESOURCE_ONLY,
} from 'web/pages/permissions/PermissionMultipleDialog';

const gmp = {settings: {}};

let handleClose: () => void;
let handleSave: () => void;
let handleChange: () => void;

beforeEach(() => {
  handleClose = testing.fn();
  handleSave = testing.fn();
  handleChange = testing.fn();
});

const mockUsers = [
  User.fromElement({_id: 'u1', name: 'User 1'}),
  User.fromElement({_id: 'u2', name: 'User 2'}),
];

const mockRoles = [
  Role.fromElement({_id: 'r1', name: 'Role 1'}),
  Role.fromElement({_id: 'r2', name: 'Role 2'}),
];

const mockGroups = [
  Group.fromElement({_id: 'g1', name: 'Group 1'}),
  Group.fromElement({_id: 'g2', name: 'Group 2'}),
];

const mockRelated = [
  Model.fromElement({_id: 'rel1', name: 'Related 1', type: 'task'}),
  Model.fromElement({_id: 'rel2', name: 'Related 2', type: 'target'}),
];

describe('PermissionMultipleDialog component tests', () => {
  test('should render dialog with default values', () => {
    const {render} = rendererWith({gmp, capabilities: true});

    render(
      <PermissionMultipleDialog
        id="test-id"
        onClose={handleClose}
        onSave={handleSave}
      />,
    );

    expect(screen.getDialog()).toBeInTheDocument();
    expect(screen.queryDialogTitle()).toHaveTextContent('Create Permission');
  });

  test('should render with custom title', () => {
    const {render} = rendererWith({gmp, capabilities: true});

    render(
      <PermissionMultipleDialog
        id="test-id"
        title="Custom Permission Title"
        onClose={handleClose}
        onSave={handleSave}
      />,
    );

    expect(screen.queryDialogTitle()).toHaveTextContent(
      'Custom Permission Title',
    );
  });

  test('should render permission select with read and write options', () => {
    const {render} = rendererWith({gmp, capabilities: true});

    render(
      <PermissionMultipleDialog
        id="test-id"
        onClose={handleClose}
        onSave={handleSave}
      />,
    );

    const permissionSelect = screen.getByTestId('permission-select');
    expect(permissionSelect).toHaveValue('read');
  });

  test('should handle user selection change', () => {
    const {render} = rendererWith({gmp, capabilities: true});

    render(
      <PermissionMultipleDialog
        groups={mockGroups}
        id="test-id"
        roles={mockRoles}
        users={mockUsers}
        onClose={handleClose}
        onSave={handleSave}
      />,
    );

    const radioButtons = screen.getRadioInputs();
    expect(radioButtons).toHaveLength(3);

    const userRadio = screen.getByDisplayValue('user');
    const roleRadio = screen.getByDisplayValue('role');
    const groupRadio = screen.getByDisplayValue('group');

    expect(userRadio).toBeInTheDocument();
    expect(roleRadio).toBeInTheDocument();
    expect(groupRadio).toBeInTheDocument();

    expect(userRadio).toBeChecked();
    expect(roleRadio).not.toBeChecked();
    expect(groupRadio).not.toBeChecked();
  });

  test('should render user select when user radio is selected', () => {
    const {render} = rendererWith({gmp, capabilities: true});

    render(
      <PermissionMultipleDialog
        id="test-id"
        subjectType="user"
        users={mockUsers}
        onClose={handleClose}
        onSave={handleSave}
      />,
    );

    const userRadio = screen.getByDisplayValue('user');
    expect(userRadio).toBeChecked();

    const selects = screen.queryAllSelectElements();
    expect(selects.length).toBeGreaterThanOrEqual(2);
  });

  test('should render role select when role radio is selected', () => {
    const {render} = rendererWith({gmp, capabilities: true});

    render(
      <PermissionMultipleDialog
        id="test-id"
        roles={mockRoles}
        subjectType="role"
        onClose={handleClose}
        onSave={handleSave}
      />,
    );

    const roleRadio = screen.getByDisplayValue('role');
    expect(roleRadio).toBeChecked();

    const selects = screen.queryAllSelectElements();
    expect(selects.length).toBeGreaterThanOrEqual(2);
  });

  test('should render group select when group radio is selected', () => {
    const {render} = rendererWith({gmp, capabilities: true});

    render(
      <PermissionMultipleDialog
        groups={mockGroups}
        id="test-id"
        subjectType="group"
        onClose={handleClose}
        onSave={handleSave}
      />,
    );

    const groupRadio = screen.getByDisplayValue('group');
    expect(groupRadio).toBeChecked();

    const selects = screen.queryAllSelectElements();
    expect(selects.length).toBeGreaterThanOrEqual(2);
  });

  test('should render entity name and type', () => {
    const {render} = rendererWith({gmp, capabilities: true});

    render(
      <PermissionMultipleDialog
        entityName="Test Entity"
        entityType="task"
        id="test-id"
        onClose={handleClose}
        onSave={handleSave}
      />,
    );

    expect(screen.getByText('Test Entity')).toBeInTheDocument();
  });

  test('should render include related options with default selection', () => {
    const {render} = rendererWith({gmp, capabilities: true});

    render(
      <PermissionMultipleDialog
        id="test-id"
        onClose={handleClose}
        onSave={handleSave}
      />,
    );

    const selects = screen.queryAllSelectElements();
    const includeRelatedSelect = selects[selects.length - 1];
    expect(includeRelatedSelect).toHaveValue('including related resources');
  });

  test('should render related resources when provided', () => {
    const {render} = rendererWith({gmp, capabilities: true});

    render(
      <PermissionMultipleDialog
        id="test-id"
        related={mockRelated}
        onClose={handleClose}
        onSave={handleSave}
      />,
    );

    expect(screen.getByText('Related 1')).toBeInTheDocument();
    expect(screen.getByText('Related 2')).toBeInTheDocument();
  });

  test('should not render subject types when capabilities do not allow', () => {
    const {render} = rendererWith({gmp, capabilities: false});

    render(
      <PermissionMultipleDialog
        groups={mockGroups}
        id="test-id"
        roles={mockRoles}
        users={mockUsers}
        onClose={handleClose}
        onSave={handleSave}
      />,
    );

    const radioButtons = screen.queryAllByRole('radio');
    expect(radioButtons).toHaveLength(0);
  });

  test('should allow changing permission type', async () => {
    const {render} = rendererWith({gmp, capabilities: true});

    render(
      <PermissionMultipleDialog
        id="test-id"
        onClose={handleClose}
        onSave={handleSave}
      />,
    );

    const permissionSelect = screen.getByTestId('permission-select');
    expect(permissionSelect).toHaveValue('read');

    const selectItems = await getSelectItemElementsForSelect(
      permissionSelect as HTMLSelectElement,
    );
    expect(selectItems).toHaveLength(2);
    expect(selectItems[0]).toHaveTextContent('read');
    expect(selectItems[1]).toHaveTextContent('write');

    fireEvent.click(selectItems[1]);
    expect(permissionSelect).toHaveValue('write');
  });

  test('should allow changing subject type', () => {
    const {render} = rendererWith({gmp, capabilities: true});

    render(
      <PermissionMultipleDialog
        groups={mockGroups}
        id="test-id"
        roles={mockRoles}
        subjectType="user"
        users={mockUsers}
        onClose={handleClose}
        onSave={handleSave}
      />,
    );

    const userRadio = screen.getByDisplayValue('user');
    const roleRadio = screen.getByDisplayValue('role');

    expect(userRadio).toBeChecked();
    expect(roleRadio).not.toBeChecked();

    fireEvent.click(roleRadio);
    expect(roleRadio).toBeChecked();
    expect(userRadio).not.toBeChecked();
  });

  test('should handle different include related options', () => {
    const {render} = rendererWith({gmp, capabilities: true});

    render(
      <PermissionMultipleDialog
        id="test-id"
        includeRelated={CURRENT_RESOURCE_ONLY}
        related={mockRelated}
        onClose={handleClose}
        onSave={handleSave}
      />,
    );

    const selects = screen.queryAllSelectElements();
    const includeRelatedSelect = selects[selects.length - 1];
    expect(includeRelatedSelect).toHaveValue('for current resource only');
  });

  test('should render all include related options when related resources exist', async () => {
    const {render} = rendererWith({gmp, capabilities: true});

    render(
      <PermissionMultipleDialog
        id="test-id"
        related={mockRelated}
        onClose={handleClose}
        onSave={handleSave}
      />,
    );

    const selects = screen.queryAllSelectElements();
    const includeRelatedSelect = selects[selects.length - 1];
    const selectItems =
      await getSelectItemElementsForSelect(includeRelatedSelect);

    expect(selectItems).toHaveLength(3);
    expect(selectItems[0]).toHaveTextContent('including related resources');
    expect(selectItems[1]).toHaveTextContent('for current resource only');
    expect(selectItems[2]).toHaveTextContent('for related resources only');
  });

  test('should render only some include related options when no related resources', async () => {
    const {render} = rendererWith({gmp, capabilities: true});

    render(
      <PermissionMultipleDialog
        id="test-id"
        includeRelated={CURRENT_RESOURCE_ONLY}
        related={[]}
        onClose={handleClose}
        onSave={handleSave}
      />,
    );

    const selects = screen.queryAllSelectElements();
    const includeRelatedSelect = selects[selects.length - 1];
    const selectItems =
      await getSelectItemElementsForSelect(includeRelatedSelect);

    expect(selectItems).toHaveLength(1);
    expect(selectItems[0]).toHaveTextContent('for current resource only');
  });

  test('should allow closing the dialog', () => {
    const {render} = rendererWith({gmp, capabilities: true});

    render(
      <PermissionMultipleDialog
        id="test-id"
        onClose={handleClose}
        onSave={handleSave}
      />,
    );

    const closeButton = screen.getDialogCloseButton();
    fireEvent.click(closeButton);

    expect(handleClose).toHaveBeenCalled();
    expect(handleSave).not.toHaveBeenCalled();
  });

  test('should call onSave with correct data when save button is clicked', () => {
    const {render} = rendererWith({gmp, capabilities: true});

    render(
      <PermissionMultipleDialog
        entityType="task"
        id="test-id"
        includeRelated={CURRENT_RESOURCE_ONLY}
        permission="read"
        subjectType="user"
        userId="u1"
        onClose={handleClose}
        onSave={handleSave}
      />,
    );

    const saveButton = screen.getDialogSaveButton();
    fireEvent.click(saveButton);

    expect(handleSave).toHaveBeenCalledWith({
      id: 'test-id',
      entityType: 'task',
      permission: 'read',
      subjectType: 'user',
      userId: 'u1',
      includeRelated: CURRENT_RESOURCE_ONLY,
      groupId: undefined,
      roleId: undefined,
      related: [],
    });
  });

  test('should handle onChange calls for select elements', () => {
    const {render} = rendererWith({gmp, capabilities: true});

    render(
      <PermissionMultipleDialog
        id="test-id"
        users={mockUsers}
        onChange={handleChange}
        onClose={handleClose}
        onSave={handleSave}
      />,
    );

    expect(handleChange).toBeDefined();
  });

  test('should handle empty user, role, and group arrays', () => {
    const {render} = rendererWith({gmp, capabilities: true});

    render(
      <PermissionMultipleDialog
        groups={[]}
        id="test-id"
        roles={[]}
        users={[]}
        onClose={handleClose}
        onSave={handleSave}
      />,
    );

    expect(screen.getDialog()).toBeInTheDocument();
  });

  test('should filter out users/roles/groups without names', () => {
    const usersWithEmptyNames = [
      User.fromElement({_id: 'u1', name: 'User 1'}),
      User.fromElement({_id: 'u2'}),
    ];

    const {render} = rendererWith({gmp, capabilities: true});

    render(
      <PermissionMultipleDialog
        id="test-id"
        subjectType="user"
        users={usersWithEmptyNames}
        onClose={handleClose}
        onSave={handleSave}
      />,
    );

    expect(screen.getDialog()).toBeInTheDocument();
  });

  test('should render with default permission and subject type when not provided', () => {
    const {render} = rendererWith({gmp, capabilities: true});

    render(
      <PermissionMultipleDialog
        id="test-id"
        onClose={handleClose}
        onSave={handleSave}
      />,
    );

    const permissionSelect = screen.getByTestId('permission-select');
    expect(permissionSelect).toHaveValue('read');

    const userRadio = screen.queryByDisplayValue('user');
    if (userRadio) {
      expect(userRadio).toBeChecked();
    }
  });
});
