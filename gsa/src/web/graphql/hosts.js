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
import {gql, useQuery} from '@apollo/client';

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

export const useGetHost = (id, options) => {
  const {data, ...other} = useQuery(GET_HOST, {
    ...options,
    variables: {id},
  });
  const host = isDefined(data?.host) ? Host.fromObject(data.host) : undefined;
  return {host, ...other};
};
