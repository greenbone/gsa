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

import {gql, useQuery, useMutation} from '@apollo/client';

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

export const DELETE_HOSTS_BY_IDS = gql`
  mutation deleteHostsByIds($ids: [UUID]!) {
    deleteHostsByIds(ids: $ids) {
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

export const useGetHost = (id, options) => {
  const {data, ...other} = useQuery(GET_HOST, {
    ...options,
    variables: {id},
  });
  const host = isDefined(data?.host) ? Host.fromObject(data.host) : undefined;
  return {host, ...other};
};

export const useDeleteHost = options => {
  const [queryDeleteHost, data] = useMutation(DELETE_HOSTS_BY_IDS, options);
  const deleteHost = useCallback(
    // eslint-disable-next-line no-shadow
    (id, options) => queryDeleteHost({...options, variables: {ids: [id]}}),
    [queryDeleteHost],
  );
  return [deleteHost, data];
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
