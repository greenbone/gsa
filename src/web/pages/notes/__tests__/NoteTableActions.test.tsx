/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {fireEvent, rendererWithTableRow, screen} from 'web/testing';
import Capabilities from 'gmp/capabilities/capabilities';
import Note from 'gmp/models/note';
import {createSession} from 'gmp/testing';
import NoteActions from 'web/pages/notes/NoteTableActions';

const wrongCaps = new Capabilities(['get_notes']);

const createGmp = () => ({
  session: createSession(),
});

const createNote = (capabilities: Capabilities) =>
  new Note({
    id: '314',
    text: 'note text',
    userCapabilities: capabilities,
    writable: 1,
  });

describe('NoteActions tests', () => {
  test('should render', () => {
    const note = createNote(new Capabilities(['everything']));

    const handleNoteClone = testing.fn();
    const handleNoteDelete = testing.fn();
    const handleNoteDownload = testing.fn();
    const handleNoteEdit = testing.fn();

    const {render} = rendererWithTableRow({
      capabilities: true,
      gmp: createGmp(),
    });
    const {element} = render(
      <NoteActions
        entity={note}
        onNoteCloneClick={handleNoteClone}
        onNoteDeleteClick={handleNoteDelete}
        onNoteDownloadClick={handleNoteDownload}
        onNoteEditClick={handleNoteEdit}
      />,
    );

    expect(element).toBeInTheDocument();
  });

  test('should call click handlers', () => {
    const note = createNote(new Capabilities(['everything']));

    const handleNoteClone = testing.fn();
    const handleNoteDelete = testing.fn();
    const handleNoteDownload = testing.fn();
    const handleNoteEdit = testing.fn();

    const {render} = rendererWithTableRow({
      capabilities: true,
      gmp: createGmp(),
    });
    render(
      <NoteActions
        entity={note}
        onNoteCloneClick={handleNoteClone}
        onNoteDeleteClick={handleNoteDelete}
        onNoteDownloadClick={handleNoteDownload}
        onNoteEditClick={handleNoteEdit}
      />,
    );

    const deleteIcon = screen.getByTitle('Move Note to trashcan');
    fireEvent.click(deleteIcon);
    expect(handleNoteDelete).toHaveBeenCalledWith(note);

    const editIcon = screen.getByTitle('Edit Note');
    fireEvent.click(editIcon);
    expect(handleNoteEdit).toHaveBeenCalledWith(note);

    const cloneIcon = screen.getByTitle('Clone Note');
    fireEvent.click(cloneIcon);
    expect(handleNoteClone).toHaveBeenCalledWith(note);

    const exportIcon = screen.getByTitle('Export Note');
    fireEvent.click(exportIcon);
    expect(handleNoteDownload).toHaveBeenCalledWith(note);
  });

  test('should not call click handlers without permissions', () => {
    const note = createNote(wrongCaps);

    const handleNoteClone = testing.fn();
    const handleNoteDelete = testing.fn();
    const handleNoteDownload = testing.fn();
    const handleNoteEdit = testing.fn();

    const {render} = rendererWithTableRow({
      capabilities: wrongCaps,
      gmp: createGmp(),
    });
    render(
      <NoteActions
        entity={note}
        onNoteCloneClick={handleNoteClone}
        onNoteDeleteClick={handleNoteDelete}
        onNoteDownloadClick={handleNoteDownload}
        onNoteEditClick={handleNoteEdit}
      />,
    );

    const deleteIcon = screen.getByRole('button', {name: 'Delete Icon'});
    expect(deleteIcon).toHaveAttribute(
      'title',
      'Permission to move Note to trashcan denied',
    );
    fireEvent.click(deleteIcon);
    expect(handleNoteDelete).not.toHaveBeenCalled();

    const editIcon = screen.getByRole('button', {name: 'Edit Icon'});
    expect(editIcon).toHaveAttribute('title', 'Permission to edit Note denied');
    fireEvent.click(editIcon);
    expect(handleNoteEdit).not.toHaveBeenCalled();

    const cloneIcon = screen.getByRole('button', {name: 'Clone Icon'});
    expect(cloneIcon).toHaveAttribute(
      'title',
      'Permission to clone Note denied',
    );
    fireEvent.click(cloneIcon);
    expect(handleNoteClone).not.toHaveBeenCalled();

    const exportIcon = screen.getByRole('button', {name: 'Export Icon'});
    expect(exportIcon).toHaveAttribute('title', 'Export Note');
    fireEvent.click(exportIcon);
    expect(handleNoteDownload).toHaveBeenCalledWith(note);
  });
});
