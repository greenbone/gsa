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
import Host from 'gmp/models/host';

import {entitiesLoadingActions} from 'web/store/entities/hosts';

import {setTimezone, setUsername} from 'web/store/usersettings/actions';
import {loadingActions} from 'web/store/usersettings/defaults/actions';
import {defaultFilterLoadingActions} from 'web/store/usersettings/defaultfilters/actions';

import {rendererWith, fireEvent, screen, wait} from 'web/utils/testing';

import HostPage, {ToolBarIcons} from '../listpage';

// setup

setLocale('en');

window.URL.createObjectURL = jest.fn();

const capabilities = new Capabilities(['everything']);
const wrongCapabilities = new Capabilities(['get_host']);

const reloadInterval = -1;
const manualUrl = 'test/';

// mock entity

const host = Host.fromElement({
  _id: '1234',
  name: 'Foo',
  comment: 'bar',
  owner: {name: 'admin'},
  creation_time: '2019-06-02T12:00:22Z',
  modification_time: '2019-06-03T11:00:22Z',
  writable: '1',
  in_use: '0',
  permissions: {permission: [{name: 'everything'}]},
  host: {
    severity: {
      value: 10.0,
    },
  },
  identifiers: {
    identifier: [
      {
        _id: '5678',
        name: 'hostname',
        value: 'foo',
        source: {
          _id: '910',
          type: 'Report Host Detail',
        },
      },
      {
        _id: '1112',
        name: 'ip',
        value: '123.456.789.10',
      },
      {
        _id: '1314',
        name: 'OS',
        value: 'cpe:/o:linux:kernel',
      },
    ],
  },
});

// mock gmp commands

const getHosts = jest.fn().mockResolvedValue({
  data: [host],
  meta: {
    filter: Filter.fromString(),
    counts: new CollectionCounts(),
  },
});

const getFilters = jest.fn().mockReturnValue(
  Promise.resolve({
    data: [],
    meta: {
      filter: Filter.fromString(),
      counts: new CollectionCounts(),
    },
  }),
);

const getDashboardSetting = jest.fn().mockResolvedValue({
  data: [],
  meta: {
    filter: Filter.fromString(),
    counts: new CollectionCounts(),
  },
});

const getAggregates = jest.fn().mockResolvedValue({
  data: [],
  meta: {
    filter: Filter.fromString(),
    counts: new CollectionCounts(),
  },
});

const currentSettings = jest.fn().mockResolvedValue({
  foo: 'bar',
});

const getSetting = jest.fn().mockResolvedValue({
  filter: null,
});

const renewSession = jest.fn().mockResolvedValue({
  foo: 'bar',
});

