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

import {OPENVAS_SCANNER_TYPE, OSP_SCANNER_TYPE} from 'gmp/models/scanner';

import {deepFreeze} from 'web/utils/testing';

import {GET_SCANNERS} from '../scanners';

const scanner1 = deepFreeze({
  id: '1',
  name: 'scanner 1',
  type: OPENVAS_SCANNER_TYPE,
  writable: true,
  inUse: true,
  owner: {name: 'admin'},
  comment: 'Hello World',
  host: '127.0.0.1',
  port: '1234',
  caPub: {
    certificate: null,
  },
  creationTime: '2019-06-19T13:13:16+00:00',
  modificationTime: '2020-05-05T13:11:51+00:00',
  permissions: {
    name: 'get_scanner',
  },
  credential: {
    id: null,
  },
});

const scanner2 = deepFreeze({
  id: '2',
  name: 'scanner 2',
  type: OSP_SCANNER_TYPE,
  writable: true,
  inUse: true,
  owner: {name: 'admin'},
  comment: 'Hello World',
  host: '127.0.0.1',
  port: '1234',
  caPub: {
    certificate: 'cert',
  },
  creationTime: '2019-06-19T13:13:16+00:00',
  modificationTime: '2020-05-05T13:11:51+00:00',
  permissions: {
    name: 'get_scanner',
  },
  credential: {
    id: '1234',
  },
});

const mockScanners = {
  nodes: [scanner1, scanner2],
  counts: {
    total: 2,
    filtered: 2,
    offset: 0,
    limit: 10,
    length: 2,
  },
  pageInfo: {
    hasNextPage: false,
    hasPreviousPage: false,
    startCursor: 'scanner:0',
    endCursor: 'scanner:1',
    lastPageCursor: 'scanner:3',
  },
};

export const createGetScannersQueryMock = (variables = {}) => {
  const queryResult = {
    data: {
      scanners: mockScanners,
    },
  };

  const resultFunc = jest.fn().mockReturnValue(queryResult);

  const queryMock = {
    request: {
      query: GET_SCANNERS,
      variables,
    },
    newData: resultFunc,
  };
  return [queryMock, resultFunc];
};
