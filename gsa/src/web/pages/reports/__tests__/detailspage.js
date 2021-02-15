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

import {isDefined} from 'gmp/utils/identity';

import {createRenewSessionQueryMock} from 'web/graphql/__mocks__/session';

import {reportActions} from 'web/store/entities/report/actions';
import {setTimezone, setUsername} from 'web/store/usersettings/actions';
import {loadingActions} from 'web/store/usersettings/defaults/actions';
import {defaultFilterLoadingActions} from 'web/store/usersettings/defaultfilters/actions';

import {rendererWith, fireEvent, screen, wait} from 'web/utils/testing';

import {getMockReport} from 'web/pages/reports/__mocks__/mockreport';
import Detailspage from '../detailspage';

// setup

setLocale('en');

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useRouteMatch: () => ({
    params: {id: '1234'},
  }),
}));

if (!isDefined(window.URL)) {
  window.URL = {};
}
window.URL.createObjectURL = jest.fn();

const location = {key: 'test', pathname: '/report/1234'};

const reloadInterval = -1;
const manualUrl = 'test/';

const filter = Filter.fromString(
  'apply_overrides=0 levels=hml rows=2 min_qod=70 first=1 sort-reverse=severity',
);

// mock entity

const {entity: report} = getMockReport();

// mock gmp commands
let getReport;
let getPermissions;
let getFilters;
let getReportFormats;
let getResults;
let currentSettings;
let renewSession;
let getSetting;
let getReportComposerDefaults;
let addAssets;
let removeAssets;

beforeEach(() => {
  getReport = jest.fn().mockResolvedValue({
    data: report,
  });

  getPermissions = jest.fn().mockResolvedValue({
    data: [],
    meta: {
      filter: Filter.fromString(),
      counts: new CollectionCounts(),
    },
  });

  getFilters = jest.fn().mockResolvedValue({
    data: [],
    meta: {
      filter: Filter.fromString(),
      counts: new CollectionCounts(),
    },
  });

  getReportFormats = jest.fn().mockResolvedValue({
    data: [],
    meta: {
      filter: Filter.fromString(),
      counts: new CollectionCounts(),
    },
  });

  getResults = jest.fn().mockResolvedValue({
    data: [],
    meta: {
      filter: Filter.fromString(),
      counts: new CollectionCounts(),
    },
  });

  currentSettings = jest.fn().mockResolvedValue({
    foo: 'bar',
  });

  renewSession = jest.fn().mockResolvedValue({
    foo: 'bar',
  });

  getSetting = jest.fn().mockResolvedValue({
    filter: null,
  });

  getReportComposerDefaults = jest.fn().mockResolvedValue({
    foo: 'bar',
  });

  addAssets = jest.fn().mockResolvedValue({
    foo: 'bar',
  });

  removeAssets = jest.fn().mockResolvedValue({
    foo: 'bar',
  });
});

