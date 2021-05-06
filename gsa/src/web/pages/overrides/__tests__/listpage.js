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

import Capabilities from 'gmp/capabilities/capabilities';
import CollectionCounts from 'gmp/collection/collectioncounts';

import {setLocale} from 'gmp/locale/lang';

import Filter from 'gmp/models/filter';
import Override from 'gmp/models/override';

import {
  createDeleteOverridesByFilterQueryMock,
  createDeleteOverridesByIdsQueryMock,
  createExportOverridesByFilterQueryMock,
  createExportOverridesByIdsQueryMock,
  createGetOverridesQueryMock,
} from 'web/graphql/__mocks__/overrides';

import {setTimezone, setUsername} from 'web/store/usersettings/actions';
import {defaultFilterLoadingActions} from 'web/store/usersettings/defaultfilters/actions';
import {loadingActions} from 'web/store/usersettings/defaults/actions';

import {rendererWith, fireEvent, screen, wait} from 'web/utils/testing';

import OverridesPage, {ToolBarIcons} from '../listpage';

setLocale('en');

window.URL.createObjectURL = jest.fn();

const override = Override.fromObject({
  active: true,
  id: '6d00d22f-551b-4fbe-8215-d8615eff73ea',
  endTime: '2023-03-13T11:35:20Z',
  hosts: ['127.0.0.1'],
  modificationTime: '2021-01-04T11:54:12Z',
  nvt: {
    id: '123',
    name: 'foo nvt',
  },
  owner: 'admin',
  permissions: [{name: 'Everything'}],
  port: '666',
  result: {
    id: '789',
    name: 'foo result',
  },
  severity: '0.1',
  newSeverity: '-1', // false positive
  task: {
    id: '456',
    name: 'foo task',
  },
  text: 'override text',
});

const caps = new Capabilities(['everything']);
const wrongCaps = new Capabilities(['get_config']);

const reloadInterval = -1;
const manualUrl = 'test/';

let currentSettings;
let getAggregates;
let getDashboardSetting;
let getFilters;
let getOverrides;
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

  getOverrides = jest.fn().mockResolvedValue({
    data: [override],
    meta: {
      filter: Filter.fromString(),
      counts: new CollectionCounts(),
    },
  });

  renewSession = jest.fn().mockResolvedValue({
    foo: 'bar',
  });
});

