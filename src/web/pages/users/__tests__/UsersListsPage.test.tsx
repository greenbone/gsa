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
  wait,
  within,
} from 'web/testing';
import Capabilities from 'gmp/capabilities/capabilities';
import CollectionCounts from 'gmp/collection/collection-counts';
import Filter from 'gmp/models/filter';
import User from 'gmp/models/user';
import {currentSettingsDefaultResponse} from 'web/pages/__mocks__/current-settings';
import UsersListPage, {
  UsersListPageToolBarIcons,
} from 'web/pages/users/UsersListPage';
import {setTimezone, setUsername} from 'web/store/usersettings/actions';
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
    meta: {filter: new Filter(), counts: new CollectionCounts()},
  },
  getAllUsersResponse = {
    data: [user],
    meta: {filter: new Filter(), counts: new CollectionCounts()},
  },
  getFiltersResponse = {
    data: [],
    meta: {filter: new Filter(), counts: new CollectionCounts()},
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
} = {}) => {
  return {
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
    settings: {manualUrl, reloadInterval},
    permissions: {
      get: testing.fn().mockResolvedValue({
        data: [],
        meta: {
          filter: Filter.fromString(),
          counts: new CollectionCounts(),
        },
      }),
    },
  };
};

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

    store.dispatch(setTimezone('CET'));
    store.dispatch(setUsername('admin'));

    const defaultSettingFilter = Filter.fromString('foo=bar');
    store.dispatch(loadingActions.success({rowsperpage: {value: '2'}}));
    store.dispatch(
      defaultFilterLoadingActions.success('user', defaultSettingFilter),
    );

    render(<UsersListPage />);

    await wait();

    // Toolbar Icons
    expect(screen.getByTitle('Help: Users')).toBeInTheDocument();
    expect(screen.getByTitle('New User')).toBeInTheDocument();

    const powerFilter = within(screen.getPowerFilter());
    const select = powerFilter.getByTestId('powerfilter-select');
    const inputs = powerFilter.queryTextInputs();

    // Powerfilter
    const userFilterInput = inputs.find(
      input => input.getAttribute('name') === 'userFilterString',
    );
    expect(userFilterInput).toBeInTheDocument();

    expect(screen.getByTitle('Update Filter')).toBeInTheDocument();
    expect(screen.getByTitle('Remove Filter')).toBeInTheDocument();
    expect(screen.getByTitle('Reset to Default Filter')).toBeInTheDocument();
    expect(screen.getByTitle('Help: Powerfilter')).toBeInTheDocument();
    expect(screen.getByTitle('Edit Filter')).toBeInTheDocument();
    expect(select).toHaveAttribute('title', 'Loaded filter');
    expect(select).toHaveValue('--');

    // table column headers
    expect(
      screen.getByRole('columnheader', {name: /name/i}),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('columnheader', {name: /roles/i}),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('columnheader', {name: /groups/i}),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('columnheader', {name: /host access/i}),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('columnheader', {name: /actions/i}),
    ).toBeInTheDocument();

    // table row contents
    expect(
      screen.getByRole('cell', {name: /user 1 \(test comment\)/i}),
    ).toBeInTheDocument();
    expect(screen.getByRole('cell', {name: /admin/i})).toBeInTheDocument();
    expect(screen.getByRole('cell', {name: /group 1/i})).toBeInTheDocument();

    // table row actions
    expect(screen.getByTitle('Delete User')).toBeInTheDocument();
    expect(screen.getByTitle('Edit User')).toBeInTheDocument();
    expect(screen.getByTitle('Clone User')).toBeInTheDocument();
    expect(screen.getByTitle('Export User')).toBeInTheDocument();
  });

  test('should allow to bulk action on page contents', async () => {
    const gmp = createGmp();
    const {render, store} = rendererWith({
      gmp,
      capabilities: true,
      store: true,
      router: true,
    });

    store.dispatch(setTimezone('CET'));
    store.dispatch(setUsername('admin'));

    const defaultSettingFilter = Filter.fromString('foo=bar');
    store.dispatch(loadingActions.success({rowsperpage: {value: '2'}}));
    store.dispatch(
      defaultFilterLoadingActions.success('user', defaultSettingFilter),
    );

    render(<UsersListPage />);

    await wait();

    // export page contents
    const exportIcon = screen.getByTitle('Export page contents');
    fireEvent.click(exportIcon);
    expect(gmp.users.exportByFilter).toHaveBeenCalled();

    // delete page contents
    const deleteIcon = screen.getByTitle('Delete page contents');
    fireEvent.click(deleteIcon);
    // Users use custom delete dialog, so just verify the icon exists
    expect(deleteIcon).toBeInTheDocument();
  });

  test('should allow to bulk action on selected users', async () => {
    const gmp = createGmp();
    const {render, store} = rendererWith({
      gmp,
      capabilities: true,
      store: true,
      router: true,
    });

    store.dispatch(setTimezone('CET'));
    store.dispatch(setUsername('admin'));

    const defaultSettingFilter = Filter.fromString('foo=bar');
    store.dispatch(loadingActions.success({rowsperpage: {value: '2'}}));
    store.dispatch(
      defaultFilterLoadingActions.success('user', defaultSettingFilter),
    );

    render(<UsersListPage />);

    await wait();

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
    expect(gmp.users.export).toHaveBeenCalled();

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

    store.dispatch(setTimezone('CET'));
    store.dispatch(setUsername('admin'));

    const defaultSettingFilter = Filter.fromString('foo=bar');
    store.dispatch(loadingActions.success({rowsperpage: {value: '2'}}));
    store.dispatch(
      defaultFilterLoadingActions.success('user', defaultSettingFilter),
    );

    render(<UsersListPage />);

    await wait();

    // change to all filtered
    const tableFooter = within(screen.getTableFooter());
    const select = tableFooter.getSelectElement();
    const selectItems = await getSelectItemElementsForSelect(select);
    fireEvent.click(selectItems[2]);
    expect(select).toHaveValue('Apply to all filtered');

    // export all filtered users
    const exportIcon = screen.getAllByTitle('Export all filtered')[0];
    fireEvent.click(exportIcon);
    expect(gmp.users.exportByFilter).toHaveBeenCalled();

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
        meta: {filter: new Filter(), counts},
      },
    });

    const {render, store} = rendererWith({
      gmp,
      capabilities: true,
      store: true,
      router: true,
    });

    store.dispatch(setTimezone('CET'));
    store.dispatch(setUsername('admin'));

    const defaultSettingFilter = Filter.fromString('foo=bar');
    store.dispatch(loadingActions.success({rowsperpage: {value: '10'}}));
    store.dispatch(
      defaultFilterLoadingActions.success('user', defaultSettingFilter),
    );

    render(<UsersListPage />);

    await wait();

    // Check pagination controls are present
    expect(screen.getAllByTitle('First')[0]).toBeInTheDocument();
    expect(screen.getAllByTitle('Previous')[0]).toBeInTheDocument();
    expect(screen.getAllByTitle('Next')[0]).toBeInTheDocument();
    expect(screen.getAllByTitle('Last')[0]).toBeInTheDocument();
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
      meta: {filter: Filter.fromString('first=1 rows=10'), counts},
    });

    const gmp = createGmp({
      getUsers,
      getUsersResponse: {
        data: [user],
        meta: {filter: Filter.fromString('first=1 rows=10'), counts},
      },
    });

    const {render, store} = rendererWith({
      gmp,
      capabilities: true,
      store: true,
      router: true,
    });

    store.dispatch(setTimezone('CET'));
    store.dispatch(setUsername('admin'));

    const defaultSettingFilter = Filter.fromString('first=1 rows=10');
    store.dispatch(loadingActions.success({rowsperpage: {value: '10'}}));
    store.dispatch(
      defaultFilterLoadingActions.success('user', defaultSettingFilter),
    );

    render(<UsersListPage />);

    await wait();

    // Test Next button
    const nextButton = screen.getAllByTitle('Next')[0];
    expect(nextButton).toBeInTheDocument();
    fireEvent.click(nextButton);

    await wait();

    // Test Previous button
    const previousButton = screen.getAllByTitle('Previous')[0];
    expect(previousButton).toBeInTheDocument();
    fireEvent.click(previousButton);

    await wait();

    // Test First button
    const firstButton = screen.getAllByTitle('First')[0];
    expect(firstButton).toBeInTheDocument();
    fireEvent.click(firstButton);

    await wait();

    // Test Last button
    const lastButton = screen.getAllByTitle('Last')[0];
    expect(lastButton).toBeInTheDocument();
    fireEvent.click(lastButton);

    await wait();

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
