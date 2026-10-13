/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {rendererWith, waitFor, fireEvent, screen, within} from 'web/testing';
import {Route, Routes} from 'react-router';
import CollectionCounts from 'gmp/collection/collection-counts';
import Response from 'gmp/http/response';
import CPE from 'gmp/models/cpe';
import QueryFilter from 'gmp/models/filter/query-filter';
import {createSession} from 'gmp/testing';
import {SEVERITY_RATING_CVSS_3} from 'gmp/utils/severity';
import {currentSettingsDefaultResponse} from 'web/pages/__fixtures__/current-settings';
import CpePage from 'web/pages/cpes/DetailsPage';

const cpe = CPE.fromElement({
  _id: 'cpe:/a:foo',
  name: 'foo',
  creation_time: '2019-06-24T11:55:30Z',
  modification_time: '2019-06-24T10:12:27Z',
  update_time: '2019-06-24T10:12:27Z',
  cpe: {
    cve_refs: 3,
    cves: {
      cve: [
        {entry: {cvss: {base_metrics: {score: 9.7}}, _id: 'CVE-2020-1234'}},
        {entry: {cvss: {base_metrics: {score: 5.4}}, _id: 'CVE-2020-5678'}},
        {entry: {cvss: {base_metrics: {score: 1.8}}, _id: 'CVE-2019-5678'}},
      ],
    },
    title: 'bar',
    severity: 9.8,
    nvd_id: '',
  },
});

const reloadInterval = -1;
const manualUrl = 'test/';

const createGmp = ({
  currentSettingsResponse = currentSettingsDefaultResponse,
  getCpeResponse = new Response(cpe),
  getTagsResponse = new Response([], {
    filter: QueryFilter.fromString(),
    counts: new CollectionCounts(),
  }),
  getCpes = testing.fn().mockResolvedValue({data: []}),
  currentSettings = testing.fn().mockResolvedValue(currentSettingsResponse),
  exportCpeResponse = new Response({foo: 'bar'}),
  getCpe = testing.fn().mockResolvedValue(getCpeResponse),
  getTags = testing.fn().mockResolvedValue(getTagsResponse),
  exportCpe = testing.fn().mockResolvedValue(exportCpeResponse),
} = {}) => ({
  cpe: {
    get: getCpe,
    export: exportCpe,
  },
  cpes: {
    get: getCpes,
  },
  tags: {
    get: getTags,
  },
  reloadInterval,
  settings: {
    manualUrl,
    reloadInterval,
    severityRating: SEVERITY_RATING_CVSS_3,
  },
  session: createSession({timezone: 'UTC', token: 'test-token'}),
  user: {
    currentSettings,
    getSetting: testing.fn().mockResolvedValue({data: {value: '%T-%U'}}),
  },
});