describe('Report Detailspage tests', () => {
  test('should render full Detailspage', async () => {
    const gmp = {
      report: {
        get: getReport,
      },
      results: {
        get: getResults,
      },
      permissions: {
        get: getPermissions,
      },
      filters: {
        get: getFilters,
      },
      reportformats: {
        get: getReportFormats,
      },
      settings: {manualUrl, reloadInterval},
      user: {
        currentSettings,
        getSetting,
        getReportComposerDefaults,
        renewSession,
      },
    };

    const {render, store} = rendererWith({
      gmp,
      capabilities: true,
      router: true,
      store: true,
    });

    store.dispatch(setTimezone('CET'));
    store.dispatch(setUsername('admin'));

    const defaultSettingfilter = Filter.fromString('foo=bar');
    store.dispatch(loadingActions.success({rowsperpage: {value: '2'}}));
    store.dispatch(
      defaultFilterLoadingActions.success('report', defaultSettingfilter),
    );

    store.dispatch(reportActions.success('1234', report, filter));

    const {baseElement} = render(<Detailspage id="1234" location={location} />);

    await wait();

    const links = baseElement.querySelectorAll('a');
    const inputs = baseElement.querySelectorAll('input');
    const selects = screen.getAllByTestId('select-selected-value');

    // Toolbar Icons
    expect(
      screen.getAllByTitle('Help: Reading Reports')[0],
    ).toBeInTheDocument();
    expect(links[0]).toHaveAttribute(
      'href',
      'test/en/reports.html#reading-a-report',
    );

    expect(screen.getAllByTitle('Reports List')[0]).toBeInTheDocument();
    expect(links[1]).toHaveAttribute('href', '/reports');

    expect(
      screen.getAllByTitle(
        'Add to Assets with QoD=>70% and Overrides enabled',
      )[0],
    ).toBeInTheDocument();
    expect(screen.getAllByTitle('Remove from Assets')[0]).toBeInTheDocument();
    expect(screen.getAllByTitle('Corresponding Task')[0]).toBeInTheDocument();
    expect(
      screen.getAllByTitle('Corresponding Results')[0],
    ).toBeInTheDocument();
    expect(
      screen.getAllByTitle('Corresponding Vulnerabilities')[0],
    ).toBeInTheDocument();
    expect(
      screen.getAllByTitle('Corresponding TLS Certificates')[0],
    ).toBeInTheDocument();
    expect(
      screen.getAllByTitle('Corresponding Performance')[0],
    ).toBeInTheDocument();
    expect(
      screen.getAllByTitle('Download filtered Report')[0],
    ).toBeInTheDocument();
    expect(screen.getAllByTitle('Trigger Alert')[0]).toBeInTheDocument();

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

    // Header
    expect(baseElement).toHaveTextContent(
      'Report:Mon, Jun 3, 2019 1:00 PM CEST',
    );
    expect(baseElement).toHaveTextContent('ID:1234');
    expect(baseElement).toHaveTextContent(
      'Created:Sun, Jun 2, 2019 2:00 PM CEST',
    );
    expect(baseElement).toHaveTextContent(
      'Modified:Mon, Jun 3, 2019 1:00 PM CEST',
    );
    expect(baseElement).toHaveTextContent('Owner:admin');

    // Tabs
    expect(baseElement).toHaveTextContent('Information');
    expect(baseElement).toHaveTextContent('Results(24 of 24)');
    expect(baseElement).toHaveTextContent('Hosts(2 of 2)');
    expect(baseElement).toHaveTextContent('Ports(2 of 2)');
    expect(baseElement).toHaveTextContent('Applications(4 of 4)');
    expect(baseElement).toHaveTextContent('Operating Systems(2 of 2)');
    expect(baseElement).toHaveTextContent('CVEs(2 of 2)');
    expect(baseElement).toHaveTextContent('Closed CVEs(2 of 2)');
    expect(baseElement).toHaveTextContent('TLS Certificates(2 of 2)');
    expect(baseElement).toHaveTextContent('Error Messages(2 of 2)');
    expect(baseElement).toHaveTextContent('User Tags(0)');

    // Details
    const tableData = baseElement.querySelectorAll('td');
    const bars = screen.getAllByTestId('progressbar-box');

    expect(tableData[0]).toHaveTextContent('Task Name');
    expect(links[8]).toHaveAttribute('href', '/task/314');
    expect(tableData[1]).toHaveTextContent('foo');

    expect(tableData[2]).toHaveTextContent('Comment');
    expect(tableData[3]).toHaveTextContent('bar');

    expect(tableData[4]).toHaveTextContent('Scan Time');
    expect(tableData[5]).toHaveTextContent(
      'Mon, Jun 3, 2019 1:00 PM CEST - Mon, Jun 3, 2019 1:31 PM CEST',
    );

    expect(tableData[6]).toHaveTextContent('Scan Duration');
    expect(tableData[7]).toHaveTextContent('0:31 h');

    expect(tableData[8]).toHaveTextContent('Scan Status');
    expect(bars[1]).toHaveAttribute('title', 'Done');
    expect(bars[1]).toHaveTextContent('Done');

    expect(tableData[10]).toHaveTextContent('Hosts scanned');
    expect(tableData[11]).toHaveTextContent('2');

    expect(tableData[12]).toHaveTextContent('Filter');
    expect(tableData[13]).toHaveTextContent(
      'apply_overrides=0 levels=hml min_qod=70',
    );

    expect(tableData[14]).toHaveTextContent('Timezone');
    expect(tableData[15]).toHaveTextContent('UTC (UTC)');
  });

  test('should render hosts tab', async () => {
    const gmp = {
      report: {
        get: getReport,
      },
      results: {
        get: getResults,
      },
      permissions: {
        get: getPermissions,
      },
      filters: {
        get: getFilters,
      },
      reportformats: {
        get: getReportFormats,
      },
      settings: {manualUrl, reloadInterval},
      user: {
        currentSettings,
        getSetting,
        getReportComposerDefaults,
        renewSession,
      },
    };

    const [renewSessionQueryMock] = createRenewSessionQueryMock();

    const {render, store} = rendererWith({
      gmp,
      capabilities: true,
      router: true,
      store: true,
      queryMocks: [renewSessionQueryMock],
    });

    store.dispatch(setTimezone('CET'));
    store.dispatch(setUsername('admin'));

    const defaultSettingfilter = Filter.fromString('foo=bar');
    store.dispatch(loadingActions.success({rowsperpage: {value: '2'}}));
    store.dispatch(
      defaultFilterLoadingActions.success('report', defaultSettingfilter),
    );

    store.dispatch(reportActions.success('1234', report, filter));

    const {baseElement} = render(<Detailspage id="1234" location={location} />);

    await wait();

    const tabs = screen.getAllByTestId('tab');

    expect(tabs[2]).toHaveTextContent('Hosts');
    fireEvent.click(tabs[2]);

    const header = baseElement.querySelectorAll('th');
    const row = baseElement.querySelectorAll('tr');

    // Headings
    expect(header[0]).toHaveTextContent('IP Address');
    expect(header[1]).toHaveTextContent('Hostname');
    expect(header[2]).toHaveTextContent('OS');
    expect(header[3]).toHaveTextContent('Ports');
    expect(header[4]).toHaveTextContent('Apps');
    expect(header[5]).toHaveTextContent('Distance');
    expect(header[6]).toHaveTextContent('Auth');
    expect(header[7]).toHaveTextContent('Start');
    expect(header[8]).toHaveTextContent('End');
    expect(header[9]).toHaveTextContent('High');
    expect(header[10]).toHaveTextContent('Medium');
    expect(header[11]).toHaveTextContent('Low');
    expect(header[12]).toHaveTextContent('Log');
    expect(header[13]).toHaveTextContent('False Positive');
    expect(header[14]).toHaveTextContent('Total');
    expect(header[15]).toHaveTextContent('Severity');

    // Row 1
    expect(row[1]).toHaveTextContent('foo.bar');
    expect(row[1]).toHaveTextContent('1032'); // 10 Ports, 3 Apps, 2 Distance
    expect(row[1]).toHaveTextContent('verify.svg');
    expect(row[1]).toHaveTextContent('Mon, Jun 3, 2019 1:00 PM CEST');
    expect(row[1]).toHaveTextContent('Mon, Jun 3, 2019 1:15 PM CEST');
    expect(row[1]).toHaveTextContent('143050150'); // 14 High, 30 Medium, 5 Low, 0 Log, 1 False Positive, 50 Total
    expect(row[1]).toHaveTextContent('10.0 (High)');

    // Row 2
    expect(row[2]).toHaveTextContent('lorem.ipsum');
    expect(row[2]).toHaveTextContent('1521'); // 15 Ports, 2 Apps, 1 Distance
    expect(row[2]).toHaveTextContent('verify_no.svg');
    expect(row[2]).toHaveTextContent('Mon, Jun 3, 2019 1:15 PM CEST');
    expect(row[2]).toHaveTextContent('Mon, Jun 3, 2019 1:31 PM CEST');
    expect(row[2]).toHaveTextContent('53005040'); // 5 High, 30 Medium, 0 Low, 5 Log, 0 False Positive, 40 Total
    expect(row[2]).toHaveTextContent('5.0 (Medium)');

    // Filter
    expect(baseElement).toHaveTextContent(
      '(Applied filter: apply_overrides=0 levels=hml rows=100 min_qod=70 first=1 sort-reverse=severity)',
    );
  });

  test('should render user tags tab', async () => {
    const gmp = {
      report: {
        get: getReport,
      },
      results: {
        get: getResults,
      },
      permissions: {
        get: getPermissions,
      },
      filters: {
        get: getFilters,
      },
      reportformats: {
        get: getReportFormats,
      },
      settings: {manualUrl, reloadInterval},
      user: {
        currentSettings,
        getSetting,
        getReportComposerDefaults,
        renewSession,
      },
    };

    const [renewSessionQueryMock] = createRenewSessionQueryMock();

    const {render, store} = rendererWith({
      gmp,
      capabilities: true,
      router: true,
      store: true,
      queryMocks: [renewSessionQueryMock],
    });

    store.dispatch(setTimezone('CET'));
    store.dispatch(setUsername('admin'));

    const defaultSettingfilter = Filter.fromString('foo=bar');
    store.dispatch(loadingActions.success({rowsperpage: {value: '2'}}));
    store.dispatch(
      defaultFilterLoadingActions.success('report', defaultSettingfilter),
    );

    store.dispatch(reportActions.success('1234', report, filter));

    const {baseElement} = render(<Detailspage id="1234" location={location} />);

    await wait();

    const tabs = screen.getAllByTestId('tab');

    expect(tabs[10]).toHaveTextContent('User Tags');
    fireEvent.click(tabs[10]);

    expect(baseElement).toHaveTextContent('No user tags available');
  });

  test('should call commands', async () => {
    const gmp = {
      report: {
        get: getReport,
        addAssets: addAssets,
        removeAssets: removeAssets,
      },
      results: {
        get: getResults,
      },
      permissions: {
        get: getPermissions,
      },
      filters: {
        get: getFilters,
      },
      reportformats: {
        get: getReportFormats,
      },
      settings: {manualUrl, reloadInterval},
      user: {
        currentSettings,
        getSetting,
        getReportComposerDefaults,
        renewSession,
      },
    };

    const [renewSessionQueryMock] = createRenewSessionQueryMock();

    const {render, store} = rendererWith({
      gmp,
      capabilities: true,
      router: true,
      store: true,
      queryMocks: [renewSessionQueryMock],
    });

    store.dispatch(setTimezone('CET'));
    store.dispatch(setUsername('admin'));

    const defaultSettingfilter = Filter.fromString('foo=bar');
    store.dispatch(loadingActions.success({rowsperpage: {value: '2'}}));
    store.dispatch(
      defaultFilterLoadingActions.success('report', defaultSettingfilter),
    );

    store.dispatch(reportActions.success('1234', report, filter));

    render(<Detailspage id="1234" location={location} />);

    await wait();

    // add to assets

    fireEvent.click(
      screen.getAllByTitle(
        'Add to Assets with QoD=>70% and Overrides enabled',
      )[0],
    );

    await wait();

    expect(addAssets).toHaveBeenCalled();

    // remove from assets

    fireEvent.click(screen.getAllByTitle('Remove from Assets')[0]);

    await wait();

    expect(removeAssets).toHaveBeenCalled();
  });
});
