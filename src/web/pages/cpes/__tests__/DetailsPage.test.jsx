/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {rendererWith, wait, fireEvent, screen, within} from 'web/testing';
import CollectionCounts from 'gmp/collection/collection-counts';
import Response from 'gmp/http/response';
import CPE from 'gmp/models/cpe';
import Filter from 'gmp/models/filter';
import {SEVERITY_RATING_CVSS_3} from 'gmp/utils/severity';
import {currentSettingsDefaultResponse} from 'web/pages/__fixtures__/current-settings';
import CpePage from 'web/pages/cpes/DetailsPage';
import {entityLoadingActions} from 'web/store/entities/cpes';
import {setTimezone, setUsername} from 'web/store/usersettings/actions';

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
    filter: Filter.fromString(),
    counts: new CollectionCounts(),
  }),
  currentSettings = testing.fn().mockResolvedValue(currentSettingsResponse),
  exportCpeResponse = new Response({foo: 'bar'}),
  getCpe = testing.fn().mockResolvedValue(getCpeResponse),
  getTags = testing.fn().mockResolvedValue(getTagsResponse),
  exportCpe = testing.fn().mockResolvedValue(exportCpeResponse),
} = {}) => {
  return {
    cpe: {
      get: getCpe,
      export: exportCpe,
    },
    tags: {
      get: getTags,
    },
    reloadInterval,
    settings: {manualUrl, severityRating: SEVERITY_RATING_CVSS_3},
    user: {
      currentSettings,
    },
  };
};

describe('CpeDetailsPage tests', () => {
  test('should render full DetailsPage', () => {
    const gmp = createGmp();
    const {render, store} = rendererWith({
      gmp,
      capabilities: true,
      router: true,
      store: true,
    });

    store.dispatch(setTimezone('UTC'));
    store.dispatch(setUsername('admin'));

    store.dispatch(entityLoadingActions.success('cpe:/a:foo', cpe));

    render(<CpePage id="cpe:/a:foo" />);

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
    const {render, store} = rendererWith({
      gmp,
      capabilities: true,
      router: true,
      store: true,
    });

    store.dispatch(setTimezone('CET'));

    store.dispatch(entityLoadingActions.success('cpe:/a:foo', cpe));

    const {container} = render(<CpePage id="cpe:/a:foo" />);

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

    store.dispatch(entityLoadingActions.success('cpe:/a:foo', cpe));

    render(<CpePage id="cpe:/a:foo" />);
    const exportIcon = screen.getByTestId('export-icon');
    expect(exportIcon).toHaveAttribute('title', 'Export CPE');
    fireEvent.click(exportIcon);
    await wait();
    expect(gmp.cpe.export).toHaveBeenCalledWith(cpe);
  });
});
