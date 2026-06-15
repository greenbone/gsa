/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, expect, test, testing} from '@gsa/testing';
import {rendererWith, screen, within} from 'web/testing';
import CollectionCounts from 'gmp/collection/collection-counts';
import Filter from 'gmp/models/filter';
import ReportHost from 'gmp/models/report/host';
import {SEVERITY_RATING_CVSS_3} from 'gmp/utils/severity';
import WebApplicationHostsTable from 'web/pages/reports/details/host/WebApplicationHostsTable';

const filter = Filter.fromString('first=1 rows=10');

const createMockHost = (overrides = {}) =>
  ReportHost.fromElement({
    ip: '1.2.3.4',
    detail: [
      {name: 'hostname', value: 'example.com'},
      {name: 'best_os_cpe', value: 'cpe:/o:linux:kernel'},
      {name: 'best_os_txt', value: 'Linux Kernel'},
      {name: 'App', value: 'app-1'},
      {name: 'traceroute', value: '1,2,3'},
    ],
    port_count: {page: 5},
    result_count: {
      page: 20,
      critical: {page: 1},
      high: {page: 2},
      medium: {page: 5},
      low: {page: 3},
      log: {page: 0},
      false_positive: {page: 0},
    },
    severity: 7.5,
    ...overrides,
  });

const gmp = {
  settings: {
    severityRating: SEVERITY_RATING_CVSS_3,
  },
};

describe('WebApplicationHostsTable', () => {
  test('should render expected columns', () => {
    const entities = [createMockHost()];
    const counts = new CollectionCounts({
      filtered: 1,
      all: 1,
      first: 1,
      rows: 10,
    });
    const onSortChange = testing.fn();
    const {render} = rendererWith({gmp});

    render(
      <WebApplicationHostsTable
        //@ts-expect-error
        entities={entities}
        entitiesCounts={counts}
        filter={filter}
        sortBy="severity"
        sortDir="desc"
        onSortChange={onSortChange}
      />,
    );

    const table = screen.getByRole('table');
    const columnHeaders = within(table).getAllByRole('columnheader');

    expect(columnHeaders.some(th => /URL/i.exec(th.textContent))).toBe(true);
    expect(columnHeaders.some(th => /OS/i.exec(th.textContent))).toBe(true);
    expect(columnHeaders.some(th => /Total/i.exec(th.textContent))).toBe(true);
    expect(columnHeaders.some(th => /Severity/i.exec(th.textContent))).toBe(
      true,
    );
  });

  test('should render host data correctly', () => {
    const entities = [
      createMockHost({
        ip: '5.6.7.8',
        detail: [
          {name: 'hostname', value: 'example.org'},
          {name: 'best_os_cpe', value: 'cpe:/o:debian:debian_linux'},
          {name: 'best_os_txt', value: 'Debian Linux'},
          {name: 'App', value: 'app-1'},
          {name: 'App', value: 'app-2'},
          {name: 'traceroute', value: '1,2,3,4'},
        ],
        port_count: {page: 2},
        result_count: {
          page: 10,
          critical: {page: 0},
          high: {page: 1},
          medium: {page: 4},
          low: {page: 2},
          log: {page: 0},
          false_positive: {page: 0},
        },
        severity: 5.0,
      }),
    ];
    const counts = new CollectionCounts({
      filtered: 1,
      all: 1,
      first: 1,
      rows: 10,
    });
    const {render} = rendererWith({gmp});

    render(
      <WebApplicationHostsTable
        //@ts-expect-error
        entities={entities}
        entitiesCounts={counts}
        filter={filter}
        sortBy="hostname"
        sortDir="asc"
      />,
    );

    expect(screen.getByText('example.org')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();

    const table = screen.getByRole('table');
    const allRows = within(table).getAllByRole('row');
    const dataRows = allRows.filter(
      row => within(row).queryAllByRole('cell').length > 0,
    );
    expect(dataRows).toHaveLength(1);

    const cells = within(dataRows[0]).getAllByRole('cell');
    expect(cells.some(cell => cell.textContent === '1')).toBe(true);
    expect(cells.some(cell => cell.textContent === '2')).toBe(true);
    expect(cells.some(cell => cell.textContent === '4')).toBe(true);
    expect(cells.some(cell => cell.textContent === '10')).toBe(true);
  });

  test('should call onSortChange when clicking the hostname header', async () => {
    const entities = [createMockHost()];
    const counts = new CollectionCounts({
      filtered: 1,
      all: 1,
      first: 1,
      rows: 10,
    });
    const onSortChange = testing.fn();
    const {render} = rendererWith({gmp});
    const {userEvent} = render(
      <WebApplicationHostsTable
        //@ts-expect-error
        entities={entities}
        entitiesCounts={counts}
        filter={filter}
        sortBy="hostname"
        sortDir="asc"
        onSortChange={onSortChange}
      />,
    );

    const hostnameHeader = screen.getByTestId('table-header-sort-by-hostname');
    await userEvent.click(hostnameHeader);

    expect(onSortChange).toHaveBeenCalledWith('hostname');
  });
});
