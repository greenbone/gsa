/* Copyright (C) 2021 Greenbone Networks GmbH
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
import {useCallback} from 'react';

import {gql, useQuery, useMutation, useLazyQuery, useApolloClient} from '@apollo/client';

import CollectionCounts from 'gmp/collection/collectioncounts';
import Policy from 'gmp/models/policy';

import {isDefined} from 'gmp/utils/identity';

export const GET_POLICY = gql`
  query Policy($id: UUID!) {
    policy(id: $id) {
      id
      name
      comment
      writable
      owner
      inUse
      creationTime
      modificationTime
      permissions {
        name
      }
      type
      trash
      familyCount
      nvtGrowing
      familyGrowing
      nvtCount
      usageType
      maxNvtCount
      knownNvtCount
      predefined
      families {
        name
        nvtCount
        maxNvtCount
        growing
      }
      preferences {
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
      nvtSelectors {
        name
        include
        type
        familyOrNvt
      }
      tasks {
        name
        id
      }
    }
  }
`;

export const GET_POLICIES = gql`
  query Policies($filterString: FilterString) {
    policies(filterString: $filterString) {
      edges {
        node {
          id
          name
          comment
          owner
          permissions {
            name
          }
          predefined
          inUse
          writable
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

export const DELETE_POLICIES_BY_IDS = gql`
  mutation deletePoliciesByIds($ids: [UUID]!) {
    deletePoliciesByIds(ids: $ids) {
      ok
    }
  }
`;

export const EXPORT_POLICIES_BY_IDS = gql`
  mutation exportPoliciesByIds($ids: [UUID]!) {
    exportPoliciesByIds(ids: $ids) {
      exportedEntities
    }
  }
`;

export const CLONE_POLICY = gql`
  mutation clonePolicy($id: UUID!) {
    clonePolicy(id: $id) {
      id
    }
  }
`;

export const CREATE_POLICY = gql`
  mutation createPolicy($input: CreatePolicyInput!) {
    createPolicy(input: $input) {
      id
    }
  }
`;

export const IMPORT_POLICY = gql`
  mutation importPolicy($policy: String) {
    importPolicy(policy: $policy) {
      id
    }
  }
`;

export const useGetPolicy = (id, options) => {
  const {data, ...other} = useQuery(GET_POLICY, {
    ...options,
    variables: {id},
  });
  const policy = isDefined(data?.policy)
    ? Policy.fromObject(data.policy)
    : undefined;
  return {policy, ...other};
};

export const useDeletePolicy = options => {
  const [queryDeletePolicy, data] = useMutation(
    DELETE_POLICIES_BY_IDS,
    options,
  );
  const deletePolicy = useCallback(
    // eslint-disable-next-line no-shadow
    (id, options) => queryDeletePolicy({...options, variables: {ids: [id]}}),
    [queryDeletePolicy],
  );
  return [deletePolicy, data];
};

export const useExportPoliciesByIds = options => {
  const [queryExportPoliciesByIds] = useMutation(
    EXPORT_POLICIES_BY_IDS,
    options,
  );

  const exportPoliciesByIds = useCallback(
    // eslint-disable-next-line no-shadow
    policyIds =>
      queryExportPoliciesByIds({
        ...options,
        variables: {
          ids: policyIds,
        },
      }),
    [queryExportPoliciesByIds, options],
  );

  return exportPoliciesByIds;
};

export const useClonePolicy = options => {
  const [queryClonePolicy, {data, ...other}] = useMutation(
    CLONE_POLICY,
    options,
  );
  const clonePolicy = useCallback(
    // eslint-disable-next-line no-shadow
    (id, options) =>
      queryClonePolicy({...options, variables: {id}}).then(
        result => result.data.clonePolicy.id,
      ),
    [queryClonePolicy],
  );
  const policyId = data?.clonePolicy?.id;
  return [clonePolicy, {...other, id: policyId}];
};

export const useCreatePolicy = options => {
  const [queryCreatePolicy, {data, ...other}] = useMutation(
    CREATE_POLICY,
    options,
  );
  const createPolicy = useCallback(
    // eslint-disable-next-line no-shadow
    (inputObject, options) =>
      queryCreatePolicy({...options, variables: {input: inputObject}}).then(
        result => result?.data?.createPolicy?.id,
      ),
    [queryCreatePolicy],
  );
  const policyId = data?.createPolicy?.id;
  return [createPolicy, {...other, id: policyId}];
};

export const useLazyGetPolicy = () => {
  const client = useApolloClient();
  let policy;
  const getPolicy = policyId =>
    client
      .query({
        query: GET_POLICY,
        variables: {id: policyId},
        fetchPolicy: 'no-cache', // do not cache, since this is used when a change is saved
      })
      .then(response => {
        if (isDefined(response?.data?.policy) {
          policy = Policy.fromObject(response?.data?.policy);
        }

        return policy;
      });

  return [getPolicy, policy];
};

export const useImportPolicy = options => {
  const [queryImportPolicy, {data, ...other}] = useMutation(
    IMPORT_POLICY,
    options,
  );
  const importPolicy = useCallback(
    // eslint-disable-next-line no-shadow
    (policy, options) =>
      queryImportPolicy({...options, variables: {policy}}).then(
        result => result.data.importPolicy.id,
      ),
    [queryImportPolicy],
  );
  const policyId = data?.importPolicy?.id;
  return [importPolicy, {...other, id: policyId}];
};
