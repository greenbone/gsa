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

const note1 = deepFreeze({
  id: '123',
  active: 1,
  creation_time: '2020-12-23T14:14:11Z',
  hosts: '127.0.0.1',
  in_use: 0,
  modification_time: '2021-01-04T11:54:12Z',
  nvt: {
    _oid: '123',
    name: 'foo nvt',
    type: 'nvt',
  },
  owner: {name: 'admin'},
  permissions: {permission: {name: 'Everything'}},
  port: '666',
  task: {
    name: 'task x',
    _id: '42',
  },
  text: 'note text',
  writable: 1,
});

const note2 = deepFreeze({
  id: '456',
  active: 1,
  creation_time: '2020-12-23T14:14:11Z',
  hosts: '127.0.0.1',
  in_use: 0,
  modification_time: '2021-01-04T11:54:12Z',
  nvt: {
    _oid: '123',
    name: 'foo nvt',
    type: 'nvt',
  },
  owner: {name: 'admin'},
  permissions: {permission: {name: 'Everything'}},
  port: '666',
  task: {
    name: 'task x',
    _id: '42',
  },
  text: 'note text',
  writable: 1,
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

export const createNoteInput = {
  id: '6d00d22f-551b-4fbe-8215-d8615eff73ea',
  active: 1,
  creation_time: '2020-12-23T14:14:11Z',
  hosts: '127.0.0.1',
  in_use: 0,
  modification_time: '2021-01-04T11:54:12Z',
  nvt: {
    _oid: '123',
    name: 'foo nvt',
    type: 'nvt',
  },
  owner: {name: 'admin'},
  permissions: {permission: {name: 'Everything'}},
  port: '666',
  text: 'note text',
  writable: 1,
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

export const createDeleteNotesByIdsQueryMock = (noteIds = ['123']) =>
  createGenericQueryMock(DELETE_NOTES_BY_IDS, bulkDeleteByIdsResult, {
    ids: noteIds,
  });

const bulkDeleteByFilterResult = {
  deleteNotesByFilter: {
    ok: true,
  },
};

export const createDeleteNotesByFilterQueryMock = (filterString = '123') =>
  createGenericQueryMock(DELETE_NOTES_BY_FILTER, bulkDeleteByFilterResult, {
    filterString,
  });

const deleteNoteResult = {
  deleteNoteByIds: {
    ok: true,
    status: 200,
  },
};

export const createDeleteNoteQueryMock = (noteId = '123') =>
  createGenericQueryMock(DELETE_NOTES_BY_IDS, deleteNoteResult, {
    ids: [noteId],
  });

export const createCloneNoteQueryMock = (
  noteId = '6d00d22f-551b-4fbe-8215-d8615eff73ea',
  newNoteId = '456',
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
    exportedEntities:
      '<get_notes_response status="200" status_text="OK" />',
  },
};

export const createExportNotesByIdsQueryMock = (ids = ['123']) =>
  createGenericQueryMock(EXPORT_NOTES_BY_IDS, exportNotesByIdsResult, {
    ids,
  });

const exportNotesByFilterResult = {
  exportNotesByFilter: {
    exportedEntities:
      '<get_notes_response status="200" status_text="OK" />',
  },
};

export const createExportNotesByFilterQueryMock = (
  filterString = 'foo',
) => {
  return createGenericQueryMock(
    EXPORT_NOTES_BY_FILTER,
    exportNotesByFilterResult,
    {filterString},
  );
};

export const createGetNoteQueryMock = (
  noteId = '123',
  note = note1,
) => createGenericQueryMock(GET_NOTE, {note}, {id: noteId});