describe('OverridesPage tests', () => {
  test('should render full OverridesPage', async () => {
    const gmp = {
      dashboard: {
        getSetting: getDashboardSetting,
      },
      overrides: {
        get: getOverrides,
        getActiveDaysAggregates: getAggregates,
        getCreatedAggregates: getAggregates,
        getWordCountsAggregates: getAggregates,
      },
      filters: {
        get: getFilters,
      },
      settings: {manualUrl, reloadInterval},
      user: {currentSettings, getSetting},
    };

    const [mock, resultFunc] = createGetOverridesQueryMock({
      filterString: 'rows=2',
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

    const defaultSettingfilter = Filter.fromString('rows=2');
    store.dispatch(loadingActions.success({rowsperpage: {value: '2'}}));
    store.dispatch(
      defaultFilterLoadingActions.success('override', defaultSettingfilter),
    );

    const {baseElement} = render(<OverridesPage />);

    await wait();

    expect(resultFunc).toHaveBeenCalled();

    const display = screen.getAllByTestId('grid-item');
    const inputs = baseElement.querySelectorAll('input');
    const selects = screen.getAllByTestId('select-selected-value');

    // Toolbar Icons
    expect(screen.getAllByTitle('Help: Overrides')[0]).toBeInTheDocument();
    expect(screen.getAllByTitle('New Override')[0]).toBeInTheDocument();

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
    expect(display[0]).toHaveTextContent('Overrides by Active Days (Total: 0)');
    expect(display[1]).toHaveTextContent('Overrides by Creation Time');
    expect(display[2]).toHaveTextContent('Overrides Text Word Cloud');

    // Table
    const header = baseElement.querySelectorAll('th');

    expect(header[0]).toHaveTextContent('Text');
    expect(header[1]).toHaveTextContent('NVT');
    expect(header[2]).toHaveTextContent('Hosts');
    expect(header[3]).toHaveTextContent('Location');
    expect(header[4]).toHaveTextContent('From');
    expect(header[5]).toHaveTextContent('To');
    expect(header[6]).toHaveTextContent('Active');
    expect(header[7]).toHaveTextContent('Actions');

    const row = baseElement.querySelectorAll('tr');

    expect(row[1]).toHaveTextContent('override text');
    expect(row[1]).toHaveTextContent('foo nvt');
    expect(row[1]).toHaveTextContent('127.0.0.1');
    expect(row[1]).toHaveTextContent('66/tcp');
    expect(row[1]).toHaveTextContent('> 0.9');
    expect(row[1]).toHaveTextContent('5.0 (Medium)');
    expect(row[1]).toHaveTextContent('yes');

    expect(
      screen.getAllByTitle('Move Override to trashcan')[0],
    ).toBeInTheDocument();
    expect(screen.getAllByTitle('Edit Override')[0]).toBeInTheDocument();
    expect(screen.getAllByTitle('Clone Override')[0]).toBeInTheDocument();
    expect(screen.getAllByTitle('Export Override')[0]).toBeInTheDocument();
  });

  test.skip('should allow to bulk action on page contents', async () => {
    const gmp = {
      dashboard: {
        getSetting: getDashboardSetting,
      },
      overrides: {
        get: getOverrides,
        getActiveDaysAggregates: getAggregates,
        getCreatedAggregates: getAggregates,
        getWordCountsAggregates: getAggregates,
      },
      filters: {
        get: getFilters,
      },
      settings: {manualUrl, reloadInterval},
      user: {renewSession, currentSettings, getSetting: getSetting},
    };

    const [mock, resultFunc] = createGetOverridesQueryMock({
      filterString: 'foo=bar rows=2',
      first: 2,
    });

    const [exportMock, exportResult] = createExportOverridesByIdsQueryMock([
      '123',
    ]);
    const [deleteMock, deleteResult] = createDeleteOverridesByIdsQueryMock([
      '123',
    ]);

    const {render, store} = rendererWith({
      gmp,
      capabilities: true,
      store: true,
      router: true,
      queryMocks: [mock, exportMock, deleteMock],
    });

    store.dispatch(setTimezone('CET'));
    store.dispatch(setUsername('admin'));

    const defaultSettingfilter = Filter.fromString('foo=bar');
    store.dispatch(loadingActions.success({rowsperpage: {value: '2'}}));
    store.dispatch(
      defaultFilterLoadingActions.success('override', defaultSettingfilter),
    );

    render(<OverridesPage />);

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

  test.skip('should allow to bulk action on selected overrides', async () => {
    const gmp = {
      dashboard: {
        getSetting: getDashboardSetting,
      },
      overrides: {
        get: getOverrides,
        getActiveDaysAggregates: getAggregates,
        getCreatedAggregates: getAggregates,
        getWordCountsAggregates: getAggregates,
      },
      filters: {
        get: getFilters,
      },
      settings: {manualUrl, reloadInterval},
      user: {renewSession, currentSettings, getSetting: getSetting},
    };

    const [mock, resultFunc] = createGetOverridesQueryMock({
      filterString: 'foo=bar rows=2',
      first: 2,
    });

    const [exportMock, exportResult] = createExportOverridesByIdsQueryMock([
      '123',
    ]);
    const [deleteMock, deleteResult] = createDeleteOverridesByIdsQueryMock([
      '123',
    ]);

    const {render, store} = rendererWith({
      gmp,
      capabilities: true,
      store: true,
      router: true,
      queryMocks: [mock, exportMock, deleteMock],
    });

    store.dispatch(setTimezone('CET'));
    store.dispatch(setUsername('admin'));

    const defaultSettingfilter = Filter.fromString('foo=bar');
    store.dispatch(loadingActions.success({rowsperpage: {value: '2'}}));
    store.dispatch(
      defaultFilterLoadingActions.success('override', defaultSettingfilter),
    );

    const {element} = render(<OverridesPage />);

    await wait();

    expect(resultFunc).toHaveBeenCalled();

    const selectFields = screen.getAllByTestId('select-open-button');
    fireEvent.click(selectFields[1]);

    const selectItems = screen.getAllByTestId('select-item');
    fireEvent.click(selectItems[1]);

    const selected = screen.getAllByTestId('select-selected-value');
    expect(selected[1]).toHaveTextContent('Apply to selection');

    const inputs = element.querySelectorAll('input');

    // select a override
    fireEvent.click(inputs[1]);
    await wait();

    // export selected override
    const exportIcon = screen.getAllByTitle('Export selection');

    expect(exportIcon[0]).toBeInTheDocument();
    fireEvent.click(exportIcon[0]);

    await wait();

    expect(exportResult).toHaveBeenCalled();

    // move selected override to trashcan
    const deleteIcon = screen.getAllByTitle('Move selection to trashcan');

    expect(deleteIcon[0]).toBeInTheDocument();
    fireEvent.click(deleteIcon[0]);

    await wait();

    expect(deleteResult).toHaveBeenCalled();
  });

  test('should allow to bulk action on filtered overrides', async () => {
    const gmp = {
      dashboard: {
        getSetting: getDashboardSetting,
      },
      overrides: {
        get: getOverrides,
        getActiveDaysAggregates: getAggregates,
        getCreatedAggregates: getAggregates,
        getWordCountsAggregates: getAggregates,
      },
      filters: {
        get: getFilters,
      },
      settings: {manualUrl, reloadInterval},
      user: {renewSession, currentSettings, getSetting: getSetting},
    };

    const [mock, resultFunc] = createGetOverridesQueryMock({
      filterString: 'foo=bar rows=2',
      first: 2,
    });

    const [exportMock, exportResult] = createExportOverridesByFilterQueryMock(
      'foo=bar rows=-1 first=1',
    );
    const [deleteMock, deleteResult] = createDeleteOverridesByFilterQueryMock(
      'foo=bar rows=-1 first=1',
    );

    const {render, store} = rendererWith({
      gmp,
      capabilities: true,
      store: true,
      router: true,
      queryMocks: [mock, exportMock, deleteMock],
    });

    store.dispatch(setTimezone('CET'));
    store.dispatch(setUsername('admin'));

    const defaultSettingfilter = Filter.fromString('foo=bar');
    store.dispatch(loadingActions.success({rowsperpage: {value: '2'}}));
    store.dispatch(
      defaultFilterLoadingActions.success('override', defaultSettingfilter),
    );

    render(<OverridesPage />);

    await wait();

    expect(resultFunc).toHaveBeenCalled();

    const selectFields = screen.getAllByTestId('select-open-button');
    fireEvent.click(selectFields[1]);

    const selectItems = screen.getAllByTestId('select-item');
    fireEvent.click(selectItems[2]);

    await wait();

    const selected = screen.getAllByTestId('select-selected-value');
    expect(selected[1]).toHaveTextContent('Apply to all filtered');

    // export all filtered overrides
    const exportIcon = screen.getAllByTitle('Export all filtered');

    expect(exportIcon[0]).toBeInTheDocument();
    fireEvent.click(exportIcon[0]);

    await wait();

    expect(exportResult).toHaveBeenCalled();

    // move all filtered overrides to trashcan
    const deleteIcon = screen.getAllByTitle('Move all filtered to trashcan');

    expect(deleteIcon[0]).toBeInTheDocument();
    fireEvent.click(deleteIcon[0]);

    await wait();

    expect(deleteResult).toHaveBeenCalled();
  });
});

describe('OverridesPage ToolBarIcons test', () => {
  test('should render', () => {
    const handleOverrideCreateClick = jest.fn();

    const gmp = {
      settings: {manualUrl},
    };

    const {render} = rendererWith({
      gmp,
      capabilities: caps,
      router: true,
    });

    const {element} = render(
      <ToolBarIcons onOverrideCreateClick={handleOverrideCreateClick} />,
    );

    const links = element.querySelectorAll('a');

    expect(screen.getAllByTitle('Help: Overrides')[0]).toBeInTheDocument();
    expect(links[0]).toHaveAttribute(
      'href',
      'test/en/reports.html#managing-overrides',
    );
  });

  test('should call click handlers', () => {
    const handleOverrideCreateClick = jest.fn();

    const gmp = {
      settings: {manualUrl},
    };

    const {render} = rendererWith({
      gmp,
      capabilities: caps,
      router: true,
    });

    render(<ToolBarIcons onOverrideCreateClick={handleOverrideCreateClick} />);

    const newIcon = screen.getAllByTitle('New Override');

    expect(newIcon[0]).toBeInTheDocument();

    fireEvent.click(newIcon[0]);
    expect(handleOverrideCreateClick).toHaveBeenCalled();
  });

  test('should not show icons if user does not have the right permissions', () => {
    const handleOverrideCreateClick = jest.fn();

    const gmp = {
      settings: {manualUrl},
    };

    const {render} = rendererWith({
      gmp,
      capabilities: wrongCaps,
      router: true,
    });

    const {queryAllByTestId} = render(
      <ToolBarIcons onOverrideCreateClick={handleOverrideCreateClick} />,
    );

    const icons = queryAllByTestId('svg-icon'); // this test is probably approppriate to keep in the old format
    expect(icons.length).toBe(1);
    expect(icons[0]).toHaveAttribute('title', 'Help: Overrides');
  });
});
