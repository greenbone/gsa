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
import AgentScanningHostsTable from 'web/pages/reports/details/AgentScanningHostsTable';

const filter = Filter.fromString('first=1 rows=10');

const createMockHost = (overrides = {}) => {
  return ReportHost.fromElement({
    ip: '192.168.1.100',
    asset: {_asset_id: 'asset-123'},
    start: '2024-01-15T10:00:00Z',
    end: '2024-01-15T10:30:00Z',
    port_count: {page: 10},
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
      {name: 'App', value: 'cpe:/a:apache:httpd'},
      {name: 'App', value: 'cpe:/a:mysql:mysql'},
      {name: 'traceroute', value: '1.1.1.1,2.2.2.2'},
      {name: 'hostname', value: 'test.example.com'},
      {name: 'agentId', value: 'agent-12345'},
      {name: 'Auth-SSH-Success'},
      {name: 'Auth-SMB-Failure'},
    ],
    ...overrides,
  });
};

describe('AgentScanningHostsTable', () => {
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
    const {render} = rendererWith({gmp, capabilities: true, router: true});

    render(
      <AgentScanningHostsTable
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
    expect(columnHeaders.some(th => /IP Address/i.exec(th.textContent))).toBe(
      true,
    );
    expect(columnHeaders.some(th => /Hostname/i.exec(th.textContent))).toBe(
      true,
    );
    expect(columnHeaders.some(th => /Agent ID/i.exec(th.textContent))).toBe(
      true,
    );
    expect(columnHeaders.some(th => /OS/i.exec(th.textContent))).toBe(true);
    expect(columnHeaders.some(th => /Ports/i.exec(th.textContent))).toBe(true);
    expect(columnHeaders.some(th => /Apps/i.exec(th.textContent))).toBe(true);
    expect(columnHeaders.some(th => /Distance/i.exec(th.textContent))).toBe(
      true,
    );
    expect(columnHeaders.some(th => /Auth/i.exec(th.textContent))).toBe(true);
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

    const {render} = rendererWith({gmp, capabilities: true, router: true});

    render(
      <AgentScanningHostsTable
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
        ip: '10.0.0.5',
        detail: [
          {name: 'hostname', value: 'agent-host.example.com'},
          {name: 'agentID', value: 'agent-99999'},
          {name: 'best_os_cpe', value: 'cpe:/o:microsoft:windows'},
          {name: 'best_os_txt', value: 'Windows 10'},
          {name: 'Auth-SSH-Success'},
          {name: 'Auth-SMB-Success'},
        ],
        port_count: {page: 25},
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

    const {render} = rendererWith({gmp, capabilities: true, router: true});

    render(
      <AgentScanningHostsTable
        entities={entities as unknown as Model[]}
        entitiesCounts={counts}
        filter={filter}
        sortBy="ip"
        sortDir="asc"
      />,
    );

    // Check IP address
    expect(screen.getByText('10.0.0.5')).toBeInTheDocument();

    // Check hostname
    expect(screen.getByText('agent-host.example.com')).toBeInTheDocument();

    // Check Agent ID
    expect(screen.getByText('agent-99999')).toBeInTheDocument();

    // Check port count
    const table = screen.getByRole('table');
    const allRows = within(table).getAllByRole('row');
    const dataRows = allRows.filter(
      row => within(row).queryAllByRole('cell').length > 0,
    );
    expect(dataRows).toHaveLength(1);

    const cells = within(dataRows[0]).getAllByRole('cell');
    expect(cells.some(cell => cell.textContent === '25')).toBe(true); // Ports
    expect(cells.some(cell => cell.textContent === '2')).toBe(true); // Critical
    expect(cells.some(cell => cell.textContent === '20')).toBe(true); // High
    expect(cells.some(cell => cell.textContent === '50')).toBe(true); // Medium
    expect(cells.some(cell => cell.textContent === '25')).toBe(true); // Low
    expect(cells.some(cell => cell.textContent === '3')).toBe(true); // Log
    expect(cells.some(cell => cell.textContent === '100')).toBe(true); // Total
  });

  test('should render authentication icons correctly', () => {
    const entities = [
      createMockHost({
        detail: [
          {name: 'Auth-SSH-Success'},
          {name: 'Auth-SMB-Failure'},
          {name: 'Auth-SNMP-Success'},
          {name: 'Auth-ESXi-Failure'},
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

    const {render} = rendererWith({gmp, capabilities: true, router: true});

    render(
      <AgentScanningHostsTable
        entities={entities as unknown as Model[]}
        entitiesCounts={counts}
        filter={filter}
      />,
    );

    // Check for auth success/failure icons
    expect(
      screen.getByTitle('SSH authentication was successful'),
    ).toBeInTheDocument();
    expect(
      screen.getByTitle('SMB authentication was unsuccessful'),
    ).toBeInTheDocument();
    expect(
      screen.getByTitle('SNMP authentication was successful'),
    ).toBeInTheDocument();
    expect(
      screen.getByTitle('ESXi authentication was unsuccessful'),
    ).toBeInTheDocument();
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
    const {render} = rendererWith({gmp, capabilities: true, router: true});

    const {userEvent} = render(
      <AgentScanningHostsTable
        entities={entities as unknown as Model[]}
        entitiesCounts={counts}
        filter={filter}
        sortBy="ip"
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

    const {render} = rendererWith({gmp, capabilities: true, router: true});

    render(
      <AgentScanningHostsTable
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

    const {render} = rendererWith({gmp, capabilities: true, router: true});

    render(
      <AgentScanningHostsTable
        entities={[] as unknown as Model[]}
        entitiesCounts={counts}
        filter={filter}
      />,
    );

    expect(screen.getByText('No Hosts available')).toBeInTheDocument();
  });

  test('should render IP address as DetailsLink when asset id exists', () => {
    const entities = [
      createMockHost({
        ip: '172.16.0.10',
        asset: {_asset_id: 'asset-456'},
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

    const {render} = rendererWith({gmp, capabilities: true, router: true});

    render(
      <AgentScanningHostsTable
        entities={entities as unknown as Model[]}
        entitiesCounts={counts}
        filter={filter}
      />,
    );

    const link = screen.getByText('172.16.0.10');
    expect(link).toBeInTheDocument();
    expect(link.closest('a')).toHaveAttribute('href', '/host/asset-456');
  });

  test('should render IP address as Link to hosts filter when no asset id', () => {
    const entities = [
      createMockHost({
        ip: '172.16.0.20',
        asset: {},
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

    const {render} = rendererWith({gmp, router: true});

    render(
      <AgentScanningHostsTable
        entities={entities as unknown as Model[]}
        entitiesCounts={counts}
        filter={filter}
      />,
    );

    const link = screen.getByText('172.16.0.20');
    expect(link).toBeInTheDocument();
    expect(link.closest('a')).toHaveAttribute(
      'href',
      '/hosts?filter=name%3D172.16.0.20',
    );
  });
});
