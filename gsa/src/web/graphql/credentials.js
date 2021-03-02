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

import Credential from 'gmp/models/credential';

import {isDefined} from 'gmp/utils/identity';

export const GET_CREDENTIALS = gql`
  query Credential(
    $filterString: FilterString
    $after: String
    $before: String
    $first: Int
    $last: Int
  ) {
    credentials(
      filterString: $filterString
      after: $after
      before: $before
      first: $first
      last: $last
    ) {
      nodes {
        id
        owner
        name
        comment
        writable
        inUse
        creationTime
        modificationTime
        permissions {
          name
        }
        allowInsecure
        login
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

export const useLazyGetCredentials = (variables, options) => {
  const [queryCredentials, {data, ...other}] = useLazyQuery(GET_CREDENTIALS, {
    ...options,
    variables,
  });

  const credentials = isDefined(data?.credentials)
    ? data.credentials.nodes.map(entity => Credential.fromObject(entity))
    : undefined;

  const {total, filtered, offset = -1, limit, length} =
    data?.credentials?.counts || {};
  const counts = isDefined(data?.credentials?.counts)
    ? new CollectionCounts({
        all: total,
        filtered: filtered,
        first: offset + 1,
        length: length,
        rows: limit,
      })
    : undefined;
  const getCredentials = useCallback(
    // eslint-disable-next-line no-shadow
    (variables, options) => queryCredentials({...options, variables}),
    [queryCredentials],
  );
  const pageInfo = data?.credentials?.pageInfo;
  return [getCredentials, {...other, counts, credentials, pageInfo}];
};

export const CREATE_CREDENTIAL = gql`
  mutation createCredential($input: CreateCredentialInput!) {
    createCredential(input: $input) {
      id
    }
  }
`;

export const useCreateCredential = options => {
  const [queryCreateCredential, {data, ...other}] = useMutation(
    CREATE_CREDENTIAL,
    options,
  );
  const createCredential = useCallback(
    // eslint-disable-next-line no-shadow
    (inputObject, options) =>
      queryCreateCredential({...options, variables: {input: inputObject}}).then(
        result => result?.data?.createCredential?.id,
      ),
    [queryCreateCredential],
  );
  const credentialId = data?.createCredential?.id;
  return [createCredential, {...other, id: credentialId}];
};
