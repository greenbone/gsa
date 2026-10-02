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
  waitFor,
  within,
  type RendererOptions,
} from 'web/testing';
import CollectionCounts from 'gmp/collection/collection-counts';
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

const createGmp = () => ({
  session: createSession({username: 'admin', token: 'test-token'}),
  settings: {
    reloadInterval: 0,
    reloadIntervalActive: 0,
    reloadIntervalInactive: 0,
  },
  groups: {
    getAll: testing.fn().mockResolvedValue({
      data: groups,
      meta: {
        filter: undefined,
        counts: new CollectionCounts({all: groups.length}),
      },
    }),
  },
  roles: {
    getAll: testing.fn().mockResolvedValue({
      data: roles,
      meta: {
        filter: undefined,
        counts: new CollectionCounts({all: roles.length}),
      },
    }),
  },
});

const renderDialog = (props = {}, options: RendererOptions = {}) => {
  const onClose = testing.fn();
  const onSave = testing.fn();
  const gmp = createGmp();
  const {gmp: optionGmp, ...rendererOptions} = options;
  const {render} = rendererWith({
    ...rendererOptions,
    capabilities: options.capabilities ?? true,
    gmp: {...gmp, ...optionGmp},
  });

  render(
    <UsersDialog
      settings={createSettings()}
      onClose={onClose}
      onSave={onSave}
      {...props}
    />,
  );

  return {gmp, onClose, onSave};
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
      accessHosts: [],
      authMethod: 'password',
      comment: '',
      groupIds: [],
      hostsAllow: '0',
      name: 'Unnamed',
      oldName: undefined,
      password: '',
      roleIds: [],
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

  test('saves a user after selecting a role and group', async () => {
    const {gmp, onSave} = renderDialog();
    const dialog = within(screen.getDialog());

    await waitFor(() => {
      expect(gmp.roles.getAll).toHaveBeenCalled();
      expect(gmp.groups.getAll).toHaveBeenCalled();
    });
    await waitFor(() => {
      const selects = dialog.getAllByTestId('multi-select');
      expect(selects[0]).not.toBeDisabled();
      expect(selects[1]).not.toBeDisabled();
    });
    const selects = dialog.getAllByTestId('multi-select');
    fireEvent.click(selects[0]);
    const roleOptions = screen.getSelectItemElementsForMultiSelect();
    fireEvent.click(
      roleOptions.find(
        option => option.textContent === 'Administrator',
      ) as HTMLElement,
    );
    fireEvent.click(selects[1]);
    const groupOptions = screen.getSelectItemElementsForMultiSelect();
    fireEvent.click(
      groupOptions.find(
        option => option.textContent === 'Security',
      ) as HTMLElement,
    );

    fireEvent.click(screen.getDialogSaveButton());

    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({roleIds: ['role-1'], groupIds: ['group-1']}),
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

    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({roleIds: []}));
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

    expect(onSave).toHaveBeenCalledWith({
      id: 'user-1',
      authMethod: AUTH_METHOD_NEW_PASSWORD,
      comment: '',
      name: 'existing-user',
      groupIds: ['group-1'],
      password: 'new-secret',
      hostsAllow: ACCESS_DENY_ALL,
      accessHosts: ['10.0.0.1'],
      roleIds: ['role-1'],
    });
  });

  test('confirms saving changes to the current Super Admin user', () => {
    const user = new User({id: 'admin-id', name: 'admin'});
    const {onSave} = renderDialog({user, name: 'admin', roleIds: ['role-1']});

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
    renderDialog({}, {capabilities: false});

    expect(screen.queryByText('Roles')).toBeNull();
    expect(screen.queryByText('Groups')).toBeNull();
    expect(screen.getByText('Host Access')).toBeInTheDocument();
  });
});
