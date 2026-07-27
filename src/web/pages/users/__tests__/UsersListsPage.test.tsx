/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, expect, test, testing} from '@gsa/testing';
import {
  fireEvent,
  getSelectItemElementsForSelect,
  rendererWith,
  screen,
  waitFor,
  within,
} from 'web/testing';
import Capabilities from 'gmp/capabilities/capabilities';
import CollectionCounts from 'gmp/collection/collection-counts';
import QueryFilter from 'gmp/models/filter/query-filter';
import User from 'gmp/models/user';
import {createSession} from 'gmp/testing';
import {currentSettingsDefaultResponse} from 'web/pages/__fixtures__/current-settings';
import UsersListPage, {
  UsersListPageToolBarIcons,
} from 'web/pages/users/UsersListPage';
import {defaultFilterLoadingActions} from 'web/store/usersettings/defaultfilters/actions';
import {loadingActions} from 'web/store/usersettings/defaults/actions';

const user = User.fromElement({
  _id: '1234',
  creation_time: '2020-12-16T15:23:59Z',
  comment: 'test comment',
  in_use: 0,
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

const reloadInterval = -1;
const manualUrl = 'test/';

const createGmp = ({
  cloneUserResponse = {data: {id: 'foo'}},
  deleteUserResponse = undefined,
  downloadUserResponse = {data: 'user-data'},
  exportUserResponse = {data: 'some-data'},
  getUserResponse = {data: user},
  getUsersResponse = {
    data: [user],
    meta: {filter: new QueryFilter(), counts: new CollectionCounts()},
  },
  getAllUsersResponse = {
    data: [user],
    meta: {filter: new QueryFilter(), counts: new CollectionCounts()},
  },
  getFiltersResponse = {
    data: [],
    meta: {filter: new QueryFilter(), counts: new CollectionCounts()},
  },
  cloneUser = testing.fn().mockResolvedValue(cloneUserResponse),
  deleteUser = testing.fn().mockResolvedValue(deleteUserResponse),
  downloadUser = testing.fn().mockResolvedValue(downloadUserResponse),
  exportUser = testing.fn().mockResolvedValue(exportUserResponse),
  getUser = testing.fn().mockResolvedValue(getUserResponse),
  getUsers = testing.fn().mockResolvedValue(getUsersResponse),
  getAllUsers = testing.fn().mockResolvedValue(getAllUsersResponse),
  getFilters = testing.fn().mockResolvedValue(getFiltersResponse),
  deleteByFilter = testing.fn().mockResolvedValue({
    foo: 'bar',
  }),
  exportByFilter = testing.fn().mockResolvedValue({
    foo: 'bar',
  }),
  deleteByModels = testing.fn().mockResolvedValue({
    foo: 'bar',
  }),
  exportByModels = testing.fn().mockResolvedValue({
    foo: 'bar',
  }),
} = {}) => ({
  user: {
    clone: cloneUser,
    delete: deleteUser,
    download: downloadUser,
    export: exportUser,
    get: getUser,
    currentSettings: testing
      .fn()
      .mockResolvedValue(currentSettingsDefaultResponse),
  },
  users: {
    get: getUsers,
    getAll: getAllUsers,
    deleteByFilter,
    exportByFilter,
    export: exportByModels,
    delete: deleteByModels,
  },
  filters: {
    get: getFilters,
  },
  settings: {
    manualUrl,
    reloadInterval,
  },
  session: createSession({token: 'test-token'}),
  permissions: {
    get: testing.fn().mockResolvedValue({
      data: [],
      meta: {
        filter: new QueryFilter(),
        counts: new CollectionCounts(),
      },
    }),
  },
});

const wrongCaps = new Capabilities(['get_configs']);

describe('UsersListPage tests', () => {
  test('should render full UsersListPage', async () => {
    const gmp = createGmp();
    const {render, store} = rendererWith({
      gmp,
      capabilities: true,
      store: true,
      router: true,
    });

    const defaultSettingFilter = QueryFilter.fromString('foo=bar');
    store.dispatch(loadingActions.success({rowsperpage: {value: '2'}}));
    store.dispatch(
      defaultFilterLoadingActions.success('user', defaultSettingFilter),
    );

    render(<UsersListPage />);

    await screen.findByTitle('Help: Users');

    // Toolbar Icons
    screen.getByTitle('Help: Users');
    screen.getByTitle('New User');

    const powerFilter = within(screen.getPowerFilter());
    const select = powerFilter.getByTestId('powerfilter-select');
    const inputs = powerFilter.queryTextInputs();

    // Powerfilter
    const userFilterInput = inputs.find(
      input => input.getAttribute('name') === 'userFilterString',
    );
    expect(userFilterInput).toBeInTheDocument();

    screen.getByTitle('Update Filter');
    screen.getByTitle('Remove Filter');
    screen.getByTitle('Reset to Default Filter');
    screen.getByTitle('Help: Powerfilter');
    screen.getByTitle('Edit Filter');
    expect(select).toHaveAttribute('title', 'Loaded filter');
    expect(select).toHaveValue('--');

    // table column headers - wait for async data load
    await waitFor(() => {
      screen.getByTestId('table-header-sort-by-name');
    });
    screen.getByTestId('table-header-sort-by-roles');
    screen.getByTestId('table-header-sort-by-groups');
    screen.getByTestId('table-header-sort-by-host_access');
    screen.getByRole('columnheader', {name: 'Actions'});

    // table row contents
    screen.getByRole('cell', {name: 'user 1 (test comment) View Other Icon'});
    screen.getByText('Admin');
    screen.getByText('Group 1');

    // table row actions
    screen.getByTitle('Delete User');
    screen.getByTitle('Edit User');
    screen.getByTitle('Clone User');
    screen.getByTitle('Export User');
  });

  test('should allow to bulk action on page contents', async () => {
    const gmp = createGmp();
    const {render, store} = rendererWith({
      gmp,
      capabilities: true,
      store: true,
      router: true,
    });

    const defaultSettingFilter = QueryFilter.fromString('foo=bar');
    store.dispatch(loadingActions.success({rowsperpage: {value: '2'}}));
    store.dispatch(
      defaultFilterLoadingActions.success('user', defaultSettingFilter),
    );

    render(<UsersListPage />);

    await screen.findByTitle('Export page contents');

    // export page contents
    const exportIcon = screen.getByTitle('Export page contents');
    fireEvent.click(exportIcon);
    await waitFor(() => {
      expect(gmp.users.exportByFilter).toHaveBeenCalled();
    });

    // delete page contents
    const deleteIcon = screen.getByTitle('Delete page contents');
    fireEvent.click(deleteIcon);
    // Users use custom delete dialog, so just verify the icon exists
    expect(deleteIcon).toBeInTheDocument();
  });

  test('should open delete confirmation dialog for page contents', async () => {
    const gmp = createGmp();
    const {render, store} = rendererWith({
      gmp,
      capabilities: true,
      store: true,
      router: true,
    });

    const defaultSettingFilter = QueryFilter.fromString('foo=bar');
    store.dispatch(loadingActions.success({rowsperpage: {value: '2'}}));
    store.dispatch(
      defaultFilterLoadingActions.success('user', defaultSettingFilter),
    );

    render(<UsersListPage />);

    await screen.findByTitle('Delete page contents');

    const deleteIcon = screen.getByTitle('Delete page contents');
    fireEvent.click(deleteIcon);

    await screen.findByText('Confirm deletion of users');
    await screen.findByText('User user 1 will be deleted.');
    screen.getByText('Current User');
  });

  test('should allow to bulk action on selected users', async () => {
    const gmp = createGmp();
    const {render, store} = rendererWith({
      gmp,
      capabilities: true,
      store: true,
      router: true,
    });

    const defaultSettingFilter = QueryFilter.fromString('foo=bar');
    store.dispatch(loadingActions.success({rowsperpage: {value: '2'}}));
    store.dispatch(
      defaultFilterLoadingActions.success('user', defaultSettingFilter),
    );

    render(<UsersListPage />);

    await screen.findByTitle('Export page contents');

    // change to apply to selection
    const tableFooter = within(screen.getTableFooter());
    const select = tableFooter.getSelectElement();
    const selectItems = await getSelectItemElementsForSelect(select);
    fireEvent.click(selectItems[1]);
    expect(select).toHaveValue('Apply to selection');

    // select a user
    const tableBody = within(screen.getTableBody());
    const inputs = tableBody.getAllCheckBoxes();
    fireEvent.click(inputs[0]);
    expect(inputs[0]).toBeChecked();

    // export selected user
    const exportIcon = screen.getByTitle('Export selection');
    fireEvent.click(exportIcon);
    await waitFor(() => {
      expect(gmp.users.export).toHaveBeenCalled();
    });

    // delete selected user
    const deleteIcon = screen.getByTitle('Delete selection');
    fireEvent.click(deleteIcon);
    // Users use custom delete dialog, so just verify the icon exists
    expect(deleteIcon).toBeInTheDocument();
  });

  test('should allow to bulk action on filtered users', async () => {
    const gmp = createGmp();
    const {render, store} = rendererWith({
      gmp,
      capabilities: true,
      store: true,
      router: true,
    });

    const defaultSettingFilter = QueryFilter.fromString('foo=bar');
    store.dispatch(loadingActions.success({rowsperpage: {value: '2'}}));
    store.dispatch(
      defaultFilterLoadingActions.success('user', defaultSettingFilter),
    );

    render(<UsersListPage />);

    await screen.findByTitle('Export page contents');

    // change to all filtered
    const tableFooter = within(screen.getTableFooter());
    const select = tableFooter.getSelectElement();
    const selectItems = await getSelectItemElementsForSelect(select);
    fireEvent.click(selectItems[2]);
    expect(select).toHaveValue('Apply to all filtered');

    // export all filtered users
    const exportIcon = tableFooter.getByTitle('Export all filtered');
    fireEvent.click(exportIcon);
    await waitFor(() => {
      expect(gmp.users.exportByFilter).toHaveBeenCalled();
    });

    // delete all filtered users
    const deleteIcon = screen.getByTitle('Delete all filtered');
    fireEvent.click(deleteIcon);
    // Users use custom delete dialog, so just verify the icon exists
    expect(deleteIcon).toBeInTheDocument();
  });

  test('should render pagination controls', async () => {
    const counts = new CollectionCounts({
      first: 1,
      all: 100,
      filtered: 50,
      length: 10,
      rows: 10,
    });

    const gmp = createGmp({
      getUsersResponse: {
        data: [user],
        meta: {filter: new QueryFilter(), counts},
      },
    });

    const {render, store} = rendererWith({
      gmp,
      capabilities: true,
      store: true,
      router: true,
    });

    const defaultSettingFilter = QueryFilter.fromString('foo=bar');
    store.dispatch(loadingActions.success({rowsperpage: {value: '10'}}));
    store.dispatch(
      defaultFilterLoadingActions.success('user', defaultSettingFilter),
    );

    render(<UsersListPage />);

    await waitFor(() => {
      expect(screen.getAllByTitle('First').length).toBeGreaterThan(0);
    });

    // Check pagination controls are present
    expect(screen.getAllByTitle('First').length).toBeGreaterThan(0);
    expect(screen.getAllByTitle('Previous').length).toBeGreaterThan(0);
    expect(screen.getAllByTitle('Next').length).toBeGreaterThan(0);
    expect(screen.getAllByTitle('Last').length).toBeGreaterThan(0);
  });

  test('should call pagination handlers', async () => {
    const counts = new CollectionCounts({
      first: 1,
      all: 100,
      filtered: 50,
      length: 10,
      rows: 10,
    });

    const getUsers = testing.fn().mockResolvedValue({
      data: [user],
      meta: {filter: QueryFilter.fromString('first=1 rows=10'), counts},
    });

    const gmp = createGmp({
      getUsers,
      getUsersResponse: {
        data: [user],
        meta: {filter: QueryFilter.fromString('first=1 rows=10'), counts},
      },
    });

    const {render, store} = rendererWith({
      gmp,
      capabilities: true,
      store: true,
      router: true,
    });

    const defaultSettingFilter = QueryFilter.fromString('first=1 rows=10');
    store.dispatch(loadingActions.success({rowsperpage: {value: '10'}}));
    store.dispatch(
      defaultFilterLoadingActions.success('user', defaultSettingFilter),
    );

    render(<UsersListPage />);

    await waitFor(() => {
      expect(screen.getAllByTitle('Next').length).toBeGreaterThan(0);
    });
    const initialCallCount = getUsers.mock.calls.length;

    // Test Next button
    const nextButton = screen.getAllByTitle('Next')[0];
    fireEvent.click(nextButton);

    // Wait for table to re-render after Next click
    await waitFor(() => {
      expect(screen.getAllByTitle('Previous').length).toBeGreaterThan(0);
    });

    // Test Previous button
    const previousButton = screen.getAllByTitle('Previous')[0];
    fireEvent.click(previousButton);

    // Wait for table to re-render after Previous click
    await waitFor(() => {
      expect(screen.getAllByTitle('First').length).toBeGreaterThan(0);
    });

    // Test First button
    const firstButton = screen.getAllByTitle('First')[0];
    fireEvent.click(firstButton);

    // Wait for table to re-render after First click
    await waitFor(() => {
      expect(screen.getAllByTitle('Last').length).toBeGreaterThan(0);
    });

    // Test Last button
    const lastButton = screen.getAllByTitle('Last')[0];
    fireEvent.click(lastButton);
    await waitFor(() => {
      expect(getUsers.mock.calls.length).toBeGreaterThan(initialCallCount);
    });

    // Verify that getUsers was called multiple times (initial load + pagination clicks)
    expect(getUsers).toHaveBeenCalled();
  });
});

describe('UsersListPage UsersListPageToolBarIcons test', () => {
  test('should render', () => {
    const handleUserCreateClick = testing.fn();

    const gmp = {
      settings: {manualUrl},
    };

    const {render} = rendererWith({
      gmp,
      capabilities: true,
      router: true,
    });

    render(
      <UsersListPageToolBarIcons onUserCreateClick={handleUserCreateClick} />,
    );

    expect(screen.getByTestId('help-icon')).toHaveAttribute(
      'title',
      'Help: Users',
    );
  });

  test('should call click handlers', () => {
    const handleUserCreateClick = testing.fn();

    const gmp = {
      settings: {manualUrl},
    };

    const {render} = rendererWith({
      gmp,
      capabilities: true,
      router: true,
    });

    render(
      <UsersListPageToolBarIcons onUserCreateClick={handleUserCreateClick} />,
    );

    const newIcon = screen.getByTestId('new-icon');
    expect(newIcon).toHaveAttribute('title', 'New User');
    fireEvent.click(newIcon);
    expect(handleUserCreateClick).toHaveBeenCalled();
  });

  test('should not show icons if user does not have the right permissions', () => {
    const handleUserCreateClick = testing.fn();

    const gmp = {
      settings: {manualUrl},
    };

    const {render} = rendererWith({
      gmp,
      capabilities: wrongCaps,
      router: true,
    });

    render(
      <UsersListPageToolBarIcons onUserCreateClick={handleUserCreateClick} />,
    );

    const newIcon = screen.queryByTestId('new-icon');
    expect(newIcon).not.toBeInTheDocument();
  });
});
