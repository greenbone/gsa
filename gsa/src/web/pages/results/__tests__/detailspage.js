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
import Result from 'gmp/models/result';

import {isDefined} from 'gmp/utils/identity';

import {
  createGetResultQueryMock,
  mockResult,
} from 'web/graphql/__mocks__/results';
import {createRenewSessionQueryMock} from 'web/graphql/__mocks__/session';

import {entityLoadingActions} from 'web/store/entities/results';
import {setTimezone, setUsername} from 'web/store/usersettings/actions';

import {rendererWith, fireEvent, screen, wait} from 'web/utils/testing';

import Detailspage, {ToolBarIcons} from '../detailspage';

// setup

setLocale('en');

if (!isDefined(window.URL)) {
  window.URL = {};
}
window.URL.createObjectURL = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({
    id: '12345',
  }),
}));

const reloadInterval = -1;
const manualUrl = 'test/';

// mock entity
const result = Result.fromObject(mockResult);

// mock gmp commands
let getResult;
let getPermissions;
let currentSettings;
let renewSession;

beforeEach(() => {
  getResult = jest.fn().mockResolvedValue({
    data: result,
  });

  getPermissions = jest.fn().mockResolvedValue({
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
});

describe('Result Detailspage tests', () => {
  test('should render full Detailspage', async () => {
    const gmp = {
      result: {
        get: getResult,
      },
      permissions: {
        get: getPermissions,
      },
      settings: {manualUrl, reloadInterval},
      user: {currentSettings, renewSession},
    };

    const [mock, resultFunc] = createGetResultQueryMock();

    const {render, store} = rendererWith({
      gmp,
      capabilities: true,
      router: true,
      store: true,
      queryMocks: [mock],
    });

    store.dispatch(setTimezone('CET'));
    store.dispatch(setUsername('admin'));

    store.dispatch(entityLoadingActions.success('12345', result));

    const {baseElement} = render(<Detailspage id="12345" />);

    await wait();

    expect(resultFunc).toHaveBeenCalled();

    // Toolbar Icons
    const links = baseElement.querySelectorAll('a');

    expect(screen.getAllByTitle('Help: Results')[0]).toBeInTheDocument();
    expect(links[0]).toHaveAttribute(
      'href',
      'test/en/reports.html#displaying-all-existing-results',
    );

    expect(screen.getAllByTitle('Results List')[0]).toBeInTheDocument();
    expect(links[1]).toHaveAttribute('href', '/results');

    expect(screen.getAllByTitle('Export Result as XML')[0]).toBeInTheDocument();
    expect(screen.getAllByTitle('Add new Note')[0]).toBeInTheDocument();
    expect(screen.getAllByTitle('Add new Override')[0]).toBeInTheDocument();
    expect(screen.getAllByTitle('Create new Ticket')[0]).toBeInTheDocument();
    expect(
      screen.getAllByTitle('Corresponding Task (task 1)')[0],
    ).toBeInTheDocument();
    expect(screen.getAllByTitle('Corresponding Report')[0]).toBeInTheDocument();
    expect(
      screen.getAllByTitle('Corresponding Tickets')[0],
    ).toBeInTheDocument();

    // Header
    expect(baseElement).toHaveTextContent('Result: foo');
    expect(baseElement).toHaveTextContent('ID:12345');
    expect(baseElement).toHaveTextContent(
      'Created:Sun, Jun 2, 2019 2:00 PM CEST',
    );
    expect(baseElement).toHaveTextContent(
      'Modified:Mon, Jun 3, 2019 1:00 PM CEST',
    );
    expect(baseElement).toHaveTextContent('Owner:admin');

    // Tabs
    const tabs = screen.getAllByTestId('entities-tab-title');
    expect(tabs[0]).toHaveTextContent('User Tags');

    // Details
    const heading = baseElement.querySelectorAll('h2');

    expect(heading[1]).toHaveTextContent('Vulnerability');
    expect(baseElement).toHaveTextContent('Namefoo');
    expect(baseElement).toHaveTextContent('Severity5.0 (Medium)');
    // Skip until overrides are implemented for getResult
    // expect(
    //   screen.getAllByTitle('There are overrides for this result')[0],
    // ).toBeInTheDocument();
    expect(baseElement).toHaveTextContent('QoD80 %');
    expect(baseElement).toHaveTextContent('Host109.876.54.321');
    expect(baseElement).toHaveTextContent('Location80/tcp');

    expect(heading[2]).toHaveTextContent('Summary');
    expect(baseElement).toHaveTextContent('This is a mock result');

    expect(heading[3]).toHaveTextContent('Detection Result');
    expect(baseElement).toHaveTextContent('This is a description');

    expect(heading[4]).toHaveTextContent('Product Detection Result');
    expect(baseElement).toHaveTextContent('Productcpe:/a:python:python:2.7.16');
    expect(baseElement).toHaveTextContent(
      'MethodCVE-2019-13404 (OID: CVE-2019-13404)',
    );
    expect(baseElement).toHaveTextContent(
      'LogView details of product detection',
    );

    expect(heading[5]).toHaveTextContent('Insight');
    expect(baseElement).toHaveTextContent('This is just a test');

    expect(heading[6]).toHaveTextContent('Detection Method');
    expect(baseElement).toHaveTextContent('This is the detection method');
    expect(baseElement).toHaveTextContent(
      'Details: nvt1 OID: 1.3.6.1.4.1.25623.1.12345',
    );
    expect(baseElement).toHaveTextContent('Version used: 2019-02-14T07:33:50Z');

    expect(heading[7]).toHaveTextContent('Affected Software/OS');
    expect(baseElement).toHaveTextContent('Affects test cases only');

    expect(heading[8]).toHaveTextContent('Impact');
    expect(baseElement).toHaveTextContent('No real impact');

    expect(heading[9]).toHaveTextContent('Solution');
    expect(baseElement).toHaveTextContent(
      'Solution Type: st_vendorfix.svgVendorfix',
    );
    expect(baseElement).toHaveTextContent('Keep writing tests');

    expect(heading[10]).toHaveTextContent('References');
    expect(
      screen.getByTitle('View Details of CVE-2019-1234'),
    ).toHaveTextContent('CVE-2019-1234');
    expect(baseElement).toHaveTextContent('BID75750');
    expect(
      screen.getByTitle('View details of DFN-CERT Advisory DFN-CERT-2019-1234'),
    ).toHaveTextContent('DFN-CERT-2019-1234');

    expect(
      screen.getByTitle('View details of CERT-Bund Advisory CB-K12&#x2F;3456'),
    ).toHaveTextContent('CB-K12/3456');
    expect(baseElement).toHaveTextContent('Otherhttps://www.foo.bar');
    // Skip until overrides are implemented for getResult
    // expect(screen.getAllByTitle('Override Details')[0]).toBeInTheDocument();
    // expect(baseElement).toHaveTextContent('TestOverride');
    // expect(baseElement).toHaveTextContent(
    //   'ModifiedFri, Mar 12, 2021 2:00 PM CET',
    // );

    expect(screen.getAllByTitle('Note Details')[0]).toBeInTheDocument();
    expect(baseElement).toHaveTextContent('Very important note');
    expect(baseElement).toHaveTextContent(
      'ModifiedMon, Jun 3, 2019 1:05 PM CEST',
    );
  });

  test('should render user tags tab', async () => {
    const gmp = {
      result: {
        get: getResult,
      },
      permissions: {
        get: getPermissions,
      },
      settings: {manualUrl, reloadInterval},
      user: {currentSettings, renewSession},
    };

    const [mock, resultFunc] = createGetResultQueryMock();
    const [renewSessionQueryMock] = createRenewSessionQueryMock();

    const {render, store} = rendererWith({
      capabilities: true,
      gmp,
      router: true,
      store: true,
      queryMocks: [mock, renewSessionQueryMock],
    });

    store.dispatch(setTimezone('CET'));
    store.dispatch(setUsername('admin'));

    store.dispatch(entityLoadingActions.success('12345', result));

    const {baseElement} = render(<Detailspage id="12345" />);

    await wait();

    expect(resultFunc).toHaveBeenCalled();

    const tabs = screen.getAllByTestId('entities-tab-title');

    expect(tabs[0]).toHaveTextContent('User Tags');
    fireEvent.click(tabs[0]);

    expect(baseElement).toHaveTextContent('No user tags available');
  });

  test('should call commands', async () => {
    const exportFunc = jest.fn().mockResolvedValue({
      foo: 'bar',
    });

    const getUsers = jest.fn().mockResolvedValue({
      data: [],
      meta: {
        filter: Filter.fromString(),
        counts: new CollectionCounts(),
      },
    });

    const gmp = {
      result: {
        get: getResult,
        export: exportFunc,
      },
      permissions: {
        get: getPermissions,
      },
      users: {
        get: getUsers,
      },
      settings: {manualUrl, reloadInterval},
      user: {currentSettings, renewSession},
    };

    const [mock, resultFunc] = createGetResultQueryMock();
    const [renewSessionQueryMock] = createRenewSessionQueryMock();

    const {render, store} = rendererWith({
      capabilities: true,
      gmp,
      router: true,
      store: true,
      queryMocks: [mock, renewSessionQueryMock],
    });

    store.dispatch(setTimezone('CET'));
    store.dispatch(setUsername('admin'));

    store.dispatch(entityLoadingActions.success('12345', result));

    render(<Detailspage id="12345" />);

    await wait();

    expect(resultFunc).toHaveBeenCalled();

    // export result

    fireEvent.click(screen.getAllByTitle('Export Result as XML')[0]);

    await wait();

    expect(exportFunc).toHaveBeenCalled();

    // load users for create ticket dialog

    fireEvent.click(screen.getAllByTitle('Create new Ticket')[0]);

    await wait();

    expect(getUsers).toHaveBeenCalled();
  });
});

describe('Result ToolBarIcons tests', () => {
  test('should render', () => {
    const handleNoteCreateClick = jest.fn();
    const handleOverrideCreateClick = jest.fn();
    const handleResultDownloadClick = jest.fn();
    const handleTicketCreateClick = jest.fn();

    const gmp = {settings: {manualUrl}};

    const {render} = rendererWith({
      gmp,
      capabilities: true,
      router: true,
    });

    const {element} = render(
      <ToolBarIcons
        entity={result}
        onNoteCreateClick={handleNoteCreateClick}
        onOverrideCreateClick={handleOverrideCreateClick}
        onResultDownloadClick={handleResultDownloadClick}
        onTicketCreateClick={handleTicketCreateClick}
      />,
    );

    const links = element.querySelectorAll('a');
    const icons = screen.getAllByTestId('svg-icon');

    expect(icons.length).toBe(9);

    expect(screen.getAllByTitle('Help: Results')[0]).toBeInTheDocument();
    expect(links[0]).toHaveAttribute(
      'href',
      'test/en/reports.html#displaying-all-existing-results',
    );

    expect(screen.getAllByTitle('Results List')[0]).toBeInTheDocument();
    expect(links[1]).toHaveAttribute('href', '/results');

    expect(screen.getAllByTitle('Export Result as XML')[0]).toBeInTheDocument();
    expect(screen.getAllByTitle('Add new Note')[0]).toBeInTheDocument();
    expect(screen.getAllByTitle('Add new Override')[0]).toBeInTheDocument();
    expect(screen.getAllByTitle('Create new Ticket')[0]).toBeInTheDocument();
    expect(
      screen.getAllByTitle('Corresponding Task (task 1)')[0],
    ).toBeInTheDocument();
    expect(screen.getAllByTitle('Corresponding Report')[0]).toBeInTheDocument();
    expect(
      screen.getAllByTitle('Corresponding Tickets')[0],
    ).toBeInTheDocument();
  });

  test('should call click handlers', () => {
    const handleNoteCreateClick = jest.fn();
    const handleOverrideCreateClick = jest.fn();
    const handleResultDownloadClick = jest.fn();
    const handleTicketCreateClick = jest.fn();

    const gmp = {settings: {manualUrl}};

    const {render} = rendererWith({
      gmp,
      capabilities: true,
      router: true,
    });

    render(
      <ToolBarIcons
        entity={result}
        onNoteCreateClick={handleNoteCreateClick}
        onOverrideCreateClick={handleOverrideCreateClick}
        onResultDownloadClick={handleResultDownloadClick}
        onTicketCreateClick={handleTicketCreateClick}
      />,
    );

    fireEvent.click(screen.getAllByTitle('Export Result as XML')[0]);
    expect(handleResultDownloadClick).toHaveBeenCalledWith(result);

    fireEvent.click(screen.getAllByTitle('Add new Note')[0]);
    expect(handleNoteCreateClick).toHaveBeenCalledWith(result);

    fireEvent.click(screen.getAllByTitle('Add new Override')[0]);
    expect(handleOverrideCreateClick).toHaveBeenCalledWith(result);

    fireEvent.click(screen.getAllByTitle('Create new Ticket')[0]);
    expect(handleTicketCreateClick).toHaveBeenCalledWith(result);
  });

  test('should not show icons without permission', () => {
    const wrongCapabilities = new Capabilities(['get_results']);

    const handleNoteCreateClick = jest.fn();
    const handleOverrideCreateClick = jest.fn();
    const handleResultDownloadClick = jest.fn();
    const handleTicketCreateClick = jest.fn();

    const gmp = {settings: {manualUrl}};

    const {render} = rendererWith({
      gmp,
      capabilities: wrongCapabilities,
      router: true,
    });

    const {element} = render(
      <ToolBarIcons
        entity={result}
        onNoteCreateClick={handleNoteCreateClick}
        onOverrideCreateClick={handleOverrideCreateClick}
        onResultDownloadClick={handleResultDownloadClick}
        onTicketCreateClick={handleTicketCreateClick}
      />,
    );

    const links = element.querySelectorAll('a');
    const icons = screen.getAllByTestId('svg-icon');

    expect(icons.length).toBe(3);

    expect(screen.getAllByTitle('Help: Results')[0]).toBeInTheDocument();
    expect(links[0]).toHaveAttribute(
      'href',
      'test/en/reports.html#displaying-all-existing-results',
    );

    expect(screen.getAllByTitle('Results List')[0]).toBeInTheDocument();
    expect(links[1]).toHaveAttribute('href', '/results');

    expect(screen.getAllByTitle('Export Result as XML')[0]).toBeInTheDocument();
    expect(screen.queryByTitle('Add new Note')).not.toBeInTheDocument();
    expect(screen.queryByTitle('Add new Override')).not.toBeInTheDocument();
    expect(screen.queryByTitle('Create new Ticket')).not.toBeInTheDocument();
    expect(
      screen.queryByTitle('Corresponding Task (task 1)'),
    ).not.toBeInTheDocument();
    expect(screen.queryByTitle('Corresponding Report')).not.toBeInTheDocument();
    expect(
      screen.queryByTitle('Corresponding Tickets'),
    ).not.toBeInTheDocument();
  });
});
