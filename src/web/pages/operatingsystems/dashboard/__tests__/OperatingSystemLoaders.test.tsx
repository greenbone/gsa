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
  OperatingSystemAverageSeverityLoader,
  OperatingSystemVulnerabilityScoreLoader,
  OSS_SEVERITY,
  OSS_VULN_SCORE,
} from 'web/pages/operatingsystems/dashboard/OperatingSystemLoaders';

const createGmp = (operatingsystems: Record<string, unknown>) => ({
  operatingsystems,
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

const expectOperatingSystemSubscriptions = (subscribe: SubscribeFunc) => {
  expect(subscribe).toHaveBeenCalledWith(
    'operatingsystems.timer',
    expect.any(Function),
  );
  expect(subscribe).toHaveBeenCalledWith(
    'operatingsystems.changed',
    expect.any(Function),
  );
};

describe('Operating System loaders', () => {
  test('should export the operating system data IDs', () => {
    expect(OSS_SEVERITY).toBe('oss-severity');
    expect(OSS_VULN_SCORE).toBe('oss-most-vulnerable');
  });

  describe('OperatingSystemAverageSeverityLoader', () => {
    test('should load average severity aggregates and render them', async () => {
      const data = {groups: [{value: 5, count: 10}]};
      const getAverageSeverityAggregates = testing.fn().mockResolvedValue({
        data,
      });
      const gmp = createGmp({getAverageSeverityAggregates});
      const filter = QueryFilter.fromString('first=1 rows=10');
      const subscribe = testing.fn().mockReturnValue(testing.fn());
      const children = testing.fn().mockReturnValue(null);

      renderWithSubscriptionContext({
        gmp,
        subscribe,
        children: (
          <OperatingSystemAverageSeverityLoader filter={filter}>
            {children}
          </OperatingSystemAverageSeverityLoader>
        ),
      });

      await waitFor(() => {
        expect(getAverageSeverityAggregates).toHaveBeenCalledWith({filter});
        expect(children).toHaveBeenLastCalledWith({data, isLoading: false});
      });

      expectOperatingSystemSubscriptions(subscribe);
    });
  });

  describe('OperatingSystemVulnerabilityScoreLoader', () => {
    test('should load vulnerability score aggregates with the maximum groups', async () => {
      const data = {groups: []};
      const getVulnScoreAggregates = testing.fn().mockResolvedValue({data});
      const gmp = createGmp({getVulnScoreAggregates});
      const filter = QueryFilter.fromString('first=1 rows=10');
      const subscribe = testing.fn().mockReturnValue(testing.fn());
      const children = testing.fn().mockReturnValue(null);

      renderWithSubscriptionContext({
        gmp,
        subscribe,
        children: (
          <OperatingSystemVulnerabilityScoreLoader filter={filter}>
            {children}
          </OperatingSystemVulnerabilityScoreLoader>
        ),
      });

      await waitFor(() => {
        expect(getVulnScoreAggregates).toHaveBeenCalledWith({filter, max: 10});
        expect(children).toHaveBeenLastCalledWith({data, isLoading: false});
      });

      expectOperatingSystemSubscriptions(subscribe);
    });
  });
});
