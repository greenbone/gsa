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

import {gql, useLazyQuery} from '@apollo/client';
import ScanConfig from 'gmp/models/scanconfig';
import {isDefined} from 'gmp/utils/identity';
import {useCallback} from 'react';

export const GET_SCAN_CONFIG = gql`
  query ScanConfig($id: UUID!) {
    scanConfig(id: $id) {
      id
      name
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
          id
          name
          value
          comment
        }
      }
      trash
      type
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
      tasks {
        name
        id
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

export const useLazyGetScanConfig = (id, options) => {
  const [queryScanConfig, {data, ...other}] = useLazyQuery(GET_SCAN_CONFIG, {
    ...options,
    variables: {id},
  });
  const scanConfig = isDefined(data?.scanConfig)
    ? ScanConfig.fromObject(data.scanConfig)
    : undefined;

  const loadScanConfig = useCallback(
    (id, options) => queryScanConfig({...options, variables: {id}}),
    [queryScanConfig],
  );
  return [loadScanConfig, {scanConfig, ...other}];
};
