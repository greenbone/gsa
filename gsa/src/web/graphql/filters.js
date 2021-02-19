/* Copyright (C) 2021 Greenbone Networks GmbH
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

import {useLazyQuery} from '@apollo/client';

import gql from 'graphql-tag';

import CollectionCounts from 'gmp/collection/collectioncounts';

import Filter from 'gmp/models/filter';

import {isDefined} from 'gmp/utils/identity';

export const GET_FILTERS = gql`
  query Filters(
    $filterString: FilterString
    $after: String
    $before: String
    $first: Int
    $last: Int
  ) {
    filters(
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
          term
          alerts
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

export const useLazyGetFilters = (variables, options) => {
  const [queryFilters, {data, ...other}] = useLazyQuery(GET_FILTERS, {
    ...options,
    variables,
  });
  const filters = isDefined(data?.filters)
    ? data.filters.edges.map(entity => Filter.fromObject(entity.node))
    : undefined;

  const {total, filtered, offset = -1, limit, length} =
    data?.filters?.counts || {};
  const counts = isDefined(data?.filters?.counts)
    ? new CollectionCounts({
        all: total,
        filtered: filtered,
        first: offset + 1,
        length: length,
        rows: limit,
      })
    : undefined;
  const getFilters = useCallback(
    // eslint-disable-next-line no-shadow
    (variables, options) => queryFilters({...options, variables}),
    [queryFilters],
  );
  const pageInfo = data?.filters?.pageInfo;
  return [getFilters, {...other, counts, filters, pageInfo}];
};
