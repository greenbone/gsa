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

import {useLazyQuery, useMutation, useQuery} from '@apollo/client';

import gql from 'graphql-tag';

import CollectionCounts from 'gmp/collection/collectioncounts';

import Schedule from 'gmp/models/schedule';

import {isDefined} from 'gmp/utils/identity';

export const GET_SCHEDULE = gql`
  query Schedule($id: UUID!) {
    schedule(id: $id) {
      id
      name
      icalendar
      timezone
      owner
      comment
      writable
      inUse
      creationTime
      modificationTime
      permissions {
        name
      }
      userTags {
        count
        tags {
          name
          id
          value
          comment
        }
      }
    }
  }
`;

export const useLazyGetSchedule = id => {
  const [querySchedule, {data, ...other}] = useLazyQuery(GET_SCHEDULE, {
    variables: {
      id,
    },
  });

  const schedule = isDefined(data?.schedule)
    ? Schedule.fromObject(data.schedule)
    : undefined;

  const getSchedule = useCallback(uuid => querySchedule({id: uuid}), [
    querySchedule,
  ]);
  return [getSchedule, {...other, schedule}];
};

export const GET_SCHEDULES = gql`
  query Schedules(
    $filterString: FilterString
    $after: String
    $before: String
    $first: Int
    $last: Int
  ) {
    schedules(
      filterString: $filterString
      after: $after
      before: $before
      first: $first
      last: $last
    ) {
      edges {
        node {
          id
          name
          icalendar
          timezone
          owner
          comment
          writable
          inUse
          creationTime
          modificationTime
          permissions {
            name
          }
          userTags {
            count
            tags {
              name
              id
              value
              comment
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

export const useLazyGetSchedules = (variables, options) => {
  const [querySchedules, {data, ...other}] = useLazyQuery(GET_SCHEDULES, {
    ...options,
    variables,
  });
  const schedules = isDefined(data?.schedules)
    ? data.schedules.edges.map(entity => Schedule.fromObject(entity.node))
    : undefined;

  const {total, filtered, offset = -1, limit, length} =
    data?.schedules?.counts || {};
  const counts = isDefined(data?.schedules?.counts)
    ? new CollectionCounts({
        all: total,
        filtered: filtered,
        first: offset + 1,
        length: length,
        rows: limit,
      })
    : undefined;
  const getSchedules = useCallback(
    // eslint-disable-next-line no-shadow
    (variables, options) => querySchedules({...options, variables}),
    [querySchedules],
  );
  const pageInfo = data?.schedules?.pageInfo;
  return [getSchedules, {...other, counts, schedules, pageInfo}];
};

export const CREATE_SCHEDULE = gql`
  mutation createSchedule($input: CreateScheduleInput!) {
    createSchedule(input: $input) {
      id
    }
  }
`;

export const useCreateSchedule = options => {
  const [queryCreateSchedule, {data, ...other}] = useMutation(
    CREATE_SCHEDULE,
    options,
  );

  const createSchedule = useCallback(
    // eslint-disable-next-line no-shadow
    (inputObject, options) =>
      queryCreateSchedule({...options, variables: {input: inputObject}}).then(
        result => result?.data?.createSchedule?.id,
      ),
    [queryCreateSchedule],
  );
  const scheduleId = data?.createSchedule?.id;
  return [createSchedule, {...other, id: scheduleId}];
};

export const MODIFY_SCHEDULE = gql`
  mutation modifySchedule($input: ModifyScheduleInput!) {
    modifySchedule(input: $input) {
      ok
    }
  }
`;

export const useModifySchedule = options => {
  const [queryModifySchedule, data] = useMutation(MODIFY_SCHEDULE, options);
  const modifySchedule = useCallback(
    // eslint-disable-next-line no-shadow
    (inputObject, options) =>
      queryModifySchedule({...options, variables: {input: inputObject}}),
    [queryModifySchedule],
  );
  return [modifySchedule, data];
};

export const DELETE_SCHEDULES_BY_IDS = gql`
  mutation deleteSchedulesByIds($ids: [UUID]!) {
    deleteSchedulesByIds(ids: $ids) {
      ok
    }
  }
