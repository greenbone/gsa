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

import {useCallback} from 'react';

import {useLazyQuery, useMutation, useQuery} from '@apollo/client';

import gql from 'graphql-tag';

import CollectionCounts from 'gmp/collection/collectioncounts';

import Note from 'gmp/models/note';

import {isDefined} from 'gmp/utils/identity';

export const GET_NOTES = gql`
  query Notes(
    $filterString: FilterString
    $after: String
    $before: String
    $first: Int
    $last: Int
  ) {
    notes(
      filterString: $filterString
      after: $after
      before: $before
      first: $first
      last: $last
    ) {
      edges {
        node {
          id
        }
      }
      counts {
        total
        filtered
        offset
        limit
        length
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
        lastPageCursor
      }
    }
  }
`;

export const useLazyGetNotes = (variables, options) => {
  const [queryNotes, {data, ...other}] = useLazyQuery(GET_NOTES, {
    ...options,
    variables,
  });
  const notes = isDefined(data?.notes)
    ? data.notes.edges.map(entity => Note.fromObject(entity.node))
    : undefined;

  const {total, filtered, offset = -1, limit, length} =
    data?.notes?.counts || {};
  const counts = isDefined(data?.notes?.counts)
    ? new CollectionCounts({
        all: total,
        filtered: filtered,
        first: offset + 1,
        length: length,
        rows: limit,
      })
    : undefined;
  const getNotes = useCallback(
    // eslint-disable-next-line no-shadow
    (variables, options) => queryNotes({...options, variables}),
    [queryNotes],
  );
  const pageInfo = data?.notes?.pageInfo;
  return [getNotes, {...other, counts, notes, pageInfo}];
};

export const GET_NOTE = gql`
  query Note($id: UUID!) {
    note(id: $id) {
      id
      active
      creationTime
      hosts
      nvt {
        id
      }
      owner
      result {
        id
      }
      task {
        id
      }
      writable
      inUse
      modificationTime
      permissions {
        name
      }
      # userTags {
      #   count
      #   tags {
      #     name
      #     id
      #     value
      #     comment
      #   }
      # }
    }
  }
`;

export const useGetNote = (id, options) => {
  const {data, ...other} = useQuery(GET_NOTE, {
    ...options,
    variables: {id},
  });
  const note = isDefined(data?.note)
    ? Note.fromObject(data.note)
    : undefined;
  return {note, ...other};
};

export const CREATE_NOTE = gql`
  mutation createNote($input: CreateNoteInput!) {
    createNote(input: $input) {
      id
    }
  }
`;

export const useCreateNote = options => {
  const [queryCreateNote, {data, ...other}] = useMutation(CREATE_NOTE, options);

  const createNote = useCallback(
    // eslint-disable-next-line no-shadow
    (inputObject, options) =>
      queryCreateNote({...options, variables: {input: inputObject}}),
    [queryCreateNote],
  );
  const noteId = data?.createNote?.id;
  return [createNote, {...other, id: noteId}];
};

export const MODIFY_NOTE = gql`
  mutation modifyNote($input: ModifyNoteInput!) {
    modifyNote(input: $input) {
      ok
    }
  }
`;

export const useModifyNote = options => {
  const [queryModifyNote, data] = useMutation(MODIFY_NOTE, options);
  const modifyNote = useCallback(
    // eslint-disable-next-line no-shadow
    (inputObject, options) =>
      queryModifyNote({...options, variables: {input: inputObject}}),
    [queryModifyNote],
  );
  return [modifyNote, data];
};

export const DELETE_NOTES_BY_IDS = gql`
  mutation deleteNotesByIds($ids: [UUID]!) {
    deleteNotesByIds(ids: $ids) {
      ok
    }
  }
`;

export const useDeleteNotesByIds = options => {
  const [queryDeleteNotesByIds, data] = useMutation(
    DELETE_NOTES_BY_IDS,
    options,
  );
  const deleteNotesByIds = useCallback(
    // eslint-disable-next-line no-shadow
    (ids, options) => queryDeleteNotesByIds({...options, variables: {ids}}),
    [queryDeleteNotesByIds],
  );
  return [deleteNotesByIds, data];
};

export const useDeleteNote = options => {
  const [queryDeleteNote, data] = useMutation(
    DELETE_NOTES_BY_IDS,
    options,
  );
  const deleteNote = useCallback(
    // eslint-disable-next-line no-shadow
    (id, options) => queryDeleteNote({...options, variables: {ids: [id]}}),
    [queryDeleteNote],
  );
  return [deleteNote, data];
};

export const DELETE_NOTES_BY_FILTER = gql`
  mutation deleteNotesByFilter($filterString: String!) {
    deleteNotesByFilter(filterString: $filterString) {
      ok
    }
  }
`;

export const useDeleteNotesByFilter = options => {
  const [queryDeleteNotesByFilter, data] = useMutation(
    DELETE_NOTES_BY_FILTER,
    options,
  );
  const deleteNotesByFilter = useCallback(
    // eslint-disable-next-line no-shadow
    (filterString, options) =>
      queryDeleteNotesByFilter({
        ...options,
        variables: {filterString},
      }),
    [queryDeleteNotesByFilter],
  );
  return [deleteNotesByFilter, data];
};

export const EXPORT_NOTES_BY_FILTER = gql`
  mutation exportNotesByFilter($filterString: String) {
    exportNotesByFilter(filterString: $filterString) {
      exportedEntities
    }
  }
`;

export const useExportNotesByFilter = options => {
  const [queryExportNotesByFilter] = useMutation(
    EXPORT_NOTES_BY_FILTER,
    options,
  );
  const exportNotesByFilter = useCallback(
    // eslint-disable-next-line no-shadow
    filterString =>
      queryExportNotesByFilter({
        ...options,
        variables: {
          filterString,
        },
      }),
    [queryExportNotesByFilter, options],
  );

  return exportNotesByFilter;
};

export const EXPORT_NOTES_BY_IDS = gql`
  mutation exportNotesByIds($ids: [UUID]!) {
    exportNotesByIds(ids: $ids) {
      exportedEntities
    }
  }
`;

export const useExportNotesByIds = options => {
  const [queryExportNotesByIds] = useMutation(
    EXPORT_NOTES_BY_IDS,
    options,
  );

  const exportNotesByIds = useCallback(
    // eslint-disable-next-line no-shadow
    noteIds =>
      queryExportNotesByIds({
        ...options,
        variables: {
          ids: noteIds,
        },
      }),
    [queryExportNotesByIds, options],
  );

  return exportNotesByIds;
};

export const CLONE_NOTE = gql`
  mutation cloneNote($id: UUID!) {
    cloneNote(id: $id) {
      id
    }
  }
`;

export const useCloneNote = options => {
  const [queryCloneNote, {data, ...other}] = useMutation(
    CLONE_NOTE,
    options,
  );
  const cloneNote = useCallback(
    // eslint-disable-next-line no-shadow
    (id, options) =>
      queryCloneNote({...options, variables: {id}}).then(
        result => result.data.cloneNote.id,
      ),
    [queryCloneNote],
  );
  const noteId = data?.cloneNote?.id;
  return [cloneNote, {...other, id: noteId}];
};
// vim: set ts=2 sw=2 tw=80:
