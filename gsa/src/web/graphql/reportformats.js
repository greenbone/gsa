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
import CollectionCounts from 'gmp/collection/collectioncounts';
import ReportFormat from 'gmp/models/reportformat';
import {isDefined} from 'gmp/utils/identity';

export const GET_REPORT_FORMATS = gql`
  query ReportFormat(
    $filterString: FilterString
    $after: String
    $before: String
    $first: Int
    $last: Int
  ) {
    reportFormats(
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
          summary
          description
          predefined
          trust
          trustTime
          active
          extension
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

export const useGetReportFormats = (variables, options) => {
  const {data, ...other} = useQuery(GET_REPORT_FORMATS, {
    ...options,
    variables,
  });
  const reportFormats = isDefined(data?.reportFormats)
    ? data.reportFormats.edges.map(entity =>
        ReportFormat.fromObject(entity.node),
      )
    : undefined;

  const {total, filtered, offset = -1, limit, length} =
    data?.reportFormats?.counts || {};
  const counts = isDefined(data?.reportFormats?.counts)
    ? new CollectionCounts({
        all: total,
        filtered: filtered,
        first: offset + 1,
        length: length,
        rows: limit,
      })
    : undefined;
  const pageInfo = data?.reportFormats?.pageInfo;
  return {...other, counts, reportFormats, pageInfo};
};
