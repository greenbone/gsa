/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {screen, fireEvent, rendererWith, wait} from 'web/testing';
import Capabilities from 'gmp/capabilities/capabilities';
import CollectionCounts from 'gmp/collection/CollectionCounts';
import Filter from 'gmp/models/filter';
import Permission from 'gmp/models/permission';
import Role from 'gmp/models/role';
import {YES_VALUE, NO_VALUE} from 'gmp/parser';
import {currentSettingsDefaultResponse} from 'web/pages/__mocks__/CurrentSettings';
import RoleDetailsPage from 'web/pages/roles/RoleDetailsPage';
import RoleDetailsPageToolBarIcons from 'web/pages/roles/RoleDetailsPageToolBarIcons';
import {entitiesLoadingActions as permissionsLoadingActions} from 'web/store/entities/permissions';
import {entitiesLoadingActions} from 'web/store/entities/roles';
import {setUsername} from 'web/store/usersettings/actions';
import {defaultFilterLoadingActions} from 'web/store/usersettings/defaultfilters/actions';
import {loadingActions} from 'web/store/usersettings/defaults/actions';

const handleRoleCloneClick = testing.fn();
const handleRoleCreateClick = testing.fn();
const handleRoleDeleteClick = testing.fn();
const handleRoleDownloadClick = testing.fn();
const handleRoleEditClick = testing.fn();

