/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {type ReactElement} from 'react';
import {describe, expect, test, testing} from '@gsa/testing';
import {rendererWith, waitFor} from 'web/testing';
import QueryFilter from 'gmp/models/filter/query-filter';
import {
  SubscriptionContext,
  type SubscribeFunc,
} from 'web/components/provider/SubscriptionProvider';
import {
  ReportsHighResultsLoader,
  ReportsSeverityLoader,
  REPORTS_HIGH_RESULTS,
  REPORTS_SEVERITY,
} from 'web/pages/reports/dashboard/ReportLoaders';

const createGmp = (reports: Record<string, unknown>) => ({reports});

const renderWithSubscriptionContext = ({
  gmp,
  subscribe,
  children,
}: {
  gmp: Record<string, unknown>;
  subscribe: SubscribeFunc;
  children: ReactElement;
}) => {
  const {render} = rendererWith({gmp, store: true});

  return render(
    <SubscriptionContext.Provider value={subscribe}>
      {children}
    </SubscriptionContext.Provider>,
  );
};

const expectReportSubscriptions = (subscribe: SubscribeFunc) => {
  expect(subscribe).toHaveBeenCalledWith('reports.timer', expect.any(Function));
  expect(subscribe).toHaveBeenCalledWith(
    'reports.changed',
    expect.any(Function),
  );
};

describe('Report loaders', () => {
  test('should export the report data IDs', () => {
    expect(REPORTS_HIGH_RESULTS).toBe('reports-high-results');
    expect(REPORTS_SEVERITY).toBe('reports-severity');
  });

  describe('ReportsSeverityLoader', () => {
    test('should load severity aggregates and render them', async () => {
      const data = {groups: [{value: '5.0', count: 10}]};
      const getSeverityAggregates = testing.fn().mockResolvedValue({data});
      const gmp = createGmp({getSeverityAggregates});
      const filter = QueryFilter.fromString('first=1 rows=10');
      const subscribe = testing.fn().mockReturnValue(testing.fn());
      const children = testing.fn().mockReturnValue(null);

      renderWithSubscriptionContext({
        gmp,
        subscribe,
        children: (
          <ReportsSeverityLoader filter={filter}>
            {children}
          </ReportsSeverityLoader>
        ),
      });

      await waitFor(() => {
        expect(getSeverityAggregates).toHaveBeenCalledWith({filter});
        expect(children).toHaveBeenLastCalledWith({data, isLoading: false});
      });

      expectReportSubscriptions(subscribe);
    });
  });

  describe('ReportsHighResultsLoader', () => {
    test('should load high results aggregates and render them', async () => {
      const data = {
        groups: [
          {
            value: '2026-01-01',
            stats: {
              high: {max: 5},
              high_per_host: {max: 2.5},
            },
          },
        ],
      };
      const getHighResultsAggregates = testing.fn().mockResolvedValue({data});
      const gmp = createGmp({getHighResultsAggregates});
      const filter = QueryFilter.fromString('first=1 rows=10');
      const subscribe = testing.fn().mockReturnValue(testing.fn());
      const children = testing.fn().mockReturnValue(null);

      renderWithSubscriptionContext({
        gmp,
        subscribe,
        children: (
          <ReportsHighResultsLoader filter={filter}>
            {children}
          </ReportsHighResultsLoader>
        ),
      });

      await waitFor(() => {
        expect(getHighResultsAggregates).toHaveBeenCalledWith({filter});
        expect(children).toHaveBeenLastCalledWith({data, isLoading: false});
      });

      expectReportSubscriptions(subscribe);
    });
  });
});
