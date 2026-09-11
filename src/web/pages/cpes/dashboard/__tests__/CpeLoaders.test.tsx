/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type {ReactElement} from 'react';
import {describe, expect, test, testing} from '@gsa/testing';
import {rendererWith, waitFor} from 'web/testing';
import type Gmp from 'gmp/gmp';
import QueryFilter from 'gmp/models/filter/query-filter';
import {
  SubscriptionContext,
  type SubscribeFunc,
} from 'web/components/provider/SubscriptionProvider';
import {
  CPES_CREATED,
  CPES_SEVERITY,
  CpesCreatedLoader,
  CpesSeverityLoader,
} from 'web/pages/cpes/dashboard/CpeLoaders';

const createGmp = (cpes: Partial<Gmp['cpes']>) => ({cpes});

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

describe('CpesCreatedLoader', () => {
  test('should export the created data ID', () => {
    expect(CPES_CREATED).toBe('cpes-created');
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
        <CpesCreatedLoader filter={filter}>{children}</CpesCreatedLoader>
      ),
    });

    await waitFor(() => {
      expect(mockGetCreatedAggregates).toHaveBeenCalledWith({filter});
      expect(children).toHaveBeenLastCalledWith({data, isLoading: false});
    });

    expect(subscribe).toHaveBeenCalledWith('cpes.timer', expect.any(Function));
    expect(subscribe).toHaveBeenCalledWith(
      'cpes.changed',
      expect.any(Function),
    );
  });
});

describe('CpesSeverityLoader', () => {
  test('should export the severity data ID', () => {
    expect(CPES_SEVERITY).toBe('cpes-severity');
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
        <CpesSeverityLoader filter={filter}>{children}</CpesSeverityLoader>
      ),
    });

    await waitFor(() => {
      expect(mockGetSeverityAggregates).toHaveBeenCalledWith({filter});
      expect(children).toHaveBeenLastCalledWith({data, isLoading: false});
    });

    expect(subscribe).toHaveBeenCalledWith('cpes.timer', expect.any(Function));
    expect(subscribe).toHaveBeenCalledWith(
      'cpes.changed',
      expect.any(Function),
    );
  });
});
