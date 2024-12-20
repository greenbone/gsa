/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import Loader, {
  loadFunc,
  loaderPropTypes,
} from 'web/store/dashboard/data/loader';

export const TASKS_STATUS = 'tasks-status';
export const TASKS_SEVERITY = 'tasks-severity';
export const TASKS_SCHEDULES = 'tasks-schedules';
export const TASKS_HIGH_RESULTS = 'tasks-high-results';

export const tasksStatusLoader = loadFunc(
  ({gmp, filter}) => gmp.tasks.getStatusAggregates({filter}).then(r => r.data),
  TASKS_STATUS,
);

export const tasksSeverityLoader = loadFunc(
  ({gmp, filter}) =>
    gmp.tasks.getSeverityAggregates({filter}).then(r => r.data),
  TASKS_SEVERITY,
);

export const tasksSchedulesLoader = loadFunc(
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

export const tasksHighResultsLoader = loadFunc(
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
    load={tasksStatusLoader}
    subscriptions={['tasks.timer', 'tasks.changed']}
  >
    {children}
  </Loader>
);

TaskStatusLoader.propTypes = loaderPropTypes;

export const TasksSchedulesLoader = ({children, filter}) => (
  <Loader
    dataId={TASKS_SCHEDULES}
    filter={filter}
    load={tasksSchedulesLoader}
    subscriptions={['tasks.timer', 'tasks.changed']}
  >
    {children}
  </Loader>
);

TasksSchedulesLoader.propTypes = loaderPropTypes;

export const TasksSeverityLoader = ({children, filter}) => (
  <Loader
    dataId={TASKS_SEVERITY}
    filter={filter}
    load={tasksSeverityLoader}
    subscriptions={['tasks.timer', 'tasks.changed']}
  >
    {children}
  </Loader>
);

TasksSeverityLoader.propTypes = loaderPropTypes;

export const TasksHighResultsLoader = ({children, filter}) => (
  <Loader
    dataId={TASKS_HIGH_RESULTS}
    filter={filter}
    load={tasksHighResultsLoader}
    subscriptions={['tasks.timer', 'tasks.changed']}
  >
    {children}
  </Loader>
);

TasksHighResultsLoader.propTypes = loaderPropTypes;
