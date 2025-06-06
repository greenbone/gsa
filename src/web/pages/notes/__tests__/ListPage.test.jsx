/* SPDX-FileCopyrightText: 2024 Greenbone AG
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
import Capabilities from 'gmp/capabilities/capabilities';
import CollectionCounts from 'gmp/collection/CollectionCounts';
import Filter from 'gmp/models/filter';
import Note from 'gmp/models/note';
import {currentSettingsDefaultResponse} from 'web/pages/__mocks__/CurrentSettings';
import NotesPage, {ToolBarIcons} from 'web/pages/notes/ListPage';
import {entitiesLoadingActions} from 'web/store/entities/notes';
import {setTimezone, setUsername} from 'web/store/usersettings/actions';
import {defaultFilterLoadingActions} from 'web/store/usersettings/defaultfilters/actions';
import {loadingActions} from 'web/store/usersettings/defaults/actions';

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
  text: 'note text',
  writable: 1,
});

const caps = new Capabilities(['everything']);
const wrongCaps = new Capabilities(['get_config']);

const reloadInterval = -1;
const manualUrl = 'test/';

const currentSettings = testing
  .fn()
  .mockResolvedValue(currentSettingsDefaultResponse);

const getSetting = testing.fn().mockResolvedValue({
  filter: null,
});

const getDashboardSetting = testing.fn().mockResolvedValue({
  data: [],
  meta: {
    filter: Filter.fromString(),
    counts: new CollectionCounts(),
  },
});

const getAggregates = testing.fn().mockResolvedValue({
  data: [],
  meta: {
    filter: Filter.fromString(),
    counts: new CollectionCounts(),
  },
});

const getFilters = testing.fn().mockReturnValue(
  Promise.resolve({
    data: [],
    meta: {
      filter: Filter.fromString(),
      counts: new CollectionCounts(),
    },
  }),
);

const getNotes = testing.fn().mockResolvedValue({
  data: [note],
  meta: {
    filter: Filter.fromString(),
    counts: new CollectionCounts(),
  },
});

const renewSession = testing.fn().mockResolvedValue({
  foo: 'bar',
});

describe('NotesPage tests', () => {
  test('should render full NotesPage', async () => {
    const gmp = {
      dashboard: {
        getSetting: getDashboardSetting,
      },
      notes: {
        get: getNotes,
        getActiveDaysAggregates: getAggregates,
        getCreatedAggregates: getAggregates,
        getWordCountsAggregates: getAggregates,
      },
      filters: {
        get: getFilters,
      },
      settings: {manualUrl, reloadInterval},
      user: {currentSettings, getSetting},
    };

    const {render, store} = rendererWith({
      gmp,
      capabilities: true,
      store: true,
      router: true,
    });

    store.dispatch(setTimezone('CET'));
    store.dispatch(setUsername('admin'));

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

    const {baseElement} = render(<NotesPage />);

    await wait();

    const powerFilter = within(screen.queryPowerFilter());
    const select = powerFilter.getSelectElement();
    const inputs = powerFilter.queryTextInputs();
    const display = screen.getAllByTestId('grid-item');

    // Toolbar Icons
    expect(screen.getAllByTitle('Help: Notes')[0]).toBeInTheDocument();
    expect(screen.getAllByTitle('New Note')[0]).toBeInTheDocument();

    // Powerfilter
    expect(inputs[0]).toHaveAttribute('name', 'userFilterString');
    expect(screen.getAllByTitle('Update Filter')[0]).toBeInTheDocument();
    expect(screen.getAllByTitle('Remove Filter')[0]).toBeInTheDocument();
    expect(
      screen.getAllByTitle('Reset to Default Filter')[0],
    ).toBeInTheDocument();
    expect(screen.getAllByTitle('Help: Powerfilter')[0]).toBeInTheDocument();
    expect(screen.getAllByTitle('Edit Filter')[0]).toBeInTheDocument();
    expect(select).toHaveAttribute('title', 'Loaded filter');
    expect(select).toHaveValue('--');

    // Dashboard
    expect(
      screen.getAllByTitle('Add new Dashboard Display')[0],
    ).toBeInTheDocument();
    expect(screen.getAllByTitle('Reset to Defaults')[0]).toBeInTheDocument();
    expect(display[0]).toHaveTextContent('Notes by Active Days (Total: 0)');
    expect(display[1]).toHaveTextContent('Notes by Creation Time');
    expect(display[2]).toHaveTextContent('Notes Text Word Cloud');

    // Table
    const header = baseElement.querySelectorAll('th');

    expect(header[0]).toHaveTextContent('Text');
    expect(header[1]).toHaveTextContent('NVT');
    expect(header[2]).toHaveTextContent('Host');
    expect(header[3]).toHaveTextContent('Location');
    expect(header[4]).toHaveTextContent('Active');
    expect(header[5]).toHaveTextContent('Actions');

    const row = baseElement.querySelectorAll('tr');

    expect(row[1]).toHaveTextContent('note text');
    expect(row[1]).toHaveTextContent('foo nvt');
    expect(row[1]).toHaveTextContent('127.0.0.1');
    expect(row[1]).toHaveTextContent('666');
    expect(row[1]).toHaveTextContent('yes');

    expect(
      screen.getAllByTitle('Move Note to trashcan')[0],
    ).toBeInTheDocument();
    expect(screen.getAllByTitle('Edit Note')[0]).toBeInTheDocument();
    expect(screen.getAllByTitle('Clone Note')[0]).toBeInTheDocument();
    expect(screen.getAllByTitle('Export Note')[0]).toBeInTheDocument();
  });

  test('should allow to bulk action on page contents', async () => {
    const deleteByFilter = testing.fn().mockResolvedValue({
      foo: 'bar',
    });

    const exportByFilter = testing.fn().mockResolvedValue({
      foo: 'bar',
    });

    const gmp = {
      dashboard: {
        getSetting: getDashboardSetting,
      },
      notes: {
        get: getNotes,
        deleteByFilter,
        exportByFilter,
        getActiveDaysAggregates: getAggregates,
        getCreatedAggregates: getAggregates,
        getWordCountsAggregates: getAggregates,
      },
      filters: {
        get: getFilters,
      },
      settings: {manualUrl, reloadInterval},
      user: {renewSession, currentSettings, getSetting: getSetting},
    };

    const {render, store} = rendererWith({
      gmp,
      capabilities: true,
      store: true,
      router: true,
    });

    store.dispatch(setTimezone('CET'));
    store.dispatch(setUsername('admin'));

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

    render(<NotesPage />);

    await wait();

    // export page contents
    const exportIcon = screen.getAllByTitle('Export page contents')[0];
    fireEvent.click(exportIcon);
    expect(exportByFilter).toHaveBeenCalled();

    // move page contents to trashcan
    const deleteIcon = screen.getAllByTitle(
      'Move page contents to trashcan',
    )[0];
    fireEvent.click(deleteIcon);
    testBulkTrashcanDialog(screen, deleteByFilter);
  });

  test('should allow to bulk action on selected notes', async () => {
    const deleteByIds = testing.fn().mockResolvedValue({
      foo: 'bar',
    });

    const exportByIds = testing.fn().mockResolvedValue({
      foo: 'bar',
    });

    const gmp = {
      dashboard: {
        getSetting: getDashboardSetting,
      },
      notes: {
        get: getNotes,
        delete: deleteByIds,
        export: exportByIds,
        getActiveDaysAggregates: getAggregates,
        getCreatedAggregates: getAggregates,
        getWordCountsAggregates: getAggregates,
      },
      filters: {
        get: getFilters,
      },
      settings: {manualUrl, reloadInterval},
      user: {renewSession, currentSettings, getSetting: getSetting},
    };

    const {render, store} = rendererWith({
      gmp,
      capabilities: true,
      store: true,
      router: true,
    });

    store.dispatch(setTimezone('CET'));
    store.dispatch(setUsername('admin'));

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

    render(<NotesPage />);

    await wait();

    // change to apply to selection
    const tableFooter = within(screen.queryTableFooter());
    const select = tableFooter.getSelectElement();
    const selectItems = await getSelectItemElementsForSelect(select);
    fireEvent.click(selectItems[1]);
    expect(select).toHaveValue('Apply to selection');

    // select a note
    const tableBody = within(screen.queryTableBody());
    const inputs = tableBody.queryCheckBoxes();
    fireEvent.click(inputs[0]);

    // export selected note
    const exportIcon = screen.getAllByTitle('Export selection')[0];
    fireEvent.click(exportIcon);
    expect(exportByIds).toHaveBeenCalled();

    // move selected note to trashcan
    const deleteIcon = screen.getAllByTitle('Move selection to trashcan')[0];
    fireEvent.click(deleteIcon);
    testBulkTrashcanDialog(screen, deleteByIds);
  });

  test('should allow to bulk action on filtered notes', async () => {
    const deleteByFilter = testing.fn().mockResolvedValue({
      foo: 'bar',
    });

    const exportByFilter = testing.fn().mockResolvedValue({
      foo: 'bar',
    });

    const gmp = {
      dashboard: {
        getSetting: getDashboardSetting,
      },
      notes: {
        get: getNotes,
        deleteByFilter,
        exportByFilter,
        getActiveDaysAggregates: getAggregates,
        getCreatedAggregates: getAggregates,
        getWordCountsAggregates: getAggregates,
      },
      filters: {
        get: getFilters,
      },
      settings: {manualUrl, reloadInterval},
      user: {renewSession, currentSettings, getSetting: getSetting},
    };

    const {render, store} = rendererWith({
      gmp,
      capabilities: true,
      store: true,
      router: true,
    });

    store.dispatch(setTimezone('CET'));
    store.dispatch(setUsername('admin'));

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

    render(<NotesPage />);

    await wait();

    const tableFooter = within(screen.queryTableFooter());
    const select = tableFooter.getSelectElement();
    const selectItems = await getSelectItemElementsForSelect(select);
    fireEvent.click(selectItems[2]);
    expect(select).toHaveValue('Apply to all filtered');

    // export all filtered notes
    const exportIcon = screen.getAllByTitle('Export all filtered')[0];
    fireEvent.click(exportIcon);
    expect(exportByFilter).toHaveBeenCalled();

    // move all filtered notes to trashcan
    const deleteIcon = screen.getAllByTitle('Move all filtered to trashcan')[0];
    fireEvent.click(deleteIcon);
    testBulkTrashcanDialog(screen, deleteByFilter);
  });
});

describe('NotesPage ToolBarIcons test', () => {
  test('should render', () => {
    const handleNoteCreateClick = testing.fn();

    const gmp = {
      settings: {manualUrl},
    };

    const {render} = rendererWith({
      gmp,
      capabilities: caps,
      router: true,
    });

    const {element} = render(
      <ToolBarIcons onNoteCreateClick={handleNoteCreateClick} />,
    );

    const links = element.querySelectorAll('a');

    expect(screen.getByTestId('help-icon')).toHaveAttribute(
      'title',
      'Help: Notes',
    );
    expect(links[0]).toHaveAttribute(
      'href',
      'test/en/reports.html#managing-notes',
    );
  });

  test('should call click handlers', () => {
    const handleNoteCreateClick = testing.fn();

    const gmp = {
      settings: {manualUrl},
    };

    const {render} = rendererWith({
      gmp,
      capabilities: caps,
      router: true,
    });

    render(<ToolBarIcons onNoteCreateClick={handleNoteCreateClick} />);

    const newIcon = screen.getByTestId('new-icon');
    expect(newIcon).toHaveAttribute('title', 'New Note');
    fireEvent.click(newIcon);
    expect(handleNoteCreateClick).toHaveBeenCalled();
  });

  test('should not show icons if user does not have the right permissions', () => {
    const handleNoteCreateClick = testing.fn();

    const gmp = {
      settings: {manualUrl},
    };

    const {render} = rendererWith({
      gmp,
      capabilities: wrongCaps,
      router: true,
    });

    render(<ToolBarIcons onNoteCreateClick={handleNoteCreateClick} />);

    expect(screen.getByTestId('help-icon')).toHaveAttribute(
      'title',
      'Help: Notes',
    );
    expect(screen.queryByTestId('new-icon')).toBeNull();
  });
});