describe('Host listpage tests', () => {
  test('should render full host listpage', async () => {
    const gmp = {
      hosts: {
        get: getHosts,
        getSeverityAggregates: getAggregates,
        getModifiedAggregates: getAggregates,
      },
      filters: {
        get: getFilters,
      },
      dashboard: {
        getSetting: getDashboardSetting,
      },
      settings: {manualUrl, reloadInterval},
      user: {currentSettings},
    };

    const {render, store} = rendererWith({
      gmp,
      capabilities: true,
      store: true,
      router: true,
    });

    store.dispatch(setTimezone('CET'));
    store.dispatch(setUsername('admin'));

    const defaultSettingfilter = Filter.fromString('foo=bar');
    store.dispatch(loadingActions.success({rowsperpage: {value: '2'}}));
    store.dispatch(
      defaultFilterLoadingActions.success('host', defaultSettingfilter),
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
      entitiesLoadingActions.success([host], filter, loadedFilter, counts),
    );

    const {baseElement} = render(<HostPage />);

    await wait();

    const inputs = baseElement.querySelectorAll('input');
    const selects = screen.getAllByTestId('select-selected-value');

    // Toolbar Icons
    expect(screen.getAllByTitle('Help: Hosts')[0]).toBeInTheDocument();
    expect(screen.getAllByTitle('New Host')[0]).toBeInTheDocument();

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

    const display = screen.getAllByTestId('grid-item');
    expect(display[0]).toHaveTextContent('Hosts by Severity Class (Total: 0)');
    expect(display[1]).toHaveTextContent('Hosts Topology');
    expect(display[2]).toHaveTextContent(
      'Hosts by Modification Time (Total: 0)',
    );

    // Table
    const header = baseElement.querySelectorAll('th');

    expect(header[0]).toHaveTextContent('Name');
    expect(header[1]).toHaveTextContent('Hostname');
    expect(header[2]).toHaveTextContent('IP Address');
    expect(header[3]).toHaveTextContent('OS');
    expect(header[4]).toHaveTextContent('Severity');
    expect(header[5]).toHaveTextContent('Modified');
    expect(header[6]).toHaveTextContent('Actions');

    // Row
    const row = baseElement.querySelectorAll('tr');

    expect(row[1]).toHaveTextContent('Foo');
    expect(row[1]).toHaveTextContent('bar');
    expect(row[1]).toHaveTextContent('foo');
    expect(row[1]).toHaveTextContent('123.456.789.10');
    expect(row[1]).toHaveTextContent('10.0 (High)');
    expect(row[1]).toHaveTextContent('Mon, Jun 3, 2019 1:00 PM CEST');

    const osImage = baseElement.querySelector('img');
    expect(osImage).toHaveAttribute('src', '/img/os_linux.svg');

    expect(screen.getAllByTitle('Delete Host')[0]).toBeInTheDocument();
    expect(screen.getAllByTitle('Edit Host')[0]).toBeInTheDocument();
    expect(
      screen.getAllByTitle('Create Target from Host')[0],
    ).toBeInTheDocument();
    expect(screen.getAllByTitle('Export Host')[0]).toBeInTheDocument();

    // Footer
    expect(
      screen.getAllByTitle('Add tag to page contents')[0],
    ).toBeInTheDocument();
    expect(screen.getAllByTitle('Delete page contents')[0]).toBeInTheDocument();
    expect(screen.getAllByTitle('Export page contents')[0]).toBeInTheDocument();
    expect(
      screen.getAllByTitle('Create Target from page contents')[0],
    ).toBeInTheDocument();
  });

  test('should allow to bulk action on page contents', async () => {
    const deleteByFilter = jest.fn().mockResolvedValue({
      foo: 'bar',
    });

    const exportByFilter = jest.fn().mockResolvedValue({
      foo: 'bar',
    });

    const gmp = {
      hosts: {
        get: getHosts,
        deleteByFilter,
        exportByFilter,
        getSeverityAggregates: getAggregates,
        getModifiedAggregates: getAggregates,
      },
      filters: {
        get: getFilters,
      },
      dashboard: {
        getSetting: getDashboardSetting,
      },
      settings: {manualUrl, reloadInterval},
      user: {renewSession, currentSettings, getSetting: getSetting},
    };

    const {render, store} = rendererWith({
      gmp,
      capabilities: true,
      store: true,
      router: true,
    });

    store.dispatch(setTimezone('CET'));
    store.dispatch(setUsername('admin'));

    const defaultSettingfilter = Filter.fromString('foo=bar');
    store.dispatch(loadingActions.success({rowsperpage: {value: '2'}}));
    store.dispatch(
      defaultFilterLoadingActions.success('host', defaultSettingfilter),
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
      entitiesLoadingActions.success([host], filter, loadedFilter, counts),
    );

    render(<HostPage />);

    await wait();

    // export page contents
    fireEvent.click(screen.getAllByTitle('Export page contents')[0]);

    await wait();

    expect(exportByFilter).toHaveBeenCalled();

    // delete page contents
    fireEvent.click(screen.getAllByTitle('Delete page contents')[0]);

    await wait();

    expect(deleteByFilter).toHaveBeenCalled();
  });

  test('should allow to bulk action on selected hosts', async () => {
    const deleteByIds = jest.fn().mockResolvedValue({
      foo: 'bar',
    });

    const exportByIds = jest.fn().mockResolvedValue({
      foo: 'bar',
    });

    const gmp = {
      hosts: {
        get: getHosts,
        delete: deleteByIds,
        export: exportByIds,
        getSeverityAggregates: getAggregates,
        getModifiedAggregates: getAggregates,
      },
      filters: {
        get: getFilters,
      },
      dashboard: {
        getSetting: getDashboardSetting,
      },
      settings: {manualUrl, reloadInterval},
      user: {renewSession, currentSettings, getSetting: getSetting},
    };

    const {render, store} = rendererWith({
      gmp,
      capabilities: true,
      store: true,
      router: true,
    });

    store.dispatch(setTimezone('CET'));
    store.dispatch(setUsername('admin'));

    const defaultSettingfilter = Filter.fromString('foo=bar');
    store.dispatch(loadingActions.success({rowsperpage: {value: '2'}}));
    store.dispatch(
      defaultFilterLoadingActions.success('host', defaultSettingfilter),
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
      entitiesLoadingActions.success([host], filter, loadedFilter, counts),
    );

    const {element} = render(<HostPage />);

    await wait();

    // open drop down menu
    const selectFields = screen.getAllByTestId('select-open-button');
    fireEvent.click(selectFields[1]);

    // select option "Apply to selection"
    const selectItems = screen.getAllByTestId('select-item');
    fireEvent.click(selectItems[1]);

    const selected = screen.getAllByTestId('select-selected-value');
    expect(selected[1]).toHaveTextContent('Apply to selection');

    // select a host
    const inputs = element.querySelectorAll('input');

    fireEvent.click(inputs[1]);
    await wait();

    // export selected host
    fireEvent.click(screen.getAllByTitle('Export selection')[0]);

    await wait();

    expect(exportByIds).toHaveBeenCalled();

    // delete selected host
    fireEvent.click(screen.getAllByTitle('Delete selection')[0]);

    await wait();

    expect(deleteByIds).toHaveBeenCalled();
  });

  test('should allow to bulk action on filtered hosts', async () => {
    const deleteByFilter = jest.fn().mockResolvedValue({
      foo: 'bar',
    });

    const exportByFilter = jest.fn().mockResolvedValue({
      foo: 'bar',
    });

    const gmp = {
      hosts: {
        get: getHosts,
        deleteByFilter,
        exportByFilter,
        getSeverityAggregates: getAggregates,
        getModifiedAggregates: getAggregates,
      },
      filters: {
        get: getFilters,
      },
      dashboard: {
        getSetting: getDashboardSetting,
      },
      settings: {manualUrl, reloadInterval},
      user: {renewSession, currentSettings, getSetting: getSetting},
    };

    const {render, store} = rendererWith({
      gmp,
      capabilities: true,
      store: true,
      router: true,
    });

    store.dispatch(setTimezone('CET'));
    store.dispatch(setUsername('admin'));

    const defaultSettingfilter = Filter.fromString('foo=bar');
    store.dispatch(loadingActions.success({rowsperpage: {value: '2'}}));
    store.dispatch(
      defaultFilterLoadingActions.success('host', defaultSettingfilter),
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
      entitiesLoadingActions.success([host], filter, loadedFilter, counts),
    );

    render(<HostPage />);

    await wait();

    // open drop down menu
    const selectFields = screen.getAllByTestId('select-open-button');
    fireEvent.click(selectFields[1]);

    // select option "Apply to all filtered"
    const selectItems = screen.getAllByTestId('select-item');
    fireEvent.click(selectItems[2]);

    await wait();

    const selected = screen.getAllByTestId('select-selected-value');
    expect(selected[1]).toHaveTextContent('Apply to all filtered');

    // export all filtered hosts
    fireEvent.click(screen.getAllByTitle('Export all filtered')[0]);

    await wait();

    expect(exportByFilter).toHaveBeenCalled();

    // delete all filtered hosts
    fireEvent.click(screen.getAllByTitle('Delete all filtered')[0]);

    await wait();

    expect(deleteByFilter).toHaveBeenCalled();
  });
});

