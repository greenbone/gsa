/* Copyright (C) 2021-2022 Greenbone AG
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
import React from 'react';

import Capabilities from 'gmp/capabilities/capabilities';
import CollectionCounts from 'gmp/collection/collectioncounts';

import {setLocale} from 'gmp/locale/lang';

import Filter from 'gmp/models/filter';
import Note from 'gmp/models/note';

import {isDefined} from 'gmp/utils/identity';

import {entityLoadingActions} from 'web/store/entities/notes';
import {setTimezone, setUsername} from 'web/store/usersettings/actions';

import {rendererWith, fireEvent, screen, wait} from 'web/utils/testing';

import Detailspage, {ToolBarIcons} from '../detailspage';

setLocale('en');

if (!isDefined(window.URL)) {
  window.URL = {};
}
window.URL.createObjectURL = jest.fn();

const caps = new Capabilities(['everything']);

const reloadInterval = -1;
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
    type: 'nvt',
  },
  owner: {name: 'admin'},
  permissions: {permission: {name: 'Everything'}},
  port: '666',
  text: 'note text',
  writable: 1,
});

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
    type: 'nvt',
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

const getNote = jest.fn().mockResolvedValue({
  data: note,
});

const getEntities = jest.fn().mockResolvedValue({
  data: [],
  meta: {
    filter: Filter.fromString(),
    counts: new CollectionCounts(),
  },
});

const currentSettings = jest.fn().mockResolvedValue({
  foo: 'bar',
});

const renewSession = jest.fn().mockResolvedValue({
  foo: 'bar',
});

describe('Note detailspage tests', () => {
  test('should render full detailspage', () => {
    const gmp = {
      note: {
        get: getNote,
      },
      permissions: {
        get: getEntities,
      },
      settings: {manualUrl, reloadInterval},
      user: {
        currentSettings,
      },
    };

    const {render, store} = rendererWith({
      capabilities: caps,
      gmp,
      router: true,
      store: true,
    });

    store.dispatch(setTimezone('CET'));
    store.dispatch(setUsername('admin'));

    store.dispatch(
      entityLoadingActions.success(
        '6d00d22f-551b-4fbe-8215-d8615eff73ea',
        note,
      ),
    );

    const {baseElement, element} = render(
      <Detailspage id="6d00d22f-551b-4fbe-8215-d8615eff73ea" />,
    );

    expect(element).toHaveTextContent('note text');

    const links = baseElement.querySelectorAll('a');

    expect(screen.getAllByTitle('Help: Notes')[0]).toBeInTheDocument();
    expect(links[0]).toHaveAttribute(
      'href',
      'test/en/reports.html#managing-notes',
    );

    expect(screen.getAllByTitle('Note List')[0]).toBeInTheDocument();
    expect(links[1]).toHaveAttribute('href', '/notes');

    expect(element).toHaveTextContent(
      'ID:6d00d22f-551b-4fbe-8215-d8615eff73ea',
    );
    expect(element).toHaveTextContent('Created:Wed, Dec 23, 2020 3:14 PM CET');
    expect(element).toHaveTextContent('Modified:Mon, Jan 4, 2021 12:54 PM CET');
    expect(element).toHaveTextContent('Owner:admin');

    const spans = baseElement.querySelectorAll('span');
    expect(spans[9]).toHaveTextContent('User Tags');
    expect(spans[11]).toHaveTextContent('Permissions');

    expect(element).toHaveTextContent('NVT Name');
    expect(element).toHaveTextContent('foo nvt');

    expect(element).toHaveTextContent('NVT OID');
    expect(element).toHaveTextContent('123');

    expect(element).toHaveTextContent('Active');
    expect(element).toHaveTextContent('Yes');

    expect(element).toHaveTextContent('Application');

    expect(element).toHaveTextContent('Hosts');
    expect(element).toHaveTextContent('127.0.0.1');

    expect(element).toHaveTextContent('Port');
    expect(element).toHaveTextContent('666');

    expect(element).toHaveTextContent('Severity');
    expect(element).toHaveTextContent('Any');

    expect(element).toHaveTextContent('Task');
    expect(element).toHaveTextContent('task x');

    expect(element).toHaveTextContent('Result');
    expect(element).toHaveTextContent('Any');

    expect(element).toHaveTextContent('Appearance');

    expect(element).toHaveTextContent('note text');
  });

  test('should render user tags tab', () => {
    const gmp = {
      note: {
        get: getNote,
      },
      permissions: {
        get: getEntities,
      },
      settings: {manualUrl, reloadInterval},
      user: {
        currentSettings,
        renewSession,
      },
    };

    const {render, store} = rendererWith({
      capabilities: caps,
      gmp,
      router: true,
      store: true,
    });

    store.dispatch(setTimezone('CET'));
    store.dispatch(setUsername('admin'));

    store.dispatch(
      entityLoadingActions.success(
        '6d00d22f-551b-4fbe-8215-d8615eff73ea',
        note,
      ),
    );

    const {baseElement} = render(
      <Detailspage id="6d00d22f-551b-4fbe-8215-d8615eff73ea" />,
    );

    const spans = baseElement.querySelectorAll('span');
    expect(spans[9]).toHaveTextContent('User Tags');
    fireEvent.click(spans[9]);

    expect(baseElement).toHaveTextContent('No user tags available');
  });

  test('should render permissions tab', () => {
    const gmp = {
      note: {
        get: getNote,
      },
      permissions: {
        get: getEntities,
      },
      settings: {manualUrl, reloadInterval},
      user: {
        currentSettings,
        renewSession,
      },
    };

    const {render, store} = rendererWith({
      capabilities: caps,
      gmp,
      router: true,
      store: true,
    });

    store.dispatch(setTimezone('CET'));
    store.dispatch(setUsername('admin'));

    store.dispatch(
      entityLoadingActions.success(
        '6d00d22f-551b-4fbe-8215-d8615eff73ea',
        note,
      ),
    );

    const {baseElement} = render(
      <Detailspage id="6d00d22f-551b-4fbe-8215-d8615eff73ea" />,
    );

    const spans = baseElement.querySelectorAll('span');
    expect(spans[11]).toHaveTextContent('Permissions');
    fireEvent.click(spans[11]);

    expect(baseElement).toHaveTextContent('No permissions available');
  });

  test('should call commands', async () => {
    const clone = jest.fn().mockResolvedValue({
      data: {id: 'foo'},
    });

    const deleteFunc = jest.fn().mockResolvedValue({
      foo: 'bar',
    });

    const exportFunc = jest.fn().mockResolvedValue({
      foo: 'bar',
    });

    const gmp = {
      note: {
        get: getNote,
        clone,
        delete: deleteFunc,
        export: exportFunc,
      },
      permissions: {
        get: getEntities,
      },
      settings: {manualUrl, reloadInterval},
      user: {
        currentSettings,
        renewSession,
      },
    };

    const {render, store} = rendererWith({
      capabilities: caps,
      gmp,
      router: true,
      store: true,
    });

    store.dispatch(setTimezone('CET'));
    store.dispatch(setUsername('admin'));

    store.dispatch(
      entityLoadingActions.success(
        '6d00d22f-551b-4fbe-8215-d8615eff73ea',
        note,
      ),
    );

    render(<Detailspage id="6d00d22f-551b-4fbe-8215-d8615eff73ea" />);

    await wait();

    const cloneIcon = screen.getAllByTitle('Clone Note');
    expect(cloneIcon[0]).toBeInTheDocument();

    fireEvent.click(cloneIcon[0]);

    await wait();

    expect(clone).toHaveBeenCalledWith(note);

    const exportIcon = screen.getAllByTitle('Export Note as XML');
    expect(exportIcon[0]).toBeInTheDocument();

    fireEvent.click(exportIcon[0]);

    await wait();

    expect(exportFunc).toHaveBeenCalledWith(note);

    const deleteIcon = screen.getAllByTitle('Move Note to trashcan');
    expect(deleteIcon[0]).toBeInTheDocument();

    fireEvent.click(deleteIcon[0]);

    await wait();

    expect(deleteFunc).toHaveBeenCalledWith({id: note.id});
  });
});

describe('Note ToolBarIcons tests', () => {
  test('should render', () => {
    const handleNoteCloneClick = jest.fn();
    const handleNoteDeleteClick = jest.fn();
    const handleNoteDownloadClick = jest.fn();
    const handleNoteEditClick = jest.fn();
    const handleNoteCreateClick = jest.fn();

    const gmp = {settings: {manualUrl}};

    const {render} = rendererWith({
      gmp,
      capabilities: caps,
      router: true,
    });

    const {element} = render(
      <ToolBarIcons
        entity={note}
        onNoteCloneClick={handleNoteCloneClick}
        onNoteDeleteClick={handleNoteDeleteClick}
        onNoteDownloadClick={handleNoteDownloadClick}
        onNoteEditClick={handleNoteEditClick}
        onNoteCreateClick={handleNoteCreateClick}
      />,
    );

    const links = element.querySelectorAll('a');

    expect(links[0]).toHaveAttribute(
      'href',
      'test/en/reports.html#managing-notes',
    );
    expect(screen.getAllByTitle('Help: Notes')[0]).toBeInTheDocument();

    expect(links[1]).toHaveAttribute('href', '/notes');
    expect(screen.getAllByTitle('Note List')[0]).toBeInTheDocument();
  });

  test('should call click handlers', () => {
    const handleNoteCloneClick = jest.fn();
    const handleNoteDeleteClick = jest.fn();
    const handleNoteDownloadClick = jest.fn();
    const handleNoteEditClick = jest.fn();
    const handleNoteCreateClick = jest.fn();

    const gmp = {settings: {manualUrl}};

    const {render} = rendererWith({
      gmp,
      capabilities: caps,
      router: true,
    });

    render(
      <ToolBarIcons
        entity={note}
        onNoteCloneClick={handleNoteCloneClick}
        onNoteDeleteClick={handleNoteDeleteClick}
        onNoteDownloadClick={handleNoteDownloadClick}
        onNoteEditClick={handleNoteEditClick}
        onNoteCreateClick={handleNoteCreateClick}
      />,
    );

    const cloneIcon = screen.getAllByTitle('Clone Note');
    const editIcon = screen.getAllByTitle('Edit Note');
    const deleteIcon = screen.getAllByTitle('Move Note to trashcan');
    const exportIcon = screen.getAllByTitle('Export Note as XML');

    expect(cloneIcon[0]).toBeInTheDocument();
    fireEvent.click(cloneIcon[0]);
    expect(handleNoteCloneClick).toHaveBeenCalledWith(note);

    expect(editIcon[0]).toBeInTheDocument();
    fireEvent.click(editIcon[0]);
    expect(handleNoteEditClick).toHaveBeenCalledWith(note);

    expect(deleteIcon[0]).toBeInTheDocument();
    fireEvent.click(deleteIcon[0]);
    expect(handleNoteDeleteClick).toHaveBeenCalledWith(note);

    expect(exportIcon[0]).toBeInTheDocument();
    fireEvent.click(exportIcon[0]);
    expect(handleNoteDownloadClick).toHaveBeenCalledWith(note);
  });

  test('should not call click handlers without permission', () => {
    const handleNoteCloneClick = jest.fn();
    const handleNoteDeleteClick = jest.fn();
    const handleNoteDownloadClick = jest.fn();
    const handleNoteEditClick = jest.fn();
    const handleNoteCreateClick = jest.fn();

    const gmp = {settings: {manualUrl}};

    const {render} = rendererWith({
      gmp,
      capabilities: caps,
      router: true,
    });

    render(
      <ToolBarIcons
        entity={noPermNote}
        onNoteCloneClick={handleNoteCloneClick}
        onNoteDeleteClick={handleNoteDeleteClick}
        onNoteDownloadClick={handleNoteDownloadClick}
        onNoteEditClick={handleNoteEditClick}
        onNoteCreateClick={handleNoteCreateClick}
      />,
    );

    const cloneIcon = screen.getAllByTitle('Clone Note');
    const editIcon = screen.getAllByTitle('Permission to edit Note denied');
    const deleteIcon = screen.getAllByTitle(
      'Permission to move Note to trashcan denied',
    );
    const exportIcon = screen.getAllByTitle('Export Note as XML');

    expect(cloneIcon[0]).toBeInTheDocument();
    fireEvent.click(cloneIcon[0]);

    expect(handleNoteCloneClick).toHaveBeenCalledWith(noPermNote);

    expect(editIcon[0]).toBeInTheDocument();
    fireEvent.click(editIcon[0]);

    expect(handleNoteEditClick).not.toHaveBeenCalled();

    expect(deleteIcon[0]).toBeInTheDocument();
    fireEvent.click(deleteIcon[0]);

    expect(handleNoteDeleteClick).not.toHaveBeenCalled();

    expect(exportIcon[0]).toBeInTheDocument();
    fireEvent.click(exportIcon[0]);

    expect(handleNoteDownloadClick).toHaveBeenCalledWith(noPermNote);
  });

  test('should call correct click handlers for note in use', () => {
    const handleNoteCloneClick = jest.fn();
    const handleNoteDeleteClick = jest.fn();
    const handleNoteDownloadClick = jest.fn();
    const handleNoteEditClick = jest.fn();
    const handleNoteCreateClick = jest.fn();

    const gmp = {settings: {manualUrl}};

    const {render} = rendererWith({
      gmp,
      capabilities: caps,
      router: true,
    });

    render(
      <ToolBarIcons
        entity={noteInUse}
        onNoteCloneClick={handleNoteCloneClick}
        onNoteDeleteClick={handleNoteDeleteClick}
        onNoteDownloadClick={handleNoteDownloadClick}
        onNoteEditClick={handleNoteEditClick}
        onNoteCreateClick={handleNoteCreateClick}
      />,
    );
    const cloneIcon = screen.getAllByTitle('Clone Note');
    const editIcon = screen.getAllByTitle('Edit Note');
    const deleteIcon = screen.getAllByTitle('Note is still in use');
    const exportIcon = screen.getAllByTitle('Export Note as XML');

    expect(cloneIcon[0]).toBeInTheDocument();
    fireEvent.click(cloneIcon[0]);

    expect(handleNoteCloneClick).toHaveBeenCalledWith(noteInUse);

    expect(editIcon[0]).toBeInTheDocument();
    fireEvent.click(editIcon[0]);

    expect(handleNoteEditClick).toHaveBeenCalled();

    expect(deleteIcon[0]).toBeInTheDocument();
    fireEvent.click(deleteIcon[0]);
    expect(handleNoteDeleteClick).not.toHaveBeenCalled();

    expect(exportIcon[0]).toBeInTheDocument();
    fireEvent.click(exportIcon[0]);

    expect(handleNoteDownloadClick).toHaveBeenCalledWith(noteInUse);
  });
});
