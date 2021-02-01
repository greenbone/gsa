/* Copyright (C) 2021 Greenbone Networks GmbH
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

import {entitiesLoadingActions} from 'web/store/entities/notes';

import {setTimezone, setUsername} from 'web/store/usersettings/actions';
import {defaultFilterLoadingActions} from 'web/store/usersettings/defaultfilters/actions';
import {loadingActions} from 'web/store/usersettings/defaults/actions';

import {rendererWith, fireEvent, screen, wait} from 'web/utils/testing';

import NotesPage, {ToolBarIcons} from '../listpage';

setLocale('en');

window.URL.createObjectURL = jest.fn();

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

let currentSettings;
let getAggregates;
let getDashboardSetting;
let getFilters;
let getNotes;
let getSetting;
let renewSession;

beforeEach(() => {
  currentSettings = jest.fn().mockResolvedValue({
    foo: 'bar',
  });

  getSetting = jest.fn().mockResolvedValue({
    filter: null,
  });

  getDashboardSetting = jest.fn().mockResolvedValue({
    data: [],
    meta: {
      filter: Filter.fromString(),
      counts: new CollectionCounts(),
    },
  });

  getAggregates = jest.fn().mockResolvedValue({
    data: [],
    meta: {
      filter: Filter.fromString(),
      counts: new CollectionCounts(),
    },
  });

  getFilters = jest.fn().mockReturnValue(
    Promise.resolve({
      data: [],
      meta: {
        filter: Filter.fromString(),
        counts: new CollectionCounts(),
      },
    }),
  );

  getNotes = jest.fn().mockResolvedValue({
    data: [note],
    meta: {
      filter: Filter.fromString(),
      counts: new CollectionCounts(),
    },
  });

  renewSession = jest.fn().mockResolvedValue({
    foo: 'bar',
  });
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

    const defaultSettingfilter = Filter.fromString('foo=bar');
    store.dispatch(loadingActions.success({rowsperpage: {value: '2'}}));
    store.dispatch(
      defaultFilterLoadingActions.success('note', defaultSettingfilter),
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

    const display = screen.getAllByTestId('grid-item');
    const inputs = baseElement.querySelectorAll('input');
    const selects = screen.getAllByTestId('select-selected-value');

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
    expect(selects[0]).toHaveAttribute('title', 'Loaded filter');
    expect(selects[0]).toHaveTextContent('--');

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
    const deleteByFilter = jest.fn().mockResolvedValue({
      foo: 'bar',
    });

    const exportByFilter = jest.fn().mockResolvedValue({
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

    const defaultSettingfilter = Filter.fromString('foo=bar');
    store.dispatch(loadingActions.success({rowsperpage: {value: '2'}}));
    store.dispatch(
      defaultFilterLoadingActions.success('note', defaultSettingfilter),
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
    const exportIcon = screen.getAllByTitle('Export page contents');

    expect(exportIcon[0]).toBeInTheDocument();
    fireEvent.click(exportIcon[0]);

    await wait();

    expect(exportByFilter).toHaveBeenCalled();

    // move page contents to trashcan
    const deleteIcon = screen.getAllByTitle('Move page contents to trashcan');

    expect(deleteIcon[0]).toBeInTheDocument();
    fireEvent.click(deleteIcon[0]);

    await wait();

    expect(deleteByFilter).toHaveBeenCalled();
  });

  test('should allow to bulk action on selected notes', async () => {
    const deleteByIds = jest.fn().mockResolvedValue({
      foo: 'bar',
    });

    const exportByIds = jest.fn().mockResolvedValue({
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

    const defaultSettingfilter = Filter.fromString('foo=bar');
    store.dispatch(loadingActions.success({rowsperpage: {value: '2'}}));
    store.dispatch(
      defaultFilterLoadingActions.success('note', defaultSettingfilter),
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

    const {element} = render(<NotesPage />);

    await wait();

    const selectFields = screen.getAllByTestId('select-open-button');
    fireEvent.click(selectFields[1]);

    const selectItems = screen.getAllByTestId('select-item');
    fireEvent.click(selectItems[1]);

    const selected = screen.getAllByTestId('select-selected-value');
    expect(selected[1]).toHaveTextContent('Apply to selection');

    const inputs = element.querySelectorAll('input');

    // select a note
    fireEvent.click(inputs[1]);
    await wait();

    // export selected note
    const exportIcon = screen.getAllByTitle('Export selection');

    expect(exportIcon[0]).toBeInTheDocument();
    fireEvent.click(exportIcon[0]);

    await wait();

    expect(exportByIds).toHaveBeenCalled();

    // move selected note to trashcan
    const deleteIcon = screen.getAllByTitle('Move selection to trashcan');

    expect(deleteIcon[0]).toBeInTheDocument();
    fireEvent.click(deleteIcon[0]);

    await wait();

    expect(deleteByIds).toHaveBeenCalled();
  });

  test('should allow to bulk action on filtered notes', async () => {
    const deleteByFilter = jest.fn().mockResolvedValue({
      foo: 'bar',
    });

    const exportByFilter = jest.fn().mockResolvedValue({
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

    const defaultSettingfilter = Filter.fromString('foo=bar');
    store.dispatch(loadingActions.success({rowsperpage: {value: '2'}}));
    store.dispatch(
      defaultFilterLoadingActions.success('note', defaultSettingfilter),
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

    const selectFields = screen.getAllByTestId('select-open-button');
    fireEvent.click(selectFields[1]);

    const selectItems = screen.getAllByTestId('select-item');
    fireEvent.click(selectItems[2]);

    await wait();

    const selected = screen.getAllByTestId('select-selected-value');
    expect(selected[1]).toHaveTextContent('Apply to all filtered');

    // export all filtered notes
    const exportIcon = screen.getAllByTitle('Export all filtered');

    expect(exportIcon[0]).toBeInTheDocument();
    fireEvent.click(exportIcon[0]);

    await wait();

    expect(exportByFilter).toHaveBeenCalled();

    // move all filtered notes to trashcan
    const deleteIcon = screen.getAllByTitle('Move all filtered to trashcan');

    expect(deleteIcon[0]).toBeInTheDocument();
    fireEvent.click(deleteIcon[0]);

    await wait();

    expect(deleteByFilter).toHaveBeenCalled();
  });
});

describe('NotesPage ToolBarIcons test', () => {
  test('should render', () => {
    const handleNoteCreateClick = jest.fn();

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

    expect(screen.getAllByTitle('Help: Notes')[0]).toBeInTheDocument();
    expect(links[0]).toHaveAttribute(
      'href',
      'test/en/reports.html#managing-notes',
    );
  });

  test('should call click handlers', () => {
    const handleNoteCreateClick = jest.fn();

    const gmp = {
      settings: {manualUrl},
    };

    const {render} = rendererWith({
      gmp,
      capabilities: caps,
      router: true,
    });

    render(<ToolBarIcons onNoteCreateClick={handleNoteCreateClick} />);

    const newIcon = screen.getAllByTitle('New Note');

    expect(newIcon[0]).toBeInTheDocument();

    fireEvent.click(newIcon[0]);
    expect(handleNoteCreateClick).toHaveBeenCalled();
  });

  test('should not show icons if user does not have the right permissions', () => {
    const handleNoteCreateClick = jest.fn();

    const gmp = {
      settings: {manualUrl},
    };

    const {render} = rendererWith({
      gmp,
      capabilities: wrongCaps,
      router: true,
    });

    const {queryAllByTestId} = render(
      <ToolBarIcons onNoteCreateClick={handleNoteCreateClick} />,
    );

    const icons = queryAllByTestId('svg-icon'); // this test is probably approppriate to keep in the old format
    expect(icons.length).toBe(1);
    expect(icons[0]).toHaveAttribute('title', 'Help: Notes');
  });
});
