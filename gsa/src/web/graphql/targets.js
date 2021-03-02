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

import {gql, useLazyQuery, useMutation} from '@apollo/client';

import CollectionCounts from 'gmp/collection/collectioncounts';

import Target from 'gmp/models/target';

import {isDefined} from 'gmp/utils/identity';

export const GET_TARGETS = gql`
  query Targets(
    $filterString: FilterString
    $after: String
    $before: String
    $first: Int
    $last: Int
  ) {
    targets(
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

export const useLazyGetTargets = (variables, options) => {
  const [queryTargets, {data, ...other}] = useLazyQuery(GET_TARGETS, {
    ...options,
    variables,
  });
  const targets = isDefined(data?.targets)
    ? data.targets.edges.map(entity => Target.fromObject(entity.node))
    : undefined;

  const {total, filtered, offset = -1, limit, length} =
    data?.targets?.counts || {};
  const counts = isDefined(data?.targets?.counts)
    ? new CollectionCounts({
        all: total,
        filtered: filtered,
        first: offset + 1,
        length: length,
        rows: limit,
      })
    : undefined;
  const getTargets = useCallback(
    // eslint-disable-next-line no-shadow
    (variables, options) => queryTargets({...options, variables}),
    [queryTargets],
  );
  const pageInfo = data?.targets?.pageInfo;
  return [getTargets, {...other, counts, targets, pageInfo}];
};

export const CREATE_TARGET = gql`
  mutation createTarget($input: CreateTargetInput!) {
    createTarget(input: $input) {
      id
    }
  }
`;

export const useCreateTarget = options => {
  const [queryCreateTarget, {data, ...other}] = useMutation(
    CREATE_TARGET,
    options,
  );
  const createTarget = useCallback(
    // eslint-disable-next-line no-shadow
    (inputObject, options) =>
      queryCreateTarget({...options, variables: {input: inputObject}}).then(
        result => result?.data?.createTarget?.id,
      ),
    [queryCreateTarget],
  );
  const targetId = data?.createTarget?.id;
  return [createTarget, {...other, id: targetId}];
};

export const MODIFY_TARGET = gql`
  mutation modifyTarget($input: ModifyTargetInput!) {
    modifyTarget(input: $input) {
      ok
    }
  }
`;

export const useModifyTarget = options => {
  const [queryModifyTarget, data] = useMutation(MODIFY_TARGET, options);
  const modifyTarget = useCallback(
    // eslint-disable-next-line no-shadow
    (inputObject, options) =>
      queryModifyTarget({...options, variables: {input: inputObject}}),
    [queryModifyTarget],
  );
  return [modifyTarget, data];
};
