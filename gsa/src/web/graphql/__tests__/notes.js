/* Copyright (C) 2021 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301 USA.
 */

import React, {useState} from 'react';

import {isDefined} from 'gmp/utils/identity';

import Button from 'web/components/form/button';

import {rendererWith, fireEvent, wait, screen} from 'web/utils/testing';

import {
  useCloneNote,
  useCreateNote,
  useDeleteNotesByIds,
  useDeleteNotesByFilter,
  useExportNotesByFilter,
  useExportNotesByIds,
  useGetNote,
  useLazyGetNotes,
  useModifyNote,
} from '../notes';

import {
  createCloneNoteQueryMock,
  createDeleteNotesByFilterQueryMock,
  createDeleteNotesByIdsQueryMock,
  createDeleteNoteQueryMock,
  createExportNotesByFilterQueryMock,
  createExportNotesByIdsQueryMock,
  createGetNotesQueryMock,
  createGetNoteQueryMock,
  createCreateNoteQueryMock,
  createModifyNoteQueryMock,
  createNoteInput,
  modifyNoteInput,
} from '../__mocks__/notes';

const GetLazyNotesComponent = () => {
  const [getNotes, {counts, loading, notes}] = useLazyGetNotes();

  if (loading) {
    return <span data-testid="loading">Loading</span>;
  }
  return (
    <div>
      <button data-testid="load" onClick={() => getNotes()} />
      {isDefined(counts) ? (
        <div data-testid="counts">
          <span data-testid="total">{counts.all}</span>
          <span data-testid="filtered">{counts.filtered}</span>
          <span data-testid="first">{counts.first}</span>
          <span data-testid="limit">{counts.rows}</span>
          <span data-testid="length">{counts.length}</span>
        </div>
      ) : (
        <div data-testid="no-counts" />
      )}
      {isDefined(notes) ? (
        notes.map(note => {
          return (
            <div key={note.id} data-testid="note">
              {note.id}
            </div>
          );
        })
      ) : (
        <div data-testid="no-notes" />
      )}
    </div>
  );
};

const CreateModifyNoteComponent = () => {
  const [notification, setNotification] = useState('');

  const [createNote] = useCreateNote();
  const [modifyNote] = useModifyNote();

  const handleCreateResult = resp => {
    const {data} = resp;
    setNotification('Note created with id ' + data.createNote.id + '.');
  };

  const handleModifyResult = resp => {
    const {data} = resp;
    setNotification('Note modified with ok=' + data.modifyNote.ok + '.');
  };

  return (
    <div>
      <Button
        title={'Create Note'}
        onClick={() => createNote(createNoteInput).then(handleCreateResult)}
      />
      <Button
        title={'Modify Note'}
        onClick={() => modifyNote(modifyNoteInput).then(handleModifyResult)}
      />
      <h3 data-testid="notification">{notification}</h3>
    </div>
  );
};

const CloneNoteComponent = () => {
  const [cloneNote, {id: noteId}] = useCloneNote();
  return (
    <div>
      {noteId && <span data-testid="cloned-note">{noteId}</span>}
      <button data-testid="clone" onClick={() => cloneNote('123')} />
    </div>
  );
};

const DeleteNotesByIdsComponent = () => {
  const [deleteNotesByIds] = useDeleteNotesByIds();
  return (
    <button
      data-testid="bulk-delete"
      onClick={() => deleteNotesByIds(['foo', 'bar'])}
    />
  );
};

const DeleteNotesByFilterComponent = () => {
  const [deleteNotesByFilter] = useDeleteNotesByFilter();
  return (
    <button
      data-testid="filter-delete"
      onClick={() => deleteNotesByFilter('foo')}
    />
  );
};

const ExportNotesByIdsComponent = () => {
  const exportNotesByIds = useExportNotesByIds();
  return (
    <button
      data-testid="bulk-export"
      onClick={() => exportNotesByIds(['123'])}
    />
  );
};

const DeleteNoteComponent = () => {
  const [deleteNote] = useDeleteNotesByIds();
  return <button data-testid="delete" onClick={() => deleteNote(['123'])} />;
};

/* eslint-disable react/prop-types */
const GetNoteComponent = ({id}) => {
  const {loading, note, error} = useGetNote(id);
  if (loading) {
    return <span data-testid="loading">Loading</span>;
  }
  return (
    <div>
      {error && <div data-testid="error">{error.message}</div>}
      {note && (
        <div data-testid="note">
          <span data-testid="id">{note.id}</span>
          <span data-testid="name">{note.name}</span>
        </div>
      )}
    </div>
  );
};

const ExportNotesByFilterComponent = () => {
  const exportNotesByFilter = useExportNotesByFilter();
  return (
    <button
      data-testid="filter-export"
      onClick={() => exportNotesByFilter('foo')}
    />
  );
};

