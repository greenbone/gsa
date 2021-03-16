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

import {GET_NOTES} from 'web/graphql/notes';

const nvtNote = deepFreeze({
  active: true,
  endTime: '2021-03-13T11:35:20Z',
  hosts: ['127.0.0.1', '127.0.0.2'],
  id: '456',
  modificationTime: '2021-01-14T06:20:57Z',
  nvt: {
    id: '12345',
    name: 'foo',
  },
  permissions: [{name: 'Everything'}],
  port: '666/tcp',
  severity: 0.0,
  task: null,
  text: 'test_note_1',
});

const nvtNote2 = deepFreeze({
  active: true,
  endTime: '2022-03-13T11:35:20Z',
  hosts: ['127.0.0.1', '127.0.0.2'],
  id: '123',
  modificationTime: '2022-01-14T06:20:57Z',
  nvt: {
    id: '12345',
    name: 'foo nvt',
  },
  permissions: [{name: 'Everything'}],
  port: '666/tcp',
  severity: 0.0,
  task: null,
  text: 'test_note_2',
});

const mockNvtNotes = {
  edges: [
    {
      node: nvtNote,
    },
    {
      node: nvtNote2,
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
    startCursor: 'note:0',
    endCursor: 'note:1',
    lastPageCursor: 'note:2',
  },
};

export const createGetNotesQueryMock = (variables = {}) => {
  const queryResult = {
    data: {
      notes: mockNvtNotes,
    },
  };

  const resultFunc = jest.fn().mockReturnValue(queryResult);

  const queryMock = {
    request: {
      query: GET_NOTES,
      variables,
    },
    newData: resultFunc,
  };
  return [queryMock, resultFunc];
};