describe('Host listpage ToolBarIcons test', () => {
  test('should render', () => {
    const handleCreateHostClick = jest.fn();

    const gmp = {
      settings: {manualUrl},
    };

    const {render} = rendererWith({
      gmp,
      capabilities,
      router: true,
    });

    const {element} = render(
      <ToolBarIcons onHostCreateClick={handleCreateHostClick} />,
    );

    const icons = screen.getAllByTestId('svg-icon');
    const links = element.querySelectorAll('a');

    expect(icons.length).toBe(2);

    expect(screen.getAllByTitle('Help: Hosts')[0]).toBeInTheDocument();
    expect(links[0]).toHaveAttribute(
      'href',
      'test/en/managing-assets.html#managing-hosts',
    );

    expect(screen.getAllByTitle('New Host')[0]).toBeInTheDocument();
  });

  test('should call click handlers', () => {
    const handleCreateHostClick = jest.fn();

    const gmp = {
      settings: {manualUrl},
    };

    const {render} = rendererWith({
      gmp,
      capabilities,
      router: true,
    });

    render(<ToolBarIcons onHostCreateClick={handleCreateHostClick} />);

    fireEvent.click(screen.getAllByTitle('New Host')[0]);
    expect(handleCreateHostClick).toHaveBeenCalled();
  });

  test('should not show icons if user does not have the right permissions', () => {
    const handleCreateHostClick = jest.fn();

    const gmp = {
      settings: {manualUrl},
    };

    const {render} = rendererWith({
      gmp,
      capabilities: wrongCapabilities,
      router: true,
    });

    render(<ToolBarIcons onHostCreateClick={handleCreateHostClick} />);

    const icons = screen.getAllByTestId('svg-icon');

    expect(icons.length).toBe(1);

    expect(screen.getAllByTitle('Help: Hosts')[0]).toBeInTheDocument();
    expect(screen.queryByTitle('New Host')).not.toBeInTheDocument();
  });
});
