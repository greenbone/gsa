/* Copyright (C) 2020-2021 Greenbone Networks GmbH
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
import {useCallback} from 'react';

import {gql, useQuery, useLazyQuery, useMutation} from '@apollo/client';

import CollectionCounts from 'gmp/collection/collectioncounts';

import Task from 'gmp/models/task';

import {isDefined} from 'gmp/utils/identity';

export const CLONE_TASK = gql`
  mutation cloneTask($id: UUID!) {
    cloneTask(id: $id) {
      id
    }
  }
`;

export const CREATE_CONTAINER_TASK = gql`
  mutation createContainerTask($input: CreateContainerTaskInput!) {
    createContainerTask(input: $input) {
      id
    }
  }
`;

export const CREATE_TASK = gql`
  mutation createTask($input: CreateTaskInput!) {
    createTask(input: $input) {
      id
    }
  }
`;

export const DELETE_TASK = gql`
  mutation deleteTask($id: UUID!) {
    deleteTask(id: $id) {
      ok
    }
  }
`;

export const DELETE_TASKS_BY_IDS = gql`
  mutation deleteTasksByIds($ids: [UUID]!) {
    deleteTasksByIds(ids: $ids) {
      ok
    }
  }
`;

export const DELETE_TASKS_BY_FILTER = gql`
  mutation deleteTasksByFilter($filterString: String!) {
    deleteTasksByFilter(filterString: $filterString) {
      ok
    }
  }
`;

export const GET_TASK = gql`
  query Task($id: UUID!) {
    task(id: $id) {
      name
      id
      creationTime
      modificationTime
      permissions {
        name
      }
      reports {
        lastReport {
          id
          severity
          timestamp
          scanStart
          scanEnd
        }
        currentReport {
          id
          scanStart
        }
        counts {
          total
          finished
        }
      }
      results {
        counts {
          current
        }
      }
      status
      progress
      target {
        name
        id
      }
      trend
      alterable
      comment
      owner
      preferences {
        name
        value
        description
      }
      schedule {
        name
        id
        icalendar
        timezone
        duration
      }
      alerts {
        name
        id
      }
      scanConfig {
        id
        name
        trash
        type
      }
      scanner {
        id
        name
        type
      }
      schedulePeriods
      hostsOrdering
      userTags {
        count
        tags {
          name
          id
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

export const GET_TASKS = gql`
  query Tasks(
    $filterString: FilterString
    $after: String
    $before: String
    $first: Int
    $last: Int
  ) {
    tasks(
      filterString: $filterString
      after: $after
      before: $before
      first: $first
      last: $last
    ) {
      edges {
        node {
          name
          id
          permissions {
            name
          }
          reports {
            currentReport {
              id
              scanStart
            }
            lastReport {
              id
              severity
              timestamp
            }
            counts {
              total
              finished
            }
          }
          status
          progress
          target {
            name
            id
          }
          trend
          alterable
          comment
          owner
          preferences {
            name
            value
            description
          }
          schedule {
            name
            id
            icalendar
            timezone
            duration
          }
          alerts {
            name
            id
          }
          scanConfig {
            id
            name
            trash
          }
          scanner {
            id
            name
            type
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
      counts {
        total
        filtered
        offset
        limit
        length
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
        lastPageCursor
      }
    }
  }
`;

export const MODIFY_TASK = gql`
  mutation modifyTask($input: ModifyTaskInput!) {
    modifyTask(input: $input) {
      ok
    }
  }
`;

export const START_TASK = gql`
  mutation startTask($id: UUID!) {
    startTask(id: $id) {
      reportId
    }
  }
`;

export const STOP_TASK = gql`
  mutation stopTask($id: UUID!) {
    stopTask(id: $id) {
      ok
    }
  }
`;

export const RESUME_TASK = gql`
  mutation resumeTask($id: UUID!) {
    resumeTask(id: $id) {
      ok
    }
  }
`;

export const useGetTask = (id, options) => {
  const {data, ...other} = useQuery(GET_TASK, {...options, variables: {id}});
  const task = isDefined(data?.task) ? Task.fromObject(data.task) : undefined;
  return {task, ...other};
};

export const useGetTasks = (variables, options) => {
  const {data, ...other} = useQuery(GET_TASKS, {...options, variables});
  const tasks = isDefined(data?.tasks)
    ? data.tasks.edges.map(entity => Task.fromObject(entity.node))
    : [];

  const {total, filtered, offset = -1, limit, length} =
    data?.tasks?.counts || {};
  const counts = isDefined(data?.tasks?.counts)
    ? new CollectionCounts({
        all: total,
        filtered: filtered,
        first: offset + 1,
        length: length,
        rows: limit,
      })
    : undefined;
  const pageInfo = data?.tasks?.pageInfo;
  return {...other, counts, tasks, pageInfo};
};

export const useLazyGetTasks = (variables, options) => {
  const [queryTasks, {data, ...other}] = useLazyQuery(GET_TASKS, {
    ...options,
    variables,
  });
  const tasks = isDefined(data?.tasks)
    ? data.tasks.edges.map(entity => Task.fromObject(entity.node))
    : undefined;

  const {total, filtered, offset = -1, limit, length} =
    data?.tasks?.counts || {};
  const counts = isDefined(data?.tasks?.counts)
    ? new CollectionCounts({
        all: total,
        filtered: filtered,
        first: offset + 1,
        length: length,
        rows: limit,
      })
    : undefined;
  const getTasks = useCallback(
    // eslint-disable-next-line no-shadow
    (variables, options) => queryTasks({...options, variables}),
    [queryTasks],
  );
  const pageInfo = data?.tasks?.pageInfo;
  return [getTasks, {...other, counts, tasks, pageInfo}];
};

export const useCloneTask = options => {
  const [queryCloneTask, {data, ...other}] = useMutation(CLONE_TASK, options);
  const cloneTask = useCallback(
    // eslint-disable-next-line no-shadow
    (id, options) =>
      queryCloneTask({...options, variables: {id}}).then(
        result => result.data.cloneTask.id,
      ),
    [queryCloneTask],
  );
  const taskId = data?.cloneTask?.id;
  return [cloneTask, {...other, id: taskId}];
};

export const useCreateContainerTask = options => {
  const [queryCreateTask, {data, ...other}] = useMutation(
    CREATE_CONTAINER_TASK,
    options,
  );
  const createTask = useCallback(
    // eslint-disable-next-line no-shadow
    (inputObject, options) =>
      queryCreateTask({...options, variables: {input: inputObject}}).then(
        result => result.data.createContainerTask.id,
      ),
    [queryCreateTask],
  );
  const taskId = data?.createContainerTask?.id;
  return [createTask, {...other, id: taskId}];
};

export const useCreateTask = options => {
  const [queryCreateTask, {data, ...other}] = useMutation(CREATE_TASK, options);
  const createTask = useCallback(
    // eslint-disable-next-line no-shadow
    (inputObject, options) =>
      queryCreateTask({...options, variables: {input: inputObject}}).then(
        result => result?.data?.createTask?.id,
      ),
    [queryCreateTask],
  );
  const taskId = data?.createTask?.id;
  return [createTask, {...other, id: taskId}];
};

export const useDeleteTask = options => {
  const [queryDeleteTask, data] = useMutation(DELETE_TASK, options);
  const deleteTask = useCallback(
    // eslint-disable-next-line no-shadow
    (id, options) => queryDeleteTask({...options, variables: {id}}),
    [queryDeleteTask],
  );
  return [deleteTask, data];
};

export const useDeleteTasksByIds = options => {
  const [queryDeleteTasksByIds, data] = useMutation(
    DELETE_TASKS_BY_IDS,
    options,
  );
  const deleteTasksByIds = useCallback(
    // eslint-disable-next-line no-shadow
    (ids, options) => queryDeleteTasksByIds({...options, variables: {ids}}),
    [queryDeleteTasksByIds],
  );
  return [deleteTasksByIds, data];
};

export const useDeleteTasksByFilter = options => {
  const [queryDeleteTasksByFilter, data] = useMutation(
    DELETE_TASKS_BY_FILTER,
    options,
  );
  const deleteTasksByFilter = useCallback(
    // eslint-disable-next-line no-shadow
    (filterString, options) =>
      queryDeleteTasksByFilter({
        ...options,
        variables: {filterString},
      }),
    [queryDeleteTasksByFilter],
  );
  return [deleteTasksByFilter, data];
};

export const useModifyTask = options => {
  const [queryModifyTask, data] = useMutation(MODIFY_TASK, options);
  const modifyTask = useCallback(
    // eslint-disable-next-line no-shadow
    (inputObject, options) =>
      queryModifyTask({...options, variables: {input: inputObject}}),
    [queryModifyTask],
  );
  return [modifyTask, data];
};

export const useStartTask = options => {
  const [queryStartTask, {data, ...other}] = useMutation(START_TASK, options);
  const startTask = useCallback(
    // eslint-disable-next-line no-shadow
    (id, options) =>
      queryStartTask({...options, variables: {id}}).then(
        result => result.data.startTask.reportId,
      ),
    [queryStartTask],
  );
  const reportId = data?.startTask?.reportId;
  return [startTask, {...other, reportId}];
};

export const useStopTask = options => {
  const [queryStopTask, data] = useMutation(STOP_TASK, options);
  const stopTask = useCallback(
    // eslint-disable-next-line no-shadow
    (id, options) => queryStopTask({...options, variables: {id}}),
    [queryStopTask],
  );
  return [stopTask, data];
};

export const useResumeTask = options => {
  const [queryResumeTask, data] = useMutation(RESUME_TASK, options);
  const resumeTask = useCallback(
    // eslint-disable-next-line no-shadow
    (id, options) => queryResumeTask({...options, variables: {id}}),
    [queryResumeTask],
  );
  return [resumeTask, data];
};

export const EXPORT_TASKS_BY_FILTER = gql`
  mutation exportTasksByFilter($filterString: String) {
    exportTasksByFilter(filterString: $filterString) {
      exportedEntities
    }
  }
`;

export const useExportTasksByFilter = options => {
  const [queryExportTasksByFilter] = useMutation(
    EXPORT_TASKS_BY_FILTER,
    options,
  );
  const exportTasksByFilter = useCallback(
    // eslint-disable-next-line no-shadow
    filterString =>
      queryExportTasksByFilter({
        ...options,
        variables: {
          filterString,
        },
      }),
    [queryExportTasksByFilter, options],
  );

  return exportTasksByFilter;
};

export const EXPORT_TASKS_BY_IDS = gql`
  mutation exportTasksByIds($ids: [UUID]!) {
    exportTasksByIds(ids: $ids) {
      exportedEntities
    }
  }
`;

export const useExportTasksByIds = options => {
  const [queryExportTasksByIds] = useMutation(EXPORT_TASKS_BY_IDS, options);

  const exportTasksByIds = useCallback(
    // eslint-disable-next-line no-shadow
    taskIds =>
      queryExportTasksByIds({
        ...options,
        variables: {
          ids: taskIds,
        },
      }),
    [queryExportTasksByIds, options],
  );

  return exportTasksByIds;
};
