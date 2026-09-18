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
  ReportComplianceLoader,
  REPORTS_COMPLIANCE,
} from 'web/pages/reports/auditdashboard/AuditReportLoaders';

const createGmp = (auditreports: Record<string, unknown>) => ({
  auditreports,
});

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

describe('Report loaders', () => {
  test('should export the compliance data ID', () => {
    expect(REPORTS_COMPLIANCE).toBe('reports-compliance');
  });

  describe('ReportComplianceLoader', () => {
    test('should load compliance aggregates and render them', async () => {
      const data = {
        groups: [
          {value: 'yes', count: 2},
          {value: 'no', count: 3},
        ],
      };
      const getComplianceAggregates = testing.fn().mockResolvedValue({data});
      const gmp = createGmp({getComplianceAggregates});
      const filter = QueryFilter.fromString('first=1 rows=10');
      const subscribe = testing.fn().mockReturnValue(testing.fn());
      const children = testing.fn().mockReturnValue(null);

      renderWithSubscriptionContext({
        gmp,
        subscribe,
        children: (
          <ReportComplianceLoader filter={filter}>
            {children}
          </ReportComplianceLoader>
        ),
      });

      await waitFor(() => {
        expect(getComplianceAggregates).toHaveBeenCalledWith({filter});
        expect(children).toHaveBeenLastCalledWith({data, isLoading: false});
      });

      expect(subscribe).toHaveBeenCalledWith(
        'reports.timer',
        expect.any(Function),
      );
      expect(subscribe).toHaveBeenCalledWith(
        'reports.changed',
        expect.any(Function),
      );
    });
  });
});
