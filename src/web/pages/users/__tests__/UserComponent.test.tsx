/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, expect, test, testing} from '@gsa/testing';
import {fireEvent, rendererWith, screen, waitFor} from 'web/testing';
import CollectionCounts from 'gmp/collection/collection-counts';
import Group from 'gmp/models/group';
import Role from 'gmp/models/role';
import Settings from 'gmp/models/settings';
import User, {ACCESS_ALLOW_ALL, AUTH_METHOD_PASSWORD} from 'gmp/models/user';
import {createSession} from 'gmp/testing';
import Button from 'web/components/form/Button';
import {currentSettingsDefaultResponse} from 'web/pages/__fixtures__/current-settings';
import UserComponent from 'web/pages/users/UserComponent';

const user = User.fromElement({
  _id: '1234',
  name: 'user 1',
  role: {_id: 'role1', name: 'Admin'},
  groups: {
    group: [{_id: 'group1', name: 'Group 1'}],
  },
  hosts: {
    __text: '192.168.1.1',
    _allow: '0',
  },
});

const userWithMultipleAssignments = User.fromElement({
  _id: '5678',
  name: 'user 2',
  role: [
    {_id: 'role1', name: 'Admin'},
    {_id: 'role2', name: 'User'},
  ],
  groups: {
    group: [
      {_id: 'group1', name: 'Group 1'},
      {_id: 'group2', name: 'Group 2'},
    ],
  },
});

const authSettings = new Settings();
authSettings.set('method:ldap_connect', {enabled: false});
authSettings.set('method:radius_connect', {enabled: false});

const groups = [
  new Group({id: 'group1', name: 'Group 1'}),
  new Group({id: 'group2', name: 'Group 2'}),
];
const roles = [
  new Role({id: 'role1', name: 'Admin'}),
  new Role({id: 'role2', name: 'User'}),
];

const createGmp = () => ({
  settings: {
    reloadInterval: 0,
    reloadIntervalActive: 0,
    reloadIntervalInactive: 0,
  },
  user: {
    create: testing.fn().mockResolvedValue({data: {id: 'created'}}),
    save: testing.fn().mockResolvedValue({data: {id: 'saved'}}),
    clone: testing.fn().mockResolvedValue({data: {id: 'cloned'}}),
    delete: testing.fn().mockResolvedValue(undefined),
    export: testing.fn().mockResolvedValue({data: 'user-data'}),
    currentAuthSettings: testing.fn().mockResolvedValue({data: authSettings}),
    currentSettings: testing
      .fn()
      .mockResolvedValue(currentSettingsDefaultResponse),
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
  session: createSession({username: 'admin', token: 'test-token'}),
});

describe('UserComponent', () => {
  test('should render child content', () => {
    const {render} = rendererWith({
      gmp: createGmp(),
      capabilities: true,
      store: true,
    });
    render(<UserComponent>{() => <span>Child Content</span>}</UserComponent>);
    expect(screen.getByText('Child Content')).toBeInTheDocument();
  });

  test('should open and close user dialog', async () => {
    const gmp = createGmp();
    const {render} = rendererWith({
      gmp,
      capabilities: true,
      store: true,
    });
    render(
      <UserComponent>
        {({create}) => <Button data-testid="open" onClick={() => create()} />}
      </UserComponent>,
    );

    fireEvent.click(screen.getByTestId('open'));
    await screen.findByText('New User');
    await waitFor(() => {
      expect(gmp.groups.getAll).toHaveBeenCalled();
      expect(gmp.roles.getAll).toHaveBeenCalled();
    });

    fireEvent.click(screen.getDialogCloseButton());
    await waitFor(() => {
      expect(screen.queryByText('New User')).toBeNull();
    });
  });

  test('should allow editing and saving an existing user', async () => {
    const gmp = createGmp();
    const onSaved = testing.fn();
    const {render} = rendererWith({gmp, capabilities: true, store: true});

    render(
      <UserComponent onSaved={onSaved}>
        {({edit}) => <Button data-testid="open" onClick={() => edit(user)} />}
      </UserComponent>,
    );

    fireEvent.click(screen.getByTestId('open'));
    await screen.findByText('Edit User user 1');
    await waitFor(() => {
      expect(gmp.groups.getAll).toHaveBeenCalled();
      expect(gmp.roles.getAll).toHaveBeenCalled();
    });

    fireEvent.click(screen.getDialogSaveButton());
    await waitFor(() => {
      expect(gmp.user.save).toHaveBeenCalledWith({
        groupIds: ['group1'],
        roleIds: ['role1'],
        accessHosts: ['192.168.1.1'],
        authMethod: AUTH_METHOD_PASSWORD,
        comment: '',
        hostsAllow: ACCESS_ALLOW_ALL,
        id: '1234',
        name: 'user 1',
        oldName: 'user 1',
        password: '',
      });
      expect(onSaved).toHaveBeenCalledWith({id: 'saved'});
    });
  });

  test('should save multiple roles and groups for an existing user', async () => {
    const gmp = createGmp();
    const onSaved = testing.fn();
    const {render} = rendererWith({gmp, capabilities: true, store: true});

    render(
      <UserComponent onSaved={onSaved}>
        {({edit}) => (
          <Button
            data-testid="open"
            onClick={() => edit(userWithMultipleAssignments)}
          />
        )}
      </UserComponent>,
    );

    fireEvent.click(screen.getByTestId('open'));
    await screen.findByText('Edit User user 2');
    await waitFor(() => {
      expect(gmp.groups.getAll).toHaveBeenCalled();
      expect(gmp.roles.getAll).toHaveBeenCalled();
    });

    fireEvent.click(screen.getDialogSaveButton());
    await waitFor(() => {
      expect(gmp.user.save).toHaveBeenCalledWith({
        accessHosts: [],
        authMethod: AUTH_METHOD_PASSWORD,
        comment: '',
        hostsAllow: ACCESS_ALLOW_ALL,
        id: '5678',
        name: 'user 2',
        oldName: 'user 2',
        password: '',
        groupIds: ['group1', 'group2'],
        roleIds: ['role1', 'role2'],
      });
      expect(onSaved).toHaveBeenCalledWith({id: 'saved'});
    });
  });

  test('should report errors while loading the user dialog', async () => {
    const gmp = createGmp();
    const error = new Error('Unable to load authentication settings');
    gmp.user.currentAuthSettings.mockRejectedValue(error);
    testing.spyOn(console, 'error').mockImplementation(() => {});
    const onDialogError = testing.fn();
    const {render} = rendererWith({gmp, capabilities: true, store: true});

    render(
      <UserComponent onDialogError={onDialogError}>
        {({edit}) => <Button data-testid="open" onClick={() => edit(user)} />}
      </UserComponent>,
    );

    fireEvent.click(screen.getByTestId('open'));
    await waitFor(() => {
      expect(onDialogError).toHaveBeenCalledWith(error);
    });
    expect(screen.queryByText('Edit User user 1')).toBeNull();
  });
});
