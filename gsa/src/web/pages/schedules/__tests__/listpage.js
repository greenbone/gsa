/* Copyright (C) 2019-2020 Greenbone Networks GmbH
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
import Schedule from 'gmp/models/schedule';

import {entitiesLoadingActions} from 'web/store/entities/schedules';

import {setTimezone, setUsername} from 'web/store/usersettings/actions';
import {defaultFilterLoadingActions} from 'web/store/usersettings/defaultfilters/actions';
import {loadingActions} from 'web/store/usersettings/defaults/actions';

import {
  rendererWith,
  waitFor,
  fireEvent,
  screen,
  wait,
} from 'web/utils/testing';

import SchedulePage, {ToolBarIcons} from '../listpage';

setLocale('en');

window.URL.createObjectURL = jest.fn();

const schedule = Schedule.fromElement({
  comment: 'hello world',
  creation_time: '2020-12-23T14:14:11Z',
  icalendar:
    'BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//Greenbone.net//NONSGML Greenbone Security Manager \n 21.04+alpha~git-bb97c86-master//EN\nBEGIN:VEVENT\nDTSTART:20210104T115400Z\nDURATION:PT0S\nRRULE:FREQ=WEEKLY\nUID:3dfd6e6f-4e79-4f18-a5c2-adb3fca56bd3\nDTSTAMP:20210104T115412Z\nEND:VEVENT\nEND:VCALENDAR\n',
  in_use: 0,
  modification_time: '2021-01-04T11:54:12Z',
  name: 'schedule 1',
  owner: {name: 'admin'},
  permissions: {permission: {name: 'Everything'}},
  timezone: 'UTC',
  writable: 1,
  _id: '41fc25b4-fc21-4b81-ab30-35c95adc032a',
});

const caps = new Capabilities(['everything']);
const wrongCaps = new Capabilities(['get_config']);

const reloadInterval = -1;
const manualUrl = 'test/';

const currentSettings = jest.fn().mockResolvedValue({
  foo: 'bar',
});

const getSetting = jest.fn().mockResolvedValue({
  filter: null,
});

const getFilters = jest.fn().mockReturnValue(
  Promise.resolve({
    data: [],
    meta: {
      filter: Filter.fromString(),
      counts: new CollectionCounts(),
    },
  }),
);

const getSchedules = jest.fn().mockResolvedValue({
  data: [schedule],
  meta: {
    filter: Filter.fromString(),
    counts: new CollectionCounts(),
  },
});

const renewSession = jest.fn().mockResolvedValue({
  foo: 'bar',
});

describe('SchedulePage tests', () => {
  test('should render full SchedulePage', async () => {
    const gmp = {
      schedules: {
        get: getSchedules,
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
      defaultFilterLoadingActions.success('schedule', defaultSettingfilter),
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
      entitiesLoadingActions.success([schedule], filter, loadedFilter, counts),
    );

    const {baseElement} = render(<SchedulePage />);

    await waitFor(() => baseElement.querySelectorAll('table'));

    expect(baseElement).toMatchSnapshot();

    const icons = screen.getAllByTestId('svg-icon');
    const inputs = baseElement.querySelectorAll('input');
    const selects = screen.getAllByTestId('select-selected-value');

    // Toolbar Icons
    expect(icons[0]).toHaveAttribute('title', 'Help: Schedules');
    expect(icons[1]).toHaveTextContent('new.svg');

    // Powerfilter
    expect(inputs[0]).toHaveAttribute('name', 'userFilterString');
    expect(icons[2]).toHaveAttribute('title', 'Update Filter');
    expect(icons[3]).toHaveAttribute('title', 'Remove Filter');
    expect(icons[4]).toHaveAttribute('title', 'Reset to Default Filter');
    expect(icons[5]).toHaveAttribute('title', 'Help: Powerfilter');
    expect(icons[6]).toHaveAttribute('title', 'Edit Filter');
    expect(selects[0]).toHaveAttribute('title', 'Loaded filter');
    expect(selects[0]).toHaveTextContent('--');

    // Table
    const header = baseElement.querySelectorAll('th');

    expect(header[0]).toHaveTextContent('Name');
    expect(header[1]).toHaveTextContent('First Run');
    expect(header[2]).toHaveTextContent('Next Run');
    expect(header[3]).toHaveTextContent('Recurrence');
    expect(header[4]).toHaveTextContent('Duration');
    expect(header[5]).toHaveTextContent('Actions');

    const row = baseElement.querySelectorAll('tr');

    expect(row[1]).toHaveTextContent('schedule 1');
    expect(row[1]).toHaveTextContent('(hello world)');
    expect(row[1]).toHaveTextContent('Mon, Jan 4, 2021 11:54 AM UTC');
    expect(row[1]).toHaveTextContent('Mon, Jan 11, 2021 11:54 AM UTC');
    expect(row[1]).toHaveTextContent('Entire Operation');

    expect(icons[13]).toHaveAttribute('title', 'Move Schedule to trashcan');
    expect(icons[14]).toHaveAttribute('title', 'Edit Schedule');
    expect(icons[15]).toHaveAttribute('title', 'Clone Schedule');
    expect(icons[16]).toHaveAttribute('title', 'Export Schedule');
  });
  test('should allow to bulk action on page contents', async () => {
    const deleteByFilter = jest.fn().mockResolvedValue({
      foo: 'bar',
    });

    const exportByFilter = jest.fn().mockResolvedValue({
      foo: 'bar',
    });

    const gmp = {
      schedules: {
        get: getSchedules,
        deleteByFilter,
        exportByFilter,
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
      defaultFilterLoadingActions.success('schedule', defaultSettingfilter),
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
      entitiesLoadingActions.success([schedule], filter, loadedFilter, counts),
    );

    render(<SchedulePage />);

    await wait();

    const icons = screen.getAllByTestId('svg-icon');

    // export page contents
    expect(icons[19]).toHaveAttribute('title', 'Export page contents');
    fireEvent.click(icons[19]);

    await wait();

    expect(exportByFilter).toHaveBeenCalled();

    // move page contents to trashcan
    expect(icons[18]).toHaveAttribute(
      'title',
      'Move page contents to trashcan',
    );
    fireEvent.click(icons[18]);

    await wait();

    expect(deleteByFilter).toHaveBeenCalled();
  });

  test('should allow to bulk action on selected schedules', async () => {
    const deleteByIds = jest.fn().mockResolvedValue({
      foo: 'bar',
    });

    const exportByIds = jest.fn().mockResolvedValue({
      foo: 'bar',
    });

    const gmp = {
      schedules: {
        get: getSchedules,
        delete: deleteByIds,
        export: exportByIds,
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
      defaultFilterLoadingActions.success('schedule', defaultSettingfilter),
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
      entitiesLoadingActions.success([schedule], filter, loadedFilter, counts),
    );

    const {element} = render(<SchedulePage />);

    await wait();

    const selectFields = screen.getAllByTestId('select-open-button');
    fireEvent.click(selectFields[1]);

    const selectItems = screen.getAllByTestId('select-item');
    fireEvent.click(selectItems[1]);

    const selected = screen.getAllByTestId('select-selected-value');
    expect(selected[1]).toHaveTextContent('Apply to selection');

    const inputs = element.querySelectorAll('input');

    // select an schedule
    fireEvent.click(inputs[1]);
    await wait();

    const icons = screen.getAllByTestId('svg-icon');

    // export selected schedule
    expect(icons[15]).toHaveAttribute('title', 'Export selection');
    fireEvent.click(icons[15]);

    await wait();

    expect(exportByIds).toHaveBeenCalled();

    // move selected schedule to trashcan
    expect(icons[14]).toHaveAttribute('title', 'Move selection to trashcan');
    fireEvent.click(icons[14]);

    await wait();

    expect(deleteByIds).toHaveBeenCalled();
  });

  test('should allow to bulk action on filtered schedules', async () => {
    const deleteByFilter = jest.fn().mockResolvedValue({
      foo: 'bar',
    });

    const exportByFilter = jest.fn().mockResolvedValue({
      foo: 'bar',
    });

    const gmp = {
      schedules: {
        get: getSchedules,
        deleteByFilter,
        exportByFilter,
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
      defaultFilterLoadingActions.success('schedule', defaultSettingfilter),
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
      entitiesLoadingActions.success([schedule], filter, loadedFilter, counts),
    );

    render(<SchedulePage />);

    await wait();

    const selectFields = screen.getAllByTestId('select-open-button');
    fireEvent.click(selectFields[1]);

    const selectItems = screen.getAllByTestId('select-item');
    fireEvent.click(selectItems[2]);

    await wait();

    const selected = screen.getAllByTestId('select-selected-value');
    expect(selected[1]).toHaveTextContent('Apply to all filtered');

    const icons = screen.getAllByTestId('svg-icon');

    // export all filtered schedules
    expect(icons[19]).toHaveAttribute('title', 'Export all filtered');
    fireEvent.click(icons[19]);

    await wait();

    expect(exportByFilter).toHaveBeenCalled();

    // move all filtered schedules to trashcan
    expect(icons[18]).toHaveAttribute('title', 'Move all filtered to trashcan');
    fireEvent.click(icons[18]);

    await wait();

    expect(deleteByFilter).toHaveBeenCalled();
  });
});

describe('SchedulePage ToolBarIcons test', () => {
  test('should render', () => {
    const handleScheduleCreateClick = jest.fn();

    const gmp = {
      settings: {manualUrl},
    };

    const {render} = rendererWith({
      gmp,
      capabilities: caps,
      router: true,
    });

    const {element, getAllByTestId} = render(
      <ToolBarIcons onScheduleCreateClick={handleScheduleCreateClick} />,
    );
    expect(element).toMatchSnapshot();

    const icons = getAllByTestId('svg-icon');
    const links = element.querySelectorAll('a');

    expect(icons[0]).toHaveAttribute('title', 'Help: Schedules');
    expect(links[0]).toHaveAttribute(
      'href',
      'test/en/scanning.html#managing-schedules',
    );
  });

  test('should call click handlers', () => {
    const handleScheduleCreateClick = jest.fn();

    const gmp = {
      settings: {manualUrl},
    };

    const {render} = rendererWith({
      gmp,
      capabilities: caps,
      router: true,
    });

    const {getAllByTestId} = render(
      <ToolBarIcons onScheduleCreateClick={handleScheduleCreateClick} />,
    );

    const icons = getAllByTestId('svg-icon');

    fireEvent.click(icons[1]);
    expect(handleScheduleCreateClick).toHaveBeenCalled();
    expect(icons[1]).toHaveAttribute('title', 'New Schedule');
  });

  test('should not show icons if user does not have the right permissions', () => {
    const handleScheduleCreateClick = jest.fn();

    const gmp = {
      settings: {manualUrl},
    };

    const {render} = rendererWith({
      gmp,
      capabilities: wrongCaps,
      router: true,
    });

    const {queryAllByTestId} = render(
      <ToolBarIcons onScheduleCreateClick={handleScheduleCreateClick} />,
    );

    const icons = queryAllByTestId('svg-icon');
    expect(icons.length).toBe(1);
    expect(icons[0]).toHaveAttribute('title', 'Help: Schedules');
  });
});
