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
  TaskStatusLoader,
  TasksHighResultsLoader,
  TasksSchedulesLoader,
  TasksSeverityLoader,
  TASKS_HIGH_RESULTS,
  TASKS_SCHEDULES,
  TASKS_SEVERITY,
  TASKS_STATUS,
} from 'web/pages/tasks/dashboard/TaskLoaders';

const createGmp = (tasks: Record<string, unknown>) => ({tasks});

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

const expectTaskSubscriptions = (subscribe: SubscribeFunc) => {
  expect(subscribe).toHaveBeenCalledWith('tasks.timer', expect.any(Function));
  expect(subscribe).toHaveBeenCalledWith('tasks.changed', expect.any(Function));
};

describe('Task loaders', () => {
  test('should export the task data IDs', () => {
    expect(TASKS_STATUS).toBe('tasks-status');
    expect(TASKS_SEVERITY).toBe('tasks-severity');
    expect(TASKS_SCHEDULES).toBe('tasks-schedules');
    expect(TASKS_HIGH_RESULTS).toBe('tasks-high-results');
  });

  describe('TaskStatusLoader', () => {
    test('should load status aggregates and render them', async () => {
      const data = {groups: [{value: 'Running', count: 10}]};
      const getStatusAggregates = testing.fn().mockResolvedValue({data});
      const gmp = createGmp({getStatusAggregates});
      const filter = QueryFilter.fromString('first=1 rows=10');
      const subscribe = testing.fn().mockReturnValue(testing.fn());
      const children = testing.fn().mockReturnValue(null);

      renderWithSubscriptionContext({
        gmp,
        subscribe,
        children: (
          <TaskStatusLoader filter={filter}>{children}</TaskStatusLoader>
        ),
      });

      await waitFor(() => {
        expect(getStatusAggregates).toHaveBeenCalledWith({filter});
        expect(children).toHaveBeenLastCalledWith({data, isLoading: false});
      });

      expectTaskSubscriptions(subscribe);
    });
  });

  describe('TasksSeverityLoader', () => {
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
          <TasksSeverityLoader filter={filter}>{children}</TasksSeverityLoader>
        ),
      });

      await waitFor(() => {
        expect(getSeverityAggregates).toHaveBeenCalledWith({filter});
        expect(children).toHaveBeenLastCalledWith({data, isLoading: false});
      });

      expectTaskSubscriptions(subscribe);
    });
  });

  describe('TasksSchedulesLoader', () => {
    test('should load scheduled tasks and render them', async () => {
      const data = [{name: 'Scheduled Task'}];
      const getAll = testing.fn().mockResolvedValue({data});
      const gmp = createGmp({getAll});
      const filter = QueryFilter.fromString('first=1 rows=10');
      const subscribe = testing.fn().mockReturnValue(testing.fn());
      const children = testing.fn().mockReturnValue(null);

      renderWithSubscriptionContext({
        gmp,
        subscribe,
        children: (
          <TasksSchedulesLoader filter={filter}>
            {children}
          </TasksSchedulesLoader>
        ),
      });

      await waitFor(() => {
        expect(getAll).toHaveBeenCalledWith({
          filter,
          ignore_pagination: 1,
          no_filter_history: 1,
          schedules_only: 1,
        });
        expect(children).toHaveBeenLastCalledWith({data, isLoading: false});
      });

      expectTaskSubscriptions(subscribe);
    });
  });

  describe('TasksHighResultsLoader', () => {
    test('should load high-results aggregates and render them', async () => {
      const data = {
        groups: [
          {
            value: 'task-1',
            text: {name: 'Task One', high_per_host: '2.5'},
          },
        ],
      };
      const getHighResultsAggregates = testing.fn().mockResolvedValue({data});
      const gmp = createGmp({getHighResultsAggregates});
      const filter = QueryFilter.fromString('first=1 rows=10');
      const subscribe = testing.fn().mockReturnValue(testing.fn());
      const children = testing.fn().mockReturnValue(null);

      renderWithSubscriptionContext({
        gmp,
        subscribe,
        children: (
          <TasksHighResultsLoader filter={filter}>
            {children}
          </TasksHighResultsLoader>
        ),
      });

      await waitFor(() => {
        expect(getHighResultsAggregates).toHaveBeenCalledWith({
          filter,
          max: 10,
        });
        expect(children).toHaveBeenLastCalledWith({data, isLoading: false});
      });

      expectTaskSubscriptions(subscribe);
    });
  });
});