`;

export const DELETE_SCHEDULES_BY_FILTER = gql`
  mutation deleteSchedulesByFilter($filterString: String!) {
    deleteSchedulesByFilter(filterString: $filterString) {
      ok
    }
  }
`;

export const EXPORT_SCHEDULES_BY_FILTER = gql`
  mutation exportSchedulesByFilter($filterString: String) {
    exportSchedulesByFilter(filterString: $filterString) {
      exportedEntities
    }
  }
`;

export const EXPORT_SCHEDULES_BY_IDS = gql`
  mutation exportSchedulesByIds($ids: [UUID]!) {
    exportSchedulesByIds(ids: $ids) {
      exportedEntities
    }
  }
`;

export const useGetSchedule = (id, options) => {
  const {data, ...other} = useQuery(GET_SCHEDULE, {
    ...options,
    variables: {id},
  });
  const schedule = isDefined(data?.schedule)
    ? Schedule.fromObject(data.schedule)
    : undefined;
  return {schedule, ...other};
};

export const useDeleteSchedule = options => {
  const [queryDeleteSchedule, data] = useMutation(
    DELETE_SCHEDULES_BY_IDS,
    options,
  );
  const deleteSchedule = useCallback(
    // eslint-disable-next-line no-shadow
    (id, options) => queryDeleteSchedule({...options, variables: {ids: [id]}}),
    [queryDeleteSchedule],
  );
  return [deleteSchedule, data];
};

export const useExportSchedulesByFilter = options => {
  const [queryExportSchedulesByFilter] = useMutation(
    EXPORT_SCHEDULES_BY_FILTER,
    options,
  );
  const exportSchedulesByFilter = useCallback(
    // eslint-disable-next-line no-shadow
    filterString =>
      queryExportSchedulesByFilter({
        ...options,
        variables: {
          filterString,
        },
      }),
    [queryExportSchedulesByFilter, options],
  );

  return exportSchedulesByFilter;
};

export const useExportSchedulesByIds = options => {
  const [queryExportSchedulesByIds] = useMutation(
    EXPORT_SCHEDULES_BY_IDS,
    options,
  );

  const exportSchedulesByIds = useCallback(
    // eslint-disable-next-line no-shadow
    scheduleIds =>
      queryExportSchedulesByIds({
        ...options,
        variables: {
          ids: scheduleIds,
        },
      }),
    [queryExportSchedulesByIds, options],
  );

  return exportSchedulesByIds;
};

export const useDeleteSchedulesByIds = options => {
  const [queryDeleteSchedulesByIds, data] = useMutation(
    DELETE_SCHEDULES_BY_IDS,
    options,
  );
  const deleteSchedulesByIds = useCallback(
    // eslint-disable-next-line no-shadow
    (ids, options) => queryDeleteSchedulesByIds({...options, variables: {ids}}),
    [queryDeleteSchedulesByIds],
  );
  return [deleteSchedulesByIds, data];
};

export const useDeleteSchedulesByFilter = options => {
  const [queryDeleteSchedulesByFilter, data] = useMutation(
    DELETE_SCHEDULES_BY_FILTER,
    options,
  );
  const deleteSchedulesByFilter = useCallback(
    // eslint-disable-next-line no-shadow
    (filterString, options) =>
      queryDeleteSchedulesByFilter({
        ...options,
        variables: {filterString},
      }),
    [queryDeleteSchedulesByFilter],
  );
  return [deleteSchedulesByFilter, data];
};

export const CLONE_SCHEDULE = gql`
  mutation cloneSchedule($id: UUID!) {
    cloneSchedule(id: $id) {
      id
    }
  }
`;

export const useCloneSchedule = options => {
  const [queryCloneSchedule, {data, ...other}] = useMutation(
    CLONE_SCHEDULE,
    options,
  );
  const cloneSchedule = useCallback(
    // eslint-disable-next-line no-shadow
    (id, options) =>
      queryCloneSchedule({...options, variables: {id}}).then(
        result => result.data.cloneSchedule.id,
      ),
    [queryCloneSchedule],
  );
  const scheduleId = data?.cloneSchedule?.id;
  return [cloneSchedule, {...other, id: scheduleId}];
};
// vim: set ts=2 sw=2 tw=80:
