/* Copyright (C) 2020 Greenbone Networks GmbH
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

import {TASK_STATUS} from 'gmp/models/task';
import {OPENVAS_SCAN_CONFIG_TYPE} from 'gmp/models/scanconfig';

import {isDefined} from 'gmp/utils/identity';

import {
  CLONE_TASK,
  CREATE_CONTAINER_TASK,
  CREATE_TASK,
  DELETE_TASK,
  GET_TASKS,
  MODIFY_TASK,
  START_TASK,
  STOP_TASK,
} from 'web/graphql/tasks';

import {deepFreeze} from 'web/utils/testing';

const target = deepFreeze({
  id: '159',
  name: 'target 1',
});

// Scanner
const scanner = deepFreeze({
  id: '212223',
  name: 'scanner 1',
  type: 'OPENVAS_SCANNER_TYPE',
});

// ScanConfig
const scanConfig = deepFreeze({
  id: '314',
  name: 'foo',
  comment: 'bar',
  trash: false,
  scanner: scanner,
  type: OPENVAS_SCAN_CONFIG_TYPE,
});

// Reports
const lastReport = deepFreeze({
  id: '1234',
  severity: '5.0',
  timestamp: '2019-07-30T13:23:30Z',
  scanStart: '2019-07-30T13:23:34Z',
  scanEnd: '2019-07-30T13:25:43Z',
});

const allPermissions = deepFreeze([
  {
    name: 'Everything',
  },
]);

// Observers
const observers = deepFreeze({
  users: ['john', 'jane'],
  roles: [
    {
      name: 'admin role',
    },
    {
      name: 'user role',
    },
  ],
  groups: [
    {
      name: 'group 1',
    },
    {
      name: 'group 2',
    },
  ],
});

// Preferences
const preferences = deepFreeze([
  {
    description: 'Add results to Asset Management',
    name: 'in_assets',
    value: 'yes',
  },
  {
    description: 'Apply Overrides when adding Assets',
    name: 'assets_apply_overrides',
    value: 'yes',
  },
  {
    description: 'Min QOD when adding Assets',
    name: 'assets_min_qod',
    value: '70',
  },
  {
    description: 'Auto Delete Reports',
    name: 'auto_delete',
    value: 'no',
  },
  {
    description: 'Auto Delete Reports Data',
    name: 'auto_delete_data',
    value: '5',
  },
  {
    description: 'Maximum concurrently executed NVTs per host',
    name: 'max_checks',
    value: '4',
  },
  {
    description: 'Maximum concurrently scanned hosts',
    name: 'max_hosts',
    value: '20',
  },
]);

const listMockTask = deepFreeze({
  name: 'foo',
  id: '12345',
  permissions: allPermissions,
  reports: {
    lastReport,
    counts: {
      total: 1,
      finished: 1,
    },
  },
  status: TASK_STATUS.done,
  target,
  trend: 'up',
  alterable: 0,
  comment: 'bar',
  owner: 'admin',
  preferences,
  schedule: null,
  alerts: [],
  scanConfig,
  scanner,
  hostsOrdering: null,
  observers,
});

const mockTasks = {
  edges: [
    {
      node: listMockTask,
    },
  ],
  counts: {
    total: 1,
    filtered: 1,
    offset: 0,
    limit: 10,
    length: 1,
  },
};

export const createGetTasksQueryMock = ({filterString} = {}) => {
  const queryResult = {
    data: {
      tasks: mockTasks,
    },
  };

  const resultFunc = jest.fn().mockReturnValue(queryResult);

  const variables = {};

  if (isDefined(filterString)) {
    variables.filterString = filterString;
  }

  const queryMock = {
    request: {
      query: GET_TASKS,
      variables,
    },
    newData: resultFunc,
  };
  return [queryMock, resultFunc];
};

export const createDeleteTaskQueryMock = taskId => {
  const queryResult = {
    data: {
      deleteTask: {
        ok: true,
      },
    },
  };

  const resultFunc = jest.fn().mockReturnValue(queryResult);

  const variables = {
    id: taskId,
  };

  const queryMock = {
    request: {
      query: DELETE_TASK,
      variables,
    },
    newData: resultFunc,
  };
  return [queryMock, resultFunc];
};

export const createCloneTaskQueryMock = (
  taskId,
  newTaskId = `${taskId}-cloned`,
) => {
  const queryResult = {
    data: {
      cloneTask: {
        id: newTaskId,
      },
    },
  };

  const resultFunc = jest.fn().mockReturnValue(queryResult);

  const variables = {
    id: taskId,
  };

  const queryMock = {
    request: {
      query: CLONE_TASK,
      variables,
    },
    newData: resultFunc,
  };
  return [queryMock, resultFunc];
};

export const createStartTaskQueryMock = (taskId, reportId) => {
  const queryResult = {
    data: {
      startTask: {
        reportId,
      },
    },
  };

  const resultFunc = jest.fn().mockReturnValue(queryResult);

  const variables = {
    id: taskId,
  };

  const queryMock = {
    request: {
      query: START_TASK,
      variables,
    },
    newData: resultFunc,
  };
  return [queryMock, resultFunc];
};

export const createCreateContainerTaskQueryMock = (name, comment, taskId) => {
  const queryResult = {
    data: {
      createContainerTask: {
        id: taskId,
      },
    },
  };

  const resultFunc = jest.fn().mockReturnValue(queryResult);

  const variables = {
    input: {
      name,
      comment,
    },
  };

  const queryMock = {
    request: {
      query: CREATE_CONTAINER_TASK,
      variables,
    },
    newData: resultFunc,
  };
  return [queryMock, resultFunc];
};

export const createCreateTaskQueryMock = (data, taskId) => {
  const queryResult = {
    data: {
      createTask: {
        id: taskId,
      },
    },
  };

  const resultFunc = jest.fn().mockReturnValue(queryResult);

  const variables = {
    input: {
      ...data,
    },
  };

  const queryMock = {
    request: {
      query: CREATE_TASK,
      variables,
    },
    newData: resultFunc,
  };
  return [queryMock, resultFunc];
};

export const createModifyTaskQueryMock = (data, taskId) => {
  const queryResult = {
    data: {
      modifyTask: {
        ok: true,
      },
    },
  };

  const resultFunc = jest.fn().mockReturnValue(queryResult);

  const variables = {
    input: {
      ...data,
    },
  };

  const queryMock = {
    request: {
      query: MODIFY_TASK,
      variables,
    },
    newData: resultFunc,
  };
  return [queryMock, resultFunc];
};

export const createStopTaskQueryMock = taskId => {
  const queryResult = {
    data: {
      stopTask: {
        ok: true,
      },
    },
  };

  const resultFunc = jest.fn().mockReturnValue(queryResult);

  const variables = {
    id: taskId,
  };

  const queryMock = {
    request: {
      query: STOP_TASK,
      variables,
    },
    newData: resultFunc,
  };
  return [queryMock, resultFunc];
};
