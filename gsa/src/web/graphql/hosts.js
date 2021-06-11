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

import {gql, useLazyQuery, useMutation, useQuery} from '@apollo/client';

import CollectionCounts from 'gmp/collection/collectioncounts';

import Host from 'gmp/models/host';

import {isDefined} from 'gmp/utils/identity';

export const GET_HOST = gql`
  query Host($id: UUID!) {
    host(id: $id) {
      id
      name
      comment
      owner
      writable
      inUse
      creationTime
      modificationTime
      permissions {
        name
      }
      severity
      details {
        name
        value
        source {
          type
          description
        }
        extra
      }
      routes {
        hosts {
          id
          ip
          distance
          sameSource
        }
      }
      identifiers {
        id
        name
        value
        creationTime
        modificationTime
        sourceId
        sourceName
        sourceType
        sourceData
        sourceDeleted
        osId
        osTitle
      }
    }
  }
`;

export const GET_HOSTS = gql`
  query Hosts(
    $filterString: FilterString
    $after: String
    $before: String
    $first: Int
    $last: Int
  ) {
    hosts(
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
          comment
          owner
          writable
          inUse
          creationTime
          modificationTime
          permissions {
            name
          }
          severity
          details {
            name
            value
            source {
              type
              description
            }
            extra
          }
          routes {
            hosts {
              id
              ip
              distance
              sameSource
            }
          }
          identifiers {
            id
            name
            value
            creationTime
            modificationTime
            sourceId
            sourceName
            sourceType
            sourceData
            sourceDeleted
            osId
            osTitle
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

export const DELETE_HOST = gql`
  mutation deleteHost($id: UUID!) {
    deleteHost(id: $id) {
      ok
    }
  }
`;

export const DELETE_HOSTS_BY_IDS = gql`
  mutation deleteHostsByIds($ids: [UUID]!) {
    deleteHostsByIds(ids: $ids) {
      ok
    }
  }
`;

export const DELETE_HOSTS_BY_FILTER = gql`
  mutation deleteHostsByFilter($filterString: String!) {
    deleteHostsByFilter(filterString: $filterString) {
      ok
    }
  }
`;

export const EXPORT_HOSTS_BY_IDS = gql`
  mutation exportHostsByIds($ids: [UUID]!) {
    exportHostsByIds(ids: $ids) {
      exportedEntities
    }
  }
`;

export const EXPORT_HOSTS_BY_FILTER = gql`
  mutation exportHostsByFilter($filterString: String) {
    exportHostsByFilter(filterString: $filterString) {
      exportedEntities
    }
  }
`;

export const useGetHost = (id, options) => {
  const {data, ...other} = useQuery(GET_HOST, {
    ...options,
    variables: {id},
  });
  const host = isDefined(data?.host) ? Host.fromObject(data.host) : undefined;
  return {host, ...other};
};

export const useLazyGetHosts = (variables, options) => {
  const [queryHosts, {data, ...other}] = useLazyQuery(GET_HOSTS, {
    ...options,
    variables,
  });
  const hosts = isDefined(data?.hosts)
    ? data.hosts.edges.map(entity => Host.fromObject(entity.node))
    : undefined;

  const {total, filtered, offset = -1, limit, length} =
    data?.hosts?.counts || {};
  const counts = isDefined(data?.hosts?.counts)
    ? new CollectionCounts({
        all: total,
        filtered: filtered,
        first: offset + 1,
        length: length,
        rows: limit,
      })
    : undefined;
  const getHosts = useCallback(
    // eslint-disable-next-line no-shadow
    (variables, options) => queryHosts({...options, variables}),
    [queryHosts],
  );
  const pageInfo = data?.hosts?.pageInfo;
  return [getHosts, {...other, counts, hosts, pageInfo}];
};

export const useDeleteHost = options => {
  const [queryDeleteHost, data] = useMutation(DELETE_HOST, options);
  const deleteHost = useCallback(
    // eslint-disable-next-line no-shadow
    (id, options) => queryDeleteHost({...options, variables: {id}}),
    [queryDeleteHost],
  );
  return [deleteHost, data];
};

export const useDeleteHostsByIds = options => {
  const [queryDeleteHostsByIds, data] = useMutation(
    DELETE_HOSTS_BY_IDS,
    options,
  );
  const deleteHostsByIds = useCallback(
    // eslint-disable-next-line no-shadow
    (ids, options) => queryDeleteHostsByIds({...options, variables: {ids}}),
    [queryDeleteHostsByIds],
  );
  return [deleteHostsByIds, data];
};

export const useDeleteHostsByFilter = options => {
  const [queryDeleteHostsByFilter, data] = useMutation(
    DELETE_HOSTS_BY_FILTER,
    options,
  );
  const deleteHostsByFilter = useCallback(
    // eslint-disable-next-line no-shadow
    (filterString, options) =>
      queryDeleteHostsByFilter({
        ...options,
        variables: {filterString},
      }),
    [queryDeleteHostsByFilter],
  );
  return [deleteHostsByFilter, data];
};

export const useExportHostsByIds = options => {
  const [queryExportHostsByIds] = useMutation(EXPORT_HOSTS_BY_IDS, options);

  const exportHostsByIds = useCallback(
    // eslint-disable-next-line no-shadow
    hostIds =>
      queryExportHostsByIds({
        ...options,
        variables: {
          ids: hostIds,
        },
      }),
    [queryExportHostsByIds, options],
  );

  return exportHostsByIds;
};

export const useExportHostsByFilter = options => {
  const [queryExportHostsByFilter] = useMutation(
    EXPORT_HOSTS_BY_FILTER,
    options,
  );
  const exportHostsByFilter = useCallback(
    // eslint-disable-next-line no-shadow
    filterString =>
      queryExportHostsByFilter({
        ...options,
        variables: {
          filterString,
        },
      }),
    [queryExportHostsByFilter, options],
  );

  return exportHostsByFilter;
};

export const CREATE_HOST = gql`
  mutation createHost($input: CreateHostInput!) {
    createHost(input: $input) {
      id
    }
  }
`;

export const useCreateHost = options => {
  const [queryCreateHost, {data, ...other}] = useMutation(CREATE_HOST, options);

  const createHost = useCallback(
    // eslint-disable-next-line no-shadow
    (inputObject, options) =>
      queryCreateHost({...options, variables: {input: inputObject}}).then(
        result => result?.data?.createHost?.id,
      ),
    [queryCreateHost],
  );
  const hostId = data?.createHost?.id;
  return [createHost, {...other, id: hostId}];
};

export const MODIFY_HOST = gql`
  mutation modifyHost($input: ModifyHostInput!) {
    modifyHost(input: $input) {
      ok
    }
  }
`;

export const useModifyHost = options => {
  const [queryModifyHost, data] = useMutation(MODIFY_HOST, options);
  const modifyHost = useCallback(
    // eslint-disable-next-line no-shadow
    (inputObject, options) =>
      queryModifyHost({...options, variables: {input: inputObject}}),
    [queryModifyHost],
  );
  return [modifyHost, data];
};
