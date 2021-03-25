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
import {deepFreeze, createGenericQueryMock} from 'web/utils/testing';

import {
  CLONE_NOTE,
  DELETE_NOTES_BY_IDS,
  DELETE_NOTES_BY_FILTER,
  EXPORT_NOTES_BY_IDS,
  EXPORT_NOTES_BY_FILTER,
  GET_NOTE,
  GET_NOTES,
  CREATE_NOTE,
  MODIFY_NOTE,
} from '../notes';

export const detailsNote = deepFreeze({
  id: '456',
  active: true,
  creationTime: '2020-12-23T14:14:11Z',
  endTime: '2021-12-23T14:14:11Z',
  hosts: ['127.0.0.1', '127.0.0.2'],
  inUse: false,
  modificationTime: '2021-01-04T11:54:12Z',
  nvt: {
    id: '123',
    name: 'foo nvt',
  },
  owner: 'admin',
  result: {
    id: '1337',
    name: 'result name',
  },
  permissions: [{name: 'Everything'}],
  port: '666/tcp',
  severity: '5.0',
  task: {
    id: '42',
    name: 'task x',
  },
  text: 'note text',
  userTags: {
    count: 1,
    tags: [
      {
        id: '123',
        name: 'note:unnamed',
        value: null,
        comment: null,
      },
    ],
  },
  writable: true,
});

export const noPermNote = deepFreeze({
  id: '456',
  active: true,
  creationTime: '2020-12-23T14:14:11Z',
  endTime: '2021-12-23T14:14:11Z',
  hosts: ['127.0.0.1', '127.0.0.2'],
  inUse: false,
  modificationTime: '2021-01-04T11:54:12Z',
  nvt: {
    id: '123',
    name: 'foo nvt',
  },
  owner: 'admin',
  result: {
    id: '1337',
    name: 'result name',
  },
  permissions: [{name: 'get_notes'}],
  port: '666/tcp',
  severity: '5.0',
  task: {
    id: '42',
    name: 'task x',
  },
  text: 'note text',
  userTags: {
    count: 1,
    tags: [
      {
        id: '123',
        name: 'note:unnamed',
        value: null,
        comment: null,
      },
    ],
  },
  writable: true,
});

export const inUseNote = deepFreeze({
  id: '456',
  active: true,
  creationTime: '2020-12-23T14:14:11Z',
  endTime: '2021-12-23T14:14:11Z',
  hosts: ['127.0.0.1', '127.0.0.2'],
  inUse: true,
  modificationTime: '2021-01-04T11:54:12Z',
  nvt: {
    id: '123',
    name: 'foo nvt',
  },
  owner: 'admin',
  result: {
    id: '1337',
    name: 'result name',
  },
  permissions: [{name: 'Everything'}],
  port: '666/tcp',
  severity: '5.0',
  task: {
    id: '42',
    name: 'task x',
  },
  text: 'note text',
  userTags: {
    count: 1,
    tags: [
      {
        id: '123',
        name: 'note:unnamed',
        value: null,
        comment: null,
      },
    ],
  },
  writable: true,
});

const listNote = deepFreeze({
  id: '123',
  active: true,
  endTime: '2021-04-13T11:35:20Z',
  hosts: ['127.0.0.1', '127.0.0.2'],
  modificationTime: '2021-01-14T06:22:57Z',
  nvt: {
    id: '12345',
    name: 'foo nvt',
  },
  permissions: [{name: 'Everything'}],
  port: '666/tcp',
  severity: 0.0,
  task: {
    id: '334',
    name: 'task x',
  },
  text: 'note text',
});

const mockNotes = {
  edges: [
    {
      node: listNote,
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

export const createNoteInput = {
  id: '6d00d22f-551b-4fbe-8215-d8615eff73ea',
  active: true,
  creation_time: '2020-12-23T14:14:11Z',
  hosts: ['127.0.0.1'],
  in_use: false,
  modification_time: '2021-01-04T11:54:12Z',
  nvt: {
    id: '123',
    name: 'foo nvt',
    type: 'nvt',
  },
  owner: {name: 'admin'},
  permissions: {permission: {name: 'Everything'}},
  port: '666/tcp',
  text: 'note text',
  writable: true,
};

const createNoteResult = {
  createNote: {
    id: '6d00d22f-551b-4fbe-8215-d8615eff73ea',
    status: 200,
  },
};

export const createCreateNoteQueryMock = () =>
  createGenericQueryMock(CREATE_NOTE, createNoteResult, {
    input: createNoteInput,
  });

export const modifyNoteInput = {
  id: '6d00d22f-551b-4fbe-8215-d8615eff73ea',
  text: 'Han shot first',
  hosts: '127.0.0.0',
};

const modifyNoteResult = {
  modifyNote: {
    ok: true,
  },
};

export const createModifyNoteQueryMock = () =>
  createGenericQueryMock(MODIFY_NOTE, modifyNoteResult, {
    input: modifyNoteInput,
  });

const bulkDeleteByIdsResult = {
  deleteNotesByIds: {
    ok: true,
  },
};

export const createDeleteNotesByIdsQueryMock = (noteIds = ['456']) =>
  createGenericQueryMock(DELETE_NOTES_BY_IDS, bulkDeleteByIdsResult, {
    ids: noteIds,
  });

const bulkDeleteByFilterResult = {
  deleteNotesByFilter: {
    ok: true,
  },
};

export const createDeleteNotesByFilterQueryMock = (filterString = '456') =>
  createGenericQueryMock(DELETE_NOTES_BY_FILTER, bulkDeleteByFilterResult, {
    filterString,
  });

const deleteNoteResult = {
  deleteNoteByIds: {
    ok: true,
    status: 200,
  },
};

export const createDeleteNoteQueryMock = (noteId = '456') =>
  createGenericQueryMock(DELETE_NOTES_BY_IDS, deleteNoteResult, {
    ids: [noteId],
  });

export const createCloneNoteQueryMock = (
  noteId = '456',
  newNoteId = '6d00d22f-551b-4fbe-8215-d8615eff73ea',
) =>
  createGenericQueryMock(
    CLONE_NOTE,
    {
      cloneNote: {
        id: newNoteId,
      },
    },
    {id: noteId},
  );

const exportNotesByIdsResult = {
  exportNotesByIds: {
    exportedEntities: '<get_notes_response status="200" status_text="OK" />',
  },
};

export const createExportNotesByIdsQueryMock = (ids = ['123']) =>
  createGenericQueryMock(EXPORT_NOTES_BY_IDS, exportNotesByIdsResult, {
    ids,
  });

const exportNotesByFilterResult = {
  exportNotesByFilter: {
    exportedEntities: '<get_notes_response status="200" status_text="OK" />',
  },
};

export const createExportNotesByFilterQueryMock = (filterString = 'foo') => {
  return createGenericQueryMock(
    EXPORT_NOTES_BY_FILTER,
    exportNotesByFilterResult,
    {filterString},
  );
};

export const createGetNoteQueryMock = (id, note = detailsNote) => {
  return createGenericQueryMock(GET_NOTE, {note: detailsNote}, {id});
};
