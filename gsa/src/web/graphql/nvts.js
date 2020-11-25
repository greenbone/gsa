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

import {useLazyQuery} from '@apollo/client';

import gql from 'graphql-tag';

import CollectionCounts from 'gmp/collection/collectioncounts';

import Nvt from 'gmp/models/nvt';

import {isDefined} from 'gmp/utils/identity';

export const GET_NVTS = gql`
  query Nvts(
    $filterString: FilterString
    $after: String
    $before: String
    $first: Int
    $last: Int
  ) {
    nvts(
      filterString: $filterString
      after: $after
      before: $before
      first: $first
      last: $last
    ) {
      edges {
        node {
          oid
          name
          family
          cvssBase
          tags
          qod {
            value
            type
          }
          severities {
            score
            severitiesList {
              date
              origin
              score
              type
              value
            }
          }
          refs {
            warning
            refList {
              id
              type
            }
          }
          preferences {
            timeout
            defaultTimeout
            preferenceList {
              nvt {
                oid
                name
              }
              hrName
              name
              id
              type
              value
              default
              alt
            }
          }
          solution {
            type
            method
            description
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

export const useLazyGetNvts = (variables, options) => {
  const [queryNvts, {data, ...other}] = useLazyQuery(GET_NVTS, {
    ...options,
    variables,
  });
  const nvts = isDefined(data?.nvts)
    ? data.nvts.edges.map(entity => Nvt.fromObject(entity.node))
    : undefined;

  const {total, filtered, offset = -1, limit, length} =
    data?.nvts?.counts || {};
  const counts = isDefined(data?.nvts?.counts)
    ? new CollectionCounts({
        all: total,
        filtered: filtered,
        first: offset + 1,
        length: length,
        rows: limit,
      })
    : undefined;
  const getNvts = useCallback(
    // eslint-disable-next-line no-shadow
    (variables, options) => queryNvts({...options, variables}),
    [queryNvts],
  );
  const pageInfo = data?.nvts?.pageInfo;
  return [getNvts, {...other, counts, nvts, pageInfo}];
};

// vim: set ts=2 sw=2 tw=80:
