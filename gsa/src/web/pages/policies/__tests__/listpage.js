/* Copyright (C) 2019-2020 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License
 * as published by the Free Software Foundation, either version 3
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */
import React from 'react';

import {setLocale} from 'gmp/locale/lang';

import Capabilities from 'gmp/capabilities/capabilities';
import CollectionCounts from 'gmp/collection/collectioncounts';

import Filter from 'gmp/models/filter';
import Policy from 'gmp/models/policy';
import {OPENVAS_SCAN_CONFIG_TYPE} from 'gmp/models/scanconfig';

import {
  createDeletePoliciesByFilterQueryMock,
  createDeletePoliciesByIdsQueryMock,
  createExportPoliciesByFilterQueryMock,
  createExportPoliciesByIdsQueryMock,
  createGetPoliciesQueryMock,
} from 'web/graphql/__mocks__/policies';

import {setUsername} from 'web/store/usersettings/actions';

import {entitiesLoadingActions} from 'web/store/entities/audits';
import {loadingActions} from 'web/store/usersettings/defaults/actions';
import {defaultFilterLoadingActions} from 'web/store/usersettings/defaultfilters/actions';

import {rendererWith, screen, fireEvent, wait} from 'web/utils/testing';

import PoliciesPage, {ToolBarIcons} from '../listpage';

setLocale('en');

window.URL.createObjectURL = jest.fn();

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
  type: OPENVAS_SCAN_CONFIG_TYPE,
  tasks: {
    task: [
      {id: '1234', name: 'audit1'},
      {id: '5678', name: 'audit2'},
    ],
  },
});

const caps = new Capabilities(['everything']);
const wrongCaps = new Capabilities(['get_config']);

const reloadInterval = -1;
const manualUrl = 'test/';

let currentSettings;
let getFilters;
let getSetting;
let getPolicies;