describe('CpeDetailsPage tests', () => {
  const renderCpeRoute = render =>
    render(
      <Routes>
        <Route element={<CpePage />} path="/cpe/:id" />
      </Routes>,
    );

  test('should navigate to CPE candidates when direct lookup has matches', async () => {
    const searchFilter = 'name:gitlab:gitlab:18.5.1 first=1 rows=20';
    const gmp = createGmp({
      getCpe: testing
        .fn()
        .mockRejectedValue(
          Object.assign(new Error('CPE not found'), {status: 404}),
        ),
      getCpes: testing.fn().mockResolvedValue({
        data: [
          CPE.fromElement({
            _id: 'cpe:/a:gitlab:gitlab:18.5.1::~~enterprise~~~',
            name: 'cpe:/a:gitlab:gitlab:18.5.1::~~enterprise~~~',
            cpe: {title: 'GitLab 18.5.1 Enterprise Edition'},
          }),
          CPE.fromElement({
            _id: 'cpe:/a:gitlab:gitlab:18.5.1::~~community~~~',
            name: 'cpe:/a:gitlab:gitlab:18.5.1::~~community~~~',
            cpe: {title: 'GitLab 18.5.1 Community Edition'},
          }),
        ],
      }),
    });
    const {render} = rendererWith({
      gmp,
      capabilities: true,
      router: true,
      showLocation: true,
      route: `/cpe/${encodeURIComponent('cpe:/a:gitlab:gitlab:18.5.1')}`,
    });
    renderCpeRoute(render);

    await waitFor(() => {
      expect(screen.getByTestId('location-pathname')).toHaveTextContent(
        '/cpes',
      );
      expect(screen.getByTestId('location-search')).toHaveTextContent(
        `?filter=${encodeURIComponent(searchFilter)}`,
      );
    });
    expect(gmp.cpes.get.mock.calls[0][0].filter.get('name')).toBe(
      'gitlab:gitlab:18.5.1',
    );
    expect(
      gmp.cpes.get.mock.calls[0][0].filter.getTerms('name')[0].relation,
    ).toBe(':');
  });

  test('should keep not-found page when candidate lookup has no matches', async () => {
    const error = Object.assign(new Error('CPE not found'), {status: 404});
    const {render} = rendererWith({
      gmp: createGmp({
        getCpe: testing.fn().mockRejectedValue(error),
        getCpes: testing.fn().mockResolvedValue({data: []}),
      }),
      capabilities: true,
      router: true,
      route: `/cpe/${encodeURIComponent('cpe:/a:univention:univention_management_console')}`,
    });

    renderCpeRoute(render);

    await waitFor(() => {
      expect(
        screen.getByText(/The CPE you were looking for could not be found/i),
      ).toBeInTheDocument();
    });
  });

  test('should render full DetailsPage', async () => {
    const gmp = createGmp();
    const {render} = rendererWith({
      gmp,
      capabilities: true,
      router: true,
      route: `/cpe/${encodeURIComponent('cpe:/a:foo')}`,
    });
    renderCpeRoute(render);

    await waitFor(() => {
      expect(gmp.cpe.get).toHaveBeenCalledWith({id: 'cpe:/a:foo'});
      expect(screen.getByTitle('Help: CPEs')).toBeInTheDocument();
    });

    expect(screen.getByTitle('Help: CPEs')).toBeInTheDocument();
    expect(screen.getByTestId('manual-link')).toHaveAttribute(
      'href',
      'test/en/managing-secinfo.html#cpe',
    );

    expect(screen.getByTitle('CPE List')).toBeInTheDocument();
    expect(screen.getByTestId('list-link-icon')).toHaveAttribute(
      'href',
      '/cpes',
    );

    expect(screen.getByTestId('export-icon')).toHaveAttribute(
      'title',
      'Export CPE',
    );

    // test title bar
    expect(screen.getByRole('heading', {name: /CPE: foo/})).toBeInTheDocument();

    const entityInfo = within(screen.getByTestId('entity-info'));
    expect(entityInfo.getByRole('row', {name: /^ID:/})).toHaveTextContent(
      'cpe:/a:foo',
    );
    expect(
      entityInfo.getByRole('row', {name: /^modified:/i}),
    ).toHaveTextContent(
      'Mon, Jun 24, 2019 10:12 AM Coordinated Universal Time',
    );
    expect(entityInfo.getByRole('row', {name: /^created:/i})).toHaveTextContent(
      'Mon, Jun 24, 2019 11:55 AM Coordinated Universal Time',
    );
    expect(
      entityInfo.getByRole('row', {name: /^last updated:/i}),
    ).toHaveTextContent(
      'Last updated:Mon, Jun 24, 2019 10:12 AM Coordinated Universal Time',
    );
    const severityRow = screen.getByRole('row', {name: /^severity/i});
    expect(within(severityRow).getByText('9.8 (Critical)')).toBeInTheDocument();

    // details
    expect(
      screen.getByRole('heading', {name: /^Reported Vulnerabilities/}),
    ).toBeInTheDocument();
    const firstCVE = screen.getByRole('row', {name: /^CVE-2020-1234/});
    expect(within(firstCVE).getByText('9.7 (Critical)')).toBeInTheDocument();
    const secondCVE = screen.getByRole('row', {name: /^CVE-2020-5678/});
    expect(within(secondCVE).getByText('5.4 (Medium)')).toBeInTheDocument();
    const thirdCVE = screen.getByRole('row', {name: /^CVE-2019-5678/});
    expect(within(thirdCVE).getByText('1.8 (Low)')).toBeInTheDocument();
  });

  test('should render user tags tab', async () => {
    const gmp = createGmp();
    const {render} = rendererWith({
      gmp,
      capabilities: true,
      router: true,
      route: `/cpe/${encodeURIComponent('cpe:/a:foo')}`,
    });

    const {container} = renderCpeRoute(render);

    const userTagsTab = await screen.findByRole('tab', {name: /^user tags/i});
    fireEvent.click(userTagsTab);
    expect(container).toHaveTextContent('No user tags available');
  });

  test('should call commands', async () => {
    const gmp = createGmp();
    const {render} = rendererWith({
      gmp,
      capabilities: true,
      router: true,
      route: `/cpe/${encodeURIComponent('cpe:/a:foo')}`,
    });

    renderCpeRoute(render);
    const exportIcon = await screen.findByTestId('export-icon');
    expect(exportIcon).toHaveAttribute('title', 'Export CPE');
    fireEvent.click(exportIcon);
    await waitFor(() => {
      expect(gmp.cpe.export).toHaveBeenCalledWith(cpe);
    });
  });
});
