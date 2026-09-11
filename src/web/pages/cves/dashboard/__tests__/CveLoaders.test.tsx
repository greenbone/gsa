/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type {ReactElement} from 'react';
import {describe, expect, test, testing} from '@gsa/testing';
import {rendererWith, waitFor} from 'web/testing';
import QueryFilter from 'gmp/models/filter/query-filter';
import {
  SubscriptionContext,
  type SubscribeFunc,
} from 'web/components/provider/SubscriptionProvider';
import {
  CVES_CREATED,
  CVES_SEVERITY,
  CvesCreatedLoader,
  CvesSeverityLoader,
} from 'web/pages/cves/dashboard/CveLoaders';

const createGmp = cves => ({cves});

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

describe('CvesCreatedLoader', () => {
  test('should export the created data ID', () => {
    expect(CVES_CREATED).toBe('cves-created');
  });

  test('should load created aggregates and render them', async () => {
    const data = {
      groups: [{value: '2026-01', count: '5', c_count: '10'}],
    };
    const mockGetCreatedAggregates = testing.fn().mockResolvedValue({data});
    const gmp = createGmp({getCreatedAggregates: mockGetCreatedAggregates});
    const filter = QueryFilter.fromString('first=1 rows=10');
    const subscribe = testing.fn().mockReturnValue(testing.fn());
    const children = testing.fn().mockReturnValue(null);

    renderWithSubscriptionContext({
      gmp,
      subscribe,
      children: (
        <CvesCreatedLoader filter={filter}>{children}</CvesCreatedLoader>
      ),
    });

    await waitFor(() => {
      expect(mockGetCreatedAggregates).toHaveBeenCalledWith({filter});
      expect(children).toHaveBeenLastCalledWith({data, isLoading: false});
    });

    expect(subscribe).toHaveBeenCalledWith('cves.timer', expect.any(Function));
    expect(subscribe).toHaveBeenCalledWith(
      'cves.changed',
      expect.any(Function),
    );
  });
});

describe('CvesSeverityLoader', () => {
  test('should export the severity data ID', () => {
    expect(CVES_SEVERITY).toBe('cves-severity');
  });

  test('should load severity aggregates and render them', async () => {
    const data = {groups: [{value: '5.0', count: 10}]};
    const mockGetSeverityAggregates = testing.fn().mockResolvedValue({data});
    const gmp = createGmp({getSeverityAggregates: mockGetSeverityAggregates});
    const filter = QueryFilter.fromString('first=1 rows=10');
    const subscribe = testing.fn().mockReturnValue(testing.fn());
    const children = testing.fn().mockReturnValue(null);

    renderWithSubscriptionContext({
      gmp,
      subscribe,
      children: (
        <CvesSeverityLoader filter={filter}>{children}</CvesSeverityLoader>
      ),
    });

    await waitFor(() => {
      expect(mockGetSeverityAggregates).toHaveBeenCalledWith({filter});
      expect(children).toHaveBeenLastCalledWith({data, isLoading: false});
    });

    expect(subscribe).toHaveBeenCalledWith('cves.timer', expect.any(Function));
    expect(subscribe).toHaveBeenCalledWith(
      'cves.changed',
      expect.any(Function),
    );
  });
});
