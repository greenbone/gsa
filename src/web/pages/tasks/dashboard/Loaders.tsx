/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import Loader, {createLoadFunc} from 'web/components/dashboard/display/Loader';

export const TASKS_STATUS = 'tasks-status';
export const TASKS_SEVERITY = 'tasks-severity';
export const TASKS_SCHEDULES = 'tasks-schedules';
export const TASKS_HIGH_RESULTS = 'tasks-high-results';

export const tasksStatusLoadFunc = createLoadFunc(
  ({gmp, filter}) => gmp.tasks.getStatusAggregates({filter}).then(r => r.data),
  TASKS_STATUS,
);

export const tasksSeverityLoadFunc = createLoadFunc(
  ({gmp, filter}) =>
    gmp.tasks.getSeverityAggregates({filter}).then(r => r.data),
  TASKS_SEVERITY,
);

export const tasksSchedulesLoadFunc = createLoadFunc(
  ({gmp, filter}) =>
    gmp.tasks
      .getAll({
        filter,
        ignore_pagination: 1,
        no_filter_history: 1,
        schedules_only: 1,
      })
      .then(r => r.data),
  TASKS_SCHEDULES,
);

const MAX_HIGH_RESULT_TASKS_COUNT = 10;

export const tasksHighResultsLoadFunc = createLoadFunc(
  ({gmp, filter}) =>
    gmp.tasks
      .getHighResultsAggregates({
        filter,
        max: MAX_HIGH_RESULT_TASKS_COUNT,
      })
      .then(r => r.data),
  TASKS_HIGH_RESULTS,
);

export const TaskStatusLoader = ({children, filter}) => (
  <Loader
    dataId={TASKS_STATUS}
    filter={filter}
    load={tasksStatusLoadFunc}
    subscriptions={['tasks.timer', 'tasks.changed']}
  >
    {children}
  </Loader>
);

export const TasksSchedulesLoader = ({children, filter}) => (
  <Loader
    dataId={TASKS_SCHEDULES}
    filter={filter}
    load={tasksSchedulesLoadFunc}
    subscriptions={['tasks.timer', 'tasks.changed']}
  >
    {children}
  </Loader>
);

export const TasksSeverityLoader = ({children, filter}) => (
  <Loader
    dataId={TASKS_SEVERITY}
    filter={filter}
    load={tasksSeverityLoadFunc}
    subscriptions={['tasks.timer', 'tasks.changed']}
  >
    {children}
  </Loader>
);

export const TasksHighResultsLoader = ({children, filter}) => (
  <Loader
    dataId={TASKS_HIGH_RESULTS}
    filter={filter}
    load={tasksHighResultsLoadFunc}
    subscriptions={['tasks.timer', 'tasks.changed']}
  >
    {children}
  </Loader>
);
