/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, expect, test, testing} from '@gsa/testing';
import {fireEvent, rendererWith, screen, waitFor} from 'web/testing';
import Group from 'gmp/models/group';
import Role from 'gmp/models/role';
import Settings from 'gmp/models/settings';
import User from 'gmp/models/user';
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

const authSettings = new Settings();
authSettings.set('method:ldap_connect', {enabled: false});
authSettings.set('method:radius_connect', {enabled: false});

const groups = [Group.fromElement({_id: 'group1', name: 'Group 1'})];
const roles = [Role.fromElement({_id: 'role1', name: 'Admin'})];

const createGmp = () => ({
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
    getAll: testing.fn().mockResolvedValue({data: groups}),
  },
  roles: {
    getAll: testing.fn().mockResolvedValue({data: roles}),
  },
  session: createSession({username: 'admin'}),
});

describe('UserComponent', () => {
  test('should render child content', () => {
    const {render} = rendererWith({
      gmp: createGmp(),
      capabilities: true,
      store: true,
    });
    render(<UserComponent>{() => <span>Child Content</span>}</UserComponent>);
    screen.getByText('Child Content');
  });

  test('should open and close user dialog', async () => {
    const {render} = rendererWith({
      gmp: createGmp(),
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

    fireEvent.click(screen.getDialogSaveButton());
    await waitFor(() => {
      expect(gmp.user.save).toHaveBeenCalled();
      expect(onSaved).toHaveBeenCalledWith({id: 'saved'});
    });
  });

  test('should report errors while loading the user dialog', async () => {
    const gmp = createGmp();
    const error = new Error('Unable to load authentication settings');
    gmp.user.currentAuthSettings.mockRejectedValue(error);
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
