/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {rendererWith, fireEvent, screen} from 'web/testing';
import Note from 'gmp/models/note';
import NoteDetailsPageToolBarIcons from 'web/pages/notes/NoteDetailsPageToolBarIcons';

const manualUrl = 'test/';

const note = Note.fromElement({
  _id: '6d00d22f-551b-4fbe-8215-d8615eff73ea',
  active: 1,
  creation_time: '2020-12-23T14:14:11Z',
  hosts: '127.0.0.1',
  in_use: 0,
  modification_time: '2021-01-04T11:54:12Z',
  nvt: {
    _oid: '123',
    name: 'foo nvt',
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

describe('Note ToolBarIcons tests', () => {
  test('should render', () => {
    const handleNoteCloneClick = testing.fn();
    const handleNoteDeleteClick = testing.fn();
    const handleNoteDownloadClick = testing.fn();
    const handleNoteEditClick = testing.fn();
    const handleNoteCreateClick = testing.fn();

    const gmp = {settings: {manualUrl}};

    const {render} = rendererWith({
      gmp,
      capabilities: true,
      router: true,
    });

    render(
      <NoteDetailsPageToolBarIcons
        entity={note}
        onNoteCloneClick={handleNoteCloneClick}
        onNoteCreateClick={handleNoteCreateClick}
        onNoteDeleteClick={handleNoteDeleteClick}
        onNoteDownloadClick={handleNoteDownloadClick}
        onNoteEditClick={handleNoteEditClick}
      />,
    );

    expect(screen.getByTitle('Help: Notes')).toBeInTheDocument();
    expect(screen.getByTestId('manual-link')).toHaveAttribute(
      'href',
      'test/en/reports.html#managing-notes',
    );

    expect(screen.getByTitle('Note List')).toBeInTheDocument();
    expect(screen.getByTestId('list-link-icon')).toHaveAttribute(
      'href',
      '/notes',
    );

    expect(screen.getByTitle('Create new Note')).toBeInTheDocument();
    expect(screen.getByTitle('Clone Note')).toBeInTheDocument();
    expect(screen.getByTitle('Edit Note')).toBeInTheDocument();
    expect(screen.getByTitle('Move Note to trashcan')).toBeInTheDocument();
    expect(screen.getByTitle('Export Note as XML')).toBeInTheDocument();
  });

  test('should call click handlers', () => {
    const handleNoteCloneClick = testing.fn();
    const handleNoteDeleteClick = testing.fn();
    const handleNoteDownloadClick = testing.fn();
    const handleNoteEditClick = testing.fn();
    const handleNoteCreateClick = testing.fn();

    const gmp = {settings: {manualUrl}};

    const {render} = rendererWith({
      gmp,
      capabilities: true,
      router: true,
    });

    render(
      <NoteDetailsPageToolBarIcons
        entity={note}
        onNoteCloneClick={handleNoteCloneClick}
        onNoteCreateClick={handleNoteCreateClick}
        onNoteDeleteClick={handleNoteDeleteClick}
        onNoteDownloadClick={handleNoteDownloadClick}
        onNoteEditClick={handleNoteEditClick}
      />,
    );

    const cloneIcon = screen.getByTestId('clone-icon');
    const editIcon = screen.getByTestId('edit-icon');
    const deleteIcon = screen.getByTestId('trashcan-icon');
    const exportIcon = screen.getByTestId('export-icon');

    fireEvent.click(cloneIcon);
    expect(handleNoteCloneClick).toHaveBeenCalledWith(note);

    fireEvent.click(editIcon);
    expect(handleNoteEditClick).toHaveBeenCalledWith(note);

    fireEvent.click(deleteIcon);
    expect(handleNoteDeleteClick).toHaveBeenCalledWith(note);

    fireEvent.click(exportIcon);
    expect(handleNoteDownloadClick).toHaveBeenCalledWith(note);
  });

  test('should not call click handlers without permission', () => {
    const noPermNote = Note.fromElement({
      _id: '6d00d22f-551b-4fbe-8215-d8615eff73ea',
      active: 1,
      creation_time: '2020-12-23T14:14:11Z',
      hosts: '127.0.0.1',
      in_use: 0,
      modification_time: '2021-01-04T11:54:12Z',
      nvt: {
        _oid: '123',
        name: 'foo nvt',
      },
      owner: {name: 'admin'},
      permissions: {permission: {name: 'get_notes'}},
      port: '666',
      task: {
        name: 'task x',
        _id: '42',
      },
      text: 'note text',
      writable: 1,
    });

    const handleNoteCloneClick = testing.fn();
    const handleNoteDeleteClick = testing.fn();
    const handleNoteDownloadClick = testing.fn();
    const handleNoteEditClick = testing.fn();
    const handleNoteCreateClick = testing.fn();

    const gmp = {settings: {manualUrl}};

    const {render} = rendererWith({
      gmp,
      capabilities: true,
      router: true,
    });

    render(
      <NoteDetailsPageToolBarIcons
        entity={noPermNote}
        onNoteCloneClick={handleNoteCloneClick}
        onNoteCreateClick={handleNoteCreateClick}
        onNoteDeleteClick={handleNoteDeleteClick}
        onNoteDownloadClick={handleNoteDownloadClick}
        onNoteEditClick={handleNoteEditClick}
      />,
    );

    const cloneIcon = screen.getByTestId('clone-icon');
    const editIcon = screen.getByTestId('edit-icon');
    const deleteIcon = screen.getByTestId('trashcan-icon');
    const exportIcon = screen.getByTestId('export-icon');

    fireEvent.click(cloneIcon);
    expect(handleNoteCloneClick).toHaveBeenCalledWith(noPermNote);

    fireEvent.click(editIcon);
    expect(handleNoteEditClick).not.toHaveBeenCalled();

    fireEvent.click(deleteIcon);
    expect(handleNoteDeleteClick).not.toHaveBeenCalled();

    fireEvent.click(exportIcon);
    expect(handleNoteDownloadClick).toHaveBeenCalledWith(noPermNote);
  });

  test('should call correct click handlers for note in use', () => {
    const noteInUse = Note.fromElement({
      _id: '6d00d22f-551b-4fbe-8215-d8615eff73ea',
      active: 1,
      creation_time: '2020-12-23T14:14:11Z',
      hosts: '127.0.0.1',
      in_use: 1,
      modification_time: '2021-01-04T11:54:12Z',
      nvt: {
        _oid: '123',
        name: 'foo nvt',
      },
      owner: {name: 'admin'},
      permissions: {permission: {name: 'Everything'}},
      port: '666',
      text: 'note text',
      writable: 1,
    });

    const handleNoteCloneClick = testing.fn();
    const handleNoteDeleteClick = testing.fn();
    const handleNoteDownloadClick = testing.fn();
    const handleNoteEditClick = testing.fn();
    const handleNoteCreateClick = testing.fn();

    const gmp = {settings: {manualUrl}};

    const {render} = rendererWith({
      gmp,
      capabilities: true,
      router: true,
    });

    render(
      <NoteDetailsPageToolBarIcons
        entity={noteInUse}
        onNoteCloneClick={handleNoteCloneClick}
        onNoteCreateClick={handleNoteCreateClick}
        onNoteDeleteClick={handleNoteDeleteClick}
        onNoteDownloadClick={handleNoteDownloadClick}
        onNoteEditClick={handleNoteEditClick}
      />,
    );
    const cloneIcon = screen.getByTestId('clone-icon');
    const editIcon = screen.getByTestId('edit-icon');
    const deleteIcon = screen.getByTestId('trashcan-icon');
    const exportIcon = screen.getByTestId('export-icon');

    fireEvent.click(cloneIcon);
    expect(handleNoteCloneClick).toHaveBeenCalledWith(noteInUse);

    fireEvent.click(editIcon);
    expect(handleNoteEditClick).toHaveBeenCalled();

    fireEvent.click(deleteIcon);
    expect(handleNoteDeleteClick).not.toHaveBeenCalled();

    fireEvent.click(exportIcon);
    expect(handleNoteDownloadClick).toHaveBeenCalledWith(noteInUse);
  });
});
