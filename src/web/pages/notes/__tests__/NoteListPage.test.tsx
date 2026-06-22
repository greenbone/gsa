/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {
  getSelectItemElementsForSelect,
  screen,
  testBulkTrashcanDialog,
  within,
  rendererWith,
  fireEvent,
  wait,
} from 'web/testing';
import CollectionCounts from 'gmp/collection/collection-counts';
import Filter from 'gmp/models/filter';
import Note from 'gmp/models/note';
import {createSession} from 'gmp/testing';
import {currentSettingsDefaultResponse} from 'web/pages/__fixtures__/current-settings';
import NotePage from 'web/pages/notes/NoteListPage';
import {entitiesLoadingActions} from 'web/store/entities/notes';
import {defaultFilterLoadingActions} from 'web/store/usersettings/defaultfilters/actions';
import {loadingActions} from 'web/store/usersettings/defaults/actions';

const createNote = (id: string, text: string) =>
  Note.fromElement({
    _id: id,
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
    text,
    writable: 1,
  });

const createNotes = (count: number) =>
  Array.from({length: count}, (_, index) =>
    createNote(`note-${index + 1}`, `note text ${index + 1}`),
  );

const note = createNote('6d00d22f-551b-4fbe-8215-d8615eff73ea', 'note text');

const reloadInterval = -1;
const manualUrl = 'test/';

const createGmp = ({
  currentSettings = testing
    .fn()
    .mockResolvedValue(currentSettingsDefaultResponse),
  getSetting = testing.fn().mockResolvedValue({
    filter: null,
  }),
  getDashboardSetting = testing.fn().mockResolvedValue({
    data: [],
    meta: {
      filter: Filter.fromString(),
      counts: new CollectionCounts(),
    },
  }),
  getAggregates = testing.fn().mockResolvedValue({
    data: [],
    meta: {
      filter: Filter.fromString(),
      counts: new CollectionCounts(),
    },
  }),
  getFilters = testing.fn().mockResolvedValue({
    data: [],
    meta: {
      filter: Filter.fromString(),
      counts: new CollectionCounts(),
    },
  }),
  getNotes = testing.fn().mockResolvedValue({
    data: [note],
    meta: {
      filter: Filter.fromString(),
      counts: new CollectionCounts(),
    },
  }),
  deleteByFilter = testing.fn().mockResolvedValue({
    foo: 'bar',
  }),
  exportByFilter = testing.fn().mockResolvedValue({
    foo: 'bar',
  }),
  deleteByIds = testing.fn().mockResolvedValue({
    foo: 'bar',
  }),
  exportByIds = testing.fn().mockResolvedValue({
    foo: 'bar',
  }),
} = {}) => ({
  dashboard: {
    getSetting: getDashboardSetting,
  },
  notes: {
    get: getNotes,
    getActiveDaysAggregates: getAggregates,
    getCreatedAggregates: getAggregates,
    getWordCountsAggregates: getAggregates,
    deleteByFilter,
    exportByFilter,
    delete: deleteByIds,
    export: exportByIds,
  },
  filters: {
    get: getFilters,
  },
  settings: {
    manualUrl,
    reloadInterval,
  },
  session: createSession(),
  user: {currentSettings, getSetting},
});

