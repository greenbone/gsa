/* Copyright (C) 2021 Greenbone Networks GmbH
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
import {deepFreeze} from 'web/utils/testing';

import {GET_OVERRIDES} from 'web/graphql/overrides';

const nvtOverride = deepFreeze({
  id: '456',
  active: true,
  creationTime: '2021-01-14T05:35:57Z',
  endTime: '2021-03-13T11:35:20Z',
  hosts: ['127.0.0.1', '127.0.0.2'],
  inUse: false,
  modificationTime: '2021-01-14T06:20:57Z',
  newSeverity: 10.0,
  nvt: {
    id: '12345',
    name: 'foo',
  },
  owner: 'admin',
  result: {
    id: '1337',
    name: 'result name',
  },
  permissions: [{name: 'Everything'}],
  port: '666/tcp',
  severity: 0.0,
  task: null,
  text: 'test_override_1',
  userTags: {
    count: 1,
    tags: [
      {
        id: '123',
        name: 'override:unnamed',
        value: null,
        comment: null,
      },
    ],
  },
  writable: true,
});

const nvtOverride2 = deepFreeze({
  id: '123',
  hosts: ['127.0.0.1', '127.0.0.2'],
  nvt: {
    id: '12345',
    name: 'foo nvt',
  },
  permissions: [{name: 'Everything'}],
  port: '666/tcp',
  task: {
    name: 'task x',
  },
  text: 'override text',
});

const mockNvtOverrides = {
  edges: [
    {
      node: nvtOverride,
    },
    {
      node: nvtOverride2,
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
    startCursor: 'override:0',
    endCursor: 'override:1',
    lastPageCursor: 'override:2',
  },
};

export const createGetOverridesQueryMock = (variables = {}) => {
  const queryResult = {
    data: {
      overrides: mockNvtOverrides,
    },
  };

  const resultFunc = jest.fn().mockReturnValue(queryResult);

  const queryMock = {
    request: {
      query: GET_OVERRIDES,
      variables,
    },
    newData: resultFunc,
  };
  return [queryMock, resultFunc];
};
