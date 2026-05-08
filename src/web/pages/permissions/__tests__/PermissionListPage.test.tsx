/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {
  rendererWith,
  screen,
  testBulkTrashcanDialog,
  fireEvent,
  wait,
} from 'web/testing';
import CollectionCounts from 'gmp/collection/collection-counts';
import Filter from 'gmp/models/filter';
import Permission from 'gmp/models/permission';
import {YES_VALUE, NO_VALUE} from 'gmp/parser';
import {createSession} from 'gmp/testing';
import {currentSettingsDefaultResponse} from 'web/pages/__fixtures__/current-settings';
import PermissionListPage from 'web/pages/permissions/PermissionListPage';
import PermissionListPageToolBarIcons from 'web/pages/permissions/PermissionListPageToolBarIcons';
import {entitiesLoadingActions} from 'web/store/entities/permissions';
import {defaultFilterLoadingActions} from 'web/store/usersettings/defaultfilters/actions';
import {loadingActions} from 'web/store/usersettings/defaults/actions';

const permission = Permission.fromElement({
  _id: '12345',
  name: 'test_permission',
  comment: 'Test permission for unit testing',
  creation_time: '2025-07-16T06:31:29Z',
  modification_time: '2025-07-16T06:44:55Z',
  owner: {name: 'admin'},
  writable: YES_VALUE,
  in_use: NO_VALUE,
  resource: {_id: 'resource123', type: 'config'},
  subject: {_id: 'subject123', type: 'user'},
});

const reloadInterval = 1;
const manualUrl = 'test/';

const createGmp = ({
  currentSettings = testing
    .fn()
    .mockResolvedValue(currentSettingsDefaultResponse),
  getSetting = testing.fn().mockResolvedValue({filter: null}),
  getFilters = testing.fn().mockResolvedValue({
    data: [],
    meta: {
      filter: Filter.fromString(),
      counts: new CollectionCounts(),
    },
  }),
  getPermissions = testing.fn().mockResolvedValue({
    data: [permission],
    meta: {
      filter: Filter.fromString(),
      counts: new CollectionCounts(),
    },
  }),
  deleteByFilter = testing.fn().mockResolvedValue({
    foo: 'bar',
  }),
  exportByFilter = testing.fn().mockResolvedValue({
    foo: 'bar',
  }),
} = {}) => ({
  permissions: {
    get: getPermissions,
    deleteByFilter,
    exportByFilter,
  },
  filters: {
    get: getFilters,
  },
  reloadInterval,
  settings: {
    manualUrl,
  },
  session: createSession(),
  user: {currentSettings, getSetting},
});

describe('PermissionListPage tests', () => {
  test('should render full PermissionListPage', async () => {
    const gmp = createGmp();

    const {render, store} = rendererWith({
      gmp,
      capabilities: true,
      store: true,
      router: true,
    });

    const defaultSettingFilter = Filter.fromString('foo=bar');
    store.dispatch(loadingActions.success({rowsperpage: {value: '2'}}));
    store.dispatch(
      defaultFilterLoadingActions.success('permission', defaultSettingFilter),
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
      entitiesLoadingActions.success(
        [permission],
        filter,
        loadedFilter,
        counts,
      ),
    );

    const {baseElement} = render(<PermissionListPage />);

    await wait();

    expect(baseElement).toBeVisible();
  });

  test('should call commands for bulk actions', async () => {
    const gmp = createGmp();
    const {render, store} = rendererWith({
      gmp,
      capabilities: true,
      store: true,
      router: true,
    });

    const defaultSettingFilter = Filter.fromString('foo=bar');
    store.dispatch(loadingActions.success({rowsperpage: {value: '2'}}));
    store.dispatch(
      defaultFilterLoadingActions.success('permission', defaultSettingFilter),
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
      entitiesLoadingActions.success(
        [permission],
        filter,
        loadedFilter,
        counts,
      ),
    );

    render(<PermissionListPage />);

    await wait();

    const exportIcon = screen.getAllByTitle('Export page contents')[0];
    fireEvent.click(exportIcon);
    expect(gmp.permissions.exportByFilter).toHaveBeenCalled();

    const deleteIcon = screen.getAllByTitle(
      'Move page contents to trashcan',
    )[0];
    fireEvent.click(deleteIcon);
    testBulkTrashcanDialog(screen, gmp.permissions.deleteByFilter);
  });
});

describe('ToolBarIcons tests', () => {
  test('should render', () => {
    const handlePermissionCreateClick = testing.fn();
    const gmp = createGmp();
    const {render} = rendererWith({
      gmp,
      capabilities: true,
      router: true,
    });

    const {element} = render(
      <PermissionListPageToolBarIcons
        onPermissionCreateClick={handlePermissionCreateClick}
      />,
    );
    expect(element).toBeVisible();

    const links = element.querySelectorAll('a');

    const helpIcon = screen.getByTestId('help-icon');
    expect(helpIcon).toHaveAttribute('title', 'Help: Permissions');
    expect(links[0]).toHaveAttribute(
      'href',
      'test/en/web-interface-access.html#managing-permissions',
    );
  });

  test('should call click handlers', () => {
    const handlePermissionCreateClick = testing.fn();
    const gmp = createGmp();
    const {render} = rendererWith({
      gmp,
      capabilities: true,
      router: true,
    });

    render(
      <PermissionListPageToolBarIcons
        onPermissionCreateClick={handlePermissionCreateClick}
      />,
    );

    const newIcon = screen.getByTestId('new-icon');
    expect(newIcon).toHaveAttribute('title', 'New Permission');
    fireEvent.click(newIcon);
    expect(handlePermissionCreateClick).toHaveBeenCalled();
  });

  test('should not show icons if user does not have the right permissions', () => {
    const handlePermissionCreateClick = testing.fn();
    const gmp = createGmp();
    const {render} = rendererWith({
      gmp,
      capabilities: false,
      router: true,
    });

    render(
      <PermissionListPageToolBarIcons
        onPermissionCreateClick={handlePermissionCreateClick}
      />,
    );

    const newIcon = screen.queryByTestId('new-icon');
    expect(newIcon).toBeNull();
  });
});
