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

import {GET_FILTERS} from '../filters';

export const mockFilter = deepFreeze({
  id: '12345',
  name: 'foo',
  owner: 'admin',
  comment: 'bar',
  writable: true,
  inUse: false,
  creationTime: '2020-12-23T14:14:11+00:00',
  modificationTime: '2021-01-04T11:54:12+00:00',
  userTags: null,
  permissions: [{name: 'Everything'}],
  term: 'name~"test" first=1 rows=10 sort=name',
  alerts: null,
});

const mockFilters = {
  edges: [
    {
      node: mockFilter,
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
    startCursor: 'c2NoZWR1bGU6MA==',
    endCursor: 'c2NoZWR1bGU6MA==',
    lastPageCursor: 'c2NoZWR1bGU6MA==',
  },
};

export const createGetFiltersQueryMock = (variables = {}) => {
  const queryResult = {
    data: {
      filters: mockFilters,
    },
  };

  const resultFunc = jest.fn().mockReturnValue(queryResult);

  const queryMock = {
    request: {
      query: GET_FILTERS,
      variables,
    },
    newData: resultFunc,
  };
  return [queryMock, resultFunc];
};
