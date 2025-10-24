/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {
  testBulkTrashcanDialog,
  rendererWith,
  fireEvent,
  screen,
  wait,
} from 'web/testing';
import Capabilities from 'gmp/capabilities/capabilities';
import CollectionCounts from 'gmp/collection/collection-counts';
import Filter from 'gmp/models/filter';
import Policy from 'gmp/models/policy';
import {currentSettingsDefaultResponse} from 'web/pages/__mocks__/current-settings';
import PoliciesPage, {ToolBarIcons} from 'web/pages/policies/ListPage';
import {entitiesLoadingActions} from 'web/store/entities/audits';
import {setUsername} from 'web/store/usersettings/actions';
import {defaultFilterLoadingActions} from 'web/store/usersettings/defaultfilters/actions';
import {loadingActions} from 'web/store/usersettings/defaults/actions';

const policy = Policy.fromElement({
  _id: '12345',
  name: 'foo',
  comment: 'bar',
  creation_time: '2019-07-16T06:31:29Z',
  modification_time: '2019-07-16T06:44:55Z',
  owner: {name: 'admin'},
  writable: '1',
  in_use: '0',
  usage_type: 'policy',
  permissions: {permission: [{name: 'everything'}]},
  scanner: {name: 'scanner', type: '42'},
  tasks: {
    task: [
      {id: '1234', name: 'audit1'},
      {id: '5678', name: 'audit2'},
    ],
  },
});

const caps = new Capabilities(['everything']);
const wrongCaps = new Capabilities(['get_config']);

const reloadInterval = 1;
const manualUrl = 'test/';

const currentSettings = testing
  .fn()
  .mockResolvedValue(currentSettingsDefaultResponse);

const getSetting = testing.fn().mockResolvedValue({filter: null});

const getFilters = testing.fn().mockReturnValue(
  Promise.resolve({
    data: [],
    meta: {
      filter: Filter.fromString(),
      counts: new CollectionCounts(),
    },
  }),
);

const getPolicies = testing.fn().mockResolvedValue({
  data: [policy],
  meta: {
    filter: Filter.fromString(),
    counts: new CollectionCounts(),
  },
});

describe('PoliciesPage tests', () => {
  test('should render full PoliciesPage', async () => {
    const gmp = {
      policies: {
        get: getPolicies,
      },
      filters: {
        get: getFilters,
      },
      reloadInterval,
      settings: {manualUrl},
      user: {currentSettings, getSetting},
    };

    const {render, store} = rendererWith({
      gmp,
      capabilities: true,
      store: true,
      router: true,
    });

    store.dispatch(setUsername('admin'));

    const defaultSettingFilter = Filter.fromString('foo=bar');
    store.dispatch(loadingActions.success({rowsperpage: {value: '2'}}));
    store.dispatch(
      defaultFilterLoadingActions.success('policy', defaultSettingFilter),
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
      entitiesLoadingActions.success([policy], filter, loadedFilter, counts),
    );

    const {container} = render(<PoliciesPage />);

    await wait();

    expect(container).toBeVisible();
  });

  test('should call commands for bulk actions', async () => {
    const deleteByFilter = testing.fn().mockResolvedValue({
      foo: 'bar',
    });

    const exportByFilter = testing.fn().mockResolvedValue({
      foo: 'bar',
    });

    const gmp = {
      policies: {
        get: getPolicies,
        deleteByFilter,
        exportByFilter,
      },
      filters: {
        get: getFilters,
      },
      reloadInterval,
      settings: {manualUrl},
      user: {currentSettings, getSetting: getSetting},
    };

    const {render, store} = rendererWith({
      gmp,
      capabilities: true,
      store: true,
      router: true,
    });

    store.dispatch(setUsername('admin'));

    const defaultSettingFilter = Filter.fromString('foo=bar');
    store.dispatch(loadingActions.success({rowsperpage: {value: '2'}}));
    store.dispatch(
      defaultFilterLoadingActions.success('policy', defaultSettingFilter),
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
      entitiesLoadingActions.success([policy], filter, loadedFilter, counts),
    );

    render(<PoliciesPage />);

    await wait();

    const exportIcon = screen.getAllByTitle('Export page contents')[0];
    fireEvent.click(exportIcon);
    expect(exportByFilter).toHaveBeenCalled();

    const deleteIcon = screen.getAllByTitle(
      'Move page contents to trashcan',
    )[0];
    fireEvent.click(deleteIcon);
    testBulkTrashcanDialog(undefined, deleteByFilter);
  });
});

describe('PoliciesPage ToolBarIcons test', () => {
  test('should render', () => {
    const handlePolicyCreateClick = testing.fn();
    const handlePolicyImportClick = testing.fn();

    const gmp = {settings: {manualUrl}};

    const {render} = rendererWith({
      gmp,
      capabilities: caps,
      router: true,
    });

    const {element} = render(
      <ToolBarIcons
        onPolicyCreateClick={handlePolicyCreateClick}
        onPolicyImportClick={handlePolicyImportClick}
      />,
    );
    expect(element).toBeVisible();

    const links = element.querySelectorAll('a');

    const helpIcon = screen.getByTestId('help-icon');
    expect(helpIcon).toHaveAttribute('title', 'Help: Policies');
    expect(links[0]).toHaveAttribute(
      'href',
      'test/en/compliance-and-special-scans.html#configuring-and-managing-policies',
    );
  });

  test('should call click handlers', () => {
    const handlePolicyCreateClick = testing.fn();
    const handlePolicyImportClick = testing.fn();

    const gmp = {settings: {manualUrl}};

    const {render} = rendererWith({
      gmp,
      capabilities: caps,
      router: true,
    });

    render(
      <ToolBarIcons
        onPolicyCreateClick={handlePolicyCreateClick}
        onPolicyImportClick={handlePolicyImportClick}
      />,
    );

    const newIcon = screen.getByTestId('new-icon');
    expect(newIcon).toHaveAttribute('title', 'New Policy');
    fireEvent.click(newIcon);
    expect(handlePolicyCreateClick).toHaveBeenCalled();

    const importIcon = screen.getByTestId('upload-icon');
    expect(importIcon).toHaveAttribute('title', 'Import Policy');
    fireEvent.click(importIcon);
    expect(handlePolicyImportClick).toHaveBeenCalled();
  });

  test('should not show icons if user does not have the right permissions', () => {
    const handlePolicyCreateClick = testing.fn();
    const handlePolicyImportClick = testing.fn();

    const gmp = {settings: {manualUrl}};

    const {render} = rendererWith({
      gmp,
      capabilities: wrongCaps,
      router: true,
    });

    render(
      <ToolBarIcons
        onPolicyCreateClick={handlePolicyCreateClick}
        onPolicyImportClick={handlePolicyImportClick}
      />,
    );

    const newIcon = screen.queryByTestId('new-icon');
    expect(newIcon).toBeNull();
    const importIcon = screen.queryByTestId('upload-icon');
    expect(importIcon).toBeNull();
  });
});
