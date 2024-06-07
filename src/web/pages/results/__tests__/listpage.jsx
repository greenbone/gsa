/* Copyright (C) 2021-2022 Greenbone AG
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
import {describe, test, expect, testing} from '@gsa/testing';

import CollectionCounts from 'gmp/collection/collectioncounts';

import Filter from 'gmp/models/filter';
import Result from 'gmp/models/result';

import {entitiesLoadingActions} from 'web/store/entities/results';

import {setTimezone, setUsername} from 'web/store/usersettings/actions';
import {loadingActions} from 'web/store/usersettings/defaults/actions';
import {defaultFilterLoadingActions} from 'web/store/usersettings/defaultfilters/actions';

import {rendererWith, screen, wait} from 'web/utils/testing';

import {
  clickElement,
  getCheckBoxes,
  getPowerFilter,
  getSelectElement,
  getSelectItemElementsForSelect,
  getTableBody,
  getTableFooter,
  getTextInputs,
} from 'web/components/testing';

import ResultsPage from '../listpage';

// setup

const reloadInterval = -1;
const manualUrl = 'test/';

// mock entities
export const result1 = Result.fromElement({
  _id: '101',
  name: 'Result 1',
  owner: {name: 'admin'},
  comment: 'Comment 1',
  creation_time: '2019-06-03T11:06:31Z',
  modification_time: '2019-06-03T11:06:31Z',
  host: {__text: '123.456.78.910', hostname: 'foo'},
  port: '80/tcp',
  nvt: {
    _oid: '201',
    type: 'nvt',
    name: 'nvt1',
    tags: 'solution_type=Mitigation',
    refs: {ref: [{_type: 'cve', _id: 'CVE-2019-1234'}]},
  },
  threat: 'High',
  severity: 10.0,
  qod: {value: 80},
});

export const result2 = Result.fromElement({
  _id: '102',
  name: 'Result 2',
  owner: {name: 'admin'},
  comment: 'Comment 2',
  creation_time: '2019-06-03T11:06:31Z',
  modification_time: '2019-06-03T11:06:31Z',
  host: {__text: '109.876.54.321'},
  port: '80/tcp',
  nvt: {
    _oid: '202',
    type: 'nvt',
    name: 'nvt2',
    tags: 'solution_type=VendorFix',
    refs: {ref: [{_type: 'cve', _id: 'CVE-2019-5678'}]},
  },
  threat: 'Medium',
  severity: 5.0,
  qod: {value: 70},
});

export const result3 = Result.fromElement({
  _id: '103',
  name: 'Result 3',
  owner: {name: 'admin'},
  comment: 'Comment 3',
  creation_time: '2019-06-03T11:06:31Z',
  modification_time: '2019-06-03T11:06:31Z',
  host: {__text: '109.876.54.321', hostname: 'bar'},
  port: '80/tcp',
  nvt: {
    _oid: '201',
    type: 'nvt',
    name: 'nvt1',
    tags: 'solution_type=Mitigation',
    refs: {ref: [{_type: 'cve', _id: 'CVE-2019-1234'}]},
    solution: {
      _type: 'Mitigation',
    },
  },
  threat: 'Medium',
  severity: 5.0,
  qod: {value: 80},
});

const results = [result1, result2, result3];

let currentSettings;
let getAggregates;
let getDashboardSetting;
let getFilters;
let getResults;
let getSetting;
let renewSession;

beforeEach(() => {
  // mock gmp commands

  getResults = testing.fn().mockResolvedValue({
    data: results,
    meta: {
      filter: Filter.fromString(),
      counts: new CollectionCounts(),
    },
  });

  getFilters = testing.fn().mockReturnValue(
    Promise.resolve({
      data: [],
      meta: {
        filter: Filter.fromString(),
        counts: new CollectionCounts(),
      },
    }),
  );

  getDashboardSetting = testing.fn().mockResolvedValue({
    data: [],
    meta: {
      filter: Filter.fromString(),
      counts: new CollectionCounts(),
    },
  });

  getAggregates = testing.fn().mockResolvedValue({
    data: [],
    meta: {
      filter: Filter.fromString(),
      counts: new CollectionCounts(),
    },
  });

  currentSettings = testing.fn().mockResolvedValue({
    foo: 'bar',
  });

  getSetting = testing.fn().mockResolvedValue({
    filter: null,
  });

  renewSession = testing.fn().mockResolvedValue({
    foo: 'bar',
  });
});

describe('Results listpage tests', () => {
  test('should render full results listpage', async () => {
    const gmp = {
      results: {
        get: getResults,
        getSeverityAggregates: getAggregates,
        getWordCountsAggregates: getAggregates,
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

    const defaultSettingFilter = Filter.fromString('foo=bar');
    store.dispatch(loadingActions.success({rowsperpage: {value: '2'}}));
    store.dispatch(
      defaultFilterLoadingActions.success('result', defaultSettingFilter),
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
      entitiesLoadingActions.success(results, filter, loadedFilter, counts),
    );

    const {baseElement} = render(<ResultsPage />);

    await wait();

    const powerFilter = getPowerFilter();
    const select = getSelectElement(powerFilter);
    const inputs = getTextInputs(powerFilter);

    // Toolbar Icons
    expect(screen.getAllByTitle('Help: Results')[0]).toBeInTheDocument();

    // Powerfilter
    expect(inputs[0]).toHaveAttribute('name', 'userFilterString');
    expect(screen.getAllByTitle('Update Filter')[0]).toBeInTheDocument();
    expect(screen.getAllByTitle('Remove Filter')[0]).toBeInTheDocument();
    expect(
      screen.getAllByTitle('Reset to Default Filter')[0],
    ).toBeInTheDocument();
    expect(screen.getAllByTitle('Help: Powerfilter')[0]).toBeInTheDocument();
    expect(screen.getAllByTitle('Edit Filter')[0]).toBeInTheDocument();
    expect(select).toHaveAttribute('title', 'Loaded filter');
    expect(select).toHaveValue('--');

    // Dashboard
    expect(
      screen.getAllByTitle('Add new Dashboard Display')[0],
    ).toBeInTheDocument();
    expect(screen.getAllByTitle('Reset to Defaults')[0]).toBeInTheDocument();

    const display = screen.getAllByTestId('grid-item');
    expect(display[0]).toHaveTextContent(
      'Results by Severity Class (Total: 0)',
    );
    expect(display[1]).toHaveTextContent('Results by CVSS (Total: 0)');

    // Headings
    const header = baseElement.querySelectorAll('th');

    expect(header[0]).toHaveTextContent('Vulnerability');
    expect(header[2]).toHaveTextContent('Severity');
    expect(header[3]).toHaveTextContent('QoD');
    expect(header[4]).toHaveTextContent('Host');
    expect(header[5]).toHaveTextContent('Location');
    expect(header[6]).toHaveTextContent('Created');
    expect(header[7]).toHaveTextContent('IP');
    expect(header[8]).toHaveTextContent('Name');

    // Row 1
    const row = baseElement.querySelectorAll('tr');

    expect(row[2]).toHaveTextContent('Result 1');
    expect(row[2]).toHaveTextContent('10.0 (High)');
    expect(row[2]).toHaveTextContent('80 %');
    expect(row[2]).toHaveTextContent('123.456.78.910');
    expect(row[2]).toHaveTextContent('foo');
    expect(row[2]).toHaveTextContent('80/tcp');
    expect(row[2]).toHaveTextContent('Mon, Jun 3, 2019 1:06 PM CEST');

    // Row 2
    expect(row[3]).toHaveTextContent('Result 2');
    expect(row[3]).toHaveTextContent('5.0 (Medium)');
    expect(row[3]).toHaveTextContent('70 %');
    expect(row[3]).toHaveTextContent('109.876.54.321');
    expect(row[3]).toHaveTextContent('80/tcp');
    expect(row[3]).toHaveTextContent('Mon, Jun 3, 2019 1:06 PM CEST');

    // Row 3
    expect(row[4]).toHaveTextContent('Result 3');
    expect(row[4]).toHaveTextContent('5.0 (Medium)');
    expect(row[4]).toHaveTextContent('80 %');
    expect(row[4]).toHaveTextContent('109.876.54.321');
    expect(row[4]).toHaveTextContent('bar');
    expect(row[4]).toHaveTextContent('80/tcp');
    expect(row[4]).toHaveTextContent('Mon, Jun 3, 2019 1:06 PM CEST');

    // Footer
    expect(
      screen.getAllByTitle('Add tag to page contents')[0],
    ).toBeInTheDocument();
    expect(screen.getAllByTitle('Export page contents')[0]).toBeInTheDocument();
  });

  test('should allow to bulk action on page contents', async () => {
    const exportByFilter = testing.fn().mockResolvedValue({
      foo: 'bar',
    });

    const gmp = {
      results: {
        get: getResults,
        exportByFilter,
        getSeverityAggregates: getAggregates,
        getWordCountsAggregates: getAggregates,
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

    const defaultSettingFilter = Filter.fromString('foo=bar');
    store.dispatch(loadingActions.success({rowsperpage: {value: '2'}}));
    store.dispatch(
      defaultFilterLoadingActions.success('result', defaultSettingFilter),
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
      entitiesLoadingActions.success(results, filter, loadedFilter, counts),
    );

    render(<ResultsPage />);

    await wait();

    await clickElement(screen.getAllByTitle('Export page contents')[0]);
    expect(exportByFilter).toHaveBeenCalled();
  });

  test('should allow to bulk action on selected results', async () => {
    const exportByIds = testing.fn().mockResolvedValue({
      foo: 'bar',
    });

    const gmp = {
      results: {
        get: getResults,
        export: exportByIds,
        getSeverityAggregates: getAggregates,
        getWordCountsAggregates: getAggregates,
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

    const defaultSettingFilter = Filter.fromString('foo=bar');
    store.dispatch(loadingActions.success({rowsperpage: {value: '2'}}));
    store.dispatch(
      defaultFilterLoadingActions.success('result', defaultSettingFilter),
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
      entitiesLoadingActions.success(results, filter, loadedFilter, counts),
    );

    render(<ResultsPage />);

    await wait();

    // change to apply to selection
    const tableFooter = getTableFooter();
    const select = getSelectElement(tableFooter);
    const selectItems = await getSelectItemElementsForSelect(select);
    await clickElement(selectItems[1]);
    expect(select).toHaveValue('Apply to selection');

    // select a result
    const tableBody = getTableBody();
    const inputs = getCheckBoxes(tableBody);
    await clickElement(inputs[1]);

    // export selected result
    await clickElement(screen.getAllByTitle('Export selection')[0]);
    expect(exportByIds).toHaveBeenCalled();
  });

  test('should allow to bulk action on filtered results', async () => {
    const exportByFilter = testing.fn().mockResolvedValue({
      foo: 'bar',
    });

    const gmp = {
      results: {
        get: getResults,
        exportByFilter,
        getSeverityAggregates: getAggregates,
        getWordCountsAggregates: getAggregates,
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

    const defaultSettingFilter = Filter.fromString('foo=bar');
    store.dispatch(loadingActions.success({rowsperpage: {value: '2'}}));
    store.dispatch(
      defaultFilterLoadingActions.success('result', defaultSettingFilter),
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
      entitiesLoadingActions.success(results, filter, loadedFilter, counts),
    );

    render(<ResultsPage />);

    await wait();

    // change to all filtered
    const tableFooter = getTableFooter();
    const select = getSelectElement(tableFooter);
    const selectItems = await getSelectItemElementsForSelect(select);
    await clickElement(selectItems[2]);
    expect(select).toHaveValue('Apply to all filtered');

    // export all filtered results
    await clickElement(screen.getAllByTitle('Export all filtered')[0]);
    expect(exportByFilter).toHaveBeenCalled();
  });
});