describe('useLazyGetNotes tests', () => {
  test('should query notes after user interaction', async () => {
    const [mock, resultFunc] = createGetNotesQueryMock();
    const {render} = rendererWith({queryMocks: [mock]});

    render(<GetLazyNotesComponent />);

    let noteElements = screen.queryAllByTestId('note');
    expect(noteElements).toHaveLength(0);

    expect(screen.queryByTestId('no-notes')).toBeInTheDocument();
    expect(screen.queryByTestId('no-counts')).toBeInTheDocument();

    const button = screen.getByTestId('load');
    fireEvent.click(button);

    const loading = await screen.findByTestId('loading');
    expect(loading).toHaveTextContent('Loading');

    await wait();

    expect(resultFunc).toHaveBeenCalled();

    noteElements = screen.getAllByTestId('note');
    expect(noteElements).toHaveLength(1);

    expect(noteElements[0]).toHaveTextContent('123');

    expect(screen.queryByTestId('no-notes')).not.toBeInTheDocument();

    expect(screen.getByTestId('total')).toHaveTextContent(1);
    expect(screen.getByTestId('filtered')).toHaveTextContent(1);
    expect(screen.getByTestId('first')).toHaveTextContent(1);
    expect(screen.getByTestId('limit')).toHaveTextContent(10);
    expect(screen.getByTestId('length')).toHaveTextContent(1);
  });
});

describe('Note mutation tests', () => {
  test('should create a note', async () => {
    const [createNoteMock, createNoteResult] = createCreateNoteQueryMock();
    const {render} = rendererWith({queryMocks: [createNoteMock]});

    const {element} = render(<CreateModifyNoteComponent />);

    const buttons = element.querySelectorAll('button');

    fireEvent.click(buttons[0]);

    await wait();

    expect(createNoteResult).toHaveBeenCalled();
    expect(screen.getByTestId('notification')).toHaveTextContent(
      'Note created with id 6d00d22f-551b-4fbe-8215-d8615eff73ea.',
    );
  });

  test('should modify a note', async () => {
    const [modifyNoteMock, modifyNoteResult] = createModifyNoteQueryMock();

    const {render} = rendererWith({queryMocks: [modifyNoteMock]});

    const {element} = render(<CreateModifyNoteComponent />);

    const buttons = element.querySelectorAll('button');

    fireEvent.click(buttons[1]);

    await wait();

    expect(modifyNoteResult).toHaveBeenCalled();
    expect(screen.getByTestId('notification')).toHaveTextContent(
      'Note modified with ok=true.',
    );
  });
});

describe('useDeleteNotesByIds tests', () => {
  test('should delete a list of notes after user interaction', async () => {
    const [mock, resultFunc] = createDeleteNotesByIdsQueryMock(['foo', 'bar']);
    const {render} = rendererWith({queryMocks: [mock]});

    render(<DeleteNotesByIdsComponent />);
    const button = screen.getByTestId('bulk-delete');
    fireEvent.click(button);

    await wait();

    expect(resultFunc).toHaveBeenCalled();
  });
});

describe('useDeleteNotesByFilter tests', () => {
  test('should delete a list of notes by filter string after user interaction', async () => {
    const [mock, resultFunc] = createDeleteNotesByFilterQueryMock('foo');
    const {render} = rendererWith({queryMocks: [mock]});

    render(<DeleteNotesByFilterComponent />);
    const button = screen.getByTestId('filter-delete');
    fireEvent.click(button);

    await wait();

    expect(resultFunc).toHaveBeenCalled();
  });
});

describe('useExportNotesByIds tests', () => {
  test('should export a list of notes after user interaction', async () => {
    const [mock, resultFunc] = createExportNotesByIdsQueryMock(['123']);
    const {render} = rendererWith({queryMocks: [mock]});

    render(<ExportNotesByIdsComponent />);
    const button = screen.getByTestId('bulk-export');
    fireEvent.click(button);

    await wait();

    expect(resultFunc).toHaveBeenCalled();
  });
});

describe('useExportNotesByFilter tests', () => {
  test('should export a list of notes by filter string after user interaction', async () => {
    const [mock, resultFunc] = createExportNotesByFilterQueryMock();
    const {render} = rendererWith({queryMocks: [mock]});

    render(<ExportNotesByFilterComponent />);
    const button = screen.getByTestId('filter-export');
    fireEvent.click(button);

    await wait();

    expect(resultFunc).toHaveBeenCalled();
  });
});

describe('useCloneNote tests', () => {
  test('should clone a note after user interaction', async () => {
    const [mock, resultFunc] = createCloneNoteQueryMock('123', '456');
    const {render} = rendererWith({queryMocks: [mock]});

    render(<CloneNoteComponent />);

    const button = screen.getByTestId('clone');
    fireEvent.click(button);

    await wait();

    expect(resultFunc).toHaveBeenCalled();

    expect(screen.getByTestId('cloned-note')).toHaveTextContent('456');
  });
});

describe('useDeleteNote tests', () => {
  test('should delete a note after user interaction', async () => {
    const [mock, resultFunc] = createDeleteNoteQueryMock('123');
    const {render} = rendererWith({queryMocks: [mock]});

    render(<DeleteNoteComponent />);

    const button = screen.getByTestId('delete');
    fireEvent.click(button);

    await wait();

    expect(resultFunc).toHaveBeenCalled();
  });
});

describe('useGetNote tests', () => {
  test('should load note', async () => {
    const [queryMock, resultFunc] = createGetNoteQueryMock();

    const {render} = rendererWith({queryMocks: [queryMock]});

    render(<GetNoteComponent id="456" />);

    expect(screen.queryByTestId('loading')).toBeInTheDocument();

    await wait();

    expect(resultFunc).toHaveBeenCalled();

    expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
    expect(screen.queryByTestId('error')).not.toBeInTheDocument();

    expect(screen.getByTestId('note')).toBeInTheDocument();

    expect(screen.getByTestId('id')).toHaveTextContent('456');
  });
});
