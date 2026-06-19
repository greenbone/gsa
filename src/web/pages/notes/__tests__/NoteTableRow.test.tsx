/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {fireEvent, rendererWithTableBody, screen} from 'web/testing';
import Capabilities from 'gmp/capabilities/capabilities';
import Note from 'gmp/models/note';
import Nvt from 'gmp/models/nvt';
import {createSession} from 'gmp/testing';
import {shorten} from 'gmp/utils/string';
import NoteRow from 'web/pages/notes/NoteTableRow';

const createGmp = () => ({
  session: createSession(),
});

const noteText = 'A'.repeat(61);
const note = new Note({
  id: '314',
  active: 1,
  hosts: [
    'host-one.example.invalid',
    'host-two.example.invalid',
    'host-three.example.invalid',
  ],
  nvt: new Nvt({
    oid: '1.3.6.1.4.1',
    name: 'Test NVT',
  }),
  orphan: 1,
  owner: {name: 'username'},
  port: '22/tcp',
  text: noteText,
  userCapabilities: new Capabilities(['everything']),
});

describe('NoteRow tests', () => {
  test('should render note row with default actions', () => {
    const {render} = rendererWithTableBody({
      capabilities: true,
      gmp: createGmp(),
    });

    render(
      <NoteRow
        entity={note}
        onNoteCloneClick={testing.fn()}
        onNoteDeleteClick={testing.fn()}
        onNoteDownloadClick={testing.fn()}
        onNoteEditClick={testing.fn()}
        onToggleDetailsClick={testing.fn()}
      />,
    );

    expect(screen.getByText('Orphan')).toBeInTheDocument();
    expect(screen.getByText(shorten(noteText))).toBeInTheDocument();
    expect(screen.getByText('Test NVT')).toBeInTheDocument();
    const hosts = screen.getByText(shorten(note.hosts.join(', ')));
    expect(hosts).toBeInTheDocument();
    expect(hosts).toHaveAttribute('title', note.hosts.join(', '));

    const port = screen.getByText(shorten(note.port));
    expect(port).toBeInTheDocument();
    expect(port).toHaveAttribute('title', note.port);
    expect(screen.getByText('yes')).toBeInTheDocument();

    expect(screen.getByTitle('Move Note to trashcan')).toBeInTheDocument();
    expect(screen.getByTitle('Edit Note')).toBeInTheDocument();
    expect(screen.getByTitle('Clone Note')).toBeInTheDocument();
    expect(screen.getByTitle('Export Note')).toBeInTheDocument();
  });

  test('should call row and action click handlers', () => {
    const handleNoteClone = testing.fn();
    const handleNoteDelete = testing.fn();
    const handleNoteDownload = testing.fn();
    const handleNoteEdit = testing.fn();
    const handleToggleDetailsClick = testing.fn();

    const {render} = rendererWithTableBody({
      capabilities: true,
      gmp: createGmp(),
    });

    render(
      <NoteRow
        entity={note}
        onNoteCloneClick={handleNoteClone}
        onNoteDeleteClick={handleNoteDelete}
        onNoteDownloadClick={handleNoteDownload}
        onNoteEditClick={handleNoteEdit}
        onToggleDetailsClick={handleToggleDetailsClick}
      />,
    );

    fireEvent.click(screen.getByTestId('row-details-toggle'));
    expect(handleToggleDetailsClick).toHaveBeenCalledWith(undefined, '314');

    fireEvent.click(screen.getByTitle('Move Note to trashcan'));
    expect(handleNoteDelete).toHaveBeenCalledWith(note);

    fireEvent.click(screen.getByTitle('Edit Note'));
    expect(handleNoteEdit).toHaveBeenCalledWith(note);

    fireEvent.click(screen.getByTitle('Clone Note'));
    expect(handleNoteClone).toHaveBeenCalledWith(note);

    fireEvent.click(screen.getByTitle('Export Note'));
    expect(handleNoteDownload).toHaveBeenCalledWith(note);
  });
});
