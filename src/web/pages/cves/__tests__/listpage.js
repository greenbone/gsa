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
import Cve from 'gmp/models/cve';

import {entitiesLoadingActions} from 'web/store/entities/cves';

import {setTimezone, setUsername} from 'web/store/usersettings/actions';
import {defaultFilterLoadingActions} from 'web/store/usersettings/defaultfilters/actions';
import {loadingActions} from 'web/store/usersettings/defaults/actions';

import {rendererWith, fireEvent, screen, wait} from 'web/utils/testing';

import CvesPage, {ToolBarIcons} from '../listpage';

setLocale('en');

window.URL.createObjectURL = jest.fn();

const cve = Cve.fromElement({
  _id: 'CVE-2020-9992',
  name: 'CVE-2020-9992',
  cvss_vector: 'AV:N/AC:M/Au:N/C:C/I:C/A:C',
  creationTime: '2020-10-22T19:15:00Z',
  severity: '9.3',
  description: 'foo bar baz',
  usage_type: 'cve',
});

const reloadInterval = -1;
const manualUrl = 'test/';

let getCves;
let getFilters;
let getDashboardSetting;
let getAggregates;
let getSetting;
let currentSettings;
let renewSession;

beforeEach(() => {
  getCves = jest.fn().mockResolvedValue({
    data: [cve],
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

  getSetting = jest.fn().mockResolvedValue({
    filter: null,
  });

  currentSettings = jest.fn().mockResolvedValue({
    foo: 'bar',
  });

  renewSession = jest.fn().mockResolvedValue({
    foo: 'bar',
  });
});

describe('CvesPage tests', () => {
  test('should render full CvesPage', async () => {
    const gmp = {
      dashboard: {
        getSetting: getDashboardSetting,
      },
      cves: {
        get: getCves,
        getSeverityAggregates: getAggregates,
        getCreatedAggregates: getAggregates,
      },
      filters: {
        get: getFilters,
      },
      settings: {manualUrl, reloadInterval},
      user: {currentSettings, getSetting},
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
      defaultFilterLoadingActions.success('cve', defaultSettingfilter),
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
      entitiesLoadingActions.success([cve], filter, loadedFilter, counts),
    );

    const {baseElement} = render(<CvesPage />);

    await wait();

    const display = screen.getAllByTestId('grid-item');
    const inputs = baseElement.querySelectorAll('input');
    const selects = screen.getAllByTestId('select-selected-value');

    // Toolbar Icons
    expect(screen.getAllByTitle('Help: CVEs')[0]).toBeInTheDocument();

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
    expect(display[0]).toHaveTextContent('CVEs by Severity Class (Total: 0)');
    expect(display[1]).toHaveTextContent('CVEs by Creation Time');
    expect(display[2]).toHaveTextContent('CVEs by CVSS (Total: 0)');

    // Table
    const header = baseElement.querySelectorAll('th');

    expect(header[0]).toHaveTextContent('Name');
    expect(header[1]).toHaveTextContent('Description');
    expect(header[2]).toHaveTextContent('Published');
    expect(header[3]).toHaveTextContent('CVSS Base Vector');
    expect(header[4]).toHaveTextContent('Severity');

    const row = baseElement.querySelectorAll('tr');

    expect(row[1]).toHaveTextContent('CVE-2020-9992');
    expect(row[1]).toHaveTextContent('foo bar baz');
    expect(row[1]).toHaveTextContent('Thu, Oct 22, 2020 9:15 PM CESTA');
    expect(row[1]).toHaveTextContent('AV:N/AC:M/Au:N/C:C/I:C/A:C');
    expect(row[1]).toHaveTextContent('9.3 (High)');
  });

  test('should allow to bulk action on page contents', async () => {
    const deleteByFilter = jest.fn().mockResolvedValue({
      foo: 'bar',
    });

    const exportByFilter = jest.fn().mockResolvedValue({
      foo: 'bar',
    });

    const gmp = {
      dashboard: {
        getSetting: getDashboardSetting,
      },
      cves: {
        get: getCves,
        deleteByFilter,
        exportByFilter,
        getSeverityAggregates: getAggregates,
        getActiveDaysAggregates: getAggregates,
        getCreatedAggregates: getAggregates,
      },
      filters: {
        get: getFilters,
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
      defaultFilterLoadingActions.success('cve', defaultSettingfilter),
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
      entitiesLoadingActions.success([cve], filter, loadedFilter, counts),
    );

    render(<CvesPage />);

    await wait();

    // export page contents
    const exportIcon = screen.getAllByTitle('Export page contents');

    expect(exportIcon[0]).toBeInTheDocument();
    fireEvent.click(exportIcon[0]);

    await wait();

    expect(exportByFilter).toHaveBeenCalled();
  });

  test('should allow to bulk action on selected cves', async () => {
    const deleteByIds = jest.fn().mockResolvedValue({
      foo: 'bar',
    });

    const exportByIds = jest.fn().mockResolvedValue({
      foo: 'bar',
    });

    const gmp = {
      dashboard: {
        getSetting: getDashboardSetting,
      },
      cves: {
        get: getCves,
        delete: deleteByIds,
        export: exportByIds,
        getSeverityAggregates: getAggregates,
        getActiveDaysAggregates: getAggregates,
        getCreatedAggregates: getAggregates,
      },
      filters: {
        get: getFilters,
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
      defaultFilterLoadingActions.success('cve', defaultSettingfilter),
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
      entitiesLoadingActions.success([cve], filter, loadedFilter, counts),
    );

    const {element} = render(<CvesPage />);

    await wait();

    const selectFields = screen.getAllByTestId('select-open-button');
    fireEvent.click(selectFields[1]);

    const selectItems = screen.getAllByTestId('select-item');
    fireEvent.click(selectItems[1]);

    const selected = screen.getAllByTestId('select-selected-value');
    expect(selected[1]).toHaveTextContent('Apply to selection');

    const inputs = element.querySelectorAll('input');

    // select a cve
    fireEvent.click(inputs[1]);
    await wait();

    // export selected cve
    const exportIcon = screen.getAllByTitle('Export selection');

    expect(exportIcon[0]).toBeInTheDocument();
    fireEvent.click(exportIcon[0]);

    await wait();

    expect(exportByIds).toHaveBeenCalled();
  });

  test('should allow to bulk action on filtered cves', async () => {
    const deleteByFilter = jest.fn().mockResolvedValue({
      foo: 'bar',
    });

    const exportByFilter = jest.fn().mockResolvedValue({
      foo: 'bar',
    });

    const gmp = {
      dashboard: {
        getSetting: getDashboardSetting,
      },
      cves: {
        get: getCves,
        deleteByFilter,
        exportByFilter,
        getSeverityAggregates: getAggregates,
        getActiveDaysAggregates: getAggregates,
        getCreatedAggregates: getAggregates,
      },
      filters: {
        get: getFilters,
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
      defaultFilterLoadingActions.success('cve', defaultSettingfilter),
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
      entitiesLoadingActions.success([cve], filter, loadedFilter, counts),
    );

    render(<CvesPage />);

    await wait();

    const selectFields = screen.getAllByTestId('select-open-button');
    fireEvent.click(selectFields[1]);

    const selectItems = screen.getAllByTestId('select-item');
    fireEvent.click(selectItems[2]);

    await wait();

    const selected = screen.getAllByTestId('select-selected-value');
    expect(selected[1]).toHaveTextContent('Apply to all filtered');

    // export all filtered cves
    const exportIcon = screen.getAllByTitle('Export all filtered');

    expect(exportIcon[0]).toBeInTheDocument();
    fireEvent.click(exportIcon[0]);

    await wait();

    expect(exportByFilter).toHaveBeenCalled();
  });
});

describe('CvesPage ToolBarIcons test', () => {
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
    expect(screen.getAllByTitle('Help: CVEs')[0]).toBeInTheDocument();
    expect(links[0]).toHaveAttribute(
      'href',
      'test/en/managing-secinfo.html#cve',
    );
  });
});
