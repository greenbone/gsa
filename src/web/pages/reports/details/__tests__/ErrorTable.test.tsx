/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, expect, test, testing} from '@gsa/testing';
import {rendererWith, screen, within} from 'web/testing';
import CollectionCounts from 'gmp/collection/collection-counts';
import Filter from 'gmp/models/filter';
import type {ReportError} from 'gmp/models/report/parser';
import ErrorsTable from 'web/pages/reports/details/error/ErrorsTable';

const filter = Filter.fromString('first=1 rows=10');

const createMockError = (overrides = {}): ReportError => {
  return {
    description: 'Test error description',
    host: {
      id: 'host-123',
      ip: '192.168.1.1000',
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
        entities={entities}
        entitiesCounts={counts}
        filter={filter}
        onSortChange={onSortChange}
      />,
    );

    const table = screen.getByRole('table');
    const columnHeaders = within(table).getAllByRole('columnheader');

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
        entities={entities}
        entitiesCounts={counts}
        filter={filter}
      />,
    );

    screen.getByText('SSH authentication failed');

    screen.getByText('Test NVT');

    screen.getByText('22');

    const table = screen.getByRole('table');
    const rows = within(table).getAllByRole('row');
    const dataRow = rows.find(
      row => within(row).queryAllByRole('cell').length > 0,
    );
    expect(dataRow).toBeDefined();
    if (!dataRow) throw new Error('data row not found');

    const hostnameCell = within(dataRow).getAllByRole('cell')[2];
    expect(hostnameCell?.textContent).toBe('test-host');
  });

  test('should render host as DetailsLink when host id exists', () => {
    const entities = [
      createMockError({
        host: {
          id: 'host-456',
          ip: '172.16.0.1000',
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
        entities={entities}
        entitiesCounts={counts}
        filter={filter}
      />,
    );

    const link = screen.getByText('172.16.0.1000');
    expect(link.closest('a')).toHaveAttribute('href', '/host/host-456');
  });

  test('should render host as plain text when host id missing', () => {
    const entities = [
      createMockError({
        host: {
          ip: '172.16.0.2000',
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
        entities={entities}
        entitiesCounts={counts}
        filter={filter}
      />,
    );

    const link = screen.getByText('172.16.0.2000');
    // Should not be a link
    expect(link.closest('a')).not.toBeInTheDocument();
  });

  test('should render hostname in italics', () => {
    const entities = [
      createMockError({
        host: {
          ip: '172.16.0.3000',
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
        entities={entities}
        entitiesCounts={counts}
        filter={filter}
      />,
    );

    const table = screen.getByRole('table');
    const rows = within(table).getAllByRole('row');
    const dataRow = rows.find(
      row => within(row).queryAllByRole('cell').length > 0,
    );

    if (!dataRow) throw new Error('data row not found');
    const hostnameCell = within(dataRow).getAllByRole('cell')[2];
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
      <ErrorsTable entities={[]} entitiesCounts={counts} filter={filter} />,
    );

    screen.getByText('No Errors available');
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
        entities={entities}
        entitiesCounts={counts}
        filter={filter}
      />,
    );

    const link = screen.getByText('CVE-2024-1234');
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
        entities={entities}
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
