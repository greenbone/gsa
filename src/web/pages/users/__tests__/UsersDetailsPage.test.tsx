/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, expect, test, testing} from '@gsa/testing';
import {fireEvent, rendererWith, screen, waitFor, within} from 'web/testing';
import {Route, Routes} from 'react-router';
import CollectionCounts from 'gmp/collection/collection-counts';
import QueryFilter from 'gmp/models/filter/query-filter';
import Permission from 'gmp/models/permission';
import User from 'gmp/models/user';
import {createSession} from 'gmp/testing';
import {currentSettingsDefaultResponse} from 'web/pages/__fixtures__/current-settings';
import UserDetailsPage from 'web/pages/users/UserDetailsPage';

const user = User.fromElement({
  _id: '1234',
  creation_time: '2020-12-16T15:23:59Z',
  comment: 'test comment',
  modification_time: '2021-03-02T10:28:15Z',
  name: 'user 1',
  owner: {name: 'admin'},
  permissions: {permission: {name: 'Everything'}},
  writable: 1,
  role: {_id: 'role1', name: 'Admin'},
  groups: {
    group: [{_id: 'group1', name: 'Group 1'}],
  },
  hosts: {
    __text: '192.168.1.1',
    _allow: '0',
  },
});

const permission = Permission.fromElement({
  _id: 'perm1',
  name: 'get_users',
  resource: {_id: '1234', type: 'user'},
  subject: {_id: '1234', type: 'user'},
});

const createGmp = () => ({
  user: {
    get: testing.fn().mockResolvedValue({data: user}),
    clone: testing.fn().mockResolvedValue({data: {id: 'new-user-id'}}),
    delete: testing.fn().mockResolvedValue({}),
    export: testing.fn().mockResolvedValue({data: 'user-export'}),
    save: testing.fn().mockResolvedValue({}),
    create: testing.fn().mockResolvedValue({}),
    currentSettings: testing
      .fn()
      .mockResolvedValue(currentSettingsDefaultResponse),
    currentAuthSettings: testing
      .fn()
      .mockResolvedValue({data: {get: () => ({})}}),
  },
  users: {
    getAll: testing.fn().mockResolvedValue({
      data: [user],
      meta: {
        filter: QueryFilter.fromString(),
        counts: new CollectionCounts(),
      },
    }),
  },
  groups: {
    getAll: testing.fn().mockResolvedValue({data: []}),
  },
  roles: {
    getAll: testing.fn().mockResolvedValue({data: []}),
  },
  permissions: {
    get: testing.fn().mockResolvedValue({
      data: [permission],
      meta: {
        filter: QueryFilter.fromString(),
        counts: new CollectionCounts(),
      },
    }),
  },
  settings: {
    manualUrl: 'test/',
    reloadInterval: -1,
  },
  session: createSession({
    token: 'test-token',
    timezone: 'CET',
    username: 'admin',
  }),
});

describe('UserDetailsPage', () => {
  test('should render details page with tabs', async () => {
    const gmp = createGmp();
    const {render} = rendererWith({
      gmp,
      capabilities: true,
      router: true,
      route: '/user/1234',
      store: true,
    });

    render(
      <Routes>
        <Route element={<UserDetailsPage />} path="/user/:id" />
      </Routes>,
    );

    await screen.findByText('User: user 1');
    await waitFor(() => {
      expect(gmp.permissions.get).toHaveBeenCalled();
    });

    const expectedFilter = QueryFilter.fromString(
      'subject_uuid=1234 and not resource_uuid="" or resource_uuid=1234',
    ).all();
    const permissionsFilter = gmp.permissions.get.mock.calls[0][0].filter;
    expect(permissionsFilter.toFilterString()).toBe(
      expectedFilter.toFilterString(),
    );

    const tablist = screen.getByRole('tablist');
    const tabs = within(tablist);
    tabs.getByRole('tab', {name: 'Information'});
    tabs.getByRole('tab', {name: 'User Tags ( 0 )'});
    tabs.getByRole('tab', {name: 'Permissions ( 1 )'});
    screen.getByText('test comment');
  });

  test('should call clone and export commands from toolbar', async () => {
    const gmp = createGmp();
    const {render} = rendererWith({
      gmp,
      capabilities: true,
      router: true,
      route: '/user/1234',
      store: true,
    });

    render(
      <Routes>
        <Route element={<UserDetailsPage />} path="/user/:id" />
      </Routes>,
    );

    const cloneIcon = await screen.findByTestId('clone-icon');

    fireEvent.click(screen.getByTestId('export-icon'));
    await waitFor(() => {
      expect(gmp.user.export).toHaveBeenCalledWith({id: user.id});
    });

    fireEvent.click(cloneIcon);
    await waitFor(() => {
      expect(gmp.user.clone).toHaveBeenCalledWith({id: user.id});
    });
  });
});
