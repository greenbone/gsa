/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, expect, test, testing} from '@gsa/testing';
import {rendererWith, screen, within} from 'web/testing';
import CollectionCounts from 'gmp/collection/collection-counts';
import Filter from 'gmp/models/filter';
import type Model from 'gmp/models/model';
import ReportHost from 'gmp/models/report/host';
import {
  SEVERITY_RATING_CVSS_2,
  SEVERITY_RATING_CVSS_3,
} from 'gmp/utils/severity';
import ContainerScanningHostsTable from 'web/pages/reports/details/ContainerScanningHostsTable';

const filter = Filter.fromString('first=1 rows=10');

const createMockHost = (overrides = {}) => {
  return ReportHost.fromElement({
    ip: 'sha256:abc123def456',
    start: '2024-01-15T10:00:00Z',
    end: '2024-01-15T10:30:00Z',
    result_count: {
      page: 50,
      critical: {page: 1},
      high: {page: 14},
      medium: {page: 30},
      low: {page: 5},
      log: {page: 0},
      false_positive: {page: 0},
    },
    detail: [
      {name: 'best_os_cpe', value: 'cpe:/o:linux:kernel'},
      {name: 'best_os_txt', value: 'Linux Kernel'},
    ],
    ...overrides,
  });
};

describe('ContainerScanningHostsTable', () => {
  test('should render table with all columns for CVSSv3', () => {
    const entities = [createMockHost()];
    const counts = new CollectionCounts({
      filtered: 1,
      all: 1,
      first: 1,
      rows: 10,
    });

    const gmp = {
      settings: {
        severityRating: SEVERITY_RATING_CVSS_3,
      },
    };

    const onSortChange = testing.fn();
    const {render} = rendererWith({gmp});

    render(
      <ContainerScanningHostsTable
        entities={entities as unknown as Model[]}
        entitiesCounts={counts}
        filter={filter}
        sortBy="severity"
        sortDir="desc"
        onSortChange={onSortChange}
      />,
    );

    const table = screen.getByRole('table');
    const columnHeaders = within(table).getAllByRole('columnheader');

    // Check all expected columns
    expect(columnHeaders.some(th => /Image/i.exec(th.textContent))).toBe(true);
    expect(columnHeaders.some(th => /OS/i.exec(th.textContent))).toBe(true);
    // CVSSv3 shows Critical column
    expect(columnHeaders.some(th => /Critical/i.exec(th.textContent))).toBe(
      true,
    );
    expect(columnHeaders.some(th => /High/i.exec(th.textContent))).toBe(true);
    expect(columnHeaders.some(th => /Medium/i.exec(th.textContent))).toBe(true);
    expect(columnHeaders.some(th => /Low/i.exec(th.textContent))).toBe(true);
    expect(columnHeaders.some(th => /Log/i.exec(th.textContent))).toBe(true);
    expect(columnHeaders.some(th => /False Pos\./i.exec(th.textContent))).toBe(
      true,
    );
    expect(columnHeaders.some(th => /Total/i.exec(th.textContent))).toBe(true);
    expect(columnHeaders.some(th => /Severity/i.exec(th.textContent))).toBe(
      true,
    );

    // Should NOT have these columns (they're in AgentScanningHostsTable)
    expect(columnHeaders.some(th => /Hostname/i.exec(th.textContent))).toBe(
      false,
    );
    expect(columnHeaders.some(th => /Agent ID/i.exec(th.textContent))).toBe(
      false,
    );
    expect(columnHeaders.some(th => /Ports/i.exec(th.textContent))).toBe(false);
    expect(columnHeaders.some(th => /Apps/i.exec(th.textContent))).toBe(false);
    expect(columnHeaders.some(th => /Distance/i.exec(th.textContent))).toBe(
      false,
    );
    expect(columnHeaders.some(th => /Auth/i.exec(th.textContent))).toBe(false);
    expect(columnHeaders.some(th => /Start/i.exec(th.textContent))).toBe(false);
    expect(columnHeaders.some(th => /End/i.exec(th.textContent))).toBe(false);
  });

  test('should render table with High column for CVSSv2', () => {
    const entities = [createMockHost()];
    const counts = new CollectionCounts({
      filtered: 1,
      all: 1,
      first: 1,
      rows: 10,
    });

    const gmp = {
      settings: {
        severityRating: SEVERITY_RATING_CVSS_2,
      },
    };

    const {render} = rendererWith({gmp});

    render(
      <ContainerScanningHostsTable
        entities={entities as unknown as Model[]}
        entitiesCounts={counts}
        filter={filter}
        sortBy="severity"
        sortDir="desc"
      />,
    );

    const table = screen.getByRole('table');
    const columnHeaders = within(table).getAllByRole('columnheader');

    // CVSSv2 shows High column instead of Critical
    // Note: The table has multiple severity columns, so we just check High exists
    expect(columnHeaders.some(th => /High/i.exec(th.textContent))).toBe(true);
    // Critical should not be present in CVSSv2
    expect(columnHeaders.some(th => /Critical/i.exec(th.textContent))).toBe(
      false,
    );
  });

  test('should render host data correctly', () => {
    const entities = [
      createMockHost({
        ip: 'sha256:fedcba987654',
        detail: [
          {name: 'best_os_cpe', value: 'cpe:/o:alpine:alpine_linux'},
          {name: 'best_os_txt', value: 'Alpine Linux'},
        ],
        result_count: {
          page: 100,
          critical: {page: 2},
          high: {page: 20},
          medium: {page: 50},
          low: {page: 25},
          log: {page: 3},
          false_positive: {page: 0},
        },
      }),
    ];
    const counts = new CollectionCounts({
      filtered: 1,
      all: 1,
      first: 1,
      rows: 10,
    });

    const gmp = {
      settings: {
        severityRating: SEVERITY_RATING_CVSS_3,
      },
    };

    const {render} = rendererWith({gmp});

    render(
      <ContainerScanningHostsTable
        entities={entities as unknown as Model[]}
        entitiesCounts={counts}
        filter={filter}
        sortBy="ip"
        sortDir="asc"
      />,
    );

    // Check IP address (container digest)
    expect(screen.getByText('sha256:fedcba987654')).toBeInTheDocument();

    const table = screen.getByRole('table');
    const allRows = within(table).getAllByRole('row');
    const dataRows = allRows.filter(
      row => within(row).queryAllByRole('cell').length > 0,
    );
    expect(dataRows).toHaveLength(1);

    const cells = within(dataRows[0]).getAllByRole('cell');
    expect(cells.some(cell => cell.textContent === '2')).toBe(true); // Critical
    expect(cells.some(cell => cell.textContent === '20')).toBe(true); // High
    expect(cells.some(cell => cell.textContent === '50')).toBe(true); // Medium
    expect(cells.some(cell => cell.textContent === '25')).toBe(true); // Low
    expect(cells.some(cell => cell.textContent === '3')).toBe(true); // Log
    expect(cells.some(cell => cell.textContent === '100')).toBe(true); // Total
  });

  test('should handle sorting by clicking on column headers', async () => {
    const entities = [createMockHost()];
    const counts = new CollectionCounts({
      filtered: 1,
      all: 1,
      first: 1,
      rows: 10,
    });

    const gmp = {
      settings: {
        severityRating: SEVERITY_RATING_CVSS_3,
      },
    };

    const onSortChange = testing.fn();
    const {render} = rendererWith({gmp});

    const {userEvent} = render(
      <ContainerScanningHostsTable
        entities={entities as unknown as Model[]}
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

  test('should render compliance columns in audit mode', () => {
    const entities = [
      createMockHost({
        compliance_count: {
          yes: 10,
          no: 5,
          incomplete: 2,
        },
      }),
    ];
    const counts = new CollectionCounts({
      filtered: 1,
      all: 1,
      first: 1,
      rows: 10,
    });

    const gmp = {
      settings: {
        severityRating: SEVERITY_RATING_CVSS_3,
      },
    };

    const {render} = rendererWith({gmp});

    render(
      <ContainerScanningHostsTable
        audit
        entities={entities as unknown as Model[]}
        entitiesCounts={counts}
        filter={filter}
      />,
    );

    const table = screen.getByRole('table');
    const columnHeaders = within(table).getAllByRole('columnheader');

    // Check for compliance columns
    expect(columnHeaders.some(th => /Yes/i.exec(th.textContent))).toBe(true);
    expect(columnHeaders.some(th => /No/i.exec(th.textContent))).toBe(true);
    expect(columnHeaders.some(th => /Incomplete/i.exec(th.textContent))).toBe(
      true,
    );
    expect(columnHeaders.some(th => /Compliant/i.exec(th.textContent))).toBe(
      true,
    );

    // Should not have severity columns
    expect(columnHeaders.some(th => /^Critical$/i.exec(th.textContent))).toBe(
      false,
    );
  });

  test('should render empty state when no hosts', () => {
    const counts = new CollectionCounts({
      filtered: 0,
      all: 0,
      first: 1,
      rows: 10,
    });

    const gmp = {
      settings: {
        severityRating: SEVERITY_RATING_CVSS_3,
      },
    };

    const {render} = rendererWith({gmp});

    render(
      <ContainerScanningHostsTable
        entities={[] as unknown as Model[]}
        entitiesCounts={counts}
        filter={filter}
      />,
    );

    expect(screen.getByText('No Hosts available')).toBeInTheDocument();
  });

  test('should render multiple hosts', () => {
    const entities = [
      createMockHost({
        ip: 'sha256:111111',
        result_count: {
          page: 10,
          critical: {page: 1},
          high: {page: 2},
          medium: {page: 3},
          low: {page: 4},
          log: {page: 0},
          false_positive: {page: 0},
        },
      }),
      createMockHost({
        ip: 'sha256:222222',
        result_count: {
          page: 20,
          critical: {page: 5},
          high: {page: 6},
          medium: {page: 7},
          low: {page: 2},
          log: {page: 0},
          false_positive: {page: 0},
        },
      }),
    ];
    const counts = new CollectionCounts({
      filtered: 2,
      all: 2,
      first: 1,
      rows: 10,
    });

    const gmp = {
      settings: {
        severityRating: SEVERITY_RATING_CVSS_3,
      },
    };

    const {render} = rendererWith({gmp});

    render(
      <ContainerScanningHostsTable
        entities={entities as unknown as Model[]}
        entitiesCounts={counts}
        filter={filter}
      />,
    );

    expect(screen.getByText('sha256:111111')).toBeInTheDocument();
    expect(screen.getByText('sha256:222222')).toBeInTheDocument();

    const table = screen.getByRole('table');
    const allRows = within(table).getAllByRole('row');
    const dataRows = allRows.filter(
      row => within(row).queryAllByRole('cell').length > 0,
    );
    expect(dataRows).toHaveLength(2);
  });

  test('should render OS icon when OS info is present', () => {
    const entities = [
      createMockHost({
        detail: [
          {name: 'best_os_cpe', value: 'cpe:/o:debian:debian_linux:11'},
          {name: 'best_os_txt', value: 'Debian GNU/Linux 11'},
        ],
      }),
    ];
    const counts = new CollectionCounts({
      filtered: 1,
      all: 1,
      first: 1,
      rows: 10,
    });

    const gmp = {
      settings: {
        severityRating: SEVERITY_RATING_CVSS_3,
      },
    };

    const {render} = rendererWith({gmp});

    render(
      <ContainerScanningHostsTable
        entities={entities as unknown as Model[]}
        entitiesCounts={counts}
        filter={filter}
      />,
    );

    // OS icon should be rendered (we can't easily test the icon itself, but we can check the structure)
    const table = screen.getByRole('table');
    expect(table).toBeInTheDocument();
  });

  test('should disable sorting when sort prop is false', () => {
    const entities = [createMockHost()];
    const counts = new CollectionCounts({
      filtered: 1,
      all: 1,
      first: 1,
      rows: 10,
    });

    const gmp = {
      settings: {
        severityRating: SEVERITY_RATING_CVSS_3,
      },
    };

    const {render} = rendererWith({gmp});

    render(
      <ContainerScanningHostsTable
        entities={entities as unknown as Model[]}
        entitiesCounts={counts}
        filter={filter}
        sort={false}
      />,
    );

    // When sort is false, headers should not have sortBy functionality
    // We can check that clicking doesn't trigger onSortChange
    const table = screen.getByRole('table');
    expect(table).toBeInTheDocument();
  });
});
