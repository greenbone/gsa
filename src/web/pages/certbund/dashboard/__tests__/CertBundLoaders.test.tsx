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
  CERTBUNDS_CREATED,
  CERTBUNDS_SEVERITY,
  CertBundCreatedLoader,
  CertBundSeverityLoader,
} from 'web/pages/certbund/dashboard/CertBundLoaders';

const createGmp = (certbunds: Partial<Gmp['certbunds']>) =>
  ({certbunds}) as unknown as Record<string, unknown>;

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

describe('CertBund Loaders', () => {
  test('should export created data ID', () => {
    expect(CERTBUNDS_CREATED).toBe('certbunds-created');
  });

  test('should export severity data ID', () => {
    expect(CERTBUNDS_SEVERITY).toBe('certbunds-severity');
  });

  describe('CertBundCreatedLoader', () => {
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
          <CertBundCreatedLoader filter={filter}>
            {children}
          </CertBundCreatedLoader>
        ),
      });

      await waitFor(() => {
        expect(mockGetCreatedAggregates).toHaveBeenCalledWith({filter});
        expect(children).toHaveBeenLastCalledWith({data, isLoading: false});
      });

      expect(subscribe).toHaveBeenCalledWith(
        'certbunds.timer',
        expect.any(Function),
      );
      expect(subscribe).toHaveBeenCalledWith(
        'certbunds.changed',
        expect.any(Function),
      );
    });
  });

  describe('CertBundSeverityLoader', () => {
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
          <CertBundSeverityLoader filter={filter}>
            {children}
          </CertBundSeverityLoader>
        ),
      });

      await waitFor(() => {
        expect(mockGetSeverityAggregates).toHaveBeenCalledWith({filter});
        expect(children).toHaveBeenLastCalledWith({data, isLoading: false});
      });

      expect(subscribe).toHaveBeenCalledWith(
        'certbunds.timer',
        expect.any(Function),
      );
      expect(subscribe).toHaveBeenCalledWith(
        'certbunds.changed',
        expect.any(Function),
      );
    });
  });
});