const role = Role.fromElement({
  _id: '12345',
  name: 'test_role',
  comment: 'Test role for unit testing',
  creation_time: '2025-07-16T06:31:29Z',
  modification_time: '2025-07-16T06:44:55Z',
  owner: {name: 'admin'},
  writable: YES_VALUE,
  in_use: NO_VALUE,
  permissions: {permission: [{name: 'everything'}]},
  users: 'john, jane',
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

const permission1 = Permission.fromElement({
  _id: 'permission1',
  name: 'get_tasks',
  resource: {
    _id: 'resource1',
    type: 'task',
  },
  subject: {
    _id: '12345',
    type: 'role',
  },
});

const permission2 = Permission.fromElement({
  _id: 'permission2',
  name: 'create_task',
  subject: {
    _id: '12345',
    type: 'role',
  },
});

const generalPermission = Permission.fromElement({
  _id: 'general1',
  name: 'everything',
  subject: {
    _id: '12345',
    type: 'role',
  },
});

const caps = new Capabilities(['everything']);
const wrongCaps = new Capabilities(['get_config']);

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

const getRole = testing.fn().mockResolvedValue({
  data: role,
});

const getPermissions = testing.fn().mockResolvedValue({
  data: [permission1, permission2],
  meta: {
    filter: Filter.fromString(),
    counts: new CollectionCounts(),
  },
});

const setupStoreForRoleDetailsPage = store => {
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

  store.dispatch(
    entitiesLoadingActions.success(
      [role],
      Filter.fromString(),
      Filter.fromString(),
      counts,
    ),
  );

  const permissionsSubjectFilter = Filter.fromString(
    'subject_uuid=12345 and not resource_uuid="" or resource_uuid=12345',
  ).all();

  const generalPermissionsFilter = Filter.fromString(
    'subject_uuid=12345 and resource_uuid=""',
  ).all();

  store.dispatch(
    permissionsLoadingActions.success(
      [permission1, permission2],
      permissionsSubjectFilter,
      permissionsSubjectFilter,
      counts,
    ),
  );

  store.dispatch(
    permissionsLoadingActions.success(
      [generalPermission],
      generalPermissionsFilter,
      generalPermissionsFilter,
      counts,
    ),
  );
};
const gmp = {
  roles: {
    get: getRole,
  },
  permissions: {
    get: getPermissions,
  },
  filters: {
    get: getFilters,
  },
  reloadInterval,
  settings: {manualUrl},
  user: {currentSettings, getSetting},
};
describe('RoleDetailsPage tests', () => {
  test('should render full RoleDetailsPage', async () => {
    const {render, store} = rendererWith({
      gmp,
      capabilities: true,
      store: true,
      router: true,
    });

    setupStoreForRoleDetailsPage(store);

    const {baseElement} = render(<RoleDetailsPage id="12345" />);

    await wait();
    expect(baseElement).toBeVisible();

    expect(screen.getByText('Role: test_role')).toBeVisible();
  });

  test('should render role details in Information tab', async () => {
    const {render, store} = rendererWith({
      gmp,
      capabilities: true,
      store: true,
      router: true,
    });

    setupStoreForRoleDetailsPage(store);

    render(<RoleDetailsPage id="12345" />);

    await wait();

    expect(screen.getByText('Comment')).toBeVisible();

    expect(screen.getByText('Test role for unit testing')).toBeVisible();
    expect(screen.getByText('Users')).toBeVisible();
    expect(screen.getByText('john')).toBeVisible();
    expect(screen.getByText('jane')).toBeVisible();
  });

  test('should render general permissions tab', async () => {
    const {render, store} = rendererWith({
      gmp,
      capabilities: true,
      store: true,
      router: true,
    });

    setupStoreForRoleDetailsPage(store);

    render(<RoleDetailsPage id="12345" />);

    const generalPermissionsTab = await screen.findByText(
      'General Command Permissions',
    );
    fireEvent.click(generalPermissionsTab);

    await wait();
    expect(screen.getByText('everything')).toBeVisible();
  });

  test('should render user tags tab', async () => {
    const {render, store} = rendererWith({
      gmp,
      capabilities: true,
      store: true,
      router: true,
    });

    setupStoreForRoleDetailsPage(store);

    render(<RoleDetailsPage id="12345" />);

    const userTagsTab = await screen.findByText('User Tags');
    fireEvent.click(userTagsTab);

    await wait();
    expect(screen.getByText('User Tags')).toBeVisible();
  });

  test('should render permissions tab', async () => {
    const {render, store} = rendererWith({
      gmp,
      capabilities: true,
      store: true,
      router: true,
    });

    setupStoreForRoleDetailsPage(store);

    render(<RoleDetailsPage id="12345" />);

    const permissionsTab = await screen.findByText('Permissions');
    fireEvent.click(permissionsTab);

    await wait();
    expect(screen.getByText('Permissions')).toBeVisible();
  });
});

describe('RoleDetailsPageToolBarIcons tests', () => {
  test('should render toolbar icons', () => {
    const gmp = {settings: {manualUrl}};

    const {render} = rendererWith({
      gmp,
      capabilities: caps,
      router: true,
    });

    const {element} = render(
      <RoleDetailsPageToolBarIcons
        entity={role}
        onRoleCloneClick={handleRoleCloneClick}
        onRoleCreateClick={handleRoleCreateClick}
        onRoleDeleteClick={handleRoleDeleteClick}
        onRoleDownloadClick={handleRoleDownloadClick}
        onRoleEditClick={handleRoleEditClick}
      />,
    );

    expect(element).toBeVisible();

    const links = element.querySelectorAll('a');

    const helpIcon = screen.getByTestId('help-icon');
    expect(helpIcon).toHaveAttribute('title', 'Help: Roles');
    expect(links[0]).toHaveAttribute(
      'href',
      'test/en/web-interface-access.html#managing-roles',
    );

    const listIcon = screen.getByTestId('list-icon');
    expect(listIcon).toHaveAttribute('title', 'Roles List');
  });

  test('should call click handlers', () => {
    const gmp = {settings: {manualUrl}};

    const {render} = rendererWith({
      gmp,
      capabilities: caps,
      router: true,
    });

    render(
      <RoleDetailsPageToolBarIcons
        entity={role}
        onRoleCloneClick={handleRoleCloneClick}
        onRoleCreateClick={handleRoleCreateClick}
        onRoleDeleteClick={handleRoleDeleteClick}
        onRoleDownloadClick={handleRoleDownloadClick}
        onRoleEditClick={handleRoleEditClick}
      />,
    );

    const newIcon = screen.getByTestId('new-icon');
    expect(newIcon).toHaveAttribute('title', 'Create new Role');
    fireEvent.click(newIcon);
    expect(handleRoleCreateClick).toHaveBeenCalled();

    const cloneIcon = screen.getByTestId('clone-icon');
    expect(cloneIcon).toHaveAttribute('title', 'Clone Role');
    fireEvent.click(cloneIcon);
    expect(handleRoleCloneClick).toHaveBeenCalledWith(role);

    const editIcon = screen.getByTestId('edit-icon');
    expect(editIcon).toHaveAttribute('title', 'Edit Role');
    fireEvent.click(editIcon);
    expect(handleRoleEditClick).toHaveBeenCalledWith(role);

    const deleteIcon = screen.getByTestId('trashcan-icon');
    expect(deleteIcon).toHaveAttribute('title', 'Move Role to trashcan');
    fireEvent.click(deleteIcon);
    expect(handleRoleDeleteClick).toHaveBeenCalledWith(role);

    const exportIcon = screen.getByTestId('export-icon');
    expect(exportIcon).toHaveAttribute('title', 'Export Role as XML');
    fireEvent.click(exportIcon);
    expect(handleRoleDownloadClick).toHaveBeenCalledWith(role);
  });

  test('should disable icons if user does not have the right permissions', () => {
    const gmp = {settings: {manualUrl}};

    const {render} = rendererWith({
      gmp,
      capabilities: wrongCaps,
      router: true,
    });

    render(
      <RoleDetailsPageToolBarIcons
        entity={role}
        onRoleCloneClick={handleRoleCloneClick}
        onRoleCreateClick={handleRoleCreateClick}
        onRoleDeleteClick={handleRoleDeleteClick}
        onRoleDownloadClick={handleRoleDownloadClick}
        onRoleEditClick={handleRoleEditClick}
      />,
    );

    const newIcon = screen.queryByTestId('new-icon');
    expect(newIcon).toBeNull();

    const cloneIcon = screen.getByTestId('clone-icon');
    expect(cloneIcon).toBeDisabled();
    expect(cloneIcon).toHaveAttribute(
      'title',
      'Permission to clone Role denied',
    );

    const editIcon = screen.getByTestId('edit-icon');
    expect(editIcon).toBeDisabled();
    expect(editIcon).toHaveAttribute('title', 'Permission to edit Role denied');

    const deleteIcon = screen.getByTestId('trashcan-icon');
    expect(deleteIcon).toBeDisabled();
    expect(deleteIcon).toHaveAttribute(
      'title',
      'Permission to move Role to trashcan denied',
    );
  });

  test('should show export icon even with limited permissions', () => {
    const handleRoleDownloadClick = testing.fn();

    const gmp = {settings: {manualUrl}};

    const {render} = rendererWith({
      gmp,
      capabilities: wrongCaps,
      router: true,
    });

    render(
      <RoleDetailsPageToolBarIcons
        entity={role}
        onRoleDownloadClick={handleRoleDownloadClick}
      />,
    );

    const exportIcon = screen.getByTestId('export-icon');
    expect(exportIcon).toHaveAttribute('title', 'Export Role as XML');
  });
});
