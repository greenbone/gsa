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

import {useQuery, useLazyQuery} from '@apollo/react-hooks';

import gql from 'graphql-tag';

import CollectionCounts from 'gmp/collection/collectioncounts';

import Task from 'gmp/models/task';

import {isDefined} from 'gmp/utils/identity';

export const GET_TASKS = gql`
  query Task($filterString: String) {
    tasks(filterString: $filterString) {
      edges {
        node {
          name
          id
          permissions {
            name
          }
          reports {
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
    }
  }
`;

export const useGetTasks = (variables, options) => {
  const {data, ...other} = useQuery(GET_TASKS, {...options, variables});
  const tasks = isDefined(data?.tasks)
    ? data.tasks.edges.map(entity => Task.fromObject(entity.node))
    : [];

  const {total, filtered, offset = -1, limit, length} =
    data?.tasks?.counts || {};
  const counts = new CollectionCounts({
    all: total,
    filtered: filtered,
    first: offset + 1,
    length: length,
    rows: limit,
  });
  return {...other, counts, tasks};
};

export const useLazyGetTasks = (variables, options) => {
  const [queryTasks, {data, ...other}] = useLazyQuery(GET_TASKS, {
    ...options,
    variables,
  });
  const tasks = isDefined(data?.tasks)
    ? data.tasks.edges.map(entity => Task.fromObject(entity.node))
    : [];

  const {total, filtered, offset = -1, limit, length} =
    data?.tasks?.counts || {};
  const counts = new CollectionCounts({
    all: total,
    filtered: filtered,
    first: offset + 1,
    length: length,
    rows: limit,
  });
  const getTasks = useCallback(
    // eslint-disable-next-line no-shadow
    (variables, options) => queryTasks({...options, variables}),
    [queryTasks],
  );
  return [getTasks, {...other, counts, tasks}];
};