beforeEach(() => {
  currentSettings = jest.fn().mockResolvedValue({foo: 'bar'});

  getSetting = jest.fn().mockResolvedValue({filter: null});

  getFilters = jest.fn().mockReturnValue(
    Promise.resolve({
      data: [],
      meta: {
        filter: Filter.fromString(),
        counts: new CollectionCounts(),
      },
    }),
  );

  getPolicies = jest.fn().mockResolvedValue({
    data: [policy],
    meta: {
      filter: Filter.fromString(),
      counts: new CollectionCounts(),
    },
  });
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
      settings: {manualUrl, reloadInterval},
      user: {currentSettings, getSetting},
    };

    const [mock, resultFunc] = createGetPoliciesQueryMock({
      filterString: 'foo=bar rows=2',
      first: 2,
    });

    const {render, store} = rendererWith({
      gmp,
      capabilities: true,
      store: true,
      router: true,
      queryMocks: [mock],
    });

    store.dispatch(setUsername('admin'));

    const defaultSettingfilter = Filter.fromString('foo=bar');
    store.dispatch(loadingActions.success({rowsperpage: {value: '2'}}));
    store.dispatch(
      defaultFilterLoadingActions.success('policy', defaultSettingfilter),
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

    const {baseElement} = render(<PoliciesPage />);

    await wait();

    expect(resultFunc).toHaveBeenCalled();

    const inputs = baseElement.querySelectorAll('input');
    const selects = screen.getAllByTestId('select-selected-value');

    // Toolbar Icons
    expect(screen.getAllByTitle('Help: Policies')[0]).toBeInTheDocument();
    expect(screen.getAllByTitle('New Policy')[0]).toBeInTheDocument();

    // Powerfilter
    expect(inputs[0]).toHaveAttribute('name', 'userFilterString');
    expect(screen.getAllByTitle('Update Filter')[0]).toBeInTheDocument();
    expect(screen.getAllByTitle('Remove Filter')[0]).toBeInTheDocument();
    expect(
      screen.getAllByTitle('Reset to Default Filter')[0],
    ).toBeInTheDocument();
    expect(screen.getAllByTitle('Help: Powerfilter')[0]).toBeInTheDocument();
    expect(selects[0]).toHaveAttribute('title', 'Loaded filter');
    expect(selects[0]).toHaveTextContent('--');

    // Table
    const header = baseElement.querySelectorAll('th');

    expect(header[0]).toHaveTextContent('Name');
    expect(header[1]).toHaveTextContent('Actions');
    const row = baseElement.querySelectorAll('tr');

    expect(row[1]).toHaveTextContent('unnamed policy');
    expect(row[1]).toHaveTextContent('(some policy description)');

    expect(
      screen.getAllByTitle('Move Policy to trashcan')[0],
    ).toBeInTheDocument();
    expect(screen.getAllByTitle('Edit Policy')[0]).toBeInTheDocument();
    expect(screen.getAllByTitle('Clone Policy')[0]).toBeInTheDocument();
    expect(screen.getAllByTitle('Export Policy')[0]).toBeInTheDocument();
    expect(
      screen.getAllByTitle('Create Audit from Policy')[0],
    ).toBeInTheDocument();
  });

  test('should allow to bulk action on page contents', async () => {
    const gmp = {
      policies: {
        get: getPolicies,
      },
      filters: {
        get: getFilters,
      },
      settings: {manualUrl, reloadInterval},
      user: {currentSettings, getSetting: getSetting},
    };

    const [mock, resultFunc] = createGetPoliciesQueryMock({
      filterString: 'foo=bar rows=2',
      first: 2,
    });

    const [exportMock, exportResult] = createExportPoliciesByIdsQueryMock([
      '234',
    ]);
    const [deleteMock, deleteResult] = createDeletePoliciesByIdsQueryMock([
      '234',
    ]);

    const {render, store} = rendererWith({
      gmp,
      capabilities: true,
      store: true,
      router: true,
      queryMocks: [mock, exportMock, deleteMock],
    });

    store.dispatch(setUsername('admin'));

    const defaultSettingfilter = Filter.fromString('foo=bar');
    store.dispatch(loadingActions.success({rowsperpage: {value: '2'}}));
    store.dispatch(
      defaultFilterLoadingActions.success('policy', defaultSettingfilter),
    );

    render(<PoliciesPage />);

    await wait();

    expect(resultFunc).toHaveBeenCalled();
    // export page contents
    const exportIcon = screen.getAllByTitle('Export page contents');

    expect(exportIcon[0]).toBeInTheDocument();
    fireEvent.click(exportIcon[0]);

    await wait();

    expect(exportResult).toHaveBeenCalled();

    // move page contents to trashcan
    const deleteIcon = screen.getAllByTitle('Move page contents to trashcan');

    expect(deleteIcon[0]).toBeInTheDocument();
    fireEvent.click(deleteIcon[0]);

    await wait();

    expect(deleteResult).toHaveBeenCalled();
  });

  test('should allow to bulk action on selected policies', async () => {
    const gmp = {
      policies: {
        get: getPolicies,
      },
      filters: {
        get: getFilters,
      },
      settings: {manualUrl, reloadInterval},
      user: {currentSettings, getSetting: getSetting},
    };

    const [mock, resultFunc] = createGetPoliciesQueryMock({
      filterString: 'foo=bar rows=2',
      first: 2,
    });

    const [exportMock, exportResult] = createExportPoliciesByIdsQueryMock([
      '234',
    ]);
    const [deleteMock, deleteResult] = createDeletePoliciesByIdsQueryMock([
      '234',
    ]);

    const {render, store} = rendererWith({
      gmp,
      capabilities: true,
      store: true,
      router: true,
      queryMocks: [mock, exportMock, deleteMock],
    });

    store.dispatch(setUsername('admin'));

    const defaultSettingfilter = Filter.fromString('foo=bar');
    store.dispatch(loadingActions.success({rowsperpage: {value: '2'}}));
    store.dispatch(
      defaultFilterLoadingActions.success('policy', defaultSettingfilter),
    );

    const {element} = render(<PoliciesPage />);

    await wait();

    expect(resultFunc).toHaveBeenCalled();

    const selectFields = screen.getAllByTestId('select-open-button');
    fireEvent.click(selectFields[1]);

    const selectItems = screen.getAllByTestId('select-item');
    fireEvent.click(selectItems[1]);

    const selected = screen.getAllByTestId('select-selected-value');
    expect(selected[1]).toHaveTextContent('Apply to selection');

    const inputs = element.querySelectorAll('input');

    // select an policy
    fireEvent.click(inputs[1]);
    await wait();

    // export selected policy
    const exportIcon = screen.getAllByTitle('Export selection');

    expect(exportIcon[0]).toBeInTheDocument();
    fireEvent.click(exportIcon[0]);

    await wait();

    expect(exportResult).toHaveBeenCalled();

    // move selected policy to trashcan
    const deleteIcon = screen.getAllByTitle('Move selection to trashcan');

    expect(deleteIcon[0]).toBeInTheDocument();
    fireEvent.click(deleteIcon[0]);

    await wait();

    expect(deleteResult).toHaveBeenCalled();
  });

  test('should allow to bulk action on filtered policies', async () => {
    const gmp = {
      policies: {
        get: getPolicies,
      },
      filters: {
        get: getFilters,
      },
      settings: {manualUrl, reloadInterval},
      user: {currentSettings, getSetting: getSetting},
    };

    const [mock, resultFunc] = createGetPoliciesQueryMock({
      filterString: 'foo=bar rows=2',
      first: 2,
    });

    const [exportMock, exportResult] = createExportPoliciesByFilterQueryMock(
      'foo=bar rows=-1 first=1',
    );
    const [deleteMock, deleteResult] = createDeletePoliciesByFilterQueryMock(
      'foo=bar rows=-1 first=1',
    );

    const {render, store} = rendererWith({
      gmp,
      capabilities: true,
      store: true,
      router: true,
      queryMocks: [mock, exportMock, deleteMock],
    });

    store.dispatch(setUsername('admin'));

    const defaultSettingfilter = Filter.fromString('foo=bar');
    store.dispatch(loadingActions.success({rowsperpage: {value: '2'}}));
    store.dispatch(
      defaultFilterLoadingActions.success('policy', defaultSettingfilter),
    );

    render(<PoliciesPage />);

    await wait();

    expect(resultFunc).toHaveBeenCalled();

    const selectFields = screen.getAllByTestId('select-open-button');
    fireEvent.click(selectFields[1]);

    const selectItems = screen.getAllByTestId('select-item');
    fireEvent.click(selectItems[2]);

    await wait();

    const selected = screen.getAllByTestId('select-selected-value');
    expect(selected[1]).toHaveTextContent('Apply to all filtered');

    // export all filtered policies
    const exportIcon = screen.getAllByTitle('Export all filtered');

    expect(exportIcon[0]).toBeInTheDocument();
    fireEvent.click(exportIcon[0]);

    await wait();

    expect(exportResult).toHaveBeenCalled();

    // move all filtered policies to trashcan
    const deleteIcon = screen.getAllByTitle('Move all filtered to trashcan');

    expect(deleteIcon[0]).toBeInTheDocument();
    fireEvent.click(deleteIcon[0]);

    await wait();

    expect(deleteResult).toHaveBeenCalled();
  });
});

