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
  NvtCreatedLoader,
  NvtsFamilyLoader,
  NvtsQodLoader,
  NvtsQodTypeLoader,
  NvtsSeverityLoader,
  NVTS_CREATED,
  NVTS_FAMILY,
  NVTS_QOD,
  NVTS_QOD_TYPE,
  NVTS_SEVERITY,
} from 'web/pages/nvts/dashboard/NvtLoaders';

const createGmp = (nvts: Record<string, unknown>) => ({nvts});

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

const expectNvtSubscriptions = (subscribe: SubscribeFunc) => {
  expect(subscribe).toHaveBeenCalledWith('nvts.timer', expect.any(Function));
  expect(subscribe).toHaveBeenCalledWith('nvts.changed', expect.any(Function));
};

describe('NVT loaders', () => {
  test('should export the NVT data IDs', () => {
    expect(NVTS_FAMILY).toBe('nvt-family');
    expect(NVTS_SEVERITY).toBe('nvt-severity');
    expect(NVTS_QOD).toBe('nvt-qod');
    expect(NVTS_QOD_TYPE).toBe('nvt-qod-type');
    expect(NVTS_CREATED).toBe('nvt-created');
  });

  describe('NvtsFamilyLoader', () => {
    test('should load family aggregates and render them', async () => {
      const data = {
        groups: [{value: 'Linux', count: 5, stats: {severity: {mean: 2.1}}}],
      };
      const getFamilyAggregates = testing.fn().mockResolvedValue({data});
      const gmp = createGmp({getFamilyAggregates});
      const filter = QueryFilter.fromString('first=1 rows=10');
      const subscribe = testing.fn().mockReturnValue(testing.fn());
      const children = testing.fn().mockReturnValue(null);

      renderWithSubscriptionContext({
        gmp,
        subscribe,
        children: (
          <NvtsFamilyLoader filter={filter}>{children}</NvtsFamilyLoader>
        ),
      });

      await waitFor(() => {
        expect(getFamilyAggregates).toHaveBeenCalledWith({filter});
        expect(children).toHaveBeenLastCalledWith({data, isLoading: false});
      });

      expectNvtSubscriptions(subscribe);
    });
  });

  describe('NvtsSeverityLoader', () => {
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
          <NvtsSeverityLoader filter={filter}>{children}</NvtsSeverityLoader>
        ),
      });

      await waitFor(() => {
        expect(getSeverityAggregates).toHaveBeenCalledWith({filter});
        expect(children).toHaveBeenLastCalledWith({data, isLoading: false});
      });

      expectNvtSubscriptions(subscribe);
    });
  });

  describe('NvtsQodLoader', () => {
    test('should load QoD aggregates and render them', async () => {
      const data = {groups: [{value: '80', count: 10}]};
      const getQodAggregates = testing.fn().mockResolvedValue({data});
      const gmp = createGmp({getQodAggregates});
      const filter = QueryFilter.fromString('first=1 rows=10');
      const subscribe = testing.fn().mockReturnValue(testing.fn());
      const children = testing.fn().mockReturnValue(null);

      renderWithSubscriptionContext({
        gmp,
        subscribe,
        children: <NvtsQodLoader filter={filter}>{children}</NvtsQodLoader>,
      });

      await waitFor(() => {
        expect(getQodAggregates).toHaveBeenCalledWith({filter});
        expect(children).toHaveBeenLastCalledWith({data, isLoading: false});
      });

      expectNvtSubscriptions(subscribe);
    });
  });

  describe('NvtsQodTypeLoader', () => {
    test('should load QoD type aggregates and render them', async () => {
      const data = {groups: [{value: 'general_note', count: 10}]};
      const getQodTypeAggregates = testing.fn().mockResolvedValue({data});
      const gmp = createGmp({getQodTypeAggregates});
      const filter = QueryFilter.fromString('first=1 rows=10');
      const subscribe = testing.fn().mockReturnValue(testing.fn());
      const children = testing.fn().mockReturnValue(null);

      renderWithSubscriptionContext({
        gmp,
        subscribe,
        children: (
          <NvtsQodTypeLoader filter={filter}>{children}</NvtsQodTypeLoader>
        ),
      });

      await waitFor(() => {
        expect(getQodTypeAggregates).toHaveBeenCalledWith({filter});
        expect(children).toHaveBeenLastCalledWith({data, isLoading: false});
      });

      expectNvtSubscriptions(subscribe);
    });
  });

  describe('NvtCreatedLoader', () => {
    test('should load created aggregates and render them', async () => {
      const data = {
        groups: [{value: '2026-01', count: '5', c_count: '10'}],
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
          <NvtCreatedLoader filter={filter}>{children}</NvtCreatedLoader>
        ),
      });

      await waitFor(() => {
        expect(getCreatedAggregates).toHaveBeenCalledWith({filter});
        expect(children).toHaveBeenLastCalledWith({data, isLoading: false});
      });

      expectNvtSubscriptions(subscribe);
    });
  });
});
