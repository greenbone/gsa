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
  DFNCERTS_CREATED,
  DFNCERTS_SEVERITY,
  DfnCertsCreatedLoader,
  DfnCertSeverityLoader,
} from 'web/pages/dfncert/dashboard/DfnCertLoaders';

const createGmp = dfncerts => ({dfncerts});

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

describe('DfnCertsCreatedLoader', () => {
  test('should export the created data ID', () => {
    expect(DFNCERTS_CREATED).toBe('dfncerts-created');
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
        <DfnCertsCreatedLoader filter={filter}>
          {children}
        </DfnCertsCreatedLoader>
      ),
    });

    await waitFor(() => {
      expect(mockGetCreatedAggregates).toHaveBeenCalledWith({filter});
      expect(children).toHaveBeenLastCalledWith({data, isLoading: false});
    });

    expect(subscribe).toHaveBeenCalledWith(
      'dfncerts.timer',
      expect.any(Function),
    );
    expect(subscribe).toHaveBeenCalledWith(
      'dfncerts.changed',
      expect.any(Function),
    );
  });
});

describe('DfnCertSeverityLoader', () => {
  test('should export the severity data ID', () => {
    expect(DFNCERTS_SEVERITY).toBe('dfncerts-severity');
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
        <DfnCertSeverityLoader filter={filter}>
          {children}
        </DfnCertSeverityLoader>
      ),
    });

    await waitFor(() => {
      expect(mockGetSeverityAggregates).toHaveBeenCalledWith({filter});
      expect(children).toHaveBeenLastCalledWith({data, isLoading: false});
    });

    expect(subscribe).toHaveBeenCalledWith(
      'dfncerts.timer',
      expect.any(Function),
    );
    expect(subscribe).toHaveBeenCalledWith(
      'dfncerts.changed',
      expect.any(Function),
    );
  });
});
