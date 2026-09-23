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
  TlsCertificatesModifiedLoader,
  TlsCertificatesStatusLoader,
} from 'web/pages/tlscertificates/dashboard/TlsCertificatesLoaders';

const createGmp = (tlscertificates: Record<string, unknown>) => ({
  tlscertificates,
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

const expectTlsCertificateSubscriptions = (subscribe: SubscribeFunc) => {
  expect(subscribe).toHaveBeenCalledWith(
    'tlscertificates.timer',
    expect.any(Function),
  );
  expect(subscribe).toHaveBeenCalledWith(
    'tlscertificates.changed',
    expect.any(Function),
  );
};

describe('TlsCertificatesStatusLoader', () => {
  test('should load TLS certificates and render them', async () => {
    const data = [{timeStatus: 'valid'}];
    const getAll = testing.fn().mockResolvedValue({data});
    const gmp = createGmp({getAll});
    const filter = QueryFilter.fromString('first=1 rows=10');
    const subscribe = testing.fn().mockReturnValue(testing.fn());
    const children = testing.fn().mockReturnValue(null);

    renderWithSubscriptionContext({
      gmp,
      subscribe,
      children: (
        <TlsCertificatesStatusLoader filter={filter}>
          {children}
        </TlsCertificatesStatusLoader>
      ),
    });

    await waitFor(() => {
      expect(getAll).toHaveBeenCalledWith({filter});
      expect(children).toHaveBeenLastCalledWith({data, isLoading: false});
    });

    expectTlsCertificateSubscriptions(subscribe);
  });
});

describe('TlsCertificatesModifiedLoader', () => {
  test('should load modified TLS certificate aggregates and render them', async () => {
    const data = {
      groups: [{value: '2026-01-01', count: 5, c_count: 10}],
    };
    const getModifiedAggregates = testing.fn().mockResolvedValue({data});
    const gmp = createGmp({getModifiedAggregates});
    const filter = QueryFilter.fromString('first=1 rows=10');
    const subscribe = testing.fn().mockReturnValue(testing.fn());
    const children = testing.fn().mockReturnValue(null);

    renderWithSubscriptionContext({
      gmp,
      subscribe,
      children: (
        <TlsCertificatesModifiedLoader filter={filter}>
          {children}
        </TlsCertificatesModifiedLoader>
      ),
    });

    await waitFor(() => {
      expect(getModifiedAggregates).toHaveBeenCalledWith({filter});
      expect(children).toHaveBeenLastCalledWith({data, isLoading: false});
    });

    expectTlsCertificateSubscriptions(subscribe);
  });
});
