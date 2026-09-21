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
  ResultsDescriptionWordCountLoader,
  ResultsSeverityLoader,
  ResultsWordCountLoader,
  RESULTS_DESCRIPTION_WORDCOUNT,
  RESULTS_SEVERITY,
  RESULTS_WORD_COUNT,
} from 'web/pages/results/dashboard/ResultLoaders';

const createGmp = (results: Record<string, unknown>) => ({results});

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

const expectResultSubscriptions = (subscribe: SubscribeFunc) => {
  expect(subscribe).toHaveBeenCalledWith('results.timer', expect.any(Function));
  expect(subscribe).toHaveBeenCalledWith(
    'results.changed',
    expect.any(Function),
  );
};

describe('Result loaders', () => {
  test('should export the result data IDs', () => {
    expect(RESULTS_DESCRIPTION_WORDCOUNT).toBe('results-description-wordcount');
    expect(RESULTS_SEVERITY).toBe('results-severity');
    expect(RESULTS_WORD_COUNT).toBe('results-wordcount');
  });

  describe('ResultsSeverityLoader', () => {
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
          <ResultsSeverityLoader filter={filter}>
            {children}
          </ResultsSeverityLoader>
        ),
      });

      await waitFor(() => {
        expect(getSeverityAggregates).toHaveBeenCalledWith({filter});
        expect(children).toHaveBeenLastCalledWith({data, isLoading: false});
      });

      expectResultSubscriptions(subscribe);
    });
  });

  describe('ResultsWordCountLoader', () => {
    test('should load word-count aggregates and render them', async () => {
      const data = {groups: [{value: 'security', count: 5}]};
      const getWordCountsAggregates = testing.fn().mockResolvedValue({data});
      const gmp = createGmp({getWordCountsAggregates});
      const filter = QueryFilter.fromString('first=1 rows=10');
      const subscribe = testing.fn().mockReturnValue(testing.fn());
      const children = testing.fn().mockReturnValue(null);

      renderWithSubscriptionContext({
        gmp,
        subscribe,
        children: (
          <ResultsWordCountLoader filter={filter}>
            {children}
          </ResultsWordCountLoader>
        ),
      });

      await waitFor(() => {
        expect(getWordCountsAggregates).toHaveBeenCalledWith({filter});
        expect(children).toHaveBeenLastCalledWith({data, isLoading: false});
      });

      expectResultSubscriptions(subscribe);
    });
  });

  describe('ResultsDescriptionWordCountLoader', () => {
    test('should load description word-count aggregates and render them', async () => {
      const data = {groups: [{value: 'security issue', count: 5}]};
      const getDescriptionWordCountsAggregates = testing
        .fn()
        .mockResolvedValue({data});
      const gmp = createGmp({getDescriptionWordCountsAggregates});
      const filter = QueryFilter.fromString('first=1 rows=10');
      const subscribe = testing.fn().mockReturnValue(testing.fn());
      const children = testing.fn().mockReturnValue(null);

      renderWithSubscriptionContext({
        gmp,
        subscribe,
        children: (
          <ResultsDescriptionWordCountLoader filter={filter}>
            {children}
          </ResultsDescriptionWordCountLoader>
        ),
      });

      await waitFor(() => {
        expect(getDescriptionWordCountsAggregates).toHaveBeenCalledWith({
          filter,
        });
        expect(children).toHaveBeenLastCalledWith({data, isLoading: false});
      });

      expectResultSubscriptions(subscribe);
    });
  });
});
