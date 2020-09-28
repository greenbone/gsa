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

import {useCallback} from 'react';

import {useLazyQuery, useMutation} from '@apollo/client';

import gql from 'graphql-tag';

import CollectionCounts from 'gmp/collection/collectioncounts';

import Schedule from 'gmp/models/schedule';

import {isDefined} from 'gmp/utils/identity';

export const GET_SCHEDULE = gql`
  query Schedule($id: UUID!) {
    schedule(id: $id) {
      name
      id
      icalendar
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
          name
          id
          icalendar
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
      queryCreateSchedule({...options, variables: {input: inputObject}}),
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

// vim: set ts=2 sw=2 tw=80:
