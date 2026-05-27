/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, expect, test, testing} from '@gsa/testing';
import {rendererWith, screen, within} from 'web/testing';
import CollectionCounts from 'gmp/collection/collection-counts';
import Filter from 'gmp/models/filter';
import type ReportApp from 'gmp/models/report/app';
import ApplicationsTable from 'web/pages/reports/details/application/ApplicationsTable';

const filter = Filter.fromString('first=1 rows=10');

const createMockGmp = () => ({
  settings: {
    severityRating: 'CVSSv3',
  },
});

const createMockApplication = (overrides = {}) => {
  return {
    id: 'app-1',
    name: 'test-application',
    hosts: {
      count: 5,
    },
    occurrences: {
      total: 100,
    },
    severity: 9.8,
    ...overrides,
  } as ReportApp;
};

describe('ApplicationsTable', () => {
  test('should render table with all columns', () => {
    const entities = [createMockApplication()];
    const counts = new CollectionCounts({
      filtered: 1,
      all: 1,
      first: 1,
      rows: 10,
    });

    const gmp = createMockGmp();

    const onSortChange = testing.fn();
    const {render} = rendererWith({gmp, capabilities: true, router: true});

    render(
      <ApplicationsTable
        // @ts-expect-error entities are ReportApp[], not Model[]
        entities={entities}
        entitiesCounts={counts}
        filter={filter}
        onSortChange={onSortChange}
      />,
    );

    const table = screen.getByRole('table');
    const columnHeaders = within(table).getAllByRole('columnheader');

    expect(
      columnHeaders.some(th => /Application CPE/i.exec(th.textContent)),
    ).toBe(true);
    expect(columnHeaders.some(th => /Hosts/i.exec(th.textContent))).toBe(true);
    expect(columnHeaders.some(th => /Occurrences/i.exec(th.textContent))).toBe(
      true,
    );
    expect(columnHeaders.some(th => /Severity/i.exec(th.textContent))).toBe(
      true,
    );
  });

  test('should render application data correctly', () => {
    const entities = [
      createMockApplication({
        name: 'Apache HTTP Server',
        hosts: {
          count: 10,
        },
        occurrences: {
          total: 250,
        },
        severity: 9.8,
      }),
    ];
    const counts = new CollectionCounts({
      filtered: 1,
      all: 1,
      first: 1,
      rows: 10,
    });

    const gmp = createMockGmp();

    const {render} = rendererWith({gmp, capabilities: true, router: true});

    render(
      <ApplicationsTable
        // @ts-expect-error entities are ReportApp[], not Model[]
        entities={entities}
        entitiesCounts={counts}
        filter={filter}
      />,
    );

    screen.getByText('Apache HTTP Server');
    screen.getByText('10');
    screen.getByText('250');
    screen.getByText(/9\.8/);
  });

  test('should render application name as DetailsLink pointing to CPE', () => {
    const entities = [
      createMockApplication({
        id: 'cpe:/a:nginx',
        name: 'Nginx Web Server',
      }),
    ];
    const counts = new CollectionCounts({
      filtered: 1,
      all: 1,
      first: 1,
      rows: 10,
    });

    const gmp = createMockGmp();

    const {render} = rendererWith({gmp, capabilities: true, router: true});

    render(
      <ApplicationsTable
        // @ts-expect-error entities are ReportApp[], not Model[]
        entities={entities}
        entitiesCounts={counts}
        filter={filter}
      />,
    );

    const link = screen.getByText('Nginx Web Server');
    expect(link.closest('a')).toHaveAttribute(
      'href',
      '/cpe/cpe%3A%2Fa%3Anginx',
    );
  });

  test('should render empty state when no applications', () => {
    const counts = new CollectionCounts({
      filtered: 0,
      all: 0,
      first: 1,
      rows: 10,
    });

    const gmp = createMockGmp();

    const {render} = rendererWith({gmp, capabilities: true, router: true});

    render(
      <ApplicationsTable
        entities={[]}
        entitiesCounts={counts}
        filter={filter}
      />,
    );

    screen.getByText('No Applications available');
  });

  test('should handle sorting by application column', async () => {
    const entities = [createMockApplication()];
    const counts = new CollectionCounts({
      filtered: 1,
      all: 1,
      first: 1,
      rows: 10,
    });

    const gmp = createMockGmp();

    const onSortChange = testing.fn();
    const {render} = rendererWith({gmp, capabilities: true, router: true});

    const {userEvent} = render(
      <ApplicationsTable
        // @ts-expect-error entities are ReportApp[], not Model[]
        entities={entities}
        entitiesCounts={counts}
        filter={filter}
        onSortChange={onSortChange}
      />,
    );

    const appHeader = await screen.findByText('Application CPE');
    await userEvent.click(appHeader);

    expect(onSortChange).toHaveBeenCalledWith('name');
  });
});
