/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, expect, test, testing} from '@gsa/testing';
import CollectionCounts from 'gmp/collection/collection-counts';
import Filter from 'gmp/models/filter';
import type {ReportError} from 'gmp/models/report/parser';
import ErrorsTable from 'web/pages/reports/details/ErrorsTable';
import {rendererWith, screen, within} from 'web/testing';

const filter = Filter.fromString('first=1 rows=10');

const createMockError = (overrides = {}): ReportError => {
  return {
    description: 'Test error description',
    host: {
      id: 'host-123',
      ip: '192.168.1.100',
      name: 'test-host',
    },
    nvt: {
      id: '1.3.6.1.4.1.25623.1.1.1.1.1',
      name: 'Test NVT',
    },
    port: '22',
    ...overrides,
  };
};

describe('ErrorsTable', () => {
  test('should render table with all columns', () => {
    const entities = [createMockError()];
    const counts = new CollectionCounts({
      filtered: 1,
      all: 1,
      first: 1,
      rows: 10,
    });

    const gmp = {};

    const onSortChange = testing.fn();
    const {render} = rendererWith({gmp, capabilities: true, router: true});

    render(
      <ErrorsTable
        // @ts-expect-error entities are ReportErrors[], not Model[]
        entities={entities as unknown as Model[]}
        entitiesCounts={counts}
        filter={filter}
        onSortChange={onSortChange}
      />,
    );

    const table = screen.getByRole('table');
    const columnHeaders = within(table).getAllByRole('columnheader');

    // Check all expected columns
    expect(
      columnHeaders.some(th => /Error Message/i.exec(th.textContent)),
    ).toBe(true);
    expect(columnHeaders.some(th => /Host/i.exec(th.textContent))).toBe(true);
    expect(columnHeaders.some(th => /Hostname/i.exec(th.textContent))).toBe(
      true,
    );
    expect(columnHeaders.some(th => /NVT/i.exec(th.textContent))).toBe(true);
    expect(columnHeaders.some(th => /Port/i.exec(th.textContent))).toBe(true);
  });

  test('should render error data correctly', () => {
    const entities = [
      createMockError({
        description: 'SSH authentication failed',
      }),
    ];
    const counts = new CollectionCounts({
      filtered: 1,
      all: 1,
      first: 1,
      rows: 10,
    });

    const gmp = {};

    const {render} = rendererWith({gmp, capabilities: true, router: true});

    render(
      <ErrorsTable
        // @ts-expect-error entities are ReportErrors[], not Model[]
        entities={entities as unknown as Model[]}
        entitiesCounts={counts}
        filter={filter}
      />,
    );

    // Check error description
    expect(screen.getByText('SSH authentication failed')).toBeInTheDocument();

    // Check NVT name
    expect(screen.getByText('Test NVT')).toBeInTheDocument();

    // Check port
    expect(screen.getByText('22')).toBeInTheDocument();

    // Check that hostname is rendered
    const table = screen.getByRole('table');
    const allRows = within(table).getAllByRole('row');
    const dataRows = allRows.filter(
      row => within(row).queryAllByRole('cell').length > 0,
    );
    expect(dataRows).toHaveLength(1);

    const cells = within(dataRows[0]).getAllByRole('cell');
    // Check that hostname is in the cell (it's the 3rd cell - index 2)
    const hostnameCell = within(dataRows[0]).getAllByRole('cell')[2];
    expect(hostnameCell?.textContent).toBe('test-host');
  });

  test('should render host as DetailsLink when host id exists', () => {
    const entities = [
      createMockError({
        host: {
          id: 'host-456',
          ip: '172.16.0.10',
        },
      }),
    ];
    const counts = new CollectionCounts({
      filtered: 1,
      all: 1,
      first: 1,
      rows: 10,
    });

    const gmp = {};

    const {render} = rendererWith({gmp, capabilities: true, router: true});

    render(
      <ErrorsTable
        // @ts-expect-error entities are ReportErrors[], not Model[]
        entities={entities as unknown as Model[]}
        entitiesCounts={counts}
        filter={filter}
      />,
    );

    const link = screen.getByText('172.16.0.10');
    expect(link).toBeInTheDocument();
    expect(link.closest('a')).toHaveAttribute('href', '/host/host-456');
  });

  test('should render host as plain text when host id missing', () => {
    const entities = [
      createMockError({
        host: {
          ip: '172.16.0.20',
        },
      }),
    ];
    const counts = new CollectionCounts({
      filtered: 1,
      all: 1,
      first: 1,
      rows: 10,
    });

    const gmp = {};

    const {render} = rendererWith({gmp, capabilities: true, router: true});

    render(
      <ErrorsTable
        // @ts-expect-error entities are ReportErrors[], not Model[]
        entities={entities as unknown as Model[]}
        entitiesCounts={counts}
        filter={filter}
      />,
    );

    const link = screen.getByText('172.16.0.20');
    expect(link).toBeInTheDocument();
    // Should not be a link
    expect(link.closest('a')).not.toBeInTheDocument();
  });

  test('should render hostname in italics', () => {
    const entities = [
      createMockError({
        host: {
          ip: '172.16.0.30',
          name: 'my-test-host',
        },
      }),
    ];
    const counts = new CollectionCounts({
      filtered: 1,
      all: 1,
      first: 1,
      rows: 10,
    });

    const gmp = {};

    const {render} = rendererWith({gmp, capabilities: true, router: true});

    render(
      <ErrorsTable
        // @ts-expect-error entities are ReportErrors[], not Model[]
        entities={entities as unknown as Model[]}
        entitiesCounts={counts}
        filter={filter}
      />,
    );

    // Check that hostname is rendered with italics tag
    const table = screen.getByRole('table');
    const allRows = within(table).getAllByRole('row');
    const dataRows = allRows.filter(
      row => within(row).queryAllByRole('cell').length > 0,
    );

    // Get the hostname cell (3rd column, index 2)
    const hostnameCell = within(dataRows[0]).getAllByRole('cell')[2];
    expect(hostnameCell?.querySelector('i')).toBeInTheDocument();
    expect(hostnameCell?.textContent).toBe('my-test-host');
  });

  test('should render empty state when no errors', () => {
    const counts = new CollectionCounts({
      filtered: 0,
      all: 0,
      first: 1,
      rows: 10,
    });

    const gmp = {};

    const {render} = rendererWith({gmp, capabilities: true, router: true});

    render(
      <ErrorsTable
        // @ts-expect-error entities are ReportErrors[], not Model[]
        entities={[] as unknown as Model[]}
        entitiesCounts={counts}
        filter={filter}
      />,
    );

    expect(screen.getByText('No Errors available')).toBeInTheDocument();
  });

  test('should render NVT as DetailsLink when nvt id exists', () => {
    const entities = [
      createMockError({
        nvt: {
          id: '1.3.6.1.4.1.25623.1.1.1.1.1',
          name: 'CVE-2024-1234',
        },
      }),
    ];
    const counts = new CollectionCounts({
      filtered: 1,
      all: 1,
      first: 1,
      rows: 10,
    });

    const gmp = {};

    const {render} = rendererWith({gmp, capabilities: true, router: true});

    render(
      <ErrorsTable
        // @ts-expect-error entities are ReportErrors[], not Model[]
        entities={entities as unknown as Model[]}
        entitiesCounts={counts}
        filter={filter}
      />,
    );

    const link = screen.getByText('CVE-2024-1234');
    expect(link).toBeInTheDocument();
    expect(link.closest('a')).toHaveAttribute(
      'href',
      '/nvt/1.3.6.1.4.1.25623.1.1.1.1.1',
    );
  });

  test('should handle sorting by error column', async () => {
    const entities = [createMockError()];
    const counts = new CollectionCounts({
      filtered: 1,
      all: 1,
      first: 1,
      rows: 10,
    });

    const gmp = {};

    const onSortChange = testing.fn();
    const {render} = rendererWith({gmp, capabilities: true, router: true});

    const {userEvent} = render(
      <ErrorsTable
        // @ts-expect-error entities are ReportErrors[], not Model[]
        entities={entities as unknown as Model[]}
        entitiesCounts={counts}
        filter={filter}
        onSortChange={onSortChange}
      />,
    );

    const errorHeader = await screen.findByText('Error Message');
    await userEvent.click(errorHeader);

    expect(onSortChange).toHaveBeenCalledWith('error');
  });
});
