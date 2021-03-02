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

import {gql, useLazyQuery} from '@apollo/client';

import CollectionCounts from 'gmp/collection/collectioncounts';

import Scanner from 'gmp/models/scanner';

import {isDefined} from 'gmp/utils/identity';

export const GET_SCANNERS = gql`
  query Scanner(
    $filterString: FilterString
    $after: String
    $before: String
    $first: Int
    $last: Int
  ) {
    scanners(
      filterString: $filterString
      after: $after
      before: $before
      first: $first
      last: $last
    ) {
      nodes {
        id
        name
        writable
        inUse
        owner
        comment
        host
        port
        caPub {
          certificate
        }
        creationTime
        modificationTime
        permissions {
          name
        }
        credential {
          id
        }
        type
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

export const useLazyGetScanners = (variables, options) => {
  const [queryScanners, {data, ...other}] = useLazyQuery(GET_SCANNERS, {
    ...options,
    variables,
  });
  const scanners = isDefined(data?.scanners)
    ? data.scanners.nodes.map(entity => Scanner.fromObject(entity))
    : undefined;

  const {total, filtered, offset = -1, limit, length} =
    data?.scanners?.counts || {};
  const counts = isDefined(data?.scanners?.counts)
    ? new CollectionCounts({
        all: total,
        filtered: filtered,
        first: offset + 1,
        length: length,
        rows: limit,
      })
    : undefined;
  const getScanners = useCallback(
    // eslint-disable-next-line no-shadow
    (variables, options) => queryScanners({...options, variables}),
    [queryScanners],
  );
  const pageInfo = data?.scanners?.pageInfo;
  return [getScanners, {...other, counts, scanners, pageInfo}];
};
