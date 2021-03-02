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

import {deepFreeze, createGenericQueryMock} from 'web/utils/testing';

import {GET_PORT_LISTS, CREATE_PORT_LIST, MODIFY_PORT_LIST} from '../portlists';

const portlist1 = deepFreeze({
  id: '12345',
  name: 'ports galore',
});

const portlist2 = deepFreeze({
  id: '23456',
  name: 'moar ports',
});

const mockPortLists = {
  nodes: [portlist1, portlist2],
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
    startCursor: 'cG9ydGxpc3Q6MA==',
    endCursor: 'cG9ydGxpc3Q6MQ==',
    lastPageCursor: 'cG9ydGxpc3Q6Mw==',
  },
};

export const createGetPortListsQueryMock = (filterString = 'foo') =>
  createGenericQueryMock(
    GET_PORT_LISTS,
    {portLists: mockPortLists},
    {filterString},
  );

export const createPortListInput = {
  name: 'manyports',
  portRange: 'T:1337,31415',
  comment: '92653',
};

const createPortListResult = {
  createPortList: {
    id: '58989',
  },
};

export const createCreatePortListQueryMock = () =>
  createGenericQueryMock(CREATE_PORT_LIST, createPortListResult, {
    input: createPortListInput,
  });

export const modifyPortListInput = {
  id: '58989',
  portRange: 'T:161,803,3988,7498',
  comment: '948482',
};

const modifyPortListResult = {
  modifyPortList: {
    ok: true,
  },
};

export const createModifyPortListQueryMock = () =>
  createGenericQueryMock(MODIFY_PORT_LIST, modifyPortListResult, {
    input: modifyPortListInput,
  });
