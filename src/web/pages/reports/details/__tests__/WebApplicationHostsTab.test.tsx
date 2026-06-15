/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, expect, test, testing} from '@gsa/testing';
import {rendererWith, screen} from 'web/testing';
import CollectionCounts from 'gmp/collection/collection-counts';
import Filter from 'gmp/models/filter';
import ReportHost from 'gmp/models/report/host';
import {SEVERITY_RATING_CVSS_3} from 'gmp/utils/severity';
import WebApplicationHostsTab from 'web/pages/reports/details/host/WebApplicationHostsTab';

const filter = Filter.fromString(
  'apply_overrides=0 levels=hml rows=2 min_qod=70 first=1 sort-reverse=severity',
);

const createMockHost = (overrides = {}) =>
  ReportHost.fromElement({
    ip: '1.2.3.4',
    detail: [
      {name: 'hostname', value: 'example.com'},
      {name: 'best_os_cpe', value: 'cpe:/o:linux:kernel'},
      {name: 'best_os_txt', value: 'Linux Kernel'},
      {name: 'App', value: 'app-1'},
      {name: 'App', value: 'app-2'},
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

const mockHosts = [
  createMockHost(),
  createMockHost({
    ip: '5.6.7.8',
    detail: [
      {name: 'hostname', value: 'example.org'},
      {name: 'best_os_cpe', value: 'cpe:/o:debian:debian_linux'},
      {name: 'best_os_txt', value: 'Debian Linux'},
      {name: 'App', value: 'app-1'},
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

const mockCounts = new CollectionCounts({
  all: 2,
  filtered: 2,
  first: 1,
  rows: 2,
  length: 2,
});

const gmp = {
  settings: {
    severityRating: SEVERITY_RATING_CVSS_3,
  },
};

describe('WebApplicationHostsTab', () => {
  test('should render Web Application Hosts Tab', () => {
    const onSortChange = testing.fn();
    const {render} = rendererWith({gmp, capabilities: true});

    render(
      <WebApplicationHostsTab
        audit={false}
        counts={mockCounts}
        filter={filter}
        hosts={mockHosts}
        isUpdating={false}
        sortField="severity"
        sortReverse={true}
        onSortChange={onSortChange}
      />,
    );

    const table = screen.getByRole('table');
    expect(table).toBeInTheDocument();
    expect(screen.getByText('example.com')).toBeInTheDocument();
    expect(screen.getByText('example.org')).toBeInTheDocument();
    expect(
      screen.getByText(
        '(Applied filter: apply_overrides=0 levels=hml rows=2 min_qod=70 first=1 sort-reverse=severity)',
      ),
    ).toBeInTheDocument();
    expect(screen.getAllByTestId('first-icon')).toHaveLength(2);
    expect(screen.getAllByTestId('previous-icon')).toHaveLength(2);
    expect(screen.getAllByTestId('next-icon')).toHaveLength(2);
    expect(screen.getAllByTestId('last-icon')).toHaveLength(2);
  });

  test('should call onSortChange when clicking the URL header', async () => {
    const onSortChange = testing.fn();
    const {render} = rendererWith({gmp, capabilities: true});
    const {userEvent} = render(
      <WebApplicationHostsTab
        audit={false}
        counts={mockCounts}
        filter={filter}
        hosts={mockHosts}
        isUpdating={false}
        sortField="hostname"
        sortReverse={false}
        onSortChange={onSortChange}
      />,
    );

    const hostnameHeader = screen.getByTestId('table-header-sort-by-hostname');
    await userEvent.click(hostnameHeader);

    expect(onSortChange).toHaveBeenCalledWith('hostname');
  });
});
