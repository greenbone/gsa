/* Copyright (C) 2020-2021 Greenbone Networks GmbH
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

import {gql, useQuery} from '@apollo/client';
import {isDefined} from 'gmp/utils/identity';
import Permission from 'gmp/models/permission';
import CollectionCounts from 'gmp/collection/collectioncounts';

export const GET_PERMISSIONS = gql`
  query Permission($filterString: FilterString) {
    permissions(filterString: $filterString) {
      edges {
        node {
          name
          id
          owner
          comment
          writable
          inUse
          creationTime
          modificationTime
          permissions {
            name
          }
          resource {
            name
            id
            type
            trash
            deleted
            permissions {
              name
            }
          }
          subject {
            name
            id
            type
            trash
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

export const useGetPermissions = (variables, options) => {
  const {data, ...other} = useQuery(GET_PERMISSIONS, {
    ...options,
    variables,
  });
  const permissions = isDefined(data?.permissions)
    ? data.permissions.edges.map(entity => Permission.fromObject(entity.node))
    : undefined;

  const {total, filtered, offset = -1, limit, length} =
    data?.permissions?.counts || {};
  const counts = isDefined(data?.permissions?.counts)
    ? new CollectionCounts({
        all: total,
        filtered: filtered,
        first: offset + 1,
        length: length,
        rows: limit,
      })
    : undefined;
  const pageInfo = data?.permissions?.pageInfo;
  return {...other, counts, permissions, pageInfo};
};
