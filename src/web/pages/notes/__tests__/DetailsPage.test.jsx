/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import Capabilities from 'gmp/capabilities/capabilities';
import CollectionCounts from 'gmp/collection/collectioncounts';
import Filter from 'gmp/models/filter';
import Note from 'gmp/models/note';
import {entityLoadingActions} from 'web/store/entities/notes';
import {setTimezone, setUsername} from 'web/store/usersettings/actions';
import {rendererWith, fireEvent, screen, wait} from 'web/utils/Testing';

import Detailspage, {ToolBarIcons} from '../DetailsPage';

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

const getNote = testing.fn().mockResolvedValue({
  data: note,
});

const getEntities = testing.fn().mockResolvedValue({
  data: [],
  meta: {
    filter: Filter.fromString(),
    counts: new CollectionCounts(),
  },
});

const currentSettings = testing.fn().mockResolvedValue({
  foo: 'bar',
});

const renewSession = testing.fn().mockResolvedValue({
  foo: 'bar',
});

describe('Note detailspage tests', () => {
  test('should render full /DetailsPage', () => {
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

    const {baseElement} = render(
      <Detailspage id="6d00d22f-551b-4fbe-8215-d8615eff73ea" />,
    );

    expect(baseElement).toHaveTextContent('note text');

    const links = baseElement.querySelectorAll('a');

    expect(screen.getAllByTitle('Help: Notes')[0]).toBeInTheDocument();
    expect(links[0]).toHaveAttribute(
      'href',
      'test/en/reports.html#managing-notes',
    );

    expect(screen.getAllByTitle('Note List')[0]).toBeInTheDocument();
    expect(links[1]).toHaveAttribute('href', '/notes');

    expect(baseElement).toHaveTextContent(
      'ID:6d00d22f-551b-4fbe-8215-d8615eff73ea',
    );
    expect(baseElement).toHaveTextContent(
      'Created:Wed, Dec 23, 2020 3:14 PM CET',
    );
    expect(baseElement).toHaveTextContent(
      'Modified:Mon, Jan 4, 2021 12:54 PM CET',
    );
    expect(baseElement).toHaveTextContent('Owner:admin');

    const spans = baseElement.querySelectorAll('span');
    expect(spans[9]).toHaveTextContent('User Tags');
    expect(spans[11]).toHaveTextContent('Permissions');

    expect(baseElement).toHaveTextContent('NVT Name');
    expect(baseElement).toHaveTextContent('foo nvt');

    expect(baseElement).toHaveTextContent('NVT OID');
    expect(baseElement).toHaveTextContent('123');

    expect(baseElement).toHaveTextContent('Active');
    expect(baseElement).toHaveTextContent('Yes');

    expect(baseElement).toHaveTextContent('Application');

    expect(baseElement).toHaveTextContent('Hosts');
    expect(baseElement).toHaveTextContent('127.0.0.1');

    expect(baseElement).toHaveTextContent('Port');
    expect(baseElement).toHaveTextContent('666');

    expect(baseElement).toHaveTextContent('Severity');
    expect(baseElement).toHaveTextContent('Any');

    expect(baseElement).toHaveTextContent('Task');
    expect(baseElement).toHaveTextContent('task x');

    expect(baseElement).toHaveTextContent('Result');
    expect(baseElement).toHaveTextContent('Any');

    expect(baseElement).toHaveTextContent('Appearance');

    expect(baseElement).toHaveTextContent('note text');
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
    const clone = testing.fn().mockResolvedValue({
      data: {id: 'foo'},
    });

    const deleteFunc = testing.fn().mockResolvedValue({
      foo: 'bar',
    });

    const exportFunc = testing.fn().mockResolvedValue({
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
    const handleNoteCloneClick = testing.fn();
    const handleNoteDeleteClick = testing.fn();
    const handleNoteDownloadClick = testing.fn();
    const handleNoteEditClick = testing.fn();
    const handleNoteCreateClick = testing.fn();

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
        onNoteCreateClick={handleNoteCreateClick}
        onNoteDeleteClick={handleNoteDeleteClick}
        onNoteDownloadClick={handleNoteDownloadClick}
        onNoteEditClick={handleNoteEditClick}
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
    const handleNoteCloneClick = testing.fn();
    const handleNoteDeleteClick = testing.fn();
    const handleNoteDownloadClick = testing.fn();
    const handleNoteEditClick = testing.fn();
    const handleNoteCreateClick = testing.fn();

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
        onNoteCreateClick={handleNoteCreateClick}
        onNoteDeleteClick={handleNoteDeleteClick}
        onNoteDownloadClick={handleNoteDownloadClick}
        onNoteEditClick={handleNoteEditClick}
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
    const handleNoteCloneClick = testing.fn();
    const handleNoteDeleteClick = testing.fn();
    const handleNoteDownloadClick = testing.fn();
    const handleNoteEditClick = testing.fn();
    const handleNoteCreateClick = testing.fn();

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
        onNoteCreateClick={handleNoteCreateClick}
        onNoteDeleteClick={handleNoteDeleteClick}
        onNoteDownloadClick={handleNoteDownloadClick}
        onNoteEditClick={handleNoteEditClick}
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
    const handleNoteCloneClick = testing.fn();
    const handleNoteDeleteClick = testing.fn();
    const handleNoteDownloadClick = testing.fn();
    const handleNoteEditClick = testing.fn();
    const handleNoteCreateClick = testing.fn();

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
        onNoteCreateClick={handleNoteCreateClick}
        onNoteDeleteClick={handleNoteDeleteClick}
        onNoteDownloadClick={handleNoteDownloadClick}
        onNoteEditClick={handleNoteEditClick}
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
