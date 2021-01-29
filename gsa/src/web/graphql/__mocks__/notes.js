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
import {deepFreeze} from 'web/utils/testing';

import {GET_NOTES} from '../notes';

const note1 = deepFreeze({
  id: '123',
});

const note2 = deepFreeze({
  id: '456',
});

const mockNotes = {
  edges: [
    {
      node: note1,
    },
    {
      node: note2,
    },
  ],
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
    startCursor: 'note:0',
    endCursor: 'note:1',
    lastPageCursor: 'note:3',
  },
};

export const createGetNotesQueryMock = (variables = {}) => {
  const queryResult = {
    data: {
      notes: mockNotes,
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
