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

import {
  CLONE_TASK,
  CREATE_CONTAINER_TASK,
  CREATE_TASK,
  DELETE_TASK,
  DELETE_TASKS_BY_IDS,
  GET_TASK,
  GET_TASKS,
  MODIFY_TASK,
  START_TASK,
  STOP_TASK,
  RESUME_TASK,
  DELETE_TASKS_BY_FILTER,
  EXPORT_TASKS_BY_FILTER,
  EXPORT_TASKS_BY_IDS,
} from 'web/graphql/tasks';

import {deepFreeze, createGenericQueryMock} from 'web/utils/testing';

const alert = deepFreeze({id: '151617', name: 'alert 1'});

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

const currentReport = deepFreeze({
  id: '5678',
  timestamp: '2019-08-30T13:23:30Z',
  scanStart: '2019-08-30T13:23:34Z',
});

const weekly = `
BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Greenbone.net//NONSGML Greenbone Security Manager
 20.8+alpha~git-b4610ada-master//EN
BEGIN:VEVENT
DTSTART:20200615T080000Z
DURATION:PT0S
RRULE:FREQ=WEEKLY
UID:c5694e2e-daea-419b-b524-bb363b4ca37b
DTSTAMP:20200615T072702Z
END:VEVENT
END:VCALENDAR
`;

// Schedule
const schedule = deepFreeze({
  id: '121314',
  name: 'schedule 1',
  timezone: 'UTC',
  duration: 0,
  icalendar: weekly,
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
    currentReport,
    lastReport,
    counts: {
      total: 1,
      finished: 1,
    },
  },
  progress: 100,
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
  pageInfo: {
    hasNextPage: false,
    hasPreviousPage: false,
    startCursor: 'task:0',
    endCursor: 'task:1',
    lastPageCursor: 'task:3',
  },
};

const detailsMockTask = deepFreeze({
  name: 'foo',
  id: '12345',
  creationTime: '2019-07-30T13:00:00Z',
  modificationTime: '2019-08-30T13:23:30Z',
  permissions: allPermissions,
  reports: {
    lastReport,
    currentReport,
    counts: {
      total: 1,
      finished: 1,
    },
  },
  progress: 100,
  status: TASK_STATUS.stopped,
  target,
  alterable: 0,
  trend: null,
  comment: 'bar',
  owner: 'admin',
  preferences,
  schedule,
  alerts: [alert],
  scanConfig,
  scanner,
  schedulePeriods: null,
  hostsOrdering: 'sequential',
  userTags: null,
  observers,
  results: {
    counts: {
      current: 20,
    },
  },
});

export const createGetTasksQueryMock = (variables = {}) => {
  const queryResult = {
    data: {
      tasks: mockTasks,
    },
  };

  const resultFunc = jest.fn().mockReturnValue(queryResult);

  const queryMock = {
    request: {
      query: GET_TASKS,
      variables,
    },
    newData: resultFunc,
  };
  return [queryMock, resultFunc];
};

export const createGetTaskQueryMock = (id, task = detailsMockTask) => {
  const queryResult = {
    data: {
      task,
    },
  };

  const resultFunc = jest.fn().mockReturnValue(queryResult);

  const queryMock = {
    request: {
      query: GET_TASK,
      variables: {
        id,
      },
    },
    newData: resultFunc,
  };
  return [queryMock, resultFunc];
};

export const createGetTaskQueryErrorMock = (
  id,
  error = new Error('An error occurred.'),
) => {
  const queryMock = {
    request: {
      query: GET_TASK,
      variables: {
        id,
      },
    },
    error,
  };
  return [queryMock];
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

export const createDeleteTasksByIdsQueryMock = taskIds => {
  const queryResult = {
    data: {
      deleteTasksByIds: {
        ok: true,
      },
    },
  };

  const resultFunc = jest.fn().mockReturnValue(queryResult);

  const variables = {
    ids: taskIds,
  };

  const queryMock = {
    request: {
      query: DELETE_TASKS_BY_IDS,
      variables,
    },
    newData: resultFunc,
  };
  return [queryMock, resultFunc];
};

export const createDeleteTasksByFilterQueryMock = (filterString = 'foo') => {
  const queryResult = {
    data: {
      deleteTasksByFilter: {
        ok: true,
      },
    },
  };

  const resultFunc = jest.fn().mockReturnValue(queryResult);

  const variables = {
    filterString,
  };

  const queryMock = {
    request: {
      query: DELETE_TASKS_BY_FILTER,
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

export const createResumeTaskQueryMock = taskId => {
  const queryResult = {
    data: {
      resumeTask: {
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
      query: RESUME_TASK,
      variables,
    },
    newData: resultFunc,
  };
  return [queryMock, resultFunc];
};

const exportTasksByIdsResult = {
  exportTasksByIds: {
    exportedEntities: '<get_tasks_response status="200" status_text="OK" />',
  },
};

export const createExportTasksByIdsQueryMock = (
  ids = ['foo', 'bar', 'lorem'],
) => createGenericQueryMock(EXPORT_TASKS_BY_IDS, exportTasksByIdsResult, {ids});

const exportTasksByFilterResult = {
  exportTasksByFilter: {
    exportedEntities: '<get_tasks_response status="200" status_text="OK" />',
  },
};

export const createExportTasksByFilterQueryMock = (filterString = 'foo') => {
  return createGenericQueryMock(
    EXPORT_TASKS_BY_FILTER,
    exportTasksByFilterResult,
    {filterString},
  );
};
