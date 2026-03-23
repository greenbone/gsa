/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {rendererWith, fireEvent, screen, within} from 'web/testing';
import CollectionCounts from 'gmp/collection/collection-counts';
import Response from 'gmp/http/response';
import Filter from 'gmp/models/filter';
import Result from 'gmp/models/result';
import {currentSettingsDefaultResponse} from 'web/pages/__fixtures__/current-settings';
import DetailsPage from 'web/pages/results/DetailsPage';
import {entityLoadingActions} from 'web/store/entities/results';
import {setTimezone, setUsername} from 'web/store/usersettings/actions';

const reloadInterval = -1;
const manualUrl = 'test/';
const enableEPSS = true;

const result = Result.fromElement({
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
        percentile: 80.0,
        cve: {
          _id: 'CVE-2019-1234',
          severity: 5.0,
        },
      },
      max_epss: {
        score: 0.9876,
        percentile: 90.0,
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
  description: 'This is a result description',
  threat: 'Medium',
  severity: 5.0,
  qod: {value: 80},
  task: {_id: '314', name: 'task 1'},
  report: {_id: '159'},
  tickets: {
    ticket: [{_id: '265'}],
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

const createGmp = ({
  getResultResponse = new Response(result),
  getPermissionsResponse = new Response([], {
    filter: Filter.fromString(),
    counts: new CollectionCounts(),
  }),
  getUsersResponse = new Response([], {
    filter: Filter.fromString(),
    counts: new CollectionCounts(),
  }),
  currentSettingsResponse = currentSettingsDefaultResponse,
  exportResultResponse = new Response({foo: 'bar'}),
  getResult = testing.fn().mockResolvedValue(getResultResponse),
  getPermissions = testing.fn().mockResolvedValue(getPermissionsResponse),
  getUsers = testing.fn().mockResolvedValue(getUsersResponse),
  currentSettings = testing.fn().mockResolvedValue(currentSettingsResponse),
  exportResult = testing.fn().mockResolvedValue(exportResultResponse),
} = {}) => {
  return {
    result: {
      get: getResult,
      export: exportResult,
    },
    permissions: {
      get: getPermissions,
    },
    settings: {manualUrl, reloadInterval, enableEPSS},
    user: {
      currentSettings,
    },
    users: {
      get: getUsers,
    },
  };
};

describe('ResultDetailsPage tests', () => {
  test('should render full DetailsPage', async () => {
    const gmp = createGmp();
    const {render, store} = rendererWith({
      gmp,
      capabilities: true,
      router: true,
      store: true,
    });

    store.dispatch(setTimezone('CET'));
    store.dispatch(setUsername('admin'));

    store.dispatch(entityLoadingActions.success('12345', result));

    render(<DetailsPage id="12345" />);

    // Toolbar Icons
    screen.getByTitle('Help: Results');
    expect(screen.getByTestId('manual-link')).toHaveAttribute(
      'href',
      'test/en/reports.html#displaying-all-existing-results',
    );
    screen.getByTitle('Results List');
    expect(screen.getByTestId('list-link-icon')).toHaveAttribute(
      'href',
      '/results',
    );

    screen.getByTitle('Export Result as XML');
    screen.getByTitle('Add new Note');
    screen.getByTitle('Add new Override');
    screen.getByTitle('Create new Ticket');
    screen.getByTitle('Corresponding Task (task 1)');
    screen.getByTitle('Corresponding Report');
    screen.getByTitle('Corresponding Tickets');

    screen.getByRole('heading', {name: /Result: foo/});
    const entityInfo = within(screen.getByTestId('entity-info'));
    const infoRows = entityInfo.getAllByRole('row');
    expect(infoRows[0]).toHaveTextContent('12345');
    expect(infoRows[1]).toHaveTextContent(
      'Sun, Jun 2, 2019 2:00 PM Central European Summer Time',
    );
    expect(infoRows[2]).toHaveTextContent(
      'Mon, Jun 3, 2019 1:00 PM Central European Summer Time',
    );
    expect(infoRows[3]).toHaveTextContent('admin');

    // Tabs
    screen.getByRole('tab', {name: /^information/i});
    screen.getByRole('tab', {name: /^user tags/i});

    // Details
    screen.getByRole('heading', {name: /^Vulnerability/});
    expect(screen.getByText('Name').closest('tr')).toHaveTextContent('foo');
    expect(screen.getByText('Severity').closest('tr')).toHaveTextContent(
      '5.0 (Medium)',
    );
    screen.getByTitle('There are overrides for this result');
    expect(screen.getByText('QoD').closest('tr')).toHaveTextContent('80 %');
    expect(screen.getByText('Host').closest('tr')).toHaveTextContent(
      '109.876.54.321',
    );
    expect(screen.getByText('Location').closest('tr')).toHaveTextContent(
      '80/tcp',
    );

    const epssCVSS = within(
      screen.getByRole('heading', {
        name: /^EPSS \(CVE with highest severity\)/,
      }).nextSibling,
    );
    const epssCVSSRows = epssCVSS.getAllByRole('row');
    expect(epssCVSSRows[0]).toHaveTextContent('87.650%');
    expect(epssCVSSRows[1]).toHaveTextContent('80th');
    expect(epssCVSSRows[2]).toHaveTextContent('CVE-2019-1234');
    expect(epssCVSSRows[3]).toHaveTextContent('5.0 (Medium)');

    const epssScore = within(
      screen.getByRole('heading', {
        name: /^EPSS \(highest EPSS score\)/,
      }).nextSibling,
    );
    const epssScoreRows = epssScore.getAllByRole('row');
    expect(epssScoreRows[0]).toHaveTextContent('98.760%');
    expect(epssScoreRows[1]).toHaveTextContent('90th');
    expect(epssScoreRows[2]).toHaveTextContent('CVE-2020-5678');
    expect(epssScoreRows[3]).toHaveTextContent('2.0 (Low)');

    screen.getByRole('heading', {name: /^Summary/});
    screen.getByText('This is a mock result');

    screen.getByRole('heading', {name: /^Detection Result/});
    screen.getByText('This is a result description');

    screen.getByRole('heading', {name: /^Insight/});
    screen.getByText('This is just a test');

    screen.getByRole('heading', {name: /^Detection Method/});
    screen.getByText('This is the detection method');

    const detectionMethodBlock = within(
      screen.getByRole('heading', {
        name: /^Detection Method/,
      }).parentElement,
    );
    const detectionRows = detectionMethodBlock.getAllByRole('row');
    expect(detectionRows[0]).toHaveTextContent(
      'nvt1 OID: 1.3.6.1.4.1.25623.1.12345',
    );
    expect(detectionRows[1]).toHaveTextContent('2019-02-14T07:33:50Z');

    const affectedSoftware = screen.getByRole('heading', {
      name: /^Affected Software\/OS/,
    });
    expect(affectedSoftware.nextSibling).toHaveTextContent(
      'Affects test cases only',
    );

    const impact = screen.getByRole('heading', {name: /^Impact/});
    expect(impact.nextSibling).toHaveTextContent('No real impact');

    const solution = screen.getByRole('heading', {name: /^Solution/});
    expect(solution.nextSibling).toHaveTextContent('Keep writing tests');

    const nvtReferences = within(screen.getByTestId('nvt-references'));
    expect(
      nvtReferences.getByRole('heading', {name: /^References/}),
    ).toBeInTheDocument();
    expect(
      nvtReferences.getByTitle('View Details of CVE-2019-1234'),
    ).toHaveTextContent('CVE-2019-1234');
    expect(
      nvtReferences.getByTitle(
        'View details of DFN-CERT Advisory DFN-CERT-2019-1234',
      ),
    ).toHaveTextContent('DFN-CERT-2019-1234');
    expect(
      nvtReferences.getByTitle(
        'View details of CERT-Bund Advisory CB-K12&#x2F;3456',
      ),
    ).toHaveTextContent('CB-K12/3456');
    expect(nvtReferences.getByRole('row', {name: /^Other/})).toHaveTextContent(
      'http://www.foo.bar',
    );

    const overrides = within(
      screen.getByRole('heading', {name: /^Overrides/}).parentNode,
    );
    expect(overrides.getByText(/^TestOverride/)).toBeInTheDocument();
    expect(overrides.getByRole('row', {name: /^Modified/})).toHaveTextContent(
      'Fri, Mar 12, 2021 2:00 PM',
    );

    const notes = within(
      screen.getByRole('heading', {name: /^Notes/}).parentNode,
    );
    expect(notes.getByText(/^TestNote/)).toBeInTheDocument();
    expect(notes.getByRole('row', {name: /^Modified/})).toHaveTextContent(
      'Thu, Mar 11, 2021 2:00 PM',
    );
  });

  test('should render user tags tab', async () => {
    const gmp = createGmp();
    const {render, store} = rendererWith({
      capabilities: true,
      gmp,
      router: true,
      store: true,
    });

    store.dispatch(setTimezone('CET'));
    store.dispatch(setUsername('admin'));

    store.dispatch(entityLoadingActions.success('12345', result));

    const {container} = render(<DetailsPage id="12345" />);

    const userTagsTab = screen.getByRole('tab', {name: /^user tags/i});
    fireEvent.click(userTagsTab);
    expect(container).toHaveTextContent('No user tags available');
  });

  test('should call commands', async () => {
    const gmp = createGmp();
    const {render, store} = rendererWith({
      gmp,
      capabilities: true,
      router: true,
      store: true,
    });

    store.dispatch(setTimezone('CET'));
    store.dispatch(setUsername('admin'));

    store.dispatch(entityLoadingActions.success('12345', result));

    render(<DetailsPage id="12345" />);

    // export result
    fireEvent.click(screen.getByTitle('Export Result as XML'));
    expect(gmp.result.export).toHaveBeenCalledWith(result);

    // load users for create ticket dialog
    fireEvent.click(screen.getByTitle('Create new Ticket'));
    expect(gmp.users.get).toHaveBeenCalled();
  });
});
