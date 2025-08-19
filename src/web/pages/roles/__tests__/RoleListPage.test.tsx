/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {rendererWith, screen, wait} from 'web/testing';
import CollectionCounts from 'gmp/collection/CollectionCounts';
import Filter from 'gmp/models/filter';
import Role from 'gmp/models/role';
import RoleListPage from 'web/pages/roles/RoleListPage';
import {entitiesLoadingActions} from 'web/store/entities/roles';
import {setTimezone, setUsername} from 'web/store/usersettings/actions';
import {defaultFilterLoadingActions} from 'web/store/usersettings/defaultfilters/actions';
import {loadingActions} from 'web/store/usersettings/defaults/actions';

const role = Role.fromElement({
  _id: '1234',
  owner: {name: 'admin'},
  name: 'Admin',
  comment: 'Administrator role',
  permissions: {permission: [{name: 'everything'}]},
});

const getSetting = testing.fn().mockResolvedValue({});

const currentSettings = testing.fn().mockResolvedValue({
  data: {},
});

const getFilters = testing.fn().mockReturnValue(
  Promise.resolve({
    data: [],
    meta: {
      filter: Filter.fromString(),
      counts: new CollectionCounts(),
    },
  }),
);

const getRoles = testing.fn().mockResolvedValue({
  data: [role],
  meta: {
    filter: Filter.fromString(),
    counts: new CollectionCounts(),
  },
});

const reloadInterval = 1;
const manualUrl = 'test/';

const gmp = {
  roles: {
    get: getRoles,
  },
  filters: {
    get: getFilters,
  },
  reloadInterval,
  settings: {manualUrl},
  user: {
    currentSettings,
    getSetting,
  },
};

describe('RoleListPage tests', () => {
  test('should render RoleListPage with correct title', async () => {
    const {render, store} = rendererWith({
      capabilities: true,
      gmp,
      store: true,
      router: true,
    });

    store.dispatch(setTimezone('CET'));
    store.dispatch(setUsername('admin'));

    const defaultSettingFilter = Filter.fromString('foo=bar');
    store.dispatch(loadingActions.success({rowsperpage: {value: '2'}}));
    store.dispatch(
      defaultFilterLoadingActions.success('role', defaultSettingFilter),
    );

    const counts = new CollectionCounts({
      first: 1,
      all: 1,
      filtered: 1,
      length: 1,
      rows: 10,
    });
    const filter = Filter.fromString('first=1 rows=10');
    const loadedFilter = Filter.fromString('first=1 rows=10');
    store.dispatch(
      entitiesLoadingActions.success([role], filter, loadedFilter, counts),
    );

    render(<RoleListPage />);

    await wait();

    expect(screen.getByText('Roles')).toBeVisible();
  });
});