describe('NoteListPage tests', () => {
  test('should render full NoteListPage', async () => {
    const gmp = createGmp();

    const {render, store} = rendererWith({
      gmp,
      capabilities: true,
      store: true,
      router: true,
    });

    const defaultSettingFilter = Filter.fromString('foo=bar');
    store.dispatch(loadingActions.success({rowsperpage: {value: '2'}}));
    store.dispatch(
      defaultFilterLoadingActions.success('note', defaultSettingFilter),
    );

    const counts = new CollectionCounts({
      first: 1,
      all: 1,
      filtered: 1,
      length: 1,
      rows: 10,
    });
    const filter = Filter.fromString('first=1 rows=10');
    const loadedFilter = Filter.fromString('first=1 rows=10');
    store.dispatch(
      entitiesLoadingActions.success([note], filter, loadedFilter, counts),
    );

    render(<NotePage />);

    await wait();

    const powerFilter = within(screen.getPowerFilter());
    const select = powerFilter.getByTestId('powerfilter-select');
    const inputs = powerFilter.queryTextInputs();
    const display = screen.getAllByTestId('grid-item');

    // Toolbar Icons
    expect(screen.getByTitle('Help: Notes')).toBeInTheDocument();
    expect(screen.getByTitle('New Note')).toBeInTheDocument();

    // Powerfilter
    expect(inputs[0]).toHaveAttribute('name', 'userFilterString');
    expect(screen.getByTitle('Update Filter')).toBeInTheDocument();
    expect(screen.getByTitle('Remove Filter')).toBeInTheDocument();
    expect(screen.getByTitle('Reset to Default Filter')).toBeInTheDocument();
    expect(screen.getByTitle('Help: Powerfilter')).toBeInTheDocument();
    expect(screen.getByTitle('Edit Filter')).toBeInTheDocument();
    expect(select).toHaveAttribute('title', 'Loaded filter');
    expect(select).toHaveValue('--');

    // Dashboard
    expect(screen.getByTitle('Add new Dashboard Display')).toBeInTheDocument();
    expect(screen.getByTitle('Reset to Defaults')).toBeInTheDocument();
    expect(display[0]).toHaveTextContent('Notes by Active Days (Total: 0)');
    expect(display[1]).toHaveTextContent('Notes by Creation Time');
    expect(display[2]).toHaveTextContent('Notes Text Word Cloud');

    // Table
    const table = screen.getByRole('table');
    const tableContent = within(table);
    const header = tableContent.getAllByRole('columnheader');

    expect(header[0]).toHaveTextContent('Text');
    expect(header[1]).toHaveTextContent('NVT');
    expect(header[2]).toHaveTextContent('Host');
    expect(header[3]).toHaveTextContent('Location');
    expect(header[4]).toHaveTextContent('Active');
    expect(header[5]).toHaveTextContent('Actions');

    const row = tableContent.getAllByRole('row');

    expect(row[1]).toHaveTextContent('note text');
    expect(row[1]).toHaveTextContent('foo nvt');
    expect(row[1]).toHaveTextContent('127.0.0.1');
    expect(row[1]).toHaveTextContent('666');
    expect(row[1]).toHaveTextContent('yes');

    expect(screen.getByTitle('Move Note to trashcan')).toBeInTheDocument();
    expect(screen.getByTitle('Edit Note')).toBeInTheDocument();
    expect(screen.getByTitle('Clone Note')).toBeInTheDocument();
    expect(screen.getByTitle('Export Note')).toBeInTheDocument();
  });

  test('should allow to bulk action on page contents', async () => {
    const gmp = createGmp();

    const {render, store} = rendererWith({
      gmp,
      capabilities: true,
      store: true,
      router: true,
    });

    const defaultSettingFilter = Filter.fromString('foo=bar');
    store.dispatch(loadingActions.success({rowsperpage: {value: '2'}}));
    store.dispatch(
      defaultFilterLoadingActions.success('note', defaultSettingFilter),
    );

    const counts = new CollectionCounts({
      first: 1,
      all: 1,
      filtered: 1,
      length: 1,
      rows: 10,
    });
    const filter = Filter.fromString('first=1 rows=10');
    const loadedFilter = Filter.fromString('first=1 rows=10');
    store.dispatch(
      entitiesLoadingActions.success([note], filter, loadedFilter, counts),
    );

    render(<NotePage />);

    await wait();

    // export page contents
    const exportIcon = screen.getByTitle('Export page contents');
    fireEvent.click(exportIcon);
    expect(gmp.notes.exportByFilter).toHaveBeenCalled();

    // move page contents to trashcan
    const deleteIcon = screen.getByTitle('Move page contents to trashcan');
    fireEvent.click(deleteIcon);
    testBulkTrashcanDialog(screen, gmp.notes.deleteByFilter);
  });

  test('should allow to bulk action on selected notes', async () => {
    const gmp = createGmp();

    const {render, store} = rendererWith({
      gmp,
      capabilities: true,
      store: true,
      router: true,
    });

    const defaultSettingFilter = Filter.fromString('foo=bar');
    store.dispatch(loadingActions.success({rowsperpage: {value: '2'}}));
    store.dispatch(
      defaultFilterLoadingActions.success('note', defaultSettingFilter),
    );

    const counts = new CollectionCounts({
      first: 1,
      all: 1,
      filtered: 1,
      length: 1,
      rows: 10,
    });
    const filter = Filter.fromString('first=1 rows=10');
    const loadedFilter = Filter.fromString('first=1 rows=10');
    store.dispatch(
      entitiesLoadingActions.success([note], filter, loadedFilter, counts),
    );

    render(<NotePage />);

    await wait();

    // change to apply to selection
    const tableFooter = within(screen.queryTableFooter() as HTMLElement);
    const select = tableFooter.getSelectElement();
    const selectItems = await getSelectItemElementsForSelect(select);
    fireEvent.click(selectItems[1]);
    expect(select).toHaveValue('Apply to selection');

    // select a note
    const tableBody = within(screen.queryTableBody() as HTMLElement);
    const inputs = tableBody.queryCheckBoxes();
    fireEvent.click(inputs[0]);

    // export selected note
    const exportIcon = screen.getByTitle('Export selection');
    fireEvent.click(exportIcon);
    expect(gmp.notes.export).toHaveBeenCalled();

    // move selected note to trashcan
    const deleteIcon = screen.getByTitle('Move selection to trashcan');
    fireEvent.click(deleteIcon);
    testBulkTrashcanDialog(screen, gmp.notes.delete);
  });

  test('should allow to bulk action on filtered notes', async () => {
    const gmp = createGmp();

    const {render, store} = rendererWith({
      gmp,
      capabilities: true,
      store: true,
      router: true,
    });

    const defaultSettingFilter = Filter.fromString('foo=bar');
    store.dispatch(loadingActions.success({rowsperpage: {value: '2'}}));
    store.dispatch(
      defaultFilterLoadingActions.success('note', defaultSettingFilter),
    );

    const counts = new CollectionCounts({
      first: 1,
      all: 1,
      filtered: 1,
      length: 1,
      rows: 10,
    });
    const filter = Filter.fromString('first=1 rows=10');
    const loadedFilter = Filter.fromString('first=1 rows=10');
    store.dispatch(
      entitiesLoadingActions.success([note], filter, loadedFilter, counts),
    );

    render(<NotePage />);

    await wait();

    // change to all filtered
    const tableFooter = within(screen.queryTableFooter() as HTMLElement);
    const select = tableFooter.getSelectElement();
    const selectItems = await getSelectItemElementsForSelect(select);
    fireEvent.click(selectItems[2]);
    expect(select).toHaveValue('Apply to all filtered');

    // export all filtered notes
    const exportIcon = screen.getByTitle('Export all filtered');
    fireEvent.click(exportIcon);
    expect(gmp.notes.exportByFilter).toHaveBeenCalled();

    // move all filtered notes to trashcan
    const deleteIcon = screen.getByTitle('Move all filtered to trashcan');
    fireEvent.click(deleteIcon);
    testBulkTrashcanDialog(screen, gmp.notes.deleteByFilter);
  });

  test('should render loading state while notes are being fetched', async () => {
    const pendingPromise = new Promise(() => {});
    const gmp = createGmp({
      getNotes: testing.fn().mockReturnValue(pendingPromise),
    });

    const {render, store} = rendererWith({
      gmp,
      capabilities: true,
      store: true,
      router: true,
    });

    const defaultSettingFilter = Filter.fromString('foo=bar');
    store.dispatch(loadingActions.success({rowsperpage: {value: '2'}}));
    store.dispatch(
      defaultFilterLoadingActions.success('note', defaultSettingFilter),
    );

    render(<NotePage />);

    await wait();

    expect(screen.getByTestId('loading')).toBeInTheDocument();
  });

  test('should render an error message when loading notes fails', async () => {
    const error = new Error('Loading notes failed');
    const gmp = createGmp({
      getNotes: testing.fn().mockRejectedValue(error),
    });

    const {render, store} = rendererWith({
      gmp,
      capabilities: true,
      store: true,
      router: true,
    });

    const defaultSettingFilter = Filter.fromString('foo=bar');
    store.dispatch(loadingActions.success({rowsperpage: {value: '2'}}));
    store.dispatch(
      defaultFilterLoadingActions.success('note', defaultSettingFilter),
    );

    render(<NotePage />);

    await wait();

    expect(screen.getByTestId('error-message')).toHaveTextContent(
      'Loading notes failed',
    );
  });

  test('should allow to navigate with pagination controls', async () => {
    const notes = createNotes(10);

    const counts = new CollectionCounts({
      first: 11,
      all: 100,
      filtered: 50,
      length: 10,
      rows: 10,
    });
    const listFilter = Filter.fromString('first=11 rows=10');
    const getNotes = testing.fn().mockResolvedValue({
      data: notes,
      meta: {
        filter: listFilter,
        counts,
      },
    });

    const gmp = createGmp({
      getNotes,
    });

    const {render, store} = rendererWith({
      gmp,
      capabilities: true,
      store: true,
      router: true,
    });

    store.dispatch(loadingActions.success({rowsperpage: {value: '10'}}));
    store.dispatch(defaultFilterLoadingActions.success('note', listFilter));

    render(<NotePage />);

    await wait();

    // Ignore initial load calls and validate only pagination-triggered fetches.
    getNotes.mockClear();

    const footer = within(screen.getByTestId('entities-table-footer'));

    fireEvent.click(footer.getByTitle('Next'));
    await wait();

    const nextFilterString = getNotes.mock.calls[0][0].filter.toFilterString();
    expect(nextFilterString).toContain('first=21');
    expect(nextFilterString).toContain('rows=10');
    getNotes.mockClear();

    fireEvent.click(footer.getByTitle('Previous'));
    await wait();

    const previousFilterString =
      getNotes.mock.calls[0][0].filter.toFilterString();
    expect(previousFilterString).toContain('first=1');
    expect(previousFilterString).toContain('rows=10');
    getNotes.mockClear();

    fireEvent.click(footer.getByTitle('First'));
    await wait();

    const firstFilterString = getNotes.mock.calls[0][0].filter.toFilterString();
    expect(firstFilterString).toContain('first=1');
    expect(firstFilterString).toContain('rows=10');
    getNotes.mockClear();

    fireEvent.click(footer.getByTitle('Last'));
    await wait();

    const lastFilterString = getNotes.mock.calls[0][0].filter.toFilterString();
    expect(lastFilterString).toContain('first=41');
    expect(lastFilterString).toContain('rows=10');
  });
});
