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

import {gql, useLazyQuery, useMutation, useQuery} from '@apollo/client';

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
          hosts
          hostCount
          owner
          writable
          inUse
          permissions {
            name
          }
          portList {
            name
            id
          }
          sshCredential {
            name
            id
            port
          }
          smbCredential {
            name
            id
          }
          esxiCredential {
            name
            id
          }
          snmpCredential {
            name
            id
          }
          aliveTest
          excludeHosts
          allowSimultaneousIPs
          reverseLookupOnly
          reverseLookupUnify
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

export const GET_TARGET = gql`
  query Target($id: UUID!) {
    target(id: $id) {
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
      hosts
      excludeHosts
      hostCount
      portList {
        name
        id
      }
      sshCredential {
        name
        id
        port
      }
      smbCredential {
        name
        id
      }
      esxiCredential {
        name
        id
      }
      snmpCredential {
        name
        id
      }
      aliveTest
      allowSimultaneousIPs
      reverseLookupOnly
      reverseLookupUnify
      tasks {
        name
        id
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

export const useGetTarget = (id, options) => {
  const {data, ...other} = useQuery(GET_TARGET, {
    ...options,
    variables: {id},
  });
  const target = isDefined(data?.target)
    ? Target.fromObject(data.target)
    : undefined;
  return {target, ...other};
};

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

export const CLONE_TARGET = gql`
  mutation cloneTarget($id: UUID!) {
    cloneTarget(id: $id) {
      id
    }
  }
`;

export const useCloneTarget = options => {
  const [queryCloneTarget, {data, ...other}] = useMutation(
    CLONE_TARGET,
    options,
  );
  const cloneTarget = useCallback(
    // eslint-disable-next-line no-shadow
    (id, options) =>
      queryCloneTarget({...options, variables: {id}}).then(
        result => result.data.cloneTarget.id,
      ),
    [queryCloneTarget],
  );
  const targetId = data?.cloneTarget?.id;
  return [cloneTarget, {...other, id: targetId}];
};

export const DELETE_TARGETS_BY_IDS = gql`
  mutation deleteTargetsByIds($ids: [UUID]!) {
    deleteTargetsByIds(ids: $ids) {
      ok
    }
  }
`;

export const useDeleteTargetsByIds = options => {
  const [queryDeleteTargetsByIds, data] = useMutation(
    DELETE_TARGETS_BY_IDS,
    options,
  );
  const deleteTargetsByIds = useCallback(
    // eslint-disable-next-line no-shadow
    (ids, options) => queryDeleteTargetsByIds({...options, variables: {ids}}),
    [queryDeleteTargetsByIds],
  );
  return [deleteTargetsByIds, data];
};

export const EXPORT_TARGETS_BY_IDS = gql`
  mutation exportTargetsByIds($ids: [UUID]!) {
    exportTargetsByIds(ids: $ids) {
      exportedEntities
    }
  }
`;

export const useExportTargetsByIds = options => {
  const [queryExportTargetsByIds] = useMutation(EXPORT_TARGETS_BY_IDS, options);

  const exportTargetsByIds = useCallback(
    // eslint-disable-next-line no-shadow
    targetIds =>
      queryExportTargetsByIds({
        ...options,
        variables: {
          ids: targetIds,
        },
      }),
    [queryExportTargetsByIds, options],
  );

  return exportTargetsByIds;
};

export const DELETE_TARGETS_BY_FILTER = gql`
  mutation deleteTargetsByFilter($filterString: String!) {
    deleteTargetsByFilter(filterString: $filterString) {
      ok
    }
  }
`;

export const EXPORT_TARGETS_BY_FILTER = gql`
  mutation exportTargetsByFilter($filterString: String) {
    exportTargetsByFilter(filterString: $filterString) {
      exportedEntities
    }
  }
`;

export const useDeleteTargetsByFilter = options => {
  const [queryDeleteTargetsByFilter, data] = useMutation(
    DELETE_TARGETS_BY_FILTER,
    options,
  );
  const deleteTargetsByFilter = useCallback(
    // eslint-disable-next-line no-shadow
    (filterString, options) =>
      queryDeleteTargetsByFilter({
        ...options,
        variables: {filterString},
      }),
    [queryDeleteTargetsByFilter],
  );
  return [deleteTargetsByFilter, data];
};

export const useExportTargetsByFilter = options => {
  const [queryExportTargetsByFilter] = useMutation(
    EXPORT_TARGETS_BY_FILTER,
    options,
  );
  const exportTargetsByFilter = useCallback(
    // eslint-disable-next-line no-shadow
    filterString =>
      queryExportTargetsByFilter({
        ...options,
        variables: {
          filterString,
        },
      }),
    [queryExportTargetsByFilter, options],
  );

  return exportTargetsByFilter;
};
