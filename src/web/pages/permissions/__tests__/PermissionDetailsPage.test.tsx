/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {screen, fireEvent, rendererWith, wait} from 'web/testing';
import CollectionCounts from 'gmp/collection/CollectionCounts';
import Filter from 'gmp/models/filter';
import Permission from 'gmp/models/permission';
import {YES_VALUE, NO_VALUE} from 'gmp/parser';
import {currentSettingsDefaultResponse} from 'web/pages/__mocks__/CurrentSettings';
import PermissionDetailsPage, {
  PermissionsDetailsPageToolBarIcons,
} from 'web/pages/permissions/PermissionDetailsPage';
import {entitiesLoadingActions} from 'web/store/entities/permissions';
import {setUsername} from 'web/store/usersettings/actions';
import {defaultFilterLoadingActions} from 'web/store/usersettings/defaultfilters/actions';
import {loadingActions} from 'web/store/usersettings/defaults/actions';

const permission = Permission.fromElement({
  _id: '12345',
  name: 'get_tasks',
  comment: 'Test permission for unit testing',
  creation_time: '2025-07-16T06:31:29Z',
  modification_time: '2025-07-16T06:44:55Z',
  owner: {name: 'admin'},
  writable: YES_VALUE,
  in_use: NO_VALUE,
  permissions: {
    permission: [
      {
        name: 'Everything',
      },
    ],
  },
  resource: {
    _id: 'resource1',
    type: 'task',
  },
  subject: {
    _id: 'subject1',
    type: 'role',
  },
  user_tags: {
    tag: [
      {
        _id: 'tag1',
        name: 'tag:name1',
        value: 'value1',
      },
      {
        _id: 'tag2',
        name: 'tag:name2',
        value: 'value2',
      },
    ],
  },
});

const reloadInterval = 1;
const manualUrl = 'test/';

const currentSettings = testing
  .fn()
  .mockResolvedValue(currentSettingsDefaultResponse);

const getSetting = testing.fn().mockResolvedValue({filter: undefined});

const getFilters = testing.fn().mockReturnValue(
  Promise.resolve({
    data: [],
    meta: {
      filter: Filter.fromString(),
      counts: new CollectionCounts(),
    },
  }),
);

const getPermission = testing.fn().mockResolvedValue({
  data: permission,
});

const setupStoreForPermissionDetailsPage = store => {
  store.dispatch(setUsername('admin'));

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

  store.dispatch(
    entitiesLoadingActions.success(
      [permission],
      Filter.fromString(),
      Filter.fromString(),
      counts,
    ),
  );
};

const gmp = {
  permissions: {
    get: getPermission,
  },
  filters: {
    get: getFilters,
  },
  reloadInterval,
  settings: {manualUrl},
  user: {currentSettings, getSetting},
};

describe('PermissionDetailsPage tests', () => {
  test('should render full PermissionDetailsPage', async () => {
    const {render, store} = rendererWith({
      gmp,
      capabilities: true,
      store: true,
      router: true,
    });

    setupStoreForPermissionDetailsPage(store);

    const {baseElement} = render(<PermissionDetailsPage id="12345" />);

    await wait();
    expect(baseElement).toBeVisible();

    expect(screen.getByText('Permission: get_tasks')).toBeVisible();
  });

  test('should render permission details in Information tab', async () => {
    const {render, store} = rendererWith({
      gmp,
      capabilities: true,
      store: true,
      router: true,
    });

    setupStoreForPermissionDetailsPage(store);

    render(<PermissionDetailsPage id="12345" />);

    await wait();

    expect(screen.getByText('Comment')).toBeVisible();
    expect(screen.getByText('Test permission for unit testing')).toBeVisible();
    expect(screen.getByText('Description')).toBeVisible();
    expect(screen.getByText('Resource')).toBeVisible();
    expect(screen.getByText('Subject')).toBeVisible();
  });

  test('should render user tags tab', async () => {
    const {render, store} = rendererWith({
      gmp,
      capabilities: true,
      store: true,
      router: true,
    });

    setupStoreForPermissionDetailsPage(store);

    render(<PermissionDetailsPage id="12345" />);

    const userTagsTab = await screen.findByText('User Tags');
    fireEvent.click(userTagsTab);

    await wait();
    expect(screen.getByText('User Tags')).toBeVisible();
  });

  test('should render toolbar icons', async () => {
    const {render, store} = rendererWith({
      gmp,
      capabilities: true,
      router: true,
      store: true,
    });

    setupStoreForPermissionDetailsPage(store);

    render(<PermissionDetailsPage id="12345" />);

    await wait();

    // Check for help and list icons which should always be present
    const helpIcon = screen.getByTitle('Help: Permissions');
    expect(helpIcon).toHaveAttribute('title', 'Help: Permissions');

    const listIcon = screen.getByTitle('Permission List');
    expect(listIcon).toHaveAttribute('title', 'Permission List');

    // Check for export icon
    const exportIcon = screen.getByTitle('Export Permission as XML');
    expect(exportIcon).toHaveAttribute('title', 'Export Permission as XML');
  });
});

describe('PermissionDetailsPageToolBarIcons tests', () => {
  const handlePermissionCloneClick = testing.fn();
  const handlePermissionCreateClick = testing.fn();
  const handlePermissionDeleteClick = testing.fn();
  const handlePermissionDownloadClick = testing.fn();
  const handlePermissionEditClick = testing.fn();

  test('should render toolbar icons', () => {
    const gmp = {settings: {manualUrl}};

    const {render} = rendererWith({
      gmp,
      capabilities: true,
      router: true,
    });

    const {element} = render(
      <PermissionsDetailsPageToolBarIcons
        entity={permission}
        onPermissionCloneClick={handlePermissionCloneClick}
        onPermissionCreateClick={handlePermissionCreateClick}
        onPermissionDeleteClick={handlePermissionDeleteClick}
        onPermissionDownloadClick={handlePermissionDownloadClick}
        onPermissionEditClick={handlePermissionEditClick}
      />,
    );

    expect(element).toBeVisible();

    const helpIcon = screen.getByTestId('help-icon');
    expect(helpIcon).toHaveAttribute('title', 'Help: Permissions');

    const listIcon = screen.getByTestId('list-icon');
    expect(listIcon).toHaveAttribute('title', 'Permission List');

    const newIcon = screen.getByTestId('new-icon');
    expect(newIcon).toHaveAttribute('title', 'Create new Permission');
    fireEvent.click(newIcon);
    expect(handlePermissionCreateClick).toHaveBeenCalled();

    const cloneIcon = screen.getByTestId('clone-icon');
    expect(cloneIcon).toHaveAttribute('title', 'Clone Permission');
    fireEvent.click(cloneIcon);
    expect(handlePermissionCloneClick).toHaveBeenCalledWith(permission);

    const editIcon = screen.getByTestId('edit-icon');
    expect(editIcon).toHaveAttribute('title', 'Edit Permission');
    fireEvent.click(editIcon);
    expect(handlePermissionEditClick).toHaveBeenCalledWith(permission);

    const deleteIcon = screen.getByTestId('trashcan-icon');
    expect(deleteIcon).toHaveAttribute('title', 'Move Permission to trashcan');
    fireEvent.click(deleteIcon);
    expect(handlePermissionDeleteClick).toHaveBeenCalledWith(permission);

    const exportIcon = screen.getByTestId('export-icon');
    expect(exportIcon).toHaveAttribute('title', 'Export Permission as XML');
    fireEvent.click(exportIcon);
    expect(handlePermissionDownloadClick).toHaveBeenCalledWith(permission);
  });

  test('should disable icons if user does not have the right permissions', () => {
    const gmp = {settings: {manualUrl}};

    const {render} = rendererWith({
      gmp,
      capabilities: false,
      router: true,
    });

    render(
      <PermissionsDetailsPageToolBarIcons
        entity={permission}
        onPermissionCloneClick={handlePermissionCloneClick}
        onPermissionCreateClick={handlePermissionCreateClick}
        onPermissionDeleteClick={handlePermissionDeleteClick}
        onPermissionDownloadClick={handlePermissionDownloadClick}
        onPermissionEditClick={handlePermissionEditClick}
      />,
    );

    const newIcon = screen.queryByTestId('new-icon');
    expect(newIcon).toBeNull();

    const cloneIcon = screen.getByTestId('clone-icon');
    expect(cloneIcon).toHaveAttribute(
      'title',
      'Permission to clone Permission denied',
    );

    const editIcon = screen.getByTestId('edit-icon');
    expect(editIcon).toHaveAttribute(
      'title',
      'Permission to edit Permission denied',
    );

    const deleteIcon = screen.getByTestId('trashcan-icon');
    expect(deleteIcon).toHaveAttribute(
      'title',
      'Permission to move Permission to trashcan denied',
    );
  });

  test('should show export icon even with limited permissions', () => {
    const gmp = {settings: {manualUrl}};

    const {render} = rendererWith({
      gmp,
      capabilities: false,
      router: true,
    });

    render(
      <PermissionsDetailsPageToolBarIcons
        entity={permission}
        onPermissionCloneClick={handlePermissionCloneClick}
        onPermissionCreateClick={handlePermissionCreateClick}
        onPermissionDeleteClick={handlePermissionDeleteClick}
        onPermissionDownloadClick={handlePermissionDownloadClick}
        onPermissionEditClick={handlePermissionEditClick}
      />,
    );

    const exportIcon = screen.getByTestId('export-icon');
    expect(exportIcon).toHaveAttribute('title', 'Export Permission as XML');
  });
});

test('should disable icons if user does not have the right permissions', async () => {
  const {render, store} = rendererWith({
    gmp,
    capabilities: false,
    store: true,
    router: true,
  });

  setupStoreForPermissionDetailsPage(store);

  render(<PermissionDetailsPage id="12345" />);

  await wait();

  const newIcon = screen.queryByTestId('new-icon');
  expect(newIcon).toBeNull();

  const cloneIcon = screen.getByTestId('clone-icon');
  expect(cloneIcon).toBeDisabled();
  expect(cloneIcon).toHaveAttribute(
    'title',
    'Permission to clone Permission denied',
  );

  const editIcon = screen.getByTestId('edit-icon');
  expect(editIcon).toBeDisabled();
  expect(editIcon).toHaveAttribute(
    'title',
    'Permission to edit Permission denied',
  );

  const deleteIcon = screen.getByTestId('trashcan-icon');
  expect(deleteIcon).toBeDisabled();
  expect(deleteIcon).toHaveAttribute(
    'title',
    'Permission to move Permission to trashcan denied',
  );
});

test('should show export icon even with limited permissions', async () => {
  const {render, store} = rendererWith({
    gmp,
    capabilities: false,
    store: true,
    router: true,
  });

  setupStoreForPermissionDetailsPage(store);

  render(<PermissionDetailsPage id="12345" />);

  await wait();

  const exportIcon = screen.getByTestId('export-icon');
  expect(exportIcon).toHaveAttribute('title', 'Export Permission as XML');
});

test('should handle loading state', () => {
  const {render, store} = rendererWith({
    gmp,
    capabilities: true,
    store: true,
    router: true,
  });

  // Don't setup store to simulate loading state
  store.dispatch(setUsername('admin'));

  render(<PermissionDetailsPage id="12345" />);

  // Component should render in loading state
  expect(screen.queryByText('Permission:')).not.toBeInTheDocument();
});
