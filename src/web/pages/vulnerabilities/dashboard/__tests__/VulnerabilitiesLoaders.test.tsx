/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {type ReactElement} from 'react';
import {describe, expect, test, testing} from '@gsa/testing';
import {rendererWith, waitFor} from 'web/testing';
import type Gmp from 'gmp/gmp';
import QueryFilter from 'gmp/models/filter/query-filter';
import {
  SubscriptionContext,
  type SubscribeFunc,
} from 'web/components/provider/SubscriptionProvider';
import {
  VulnerabilitiesHostsLoader,
  VulnerabilitiesSeverityLoader,
  VULNS_HOSTS,
  VULNS_SEVERITY,
} from 'web/pages/vulnerabilities/dashboard/VulnerabilitiesLoaders';

const createGmp = (vulns: Partial<Gmp['vulns']>) =>
  ({vulns}) as unknown as Record<string, unknown>;

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

const expectVulnerabilitySubscriptions = (subscribe: SubscribeFunc) => {
  expect(subscribe).toHaveBeenCalledWith('vulns.timer', expect.any(Function));
  expect(subscribe).toHaveBeenCalledWith('vulns.changed', expect.any(Function));
};

describe('Vulnerabilities Loaders', () => {
  test('should export severity data ID', () => {
    expect(VULNS_SEVERITY).toBe('vulns-severity');
  });

  test('should export hosts data ID', () => {
    expect(VULNS_HOSTS).toBe('vulns-hosts');
  });

  describe('VulnerabilitiesSeverityLoader', () => {
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
          <VulnerabilitiesSeverityLoader filter={filter}>
            {children}
          </VulnerabilitiesSeverityLoader>
        ),
      });

      await waitFor(() => {
        expect(getSeverityAggregates).toHaveBeenCalledWith({filter});
        expect(children).toHaveBeenLastCalledWith({data, isLoading: false});
      });

      expectVulnerabilitySubscriptions(subscribe);
    });
  });

  describe('VulnerabilitiesHostsLoader', () => {
    test('should load host aggregates and render them', async () => {
      const data = {groups: [{value: 1, count: 5, c_count: 5}]};
      const getHostAggregates = testing.fn().mockResolvedValue({data});
      const gmp = createGmp({getHostAggregates});
      const filter = QueryFilter.fromString('first=1 rows=10');
      const subscribe = testing.fn().mockReturnValue(testing.fn());
      const children = testing.fn().mockReturnValue(null);

      renderWithSubscriptionContext({
        gmp,
        subscribe,
        children: (
          <VulnerabilitiesHostsLoader filter={filter}>
            {children}
          </VulnerabilitiesHostsLoader>
        ),
      });

      await waitFor(() => {
        expect(getHostAggregates).toHaveBeenCalledWith({filter});
        expect(children).toHaveBeenLastCalledWith({data, isLoading: false});
      });

      expectVulnerabilitySubscriptions(subscribe);
    });
  });
});
