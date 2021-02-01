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

import {entitiesActions} from 'web/store/entities/reports';

import {setTimezone, setUsername} from 'web/store/usersettings/actions';
import {loadingActions} from 'web/store/usersettings/defaults/actions';
import {defaultFilterLoadingActions} from 'web/store/usersettings/defaultfilters/actions';

import {rendererWith, fireEvent, screen, wait} from 'web/utils/testing';

import {getMockReport} from 'web/pages/reports/__mocks__/mockreport';
import ReportPage, {ToolBarIcons} from '../listpage';

// setup

setLocale('en');

window.URL.createObjectURL = jest.fn();

const capabilities = new Capabilities(['everything']);

const reloadInterval = -1;
const manualUrl = 'test/';

// mock entity

const {entity} = getMockReport();

let currentSettings;
let getAggregates;
let getDashboardSetting;
let getFilters;
let getReports;
let getSetting;
let renewSession;

beforeEach(() => {
  // mock gmp commands

  getReports = jest.fn().mockResolvedValue({
    data: [entity],
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

  currentSettings = jest.fn().mockResolvedValue({
    foo: 'bar',
  });

  getSetting = jest.fn().mockResolvedValue({
    filter: null,
  });

  renewSession = jest.fn().mockResolvedValue({
    foo: 'bar',
  });
});

describe('Report listpage tests', () => {
  test('should render full report listpage', async () => {
    const gmp = {
      reports: {
        get: getReports,
        getSeverityAggregates: getAggregates,
        getHighResultsAggregates: getAggregates,
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
      defaultFilterLoadingActions.success('report', defaultSettingfilter),
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
      entitiesActions.success([entity], filter, loadedFilter, counts),
    );

    const {baseElement} = render(<ReportPage />);

    await wait();

    const inputs = baseElement.querySelectorAll('input');
    const selects = screen.getAllByTestId('select-selected-value');

    // Toolbar Icons
    expect(screen.getAllByTitle('Help: Reports')[0]).toBeInTheDocument();
    expect(screen.getAllByTitle('Upload report')[0]).toBeInTheDocument();

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
    expect(display[0]).toHaveTextContent(
      'Reports by Severity Class (Total: 0)',
    );
    expect(display[1]).toHaveTextContent('Reports with High Results');
    expect(display[2]).toHaveTextContent('Reports by CVSS (Total: 0)');

    // Table
    const header = baseElement.querySelectorAll('th');

    expect(header[0]).toHaveTextContent('Date');
    expect(header[1]).toHaveTextContent('Status');
    expect(header[2]).toHaveTextContent('Task');
    expect(header[3]).toHaveTextContent('Severity');
    expect(header[4]).toHaveTextContent('High');
    expect(header[5]).toHaveTextContent('Medium');
    expect(header[6]).toHaveTextContent('Low');

    // Row
    const row = baseElement.querySelectorAll('tr');

    expect(row[1]).toHaveTextContent('Mon, Jun 3, 2019 1:00 PM CEST');
    expect(row[1]).toHaveTextContent('Done');
    expect(row[1]).toHaveTextContent('foo');
    expect(row[1]).toHaveTextContent('10.0 (High)');
    expect(row[1]).toHaveTextContent('351024'); // 3 high, 5 medium, 10 low, 2 log, 4 false positive

    expect(
      screen.getAllByTitle('Select Report for delta comparison')[0],
    ).toBeInTheDocument();
    expect(screen.getAllByTitle('Delete Report')[0]).toBeInTheDocument();

    // Footer
    expect(
      screen.getAllByTitle('Add tag to page contents')[0],
    ).toBeInTheDocument();
    expect(screen.getAllByTitle('Delete page contents')[0]).toBeInTheDocument();
  });

  test('should allow to bulk action on page contents', async () => {
    const deleteByFilter = jest.fn().mockResolvedValue({
      foo: 'bar',
    });

    const gmp = {
      reports: {
        get: getReports,
        deleteByFilter,
        getSeverityAggregates: getAggregates,
        getHighResultsAggregates: getAggregates,
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
      defaultFilterLoadingActions.success('report', defaultSettingfilter),
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
      entitiesActions.success([entity], filter, loadedFilter, counts),
    );

    render(<ReportPage />);

    await wait();

    fireEvent.click(screen.getAllByTitle('Delete page contents')[0]);

    await wait();

    expect(deleteByFilter).toHaveBeenCalled();
  });

  test('should allow to bulk action on selected reports', async () => {
    const deleteByIds = jest.fn().mockResolvedValue({
      foo: 'bar',
    });

    const gmp = {
      reports: {
        get: getReports,
        delete: deleteByIds,
        getSeverityAggregates: getAggregates,
        getHighResultsAggregates: getAggregates,
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
      defaultFilterLoadingActions.success('report', defaultSettingfilter),
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
      entitiesActions.success([entity], filter, loadedFilter, counts),
    );

    const {element} = render(<ReportPage />);

    await wait();

    // open drop down menu
    const selectFields = screen.getAllByTestId('select-open-button');
    fireEvent.click(selectFields[1]);

    // select option "Apply to selection"
    const selectItems = screen.getAllByTestId('select-item');
    fireEvent.click(selectItems[1]);

    const selected = screen.getAllByTestId('select-selected-value');
    expect(selected[1]).toHaveTextContent('Apply to selection');

    // select a report
    const inputs = element.querySelectorAll('input');

    fireEvent.click(inputs[1]);
    await wait();

    // delete selected report
    fireEvent.click(screen.getAllByTitle('Delete selection')[0]);

    await wait();

    expect(deleteByIds).toHaveBeenCalled();
  });

  test('should allow to bulk action on filtered reports', async () => {
    const deleteByFilter = jest.fn().mockResolvedValue({
      foo: 'bar',
    });

    const gmp = {
      reports: {
        get: getReports,
        deleteByFilter,
        getSeverityAggregates: getAggregates,
        getHighResultsAggregates: getAggregates,
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
      defaultFilterLoadingActions.success('report', defaultSettingfilter),
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
      entitiesActions.success([entity], filter, loadedFilter, counts),
    );

    render(<ReportPage />);

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

    // delete all filtered reports
    fireEvent.click(screen.getAllByTitle('Delete all filtered')[0]);

    await wait();

    expect(deleteByFilter).toHaveBeenCalled();
  });
});

describe('Report listpage ToolBarIcons test', () => {
  test('should render', () => {
    const handleUploadReportClick = jest.fn();

    const gmp = {
      settings: {manualUrl},
    };

    const {render} = rendererWith({
      gmp,
      capabilities: capabilities,
      router: true,
    });

    const {element} = render(
      <ToolBarIcons onUploadReportClick={handleUploadReportClick} />,
    );

    const icons = screen.getAllByTestId('svg-icon');
    const links = element.querySelectorAll('a');

    expect(icons.length).toBe(2);

    expect(screen.getAllByTitle('Help: Reports')[0]).toBeInTheDocument();
    expect(links[0]).toHaveAttribute(
      'href',
      'test/en/reports.html#using-and-managing-reports',
    );

    expect(screen.getAllByTitle('Upload report')[0]).toBeInTheDocument();
  });

  test('should call click handlers', () => {
    const handleUploadReportClick = jest.fn();

    const gmp = {
      settings: {manualUrl},
    };

    const {render} = rendererWith({
      gmp,
      capabilities: capabilities,
      router: true,
    });

    render(<ToolBarIcons onUploadReportClick={handleUploadReportClick} />);

    fireEvent.click(screen.getAllByTitle('Upload report')[0]);
    expect(handleUploadReportClick).toHaveBeenCalled();
  });
});
