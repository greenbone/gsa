/* Copyright (C) 2021 Greenbone Networks GmbH
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

import CollectionCounts from 'gmp/collection/collectioncounts';

import {setLocale} from 'gmp/locale/lang';

import Filter from 'gmp/models/filter';
import NVT from 'gmp/models/nvt';

import {entitiesLoadingActions} from 'web/store/entities/nvts';

import {
  nvtEntity,
  createExportNvtsByIdsQueryMock,
  createExportNvtsByFilterQueryMock,
  createGetNvtsQueryMock,
} from 'web/graphql/__mocks__/nvts';

import {setTimezone, setUsername} from 'web/store/usersettings/actions';
import {defaultFilterLoadingActions} from 'web/store/usersettings/defaultfilters/actions';
import {loadingActions} from 'web/store/usersettings/defaults/actions';

import {rendererWith, fireEvent, screen, wait} from 'web/utils/testing';

import NvtsPage, {ToolBarIcons} from '../listpage';

setLocale('en');

window.URL.createObjectURL = jest.fn();

const nvtObject = NVT.fromObject(nvtEntity);

const reloadInterval = -1;
const manualUrl = 'test/';

let currentSettings;
let getAggregates;
let getDashboardSetting;
let getFilters;
let getSetting;
let renewSession;

beforeEach(() => {
  currentSettings = jest.fn().mockResolvedValue({
    foo: 'bar',
  });

  getSetting = jest.fn().mockResolvedValue({
    filter: null,
  });

  getDashboardSetting = jest.fn().mockResolvedValue({
    data: [],
    meta: {
      filter: Filter.fromString(),
      counts: new CollectionCounts(),
    },
  });

  getAggregates = jest.fn().mockResolvedValue({
    data: [],
    meta: {
      filter: Filter.fromString(),
      counts: new CollectionCounts(),
    },
  });

  getFilters = jest.fn().mockReturnValue(
    Promise.resolve({
      data: [],
      meta: {
        filter: Filter.fromString(),
        counts: new CollectionCounts(),
      },
    }),
  );

  renewSession = jest.fn().mockResolvedValue({
    foo: 'bar',
  });
});

describe('NvtsPage tests', () => {
  test('should render full NvtsPage', async () => {
    const gmp = {
      dashboard: {
        getSetting: getDashboardSetting,
      },
      nvts: {
        getFamilyAggregates: getAggregates,
        getSeverityAggregates: getAggregates,
        getCreatedAggregates: getAggregates,
      },
      filters: {
        get: getFilters,
      },
      settings: {manualUrl, reloadInterval},
      user: {currentSettings, getSetting},
    };

    const filterString = 'foo=bar rows=2';
    const defaultSettingfilter = Filter.fromString(filterString);
    const [mock, resultFunc] = createGetNvtsQueryMock({
      filterString,
      first: 2,
    });

    const {render, store} = rendererWith({
      gmp,
      capabilities: true,
      store: true,
      router: true,
      queryMocks: [mock],
    });

    store.dispatch(setTimezone('CET'));
    store.dispatch(setUsername('admin'));

    store.dispatch(loadingActions.success({rowsperpage: {value: '2'}}));
    store.dispatch(
      defaultFilterLoadingActions.success('nvt', defaultSettingfilter),
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
      entitiesLoadingActions.success([nvtObject], filter, loadedFilter, counts),
    );

    const {baseElement} = render(<NvtsPage />);

    await wait();

    expect(resultFunc).toHaveBeenCalled();

    const display = screen.getAllByTestId('grid-item');
    const inputs = baseElement.querySelectorAll('input');
    const selects = screen.getAllByTestId('select-selected-value');

    // Toolbar Icons
    expect(screen.getAllByTitle('Help: NVTs')[0]).toBeInTheDocument();

    // Powerfilter
    expect(inputs[0]).toHaveAttribute('name', 'userFilterString');
    expect(screen.getAllByTitle('Update Filter')[0]).toBeInTheDocument();
    expect(screen.getAllByTitle('Remove Filter')[0]).toBeInTheDocument();
    expect(
      screen.getAllByTitle('Reset to Default Filter')[0],
    ).toBeInTheDocument();
    expect(screen.getAllByTitle('Help: Powerfilter')[0]).toBeInTheDocument();
    expect(screen.getAllByTitle('Edit Filter')[0]).toBeInTheDocument();
    expect(selects[0]).toHaveAttribute('title', 'Loaded filter');
    expect(selects[0]).toHaveTextContent('--');

    // Dashboard
    expect(
      screen.getAllByTitle('Add new Dashboard Display')[0],
    ).toBeInTheDocument();
    expect(screen.getAllByTitle('Reset to Defaults')[0]).toBeInTheDocument();
    expect(display[0]).toHaveTextContent('NVTs by Severity Class (Total: 0)');
    expect(display[1]).toHaveTextContent('NVTs by Creation Time');
    expect(display[2]).toHaveTextContent('NVTs by Family (Total: 0)');

    // Table
    const header = baseElement.querySelectorAll('th');

    expect(header[0]).toHaveTextContent('Name');
    expect(header[1]).toHaveTextContent('Family');
    expect(header[2]).toHaveTextContent('Created');
    expect(header[3]).toHaveTextContent('Modified');
    expect(header[4]).toHaveTextContent('CVE');
    expect(header[5]).toHaveTextContent('solution_type.svg');
    expect(header[6]).toHaveTextContent('Severity');
    expect(header[7]).toHaveTextContent('QoD');

    const row = baseElement.querySelectorAll('tr');

    expect(row[1]).toHaveTextContent('12345');
    expect(row[1]).toHaveTextContent('bar');
    expect(row[1]).toHaveTextContent('Mon, Jun 24, 2019 1:55 PM CEST');
    expect(row[1]).toHaveTextContent('Mon, Jun 24, 2019 12:12 PM CEST');
    expect(row[1]).toHaveTextContent('CVE-2020-1234');
    expect(row[1]).toHaveTextContent('CVE-2020-5678');
    expect(row[1]).toHaveTextContent('st_vendorfix.svg');
    expect(row[1]).toHaveTextContent('80 %');
  });

  test('should allow to bulk action on page contents', async () => {
    const gmp = {
      dashboard: {
        getSetting: getDashboardSetting,
      },
      nvts: {
        getFamilyAggregates: getAggregates,
        getSeverityAggregates: getAggregates,
        getCreatedAggregates: getAggregates,
      },
      filters: {
        get: getFilters,
      },
      settings: {manualUrl, reloadInterval},
      user: {renewSession, currentSettings, getSetting: getSetting},
    };
    const filterString = 'foo=bar rows=2';
    const defaultSettingfilter = Filter.fromString(filterString);

    const [mock, resultFunc] = createGetNvtsQueryMock({
      filterString,
      first: 2,
    });

    const [
      exportByIdsMock,
      exportByIdsResult,
    ] = createExportNvtsByIdsQueryMock(['12345']);

    const {render, store} = rendererWith({
      gmp,
      capabilities: true,
      store: true,
      router: true,
      queryMocks: [mock, exportByIdsMock],
    });

    store.dispatch(setTimezone('CET'));
    store.dispatch(setUsername('admin'));

    store.dispatch(loadingActions.success({rowsperpage: {value: '2'}}));
    store.dispatch(
      defaultFilterLoadingActions.success('nvt', defaultSettingfilter),
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
      entitiesLoadingActions.success([nvtObject], filter, loadedFilter, counts),
    );

    render(<NvtsPage />);

    await wait();

    expect(resultFunc).toHaveBeenCalled();

    // export page contents
    const exportIcon = screen.getAllByTitle('Export page contents');

    expect(exportIcon[0]).toBeInTheDocument();
    fireEvent.click(exportIcon[0]);

    await wait();

    expect(exportByIdsResult).toHaveBeenCalled();
  });

  test('should allow to bulk action on selected nvts', async () => {
    const gmp = {
      dashboard: {
        getSetting: getDashboardSetting,
      },
      nvts: {
        getFamilyAggregates: getAggregates,
        getSeverityAggregates: getAggregates,
        getCreatedAggregates: getAggregates,
      },
      filters: {
        get: getFilters,
      },
      settings: {manualUrl, reloadInterval},
      user: {renewSession, currentSettings, getSetting: getSetting},
    };

    const filterString = 'foo=bar rows=2';
    const defaultSettingfilter = Filter.fromString(filterString);

    const [mock, resultFunc] = createGetNvtsQueryMock({
      filterString,
      first: 2,
    });

    const [
      exportByIdsMock,
      exportByIdsResult,
    ] = createExportNvtsByIdsQueryMock(['12345']);

    const {render, store} = rendererWith({
      gmp,
      capabilities: true,
      store: true,
      router: true,
      queryMocks: [mock, exportByIdsMock],
    });

    store.dispatch(setTimezone('CET'));
    store.dispatch(setUsername('admin'));

    store.dispatch(loadingActions.success({rowsperpage: {value: '2'}}));
    store.dispatch(
      defaultFilterLoadingActions.success('nvt', defaultSettingfilter),
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
      entitiesLoadingActions.success([nvtObject], filter, loadedFilter, counts),
    );

    const {baseElement} = render(<NvtsPage />);

    await wait();

    expect(resultFunc).toHaveBeenCalled();

    const selectFields = screen.getAllByTestId('select-open-button');
    fireEvent.click(selectFields[1]);

    const selectItems = screen.getAllByTestId('select-item');
    fireEvent.click(selectItems[1]);

    const selected = screen.getAllByTestId('select-selected-value');
    expect(selected[1]).toHaveTextContent('Apply to selection');

    const inputs = baseElement.querySelectorAll('input');

    // select a nvt
    fireEvent.click(inputs[1]);
    await wait();

    // export selected nvt
    const exportIcon = screen.getAllByTitle('Export selection');

    expect(exportIcon[0]).toBeInTheDocument();
    fireEvent.click(exportIcon[0]);

    await wait();

    expect(exportByIdsResult).toHaveBeenCalled();
  });

  test('should allow to bulk action on filtered nvts', async () => {
    const gmp = {
      dashboard: {
        getSetting: getDashboardSetting,
      },
      nvts: {
        getFamilyAggregates: getAggregates,
        getSeverityAggregates: getAggregates,
        getCreatedAggregates: getAggregates,
      },
      filters: {
        get: getFilters,
      },
      settings: {manualUrl, reloadInterval},
      user: {renewSession, currentSettings, getSetting: getSetting},
    };
    const filterString = 'foo=bar rows=2';
    const defaultSettingfilter = Filter.fromString(filterString);
    const filter = Filter.fromString('first=1 rows=10');
    const loadedFilter = Filter.fromString('first=1 rows=10');

    const [mock, resultFunc] = createGetNvtsQueryMock({
      filterString,
      first: 2,
    });

    const [
      exportByFilterMock,
      exportByFilterResult,
    ] = createExportNvtsByFilterQueryMock('foo=bar rows=-1 first=1');

    const {render, store} = rendererWith({
      gmp,
      capabilities: true,
      store: true,
      router: true,
      queryMocks: [mock, exportByFilterMock],
    });

    store.dispatch(setTimezone('CET'));
    store.dispatch(setUsername('admin'));

    store.dispatch(loadingActions.success({rowsperpage: {value: '2'}}));
    store.dispatch(
      defaultFilterLoadingActions.success('nvt', defaultSettingfilter),
    );

    const counts = new CollectionCounts({
      first: 1,
      all: 1,
      filtered: 1,
      length: 1,
      rows: 10,
    });

    store.dispatch(
      entitiesLoadingActions.success([nvtObject], filter, loadedFilter, counts),
    );

    render(<NvtsPage />);

    await wait();

    expect(resultFunc).toHaveBeenCalled();

    const selectFields = screen.getAllByTestId('select-open-button');
    fireEvent.click(selectFields[1]);

    const selectItems = screen.getAllByTestId('select-item');
    fireEvent.click(selectItems[2]);

    await wait();

    const selected = screen.getAllByTestId('select-selected-value');
    expect(selected[1]).toHaveTextContent('Apply to all filtered');

    // export all filtered nvts
    const exportIcon = screen.getAllByTitle('Export all filtered');

    expect(exportIcon[0]).toBeInTheDocument();
    fireEvent.click(exportIcon[0]);

    await wait();

    expect(exportByFilterResult).toHaveBeenCalled();
  });
});

describe('NvtsPage ToolBarIcons test', () => {
  test('should render', () => {
    const gmp = {
      settings: {manualUrl},
    };

    const {render} = rendererWith({
      gmp,
      router: true,
    });

    const {baseElement} = render(<ToolBarIcons />);

    const links = baseElement.querySelectorAll('a');
    expect(screen.getAllByTitle('Help: NVTs')[0]).toBeInTheDocument();
    expect(links[0]).toHaveAttribute(
      'href',
      'test/en/managing-secinfo.html#network-vulnerability-tests-nvt',
    );
  });
});
