/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import Capabilities from 'gmp/capabilities/capabilities';
import CollectionCounts from 'gmp/collection/collectioncounts';
import Filter from 'gmp/models/filter';
import Result from 'gmp/models/result';
import {entityLoadingActions} from 'web/store/entities/results';
import {setTimezone, setUsername} from 'web/store/usersettings/actions';
import {rendererWith, fireEvent, screen, wait} from 'web/utils/testing';

import Detailspage, {ToolBarIcons} from '../detailspage';

// setup

const reloadInterval = -1;
const manualUrl = 'test/';
const enableEPSS = true;

// mock entity

export const result = Result.fromElement({
  _id: '12345',
  name: 'foo',
  owner: {name: 'admin'},
  comment: 'bar',
  creation_time: '2019-06-02T12:00:00Z',
  modification_time: '2019-06-03T11:00:00Z',
  host: {__text: '109.876.54.321'},
  port: '80/tcp',
  nvt: {
    _oid: '1.3.6.1.4.1.25623.1.12345',
    type: 'nvt',
    name: 'nvt1',
    tags: 'cvss_base_vector=AV:N/AC:M/Au:N/C:P/I:N/A:N|summary=This is a mock result|insight=This is just a test|affected=Affects test cases only|impact=No real impact|solution=Keep writing tests|vuldetect=This is the detection method|solution_type=Mitigation',
    epss: {
      max_severity: {
        score: 0.8765,
        percentile: 0.8,
        cve: {
          _id: 'CVE-2019-1234',
          severity: 5.0,
        },
      },
      max_epss: {
        score: 0.9876,
        percentile: 0.9,
        cve: {
          _id: 'CVE-2020-5678',
          severity: 2.0,
        },
      },
    },
    refs: {
      ref: [
        {_type: 'cve', _id: 'CVE-2019-1234'},
        {_type: 'cert-bund', _id: 'CB-K12/3456'},
        {_type: 'dfn-cert', _id: 'DFN-CERT-2019-1234'},
        {_type: 'url', _id: 'www.foo.bar'},
      ],
    },
    solution: {
      _type: 'Mitigation',
      __text: 'Keep writing tests',
    },
  },
  description: 'This is a description',
  threat: 'Medium',
  severity: 5.0,
  qod: {value: 80},
  task: {id: '314', name: 'task 1'},
  report: {id: '159'},
  tickets: {
    ticket: [{id: '265'}],
  },
  scan_nvt_version: '2019-02-14T07:33:50Z',
  notes: {
    note: [
      {
        _id: '358',
        text: 'TestNote',
        modification_time: '2021-03-11T13:00:32Z',
        active: 1,
      },
    ],
  },
  overrides: {
    override: [
      {
        _id: '979',
        text: 'TestOverride',
        modification_time: '2021-03-12T13:00:32Z',
        severity: 5.0,
        new_severity: 6.0,
        active: 1,
      },
    ],
  },
});

// mock gmp commands
let getResult;
let getPermissions;
let currentSettings;
let renewSession;

beforeEach(() => {
  getResult = testing.fn().mockResolvedValue({
    data: result,
  });

  getPermissions = testing.fn().mockResolvedValue({
    data: [],
    meta: {
      filter: Filter.fromString(),
      counts: new CollectionCounts(),
    },
  });

  currentSettings = testing.fn().mockResolvedValue({
    foo: 'bar',
  });

  renewSession = testing.fn().mockResolvedValue({
    foo: 'bar',
  });
});

describe('Result Detailspage tests', () => {
  test('should render full Detailspage', () => {
    const gmp = {
      result: {
        get: getResult,
      },
      permissions: {
        get: getPermissions,
      },
      settings: {manualUrl, reloadInterval, enableEPSS},
      user: {currentSettings, renewSession},
    };

    const {render, store} = rendererWith({
      gmp,
      capabilities: true,
      router: true,
      store: true,
    });

    store.dispatch(setTimezone('CET'));
    store.dispatch(setUsername('admin'));

    store.dispatch(entityLoadingActions.success('12345', result));

    const {baseElement} = render(<Detailspage id="12345" />);

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
    const spans = baseElement.querySelectorAll('span');
    expect(spans[12]).toHaveTextContent('User Tags');

    // Details
    const heading = baseElement.querySelectorAll('h2');

    expect(heading[1]).toHaveTextContent('Vulnerability');
    expect(baseElement).toHaveTextContent('Namefoo');
    expect(baseElement).toHaveTextContent('Severity5.0 (Medium)');
    expect(
      screen.getAllByTitle('There are overrides for this result')[0],
    ).toBeInTheDocument();
    expect(baseElement).toHaveTextContent('QoD80 %');
    expect(baseElement).toHaveTextContent('Host109.876.54.321');
    expect(baseElement).toHaveTextContent('Location80/tcp');
    expect(baseElement).toHaveTextContent('EPSS (CVE with highest severity)');
    expect(baseElement).toHaveTextContent('EPSS Score0.87650');
    expect(baseElement).toHaveTextContent('EPSS Percentage80.000%');
    expect(baseElement).toHaveTextContent('CVECVE-2019-1234');
    expect(baseElement).toHaveTextContent('CVE Severity5.0 (Medium)');
    expect(baseElement).toHaveTextContent('EPSS (highest EPSS score)');
    expect(baseElement).toHaveTextContent('EPSS Score0.98760');
    expect(baseElement).toHaveTextContent('EPSS Percentage90.000%');
    expect(baseElement).toHaveTextContent('CVECVE-2020-5678');
    expect(baseElement).toHaveTextContent('CVE Severity2.0 (Low)');
    expect(heading[2]).toHaveTextContent('Summary');
    expect(baseElement).toHaveTextContent('This is a mock result');

    expect(heading[3]).toHaveTextContent('Detection Result');
    expect(baseElement).toHaveTextContent('This is a description');

    expect(heading[4]).toHaveTextContent('Insight');
    expect(baseElement).toHaveTextContent('This is just a test');

    expect(heading[5]).toHaveTextContent('Detection Method');
    expect(baseElement).toHaveTextContent('This is the detection method');
    expect(baseElement).toHaveTextContent(
      'Details: nvt1 OID: 1.3.6.1.4.1.25623.1.12345',
    );
    expect(baseElement).toHaveTextContent('Version used: 2019-02-14T07:33:50Z');

    expect(heading[6]).toHaveTextContent('Affected Software/OS');
    expect(baseElement).toHaveTextContent('Affects test cases only');

    expect(heading[7]).toHaveTextContent('Impact');
    expect(baseElement).toHaveTextContent('No real impact');

    expect(heading[8]).toHaveTextContent('Solution');
    expect(baseElement).toHaveTextContent('Keep writing tests');

    expect(heading[9]).toHaveTextContent('References');
    expect(
      screen.getByTitle('View Details of CVE-2019-1234'),
    ).toHaveTextContent('CVE-2019-1234');
    expect(
      screen.getByTitle('View details of DFN-CERT Advisory DFN-CERT-2019-1234'),
    ).toHaveTextContent('DFN-CERT-2019-1234');

    expect(
      screen.getByTitle('View details of CERT-Bund Advisory CB-K12&#x2F;3456'),
    ).toHaveTextContent('CB-K12/3456');
    expect(baseElement).toHaveTextContent('Otherhttp://www.foo.bar');

    expect(screen.getAllByTitle('Override Details')[0]).toBeInTheDocument();
    expect(baseElement).toHaveTextContent('TestOverride');
    expect(baseElement).toHaveTextContent('ModifiedFri, Mar 12, 2021 2:00 PM');

    expect(screen.getAllByTitle('Note Details')[0]).toBeInTheDocument();
    expect(baseElement).toHaveTextContent('TestNote');
    expect(baseElement).toHaveTextContent('ModifiedThu, Mar 11, 2021 2:00 PM');
  });

  test('should render user tags tab', () => {
    const gmp = {
      result: {
        get: getResult,
      },
      permissions: {
        get: getPermissions,
      },
      settings: {manualUrl, reloadInterval, enableEPSS},
      user: {currentSettings, renewSession},
    };

    const {render, store} = rendererWith({
      capabilities: true,
      gmp,
      router: true,
      store: true,
    });

    store.dispatch(setTimezone('CET'));
    store.dispatch(setUsername('admin'));

    store.dispatch(entityLoadingActions.success('12345', result));

    const {baseElement} = render(<Detailspage id="12345" />);

    const spans = baseElement.querySelectorAll('span');
    expect(spans[12]).toHaveTextContent('User Tags');
    fireEvent.click(spans[12]);

    expect(baseElement).toHaveTextContent('No user tags available');
  });

  test('should call commands', async () => {
    const exportFunc = testing.fn().mockResolvedValue({
      foo: 'bar',
    });

    const getUsers = testing.fn().mockResolvedValue({
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
      settings: {manualUrl, reloadInterval, enableEPSS},
      user: {currentSettings, renewSession},
    };

    const {render, store} = rendererWith({
      capabilities: true,
      gmp,
      router: true,
      store: true,
    });

    store.dispatch(setTimezone('CET'));
    store.dispatch(setUsername('admin'));

    store.dispatch(entityLoadingActions.success('12345', result));

    render(<Detailspage id="12345" />);

    await wait();

    // export result

    fireEvent.click(screen.getAllByTitle('Export Result as XML')[0]);

    await wait();

    expect(exportFunc).toHaveBeenCalledWith(result);

    // load users for create ticket dialog

    fireEvent.click(screen.getAllByTitle('Create new Ticket')[0]);

    await wait();

    expect(getUsers).toHaveBeenCalled();
  });
});

describe('Result ToolBarIcons tests', () => {
  test('should render', () => {
    const handleNoteCreateClick = testing.fn();
    const handleOverrideCreateClick = testing.fn();
    const handleResultDownloadClick = testing.fn();
    const handleTicketCreateClick = testing.fn();

    const gmp = {settings: {manualUrl, enableEPSS}};

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
    const handleNoteCreateClick = testing.fn();
    const handleOverrideCreateClick = testing.fn();
    const handleResultDownloadClick = testing.fn();
    const handleTicketCreateClick = testing.fn();

    const gmp = {settings: {manualUrl, enableEPSS}};

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

    const handleNoteCreateClick = testing.fn();
    const handleOverrideCreateClick = testing.fn();
    const handleResultDownloadClick = testing.fn();
    const handleTicketCreateClick = testing.fn();

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
