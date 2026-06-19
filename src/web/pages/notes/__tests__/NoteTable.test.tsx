/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {fireEvent, rendererWith, screen} from 'web/testing';
import type Capabilities from 'gmp/capabilities/capabilities';
import EverythingCapabilities from 'gmp/capabilities/everything';
import Note from 'gmp/models/note';
import Nvt from 'gmp/models/nvt';
import {createSession} from 'gmp/testing';
import NoteTable from 'web/pages/notes/NoteTable';

const createGmp = () => ({
  session: createSession(),
});

const createNote = ({
  id,
  text,
  userCapabilities,
}: {
  id: string;
  text: string;
  userCapabilities?: Capabilities;
}) =>
  new Note({
    id,
    active: 1,
    hosts: ['127.0.0.1'],
    nvt: new Nvt({oid: `1.3.6.1.4.1.${id}`, name: `NVT ${id}`}),
    port: '22/tcp',
    text,
    userCapabilities,
    writable: 1,
  });

describe('NoteTable tests', () => {
  test('should render without crashing', () => {
    const notes = [
      createNote({id: '1', text: 'Note 1'}),
      createNote({id: '2', text: 'Note 2'}),
    ];
    const {render} = rendererWith({capabilities: true, gmp: createGmp()});
    render(<NoteTable entities={notes} />);
    expect(screen.getByRole('table')).toBeInTheDocument();
  });

  test('should render the empty title when no notes are available', () => {
    const {render} = rendererWith({capabilities: true, gmp: createGmp()});
    render(<NoteTable entities={[]} />);
    expect(screen.getByText('No Notes available')).toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  test("should not render anything if notes aren't available", () => {
    const {render} = rendererWith({capabilities: true, gmp: createGmp()});
    const {container} = render(<NoteTable />);
    expect(container).toBeEmptyDOMElement();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  test('should render notes', () => {
    const notes = [
      createNote({id: '1', text: 'Note 1'}),
      createNote({id: '2', text: 'Note 2'}),
    ];
    const {render} = rendererWith({capabilities: true, gmp: createGmp()});
    render(<NoteTable entities={notes} />);
    expect(screen.getByText('Note 1')).toBeInTheDocument();
    expect(screen.getByText('Note 2')).toBeInTheDocument();
    const rows = screen.queryAllByRole('row');
    expect(rows).toHaveLength(notes.length + 2);
    const headers = screen.queryAllByRole('columnheader');
    expect(headers.length).toBeGreaterThan(0);
  });

  test('should allow to call action handlers', () => {
    const notes = [
      createNote({
        id: '1',
        text: 'Note 1',
        userCapabilities: new EverythingCapabilities(),
      }),
    ];
    const handleClone = testing.fn();
    const handleDelete = testing.fn();
    const handleDownload = testing.fn();
    const handleEdit = testing.fn();
    const {render} = rendererWith({capabilities: true, gmp: createGmp()});
    render(
      <NoteTable
        entities={notes}
        onNoteCloneClick={handleClone}
        onNoteDeleteClick={handleDelete}
        onNoteDownloadClick={handleDownload}
        onNoteEditClick={handleEdit}
      />,
    );

    fireEvent.click(screen.getByTitle('Clone Note'));
    expect(handleClone).toHaveBeenCalledWith(notes[0]);

    fireEvent.click(screen.getByTitle('Move Note to trashcan'));
    expect(handleDelete).toHaveBeenCalledWith(notes[0]);

    fireEvent.click(screen.getByTitle('Export Note'));
    expect(handleDownload).toHaveBeenCalledWith(notes[0]);

    fireEvent.click(screen.getByTitle('Edit Note'));
    expect(handleEdit).toHaveBeenCalledWith(notes[0]);
  });
});
