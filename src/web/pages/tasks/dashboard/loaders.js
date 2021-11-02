/* Copyright (C) 2018-2021 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License
 * as published by the Free Software Foundation, either version 3
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
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

// vim: set ts=2 sw=2 tw=80:
