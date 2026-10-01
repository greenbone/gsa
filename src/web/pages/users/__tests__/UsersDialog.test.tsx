/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, expect, test, testing} from '@gsa/testing';
import {
  changeInputValue,
  fireEvent,
  rendererWith,
  screen,
  within,
} from 'web/testing';
import Group from 'gmp/models/group';
import Role from 'gmp/models/role';
import Settings from 'gmp/models/settings';
import User, {ACCESS_DENY_ALL, AUTH_METHOD_NEW_PASSWORD} from 'gmp/models/user';
import {createSession} from 'gmp/testing';
import UsersDialog from 'web/pages/users/UsersDialog';

const roles = [
  new Role({id: 'role-1', name: 'Administrator'}),
  new Role({id: 'role-2', name: 'Auditor'}),
];
const groups = [
  new Group({id: 'group-1', name: 'Security'}),
  new Group({id: 'group-2', name: 'Operations'}),
];

const createSettings = ({ldap = false, radius = false} = {}) => {
  const settings = new Settings();
  settings.set('method:ldap_connect', {enabled: ldap});
  settings.set('method:radius_connect', {enabled: radius});
  return settings;
};

const renderDialog = (props = {}, options = {}) => {
  const onClose = testing.fn();
  const onSave = testing.fn();
  const {render} = rendererWith({
    capabilities: true,
    gmp: {
      session: createSession({username: 'admin'}),
    },
    ...options,
  });

  render(
    <UsersDialog
      settings={createSettings()}
      onClose={onClose}
      onSave={onSave}
      {...props}
    />,
  );

  return {onClose, onSave};
};

describe('UsersDialog tests', () => {
  test('renders and closes a new user dialog', () => {
    const {onClose} = renderDialog({title: 'Create User'});

    expect(screen.getByText('Create User')).toBeInTheDocument();
    fireEvent.click(screen.getDialogCloseButton());

    expect(onClose).toHaveBeenCalled();
    expect(screen.getByName('name')).toHaveValue('Unnamed');
    expect(screen.getByRole('radio', {name: 'Password'})).toBeChecked();
  });

  test('saves default new user values', () => {
    const {onSave} = renderDialog();

    fireEvent.click(screen.getDialogSaveButton());
    fireEvent.click(
      screen
        .getByTestId('confirmation-dialog')
        .querySelector('[data-testid="dialog-save-button"]') as HTMLElement,
    );

    fireEvent.click(screen.getDialogSaveButton());

    expect(onSave).toHaveBeenCalledWith({
      access_hosts: [],
      auth_method: 'password',
      comment: '',
      group_ids: [],
      hosts_allow: '0',
      name: 'Unnamed',
      old_name: undefined,
      password: '',
      role_ids: [],
      roles: undefined,
      groups: undefined,
    });
  });

  test('changes new user fields and authentication method', () => {
    const {onSave} = renderDialog({
      settings: createSettings({ldap: true}),
    });

    const dialog = within(screen.getDialog());
    changeInputValue(dialog.getByName('name'), 'new-user');
    changeInputValue(dialog.getByName('comment'), 'A test user');
    changeInputValue(dialog.getByName('password'), 'secret');
    fireEvent.click(dialog.getByRole('radio', {name: 'Deny all and allow'}));
    fireEvent.click(
      dialog.getByRole('radio', {name: 'LDAP Authentication Only'}),
    );

    fireEvent.click(screen.getDialogSaveButton());
    expect(onSave).not.toHaveBeenCalled();
  });

  test('renders enabled LDAP and RADIUS options', () => {
    renderDialog({settings: createSettings({ldap: true, radius: true})});

    expect(
      screen.getByRole('radio', {name: 'LDAP Authentication Only'}),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('radio', {name: 'RADIUS Authentication Only'}),
    ).toBeInTheDocument();
  });

  test('saves a user after selecting a role and group', () => {
    const {onSave} = renderDialog({roles, groups});
    const dialog = within(screen.getDialog());

    const selects = dialog.getAllByTestId('multi-select');
    fireEvent.click(selects[0]);
    fireEvent.click(screen.getByRole('option', {name: 'Administrator'}));
    fireEvent.click(selects[1]);
    fireEvent.click(screen.getByRole('option', {name: 'Security'}));

    fireEvent.click(screen.getDialogSaveButton());

    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({role_ids: ['role-1'], group_ids: ['group-1']}),
    );
  });

  test('requires confirmation before saving without a role', () => {
    const {onSave} = renderDialog();

    fireEvent.click(screen.getDialogSaveButton());

    expect(screen.getByText('User without a role')).toBeInTheDocument();
    expect(onSave).not.toHaveBeenCalled();
    const confirmation = screen.getByTestId('confirmation-dialog');
    fireEvent.click(
      confirmation.querySelector(
        '[data-testid="dialog-save-button"]',
      ) as HTMLElement,
    );

    fireEvent.click(screen.getDialogSaveButton());

    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({role_ids: []}),
    );
  });

  test('renders edit fields and saves changed password settings', () => {
    const user = User.fromElement({
      _id: 'user-1',
      name: 'existing-user',
      role: {_id: 'role-1', name: 'Administrator'},
      groups: {group: [{_id: 'group-1', name: 'Security'}]},
      hosts: {__text: '10.0.0.1', _allow: ACCESS_DENY_ALL},
      sources: {source: 'ldap_connect'},
    });
    const {onSave} = renderDialog({
      settings: createSettings({ldap: true}),
      user,
      name: user.name,
      roles,
      groups,
      roleIds: ['role-1'],
      groupIds: ['group-1'],
      accessHosts: ['10.0.0.1'],
      hostsAllow: ACCESS_DENY_ALL,
    });

    expect(screen.queryByRole('radio', {name: 'Password'})).toBeNull();
    expect(
      screen.getByRole('radio', {name: 'LDAP Authentication Only'}),
    ).toBeChecked();
    fireEvent.click(screen.getByRole('radio', {name: 'New Password'}));
    expect(screen.getByName('password')).not.toBeDisabled();
    changeInputValue(screen.getByName('password'), 'new-secret');
    fireEvent.click(screen.getDialogSaveButton());

    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'user-1',
        auth_method: AUTH_METHOD_NEW_PASSWORD,
        password: 'new-secret',
        hosts_allow: ACCESS_DENY_ALL,
        access_hosts: ['10.0.0.1'],
      }),
    );
  });

  test('confirms saving changes to the current Super Admin user', () => {
    const user = new User({id: 'admin-id', name: 'admin'});
    const {onSave} = renderDialog(
      {user, name: 'admin', roleIds: ['role-1']},
      {gmp: {session: createSession({username: 'admin'})}},
    );

    fireEvent.click(screen.getDialogSaveButton());
    expect(screen.getByText('Save Super Admin User')).toBeInTheDocument();
    expect(onSave).not.toHaveBeenCalled();

    const confirmation = screen.getByTestId('confirmation-dialog');
    fireEvent.click(
      confirmation.querySelector(
        '[data-testid="dialog-save-button"]',
      ) as HTMLElement,
    );
    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({id: 'admin-id'}),
    );
  });

  test('hides role and group fields without capabilities', () => {
    renderDialog({roles, groups}, {capabilities: false});

    expect(screen.queryByText('Roles')).toBeNull();
    expect(screen.queryByText('Groups')).toBeNull();
    expect(screen.getByText('Host Access')).toBeInTheDocument();
  });
});
