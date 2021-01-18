/* Copyright (C) 2020 Greenbone Networks GmbH
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
      userTags {
        count
        tags {
          name
          id
          value
          comment
        }
      }
      type
      trash
      familyCount
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
        nvt
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