describe('PoliciesPage ToolBarIcons test', () => {
  test('should render', () => {
    const handlePolicyCreateClick = jest.fn();
    const handlePolicyImportClick = jest.fn();
    const renewSession = jest.fn().mockResolvedValue({data: {}});

    const gmp = {settings: {manualUrl}, user: {renewSession}};

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
    expect(element).toMatchSnapshot();

    const links = element.querySelectorAll('a');

    expect(screen.getAllByTitle('Help: Policies')[0]).toBeInTheDocument();

    expect(links[0]).toHaveAttribute(
      'href',
      'test/en/compliance-and-special-scans.html#configuring-and-managing-policies',
    );
  });

  test('should call click handlers', () => {
    const handlePolicyCreateClick = jest.fn();
    const handlePolicyImportClick = jest.fn();

    const renewSession = jest.fn().mockResolvedValue({data: {}});

    const gmp = {settings: {manualUrl}, user: {renewSession}};

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

    const newIcon = screen.getAllByTitle('New Policy');
    expect(newIcon[0]).toBeInTheDocument();

    fireEvent.click(newIcon[0]);
    expect(handlePolicyCreateClick).toHaveBeenCalled();

    const importIcon = screen.getAllByTitle('Import Policy');
    expect(importIcon[0]).toBeInTheDocument();

    fireEvent.click(importIcon[0]);
    expect(handlePolicyImportClick).toHaveBeenCalled();
  });

  test('should not show icons if user does not have the right permissions', () => {
    const handlePolicyCreateClick = jest.fn();
    const handlePolicyImportClick = jest.fn();

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

    expect(screen.getAllByTitle('Help: Policies')[0]).toBeInTheDocument();
  });
});
