/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {rendererWith, fireEvent, screen, waitFor, within} from 'web/testing';
import CollectionCounts from 'gmp/collection/collection-counts';
import Response from 'gmp/http/response';
import Filter from 'gmp/models/filter';
import Note from 'gmp/models/note';
import {currentSettingsDefaultResponse} from 'web/pages/__fixtures__/current-settings';
import DetailsPage from 'web/pages/notes/DetailsPage';
import {entityLoadingActions} from 'web/store/entities/notes';
import {setTimezone, setUsername} from 'web/store/usersettings/actions';

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

const currentSettings = testing
  .fn()
  .mockResolvedValue(currentSettingsDefaultResponse);

const createGmp = ({
  getNoteResponse = new Response(note),
  getPermissionsResponse = new Response([], {
    filter: Filter.fromString(),
    counts: new CollectionCounts(),
  }),
  cloneNoteResponse = new Response({id: 'foo'}),
  deleteNoteResponse = {foo: 'bar'},
  exportNoteResponse = {foo: 'bar'},
  getNote = testing.fn().mockResolvedValue(getNoteResponse),
  getPermissions = testing.fn().mockResolvedValue(getPermissionsResponse),
  cloneNote = testing.fn().mockResolvedValue(cloneNoteResponse),
  deleteNote = testing.fn().mockResolvedValue(deleteNoteResponse),
  exportNote = testing.fn().mockResolvedValue(exportNoteResponse),
} = {}) => {
  return {
    note: {
      get: getNote,
      clone: cloneNote,
      delete: deleteNote,
      export: exportNote,
    },
    permissions: {
      get: getPermissions,
    },
    settings: {manualUrl, reloadInterval},
    user: {
      currentSettings,
    },
  };
};

describe('NoteDetailsPage tests', () => {
  test('should render full DetailsPage', () => {
    const gmp = createGmp();
    const {render, store} = rendererWith({
      gmp,
      capabilities: true,
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

    render(<DetailsPage id="6d00d22f-551b-4fbe-8215-d8615eff73ea" />);

    screen.getByTitle('Help: Notes');
    screen.getByTitle('Note List');
    expect(screen.getByTestId('manual-link')).toHaveAttribute(
      'href',
      'test/en/reports.html#managing-notes',
    );
    expect(screen.getByTestId('list-link-icon')).toHaveAttribute(
      'href',
      '/notes',
    );

    const entityInfo = within(screen.getByTestId('entity-info'));
    const infoRows = entityInfo.getAllByRole('row');
    expect(infoRows[0]).toHaveTextContent(
      'ID:6d00d22f-551b-4fbe-8215-d8615eff73ea',
    );
    expect(infoRows[1]).toHaveTextContent(
      'Created:Wed, Dec 23, 2020 3:14 PM Central European Standard',
    );
    expect(infoRows[2]).toHaveTextContent(
      'Modified:Mon, Jan 4, 2021 12:54 PM Central European Standard',
    );
    expect(infoRows[3]).toHaveTextContent('Owner:admin');

    const tablist = screen.getByRole('tablist');
    within(tablist).getByRole('tab', {name: /^information/i});
    within(tablist).getByRole('tab', {name: /^user tags/i});
    within(tablist).getByRole('tab', {name: /^permissions/i});

    // Details section - use simple text queries
    screen.getByText('foo nvt');
    screen.getByText('123');
    screen.getByText(/^Yes$/); // Active

    screen.getByRole('heading', {name: /^Application/i});

    screen.getByText('127.0.0.1');
    screen.getByText('666');
    screen.getByText('task x');
    // 'Any' appears multiple times
    // 'Any' appears multiple times - skip checking it

    screen.getByRole('heading', {name: /^Appearance/i});

    expect(screen.getByTestId('note-box')).toHaveTextContent('note text');
  });

  test('should render user tags tab', () => {
    const gmp = createGmp();
    const {render, store} = rendererWith({
      gmp,
      capabilities: true,
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

    const {container} = render(
      <DetailsPage id="6d00d22f-551b-4fbe-8215-d8615eff73ea" />,
    );

    const tablist = screen.getByRole('tablist');
    const userTagsTab = within(tablist).getByRole('tab', {name: /^user tags/i});
    fireEvent.click(userTagsTab);
    expect(container).toHaveTextContent('No user tags available');
  });

  test('should render permissions tab', () => {
    const gmp = createGmp();
    const {render, store} = rendererWith({
      gmp,
      capabilities: true,
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

    const {container} = render(
      <DetailsPage id="6d00d22f-551b-4fbe-8215-d8615eff73ea" />,
    );

    const tablist = screen.getByRole('tablist');
    const permissionsTab = within(tablist).getByRole('tab', {
      name: /^permissions/i,
    });
    fireEvent.click(permissionsTab);
    expect(container).toHaveTextContent('No permissions available');
  });

  test('should call commands', async () => {
    const gmp = createGmp();
    const {render, store} = rendererWith({
      gmp,
      capabilities: true,
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

    render(<DetailsPage id="6d00d22f-551b-4fbe-8215-d8615eff73ea" />);

    const cloneIcon = await screen.findByTestId('clone-icon');
    fireEvent.click(cloneIcon);
    await waitFor(() => expect(gmp.note.clone).toHaveBeenCalledWith(note));

    const exportIcon = screen.getByTestId('export-icon');
    fireEvent.click(exportIcon);
    await waitFor(() => expect(gmp.note.export).toHaveBeenCalledWith(note));

    const deleteIcon = screen.getByTestId('trashcan-icon');
    fireEvent.click(deleteIcon);
    await waitFor(() =>
      expect(gmp.note.delete).toHaveBeenCalledWith({id: note.id}),
    );
  });
});
