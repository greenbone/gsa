/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, expect, test, testing} from '@gsa/testing';
import {
  fireEvent,
  getSelectItemElementsForSelect,
  rendererWith,
  screen,
  wait,
  within,
} from 'web/testing';
import CollectionCounts from 'gmp/collection/collection-counts';
import QueryFilter from 'gmp/models/filter/query-filter';
import Vulnerability from 'gmp/models/vulnerability';
import {createSession} from 'gmp/testing';
import VulnerabilitiesListPage from 'web/pages/vulnerabilities/VulnerabilitiesListPage';
import {defaultFilterLoadingActions} from 'web/store/usersettings/defaultfilters/actions';
import {loadingActions} from 'web/store/usersettings/defaults/actions';

const createVulnerability = (id = 'vuln-1', name = 'CVE-2026-0001') =>
  Vulnerability.fromElement({
    _id: id,
    name,
    qod: 80,
    severity: 7.5,
    results: {
      count: 2,
      oldest: '2026-01-01T00:00:00Z',
      newest: '2026-02-01T00:00:00Z',
    },
    hosts: {
      count: 1,
    },
  });

const createGmp = ({
  getVulns = testing.fn().mockResolvedValue({
    data: [createVulnerability()],
    meta: {
      filter: QueryFilter.fromString('first=1 rows=10'),
      counts: new CollectionCounts({
        first: 1,
        all: 1,
        filtered: 1,
        length: 1,
        rows: 10,
      }),
    },
  }),
  exportByFilter = testing.fn().mockResolvedValue({data: '<xml />'}),
  exportByIds = testing.fn().mockResolvedValue({data: '<xml />'}),
  getAggregates = testing.fn().mockResolvedValue({
    data: [],
    meta: {
      filter: QueryFilter.fromString(),
      counts: new CollectionCounts(),
    },
  }),
} = {}) => ({
  settings: {
    manualUrl: 'https://docs.greenbone.net',
    reloadInterval: -1,
  },
  session: createSession({token: 'token'}),
  vulns: {
    get: getVulns,
    getSeverityAggregates: getAggregates,
    getHostAggregates: getAggregates,
    deleteByFilter: testing.fn().mockResolvedValue({}),
    delete: testing.fn().mockResolvedValue({}),
    exportByFilter,
    export: exportByIds,
  },
  dashboard: {
    getSetting: testing.fn().mockResolvedValue({
      data: [],
      meta: {
        filter: QueryFilter.fromString(),
        counts: new CollectionCounts(),
      },
    }),
  },
  filters: {
    get: testing.fn().mockResolvedValue({
      data: [],
      meta: {
        filter: QueryFilter.fromString(),
        counts: new CollectionCounts(),
      },
    }),
  },
  user: {
    getSetting: testing.fn().mockResolvedValue({data: null}),
  },
});

describe('VulnerabilitiesListPage tests', () => {
  test('exports selected vulnerabilities when "Apply to selection" is chosen', async () => {
    const exportByFilter = testing.fn().mockResolvedValue({data: '<xml />'});
    const exportByIds = testing.fn().mockResolvedValue({data: '<xml />'});
    const gmp = createGmp({exportByFilter, exportByIds});

    const {render, store} = rendererWith({
      capabilities: true,
      gmp,
      store: true,
    });

    store.dispatch(
      loadingActions.success({
        rowsperpage: {value: '10'},
        listexportfilename: {value: '$o-$d'},
      }),
    );
    store.dispatch(
      defaultFilterLoadingActions.success(
        'vulnerability',
        QueryFilter.fromString('first=1 rows=10'),
      ),
    );

    render(<VulnerabilitiesListPage />);
    await screen.findByText('CVE-2026-0001');

    const tableFooter = within(screen.queryTableFooter() as HTMLElement);
    const select = tableFooter.getSelectElement();
    const selectItems = await getSelectItemElementsForSelect(select);
    fireEvent.click(selectItems[1]);
    expect(select).toHaveValue('Apply to selection');

    const tableBody = within(screen.queryTableBody() as HTMLElement);
    const inputs = tableBody.queryCheckBoxes();
    fireEvent.click(inputs[0]);

    const exportIcon = screen.getByTitle('Export selection');
    fireEvent.click(exportIcon);
    await wait();

    expect(exportByIds).toHaveBeenCalled();
    expect(exportByFilter).not.toHaveBeenCalled();
  });

  test('uses pagination controls to request next vulnerabilities page', async () => {
    const counts = new CollectionCounts({
      first: 11,
      all: 100,
      filtered: 50,
      length: 10,
      rows: 10,
    });
    const listFilter = QueryFilter.fromString('first=11 rows=10');
    const getVulns = testing.fn().mockResolvedValue({
      data: [createVulnerability()],
      meta: {
        filter: listFilter,
        counts,
      },
    });
    const gmp = createGmp({getVulns});

    const {render, store} = rendererWith({
      capabilities: true,
      gmp,
      store: true,
    });

    store.dispatch(loadingActions.success({rowsperpage: {value: '10'}}));
    store.dispatch(
      defaultFilterLoadingActions.success('vulnerability', listFilter),
    );

    render(<VulnerabilitiesListPage />);
    await screen.findByText('CVE-2026-0001');

    getVulns.mockClear();
    const footer = within(screen.getByTestId('entities-table-footer'));
    fireEvent.click(footer.getByTitle('Next'));
    await wait();

    const nextFilterString = getVulns.mock.calls[0][0].filter.toFilterString();
    expect(nextFilterString).toContain('first=21');
    expect(nextFilterString).toContain('rows=10');
  });
});
