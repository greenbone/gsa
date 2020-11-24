/* Copyright (C) 2020 Greenbone Networks GmbH
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

import {deepFreeze, createGenericQueryMock} from 'web/utils/testing';

import {GET_SCAN_CONFIG, GET_SCAN_CONFIGS} from '../scanconfigs';

export const scanConfig1 = deepFreeze({
  id: '314',
  name: 'Half empty and slow',
  creationTime: '2020-08-17T12:18:14+00:00',
  comment: "Most NVT's",
  families: [{name: 'addams', growing: true, maxNvtCount: 1, nvtCount: 1}],
  familyCount: 1,
  inUse: true,
  knownNvtCount: 99998,
  maxNvtCount: 99999,
  modificationTime: '2020-09-29T12:16:50+00:00',
  nvtCount: 99998,
  nvtSelectors: [
    {
      name: '436',
      include: true,
      type: 2,
      familyOrNvt: '1.3.6.1.4.1.25623.1.0.100315',
    },
  ],
  permissions: [{name: 'Everything'}],
  predefined: true,
  preferences: [
    {
      alt: null,
      default: 'postgres',
      hrName: 'Postgres Username:',
      id: 1,
      name: 'Postgres Username:',
      type: 'entry',
      value: 'postgres',
      nvt: {
        oid: '1.3.6.1.4.1.25623.1.0.100151',
        name: 'PostgreSQL Detection',
      },
    },
  ],
  tasks: [
    {
      name: 'foo',
      id: '457',
    },
  ],
  trash: null,
  type: 0,
  usageType: 'scan',
  userTags: null,
  writable: true,
});

const mockScanConfigs = {
  edges: [
    {
      node: scanConfig1,
    },
  ],
  counts: {
    total: 1,
    filtered: 1,
    offset: 0,
    limit: 10,
    length: 1,
  },
  pageInfo: {
    hasNextPage: false,
    hasPreviousPage: false,
    startCursor: 'YWxlcnQ6MA==',
    endCursor: 'YWxlcnQ6OQ==',
    lastPageCursor: 'YWxlcnQ6MA==',
  },
};

export const createGetScanConfigQueryMock = (
  id = '314',
  result = scanConfig1,
) => createGenericQueryMock(GET_SCAN_CONFIG, {scanConfig: result}, {id});

export const createGetScanConfigsQueryMock = (variables = {}) =>
  createGenericQueryMock(
    GET_SCAN_CONFIGS,
    {scanConfigs: mockScanConfigs},
    variables,
  );
