/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, expect, test, testing} from '@gsa/testing';
import {act, rendererWith, screen, within} from 'web/testing';
import CollectionCounts from 'gmp/collection/collection-counts';
import Filter from 'gmp/models/filter';
import {createSession} from 'gmp/testing';
import ApplicationsTab from 'web/pages/reports/details/ApplicationsTab';

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
  severity: 'high',
  ...overrides,
});

const mockApps = [
  createMockApplication({
    id: 'app-apache',
    name: 'Apache HTTP Server',
    hosts: {count: 10},
    occurrences: {total: 250},
    severity: '10.0',
  }),
  createMockApplication({
    id: 'app-nginx',
    name: 'Nginx',
    hosts: {count: 3},
    occurrences: {total: 15},
    severity: '5.0',
  }),
];

const mockAppsCounts = new CollectionCounts({
  filtered: 2,
  all: 2,
  first: 1,
  rows: 10,
});

const createGmp = ({
  getReportApplications = testing.fn().mockResolvedValue({
    data: mockApps,
    meta: {
      filter,
      counts: mockAppsCounts,
    },
  }),
} = {}) => ({
  reportapplications: {
    get: getReportApplications,
  },
  settings: {
    reloadInterval: 5000,
    reloadIntervalActive: 2000,
    reloadIntervalInactive: 10000,
  },
  session: createSession({
    timezone: 'CET',
    token: 'test-token',
    username: 'admin',
  }),
});

const reportId = 'report-123';

describe('ApplicationsTab', () => {
  test('should render loading state initially', () => {
    const gmp = createGmp();
    const {render} = rendererWith({gmp, router: true, capabilities: true});

    render(
      <ApplicationsTab filter={filter} reportId={reportId} status={'Done'} />,
    );

    expect(screen.getByTestId('loading')).toBeInTheDocument();
  });

  test('should render table with applications', async () => {
    const gmp = createGmp();
    const {render} = rendererWith({gmp, router: true, capabilities: true});

    render(
      <ApplicationsTab filter={filter} reportId={reportId} status={'Done'} />,
    );

    const table = await screen.findByRole('table');
    expect(table).toBeInTheDocument();

    const rows = within(table).getAllByRole('row');
    // sorted by name descending (no sort-reverse, default asc → sortReverse=true)
    expect(rows[1]).toHaveTextContent('Nginx');
    expect(rows[1]).toHaveTextContent('3');
    expect(rows[1]).toHaveTextContent('15');

    expect(rows[2]).toHaveTextContent('Apache HTTP Server');
    expect(rows[2]).toHaveTextContent('10');
    expect(rows[2]).toHaveTextContent('250');
  });

  test('should render empty state when no applications', async () => {
    const gmp = createGmp({
      getReportApplications: testing.fn().mockResolvedValue({
        data: [],
        meta: {
          filter,
          counts: new CollectionCounts({
            filtered: 0,
            all: 0,
            first: 1,
            rows: 10,
          }),
        },
      }),
    });
    const {render} = rendererWith({gmp, router: true, capabilities: true});

    render(
      <ApplicationsTab filter={filter} reportId={reportId} status={'Done'} />,
    );

    expect(
      await screen.findByText('No Applications available'),
    ).toBeInTheDocument();
  });

  test('should render error panel on fetch failure', async () => {
    const gmp = createGmp({
      getReportApplications: testing
        .fn()
        .mockRejectedValue(new Error('Failed to fetch applications')),
    });
    const {render} = rendererWith({gmp, router: true, capabilities: true});

    render(
      <ApplicationsTab filter={filter} reportId={reportId} status={'Done'} />,
    );

    expect(
      await screen.findByText(/Error while loading Applications for Report/),
    ).toBeInTheDocument();
  });

  test('should call API with filter containing report ID', async () => {
    const getReportApplications = testing.fn().mockResolvedValue({
      data: mockApps,
      meta: {filter, counts: mockAppsCounts},
    });
    const gmp = createGmp({getReportApplications});
    const {render} = rendererWith({gmp, router: true, capabilities: true});

    render(
      <ApplicationsTab filter={filter} reportId={reportId} status={'Done'} />,
    );

    await screen.findByRole('table');

    expect(getReportApplications).toHaveBeenCalledWith(
      expect.objectContaining({
        report_id: reportId,
        filter: expect.objectContaining({}),
      }),
    );
  });

  test('should show applied filter', async () => {
    const gmp = createGmp();
    const {render} = rendererWith({gmp, router: true, capabilities: true});

    render(
      <ApplicationsTab filter={filter} reportId={reportId} status={'Done'} />,
    );

    await screen.findByRole('table');

    expect(screen.getByText(/Applied filter:/)).toBeInTheDocument();
  });
});

const pollingReloadIntervalActive = 100;

const createPollingGmp = ({
  getReportApplications = testing.fn().mockResolvedValue({
    data: mockApps,
    meta: {
      filter,
      counts: mockAppsCounts,
    },
  }),
} = {}) => ({
  reportapplications: {
    get: getReportApplications,
  },
  settings: {
    reloadInterval: 5000,
    reloadIntervalActive: pollingReloadIntervalActive,
    reloadIntervalInactive: 10000,
  },
  session: createSession({
    timezone: 'CET',
    token: 'test-token',
    username: 'admin',
  }),
});

describe('ApplicationsTab polling behavior', () => {
  test.each([
    [
      'should poll when task status is active',
      'Running' as const,
      pollingReloadIntervalActive + 50,
      2,
    ],
    [
      'should not poll when task status is inactive',
      'Stopped' as const,
      pollingReloadIntervalActive * 10,
      1,
    ],
  ])('%s', async (_, status, timeToAdvance, expectedCallCount) => {
    testing.useFakeTimers();

    const getReportApplications = testing.fn().mockResolvedValue({
      data: mockApps,
      meta: {
        filter,
        counts: mockAppsCounts,
      },
    });

    const gmp = createPollingGmp({getReportApplications});
    const {render} = rendererWith({gmp, router: true, capabilities: true});

    render(
      <ApplicationsTab filter={filter} reportId={reportId} status={status} />,
    );

    await act(async () => {});
    expect(getReportApplications).toHaveBeenCalledTimes(1);

    await act(async () => {
      await testing.advanceTimersByTimeAsync(timeToAdvance);
    });

    expect(getReportApplications).toHaveBeenCalledTimes(expectedCallCount);

    testing.useRealTimers();
  });
});
