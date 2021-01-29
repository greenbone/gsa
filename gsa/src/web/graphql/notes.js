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

import {useLazyQuery} from '@apollo/client';

import gql from 'graphql-tag';

import CollectionCounts from 'gmp/collection/collectioncounts';

import Note from 'gmp/models/note';

import {isDefined} from 'gmp/utils/identity';

export const GET_NOTES = gql`
  query Notes(
    $filterString: FilterString
    $after: String
    $before: String
    $first: Int
    $last: Int
  ) {
    notes(
      filterString: $filterString
      after: $after
      before: $before
      first: $first
      last: $last
    ) {
      edges {
        node {
          id
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

export const useLazyGetNotes = (variables, options) => {
  const [queryNotes, {data, ...other}] = useLazyQuery(GET_NOTES, {
    ...options,
    variables,
  });
  const notes = isDefined(data?.notes)
    ? data.notes.edges.map(entity => Note.fromObject(entity.node))
    : undefined;

  const {total, filtered, offset = -1, limit, length} =
    data?.notes?.counts || {};
  const counts = isDefined(data?.notes?.counts)
    ? new CollectionCounts({
        all: total,
        filtered: filtered,
        first: offset + 1,
        length: length,
        rows: limit,
      })
    : undefined;
  const getNotes = useCallback(
    // eslint-disable-next-line no-shadow
    (variables, options) => queryNotes({...options, variables}),
    [queryNotes],
  );
  const pageInfo = data?.notes?.pageInfo;
  return [getNotes, {...other, counts, notes, pageInfo}];
};

// vim: set ts=2 sw=2 tw=80:
