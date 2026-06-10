/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, expect, test} from '@gsa/testing';
import {rendererWith, screen} from 'web/testing';
import CollectionCounts from 'gmp/collection/collection-counts';
import Filter from 'gmp/models/filter';
import ApplicationsTab from 'web/pages/reports/details/application/ApplicationsTab';

const filter = Filter.fromString('first=1 rows=10');

const createMockApplication = (overrides = {}) => ({
  id: 'app-default',
  name: 'test-application',
  hosts: {
    count: 5,
  },
  occurrences: {
    total: 100,
  },
  severity: 9.8,
  ...overrides,
});

const mockApps = [
  createMockApplication({
    id: 'app-apache',
    name: 'Apache HTTP Server',
    hosts: {count: 10},
    occurrences: {total: 250},
    severity: 10.0,
  }),
  createMockApplication({
    id: 'app-nginx',
    name: 'Nginx',
    hosts: {count: 3},
    occurrences: {total: 15},
    severity: 5.0,
  }),
];

const mockAppsCounts = new CollectionCounts({
  filtered: 2,
  all: 2,
  first: 1,
  rows: 10,
});

const reportId = 'report-123';

const mockApplicationsData = {
  entities: mockApps,
  entitiesCounts: mockAppsCounts,
};

const gmp = {
  settings: {
    severityRating: 'CVSSv3',
  },
};

describe('ApplicationsTab', () => {
  test('should render loading state initially', () => {
    const {render} = rendererWith({gmp, router: true, capabilities: true});

    render(
      <ApplicationsTab
        filter={filter}
        isApplicationsFetching={true}
        reportId={reportId}
      />,
    );

    expect(screen.getByTestId('loading')).toBeInTheDocument();
  });

  test('should render table with applications', async () => {
    const {render} = rendererWith({gmp, router: true, capabilities: true});

    render(
      <ApplicationsTab
        applicationsData={mockApplicationsData}
        filter={filter}
        reportId={reportId}
      />,
    );

    const table = await screen.findByRole('table');
    expect(table).toBeInTheDocument();

    expect(table).toHaveTextContent('Nginx');
    expect(table).toHaveTextContent('3');
    expect(table).toHaveTextContent('15');
    expect(table).toHaveTextContent('Apache HTTP Server');
    expect(table).toHaveTextContent('10');
    expect(table).toHaveTextContent('250');
  });

  test('should render empty state when no applications', async () => {
    const {render} = rendererWith({gmp, router: true, capabilities: true});

    render(
      <ApplicationsTab
        applicationsData={{
          entities: [],
          entitiesCounts: new CollectionCounts({
            filtered: 0,
            all: 0,
            first: 1,
            rows: 10,
          }),
        }}
        filter={filter}
        reportId={reportId}
      />,
    );

    expect(
      await screen.findByText('No Applications available'),
    ).toBeInTheDocument();
  });

  test('should render error panel when applications are in error state', async () => {
    const {render} = rendererWith({gmp, router: true, capabilities: true});

    render(
      <ApplicationsTab
        filter={filter}
        isApplicationsError={true}
        reportId={reportId}
      />,
    );

    expect(
      await screen.findByText(/Error while loading Applications for Report/),
    ).toBeInTheDocument();
  });

  test('should show applied filter', async () => {
    const {render} = rendererWith({gmp, router: true, capabilities: true});

    render(
      <ApplicationsTab
        applicationsData={mockApplicationsData}
        filter={filter}
        reportId={reportId}
      />,
    );

    await screen.findByRole('table');

    expect(screen.getByText(/Applied filter:/)).toBeInTheDocument();
  });
});
