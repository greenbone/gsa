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
  OVERRIDES_ACTIVE_DAYS,
  OVERRIDES_CREATED,
  OVERRIDES_WORD_COUNT,
  OverridesActiveDaysLoader,
  OverridesCreatedLoader,
  OverridesWordCountLoader,
} from 'web/pages/overrides/dashboard/OverrideLoaders';

const createGmp = (overrides: Record<string, unknown>) => ({overrides});

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

const expectOverrideSubscriptions = (subscribe: SubscribeFunc) => {
  expect(subscribe).toHaveBeenCalledWith(
    'overrides.timer',
    expect.any(Function),
  );
  expect(subscribe).toHaveBeenCalledWith(
    'overrides.changed',
    expect.any(Function),
  );
};

describe('OverridesActiveDaysLoader', () => {
  test('should export the active days data ID', () => {
    expect(OVERRIDES_ACTIVE_DAYS).toBe('overrides-active-days');
  });

  test('should load active days aggregates and render them', async () => {
    const data = {groups: [{value: 1, count: 5}]};
    const getActiveDaysAggregates = testing.fn().mockResolvedValue({data});
    const gmp = createGmp({getActiveDaysAggregates});
    const filter = QueryFilter.fromString('first=1 rows=10');
    const subscribe = testing.fn().mockReturnValue(testing.fn());
    const children = testing.fn().mockReturnValue(null);

    renderWithSubscriptionContext({
      gmp,
      subscribe,
      children: (
        <OverridesActiveDaysLoader filter={filter}>
          {children}
        </OverridesActiveDaysLoader>
      ),
    });

    await waitFor(() => {
      expect(getActiveDaysAggregates).toHaveBeenCalledWith({filter});
      expect(children).toHaveBeenLastCalledWith({
        data,
        isLoading: false,
        isFetching: false,
      });
    });

    expectOverrideSubscriptions(subscribe);
  });
});

describe('OverridesCreatedLoader', () => {
  test('should export the created data ID', () => {
    expect(OVERRIDES_CREATED).toBe('overrides-created');
  });

  test('should load created aggregates and render them', async () => {
    const data = {
      groups: [{value: '2026-01-01', count: '5', c_count: '10'}],
    };
    const getCreatedAggregates = testing.fn().mockResolvedValue({data});
    const gmp = createGmp({getCreatedAggregates});
    const filter = QueryFilter.fromString('first=1 rows=10');
    const subscribe = testing.fn().mockReturnValue(testing.fn());
    const children = testing.fn().mockReturnValue(null);

    renderWithSubscriptionContext({
      gmp,
      subscribe,
      children: (
        <OverridesCreatedLoader filter={filter}>
          {children}
        </OverridesCreatedLoader>
      ),
    });

    await waitFor(() => {
      expect(getCreatedAggregates).toHaveBeenCalledWith({filter});
      expect(children).toHaveBeenLastCalledWith({
        data,
        isLoading: false,
        isFetching: false,
      });
    });

    expectOverrideSubscriptions(subscribe);
  });
});

describe('OverridesWordCountLoader', () => {
  test('should export the word count data ID', () => {
    expect(OVERRIDES_WORD_COUNT).toBe('overrides-wordcount');
  });

  test('should load word count aggregates and render them', async () => {
    const data = {groups: [{value: 'override', count: 5}]};
    const getWordCountsAggregates = testing.fn().mockResolvedValue({data});
    const gmp = createGmp({getWordCountsAggregates});
    const filter = QueryFilter.fromString('first=1 rows=10');
    const subscribe = testing.fn().mockReturnValue(testing.fn());
    const children = testing.fn().mockReturnValue(null);

    renderWithSubscriptionContext({
      gmp,
      subscribe,
      children: (
        <OverridesWordCountLoader filter={filter}>
          {children}
        </OverridesWordCountLoader>
      ),
    });

    await waitFor(() => {
      expect(getWordCountsAggregates).toHaveBeenCalledWith({filter});
      expect(children).toHaveBeenLastCalledWith({
        data,
        isLoading: false,
        isFetching: false,
      });
    });

    expectOverrideSubscriptions(subscribe);
  });
});
