/* Copyright (C) 2020 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301 USA.
 */
import gql from 'graphql-tag';
import {TASK_STATUS} from 'gmp/models/task';

import {useMutation, useQuery} from '@apollo/react-hooks';

import {toGraphQL, toFruitfulQuery} from 'web/utils/graphql';

export const GET_TASK = gql`
  query Task($taskId: UUID!) {
    task(taskId: $taskId) {
      name
      uuid
      permissions {
        name
      }
      lastReport {
        uuid
        severity
        timestamp
        scanStart
        scanEnd
      }
      currentReport {
        uuid
        scanStart
      }
      reportCount {
        total
        finished
      }
      status
      target {
        name
        uuid
      }
      trend
      comment
      owner
      preferences {
        name
        value
        description
      }
      schedule {
        name
        uuid
        icalendar
        timezone
        duration
      }
      alerts {
        name
        uuid
      }
      scanConfig {
        uuid
        name
        trash
      }
      scanner {
        uuid
        name
        scannerType
      }
      schedulePeriods
      hostsOrdering
      userTags {
        count
        tags {
          name
          uuid
          value
          comment
        }
      }
      observers {
        users
        roles {
          name
        }
        groups {
          name
        }
      }
    }
  }
`;

export const useGetTask = () => {
  return toFruitfulQuery(useQuery)(GET_TASK);
};

export const GET_TASKS = gql`
  query Task($filterString: String) {
    tasks(filterString: $filterString) {
      nodes {
        name
        uuid
        permissions {
          name
        }
        lastReport {
          uuid
          severity
          timestamp
        }
        reportCount {
          total
          finished
        }
        status
        target {
          name
          uuid
        }
        trend
        comment
        owner
        preferences {
          name
          value
          description
        }
        schedule {
          name
          uuid
          icalendar
          timezone
          duration
        }
        alerts {
          name
          uuid
        }
        scanConfig {
          uuid
          name
          trash
        }
        scanner {
          uuid
          name
          scannerType
        }
        hostsOrdering
        observers {
          users
          roles {
            name
          }
          groups {
            name
          }
        }
      }
    }
  }
`;

export const useGetTasks = () => {
  return toFruitfulQuery(useQuery)(GET_TASKS);
};

export const CLONE_TASK = gql`
  mutation cloneTask($taskId: String!) {
    cloneTask(taskId: $taskId) {
      taskId
    }
  }
`;

export const useCloneTask = () => {
  const [cloneTask] = useMutation(CLONE_TASK);
  return toGraphQL(cloneTask);
};

export const DELETE_TASK = gql`
  mutation deleteTask($taskId: String!) {
    deleteTask(taskId: $taskId) {
      ok
    }
  }
`;

export const useDeleteTask = () => {
  const [deleteTask] = useMutation(DELETE_TASK);
  return toGraphQL(deleteTask);
};

export const MODIFY_TASK = gql`
  mutation modifyTask(
    $taskId: String!
    $name: String
    $targetId: UUID
    $scannerId: UUID
    $schedulePeriods: Int
    $alterable: Boolean
    $comment: String
  ) {
    modifyTask(
      taskId: $taskId
      name: $name
      targetId: $targetId
      scannerId: $scannerId
      schedulePeriods: $schedulePeriods
      alterable: $alterable
      comment: $comment
    ) {
      taskId
    }
  }
`;

export const useModifyTask = () => {
  const [modifyTask] = useMutation(MODIFY_TASK);
  return toGraphQL(modifyTask);
};

export const CREATE_TASK = gql`
  mutation createTask(
    $name: String!
    $configId: UUID!
    $targetId: UUID!
    $scannerId: UUID!
    $scheduleId: UUID
    $schedulePeriods: Int
    $alterable: Boolean
    $comment: String
  ) {
    createTask(
      name: $name
      configId: $configId
      targetId: $targetId
      scannerId: $scannerId
      scheduleId: $scheduleId
      schedulePeriods: $schedulePeriods
      alterable: $alterable
      comment: $comment
    ) {
      taskId
    }
  }
`;

export const useCreateTask = () => {
  const [createTask] = useMutation(CREATE_TASK);
  return toGraphQL(createTask);
};

export const CREATE_CONTAINER_TASK = gql`
  mutation createContainerTask($name: String!, $comment: String) {
    createContainerTask(name: $name, comment: $comment) {
      taskId
    }
  }
`;

export const useCreateContainerTask = () => {
  const [createContainerTask] = useMutation(CREATE_CONTAINER_TASK);
  return toGraphQL(createContainerTask);
};

const lastReport = {
  uuid: '1234',
  severity: '5.0',
  timestamp: '2020-02-27T13:20:45Z',
};

const mockTask = {
  data: {
    tasks: {
      nodes: [
        {
          name: 'foo',
          uuid: '1234',
          permissions: [
            {
              name: 'Everything',
            },
          ],
          lastReport,
          reportCount: {
            total: 1,
            finished: 1,
          },
          status: TASK_STATUS.done,
          target: {
            name: 'Target',
            uuid: 'id1',
          },
          trend: null,
          comment: 'bar',
          owner: 'admin',
          preferences: null,
          schedule: null,
          alerts: [],
          scanConfig: {
            uuid: 'id2',
            name: 'lorem',
            trash: false,
          },
          scanner: {
            uuid: 'id3',
            name: 'ipsum',
            scannerType: 'dolor',
          },
          hostsOrdering: null,
          observers: {
            users: ['john', 'jane'],
            roles: [
              {
                name: 'r1',
              },
              {
                name: 'r2',
              },
            ],
            groups: [
              {
                name: 'g1',
              },
              {
                name: 'g2',
              },
            ],
          },
        },
      ],
    },
  },
};

export const mockGetTasks = [
  {
    request: {
      query: GET_TASKS,
      variables: {filterString: 'foo=bar rows=2'},
    },
    result: mockTask,
  },
  {
    request: {
      query: GET_TASKS,
      variables: {filterString: ''},
    },
    result: mockTask,
  },
  {
    request: {
      query: GET_TASKS,
      variables: {filterString: ''},
    },
    result: mockTask,
  },
];
