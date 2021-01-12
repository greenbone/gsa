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

import {
  createDeleteSchedulesByFilterQueryMock,
  createDeleteSchedulesByIdsQueryMock,
  createExportSchedulesByFilterQueryMock,
  createExportSchedulesByIdsQueryMock,
  createGetSchedulesQueryMock,
} from 'web/graphql/__mocks__/schedules';

import {setTimezone, setUsername} from 'web/store/usersettings/actions';
import {defaultFilterLoadingActions} from 'web/store/usersettings/defaultfilters/actions';
import {loadingActions} from 'web/store/usersettings/defaults/actions';

import {rendererWith, fireEvent, screen, wait} from 'web/utils/testing';

import SchedulePage, {ToolBarIcons} from '../listpage';

setLocale('en');

window.URL.createObjectURL = jest.fn();

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

const renewSession = jest.fn().mockResolvedValue({
  foo: 'bar',
});

describe('SchedulePage tests', () => {
  test('should render full SchedulePage', async () => {
    const gmp = {
      filters: {
        get: getFilters,
      },
      settings: {manualUrl, reloadInterval},
      user: {currentSettings, getSetting},
    };

    const [mock, resultFunc] = createGetSchedulesQueryMock({
      filterString: 'foo=bar rows=2',
      first: 2,
    });

    const {render, store} = rendererWith({
      gmp,
      capabilities: true,
      store: true,
      router: true,
      queryMocks: [mock],
    });

    store.dispatch(setTimezone('CET'));
    store.dispatch(setUsername('admin'));

    const defaultSettingfilter = Filter.fromString('foo=bar');
    store.dispatch(loadingActions.success({rowsperpage: {value: '2'}}));
    store.dispatch(
      defaultFilterLoadingActions.success('schedule', defaultSettingfilter),
    );

    const {baseElement} = render(<SchedulePage />);

    await wait();

    expect(resultFunc).toHaveBeenCalled();

    const inputs = baseElement.querySelectorAll('input');
    const selects = screen.getAllByTestId('select-selected-value');

    // Toolbar Icons
    expect(screen.getAllByTitle('Help: Schedules')[0]).toBeInTheDocument();
    expect(screen.getAllByTitle('New Schedule')[0]).toBeInTheDocument();

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
    expect(row[1]).toHaveTextContent('-');
    expect(row[1]).toHaveTextContent('Entire Operation');

    expect(
      screen.getAllByTitle('Move Schedule to trashcan')[0],
    ).toBeInTheDocument();
    expect(screen.getAllByTitle('Edit Schedule')[0]).toBeInTheDocument();
    expect(screen.getAllByTitle('Clone Schedule')[0]).toBeInTheDocument();
    expect(screen.getAllByTitle('Export Schedule')[0]).toBeInTheDocument();
  });
  test('should allow to bulk action on page contents', async () => {
    const gmp = {
      filters: {
        get: getFilters,
      },
      settings: {manualUrl, reloadInterval},
      user: {renewSession, currentSettings, getSetting: getSetting},
    };

    const [mock, resultFunc] = createGetSchedulesQueryMock({
      filterString: 'foo=bar rows=2',
      first: 2,
    });

    const [exportMock, exportResult] = createExportSchedulesByIdsQueryMock([
      'foo',
    ]);
    const [deleteMock, deleteResult] = createDeleteSchedulesByIdsQueryMock([
      'foo',
    ]);

    const {render, store} = rendererWith({
      gmp,
      capabilities: true,
      store: true,
      router: true,
      queryMocks: [mock, exportMock, deleteMock],
    });

    store.dispatch(setTimezone('CET'));
    store.dispatch(setUsername('admin'));

    const defaultSettingfilter = Filter.fromString('foo=bar');
    store.dispatch(loadingActions.success({rowsperpage: {value: '2'}}));
    store.dispatch(
      defaultFilterLoadingActions.success('schedule', defaultSettingfilter),
    );

    render(<SchedulePage />);

    await wait();

    expect(resultFunc).toHaveBeenCalled();
    // export page contents
    const exportIcon = screen.getAllByTitle('Export page contents');

    expect(exportIcon[0]).toBeInTheDocument();
    fireEvent.click(exportIcon[0]);

    await wait();

    expect(exportResult).toHaveBeenCalled();

    // move page contents to trashcan
    const deleteIcon = screen.getAllByTitle('Move page contents to trashcan');

    expect(deleteIcon[0]).toBeInTheDocument();
    fireEvent.click(deleteIcon[0]);

    await wait();

    expect(deleteResult).toHaveBeenCalled();
  });

  test('should allow to bulk action on selected schedules', async () => {
    const gmp = {
      filters: {
        get: getFilters,
      },
      settings: {manualUrl, reloadInterval},
      user: {renewSession, currentSettings, getSetting: getSetting},
    };

    const [mock, resultFunc] = createGetSchedulesQueryMock({
      filterString: 'foo=bar rows=2',
      first: 2,
    });

    const [exportMock, exportResult] = createExportSchedulesByIdsQueryMock([
      'foo',
    ]);
    const [deleteMock, deleteResult] = createDeleteSchedulesByIdsQueryMock([
      'foo',
    ]);

    const {render, store} = rendererWith({
      gmp,
      capabilities: true,
      store: true,
      router: true,
      queryMocks: [mock, exportMock, deleteMock],
    });

    store.dispatch(setTimezone('CET'));
    store.dispatch(setUsername('admin'));

    const defaultSettingfilter = Filter.fromString('foo=bar');
    store.dispatch(loadingActions.success({rowsperpage: {value: '2'}}));
    store.dispatch(
      defaultFilterLoadingActions.success('schedule', defaultSettingfilter),
    );

    const {element} = render(<SchedulePage />);

    await wait();

    expect(resultFunc).toHaveBeenCalled();

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

    // export selected schedule
    const exportIcon = screen.getAllByTitle('Export selection');

    expect(exportIcon[0]).toBeInTheDocument();
    fireEvent.click(exportIcon[0]);

    await wait();

    expect(exportResult).toHaveBeenCalled();

    // move selected schedule to trashcan
    const deleteIcon = screen.getAllByTitle('Move selection to trashcan');

    expect(deleteIcon[0]).toBeInTheDocument();
    fireEvent.click(deleteIcon[0]);

    await wait();

    expect(deleteResult).toHaveBeenCalled();
  });

  test('should allow to bulk action on filtered schedules', async () => {
    const gmp = {
      filters: {
        get: getFilters,
      },
      settings: {manualUrl, reloadInterval},
      user: {renewSession, currentSettings, getSetting: getSetting},
    };

    const [mock, resultFunc] = createGetSchedulesQueryMock({
      filterString: 'foo=bar rows=2',
      first: 2,
    });

    const [exportMock, exportResult] = createExportSchedulesByFilterQueryMock(
      'foo=bar rows=-1 first=1',
    );
    const [deleteMock, deleteResult] = createDeleteSchedulesByFilterQueryMock(
      'foo=bar rows=-1 first=1',
    );

    const {render, store} = rendererWith({
      gmp,
      capabilities: true,
      store: true,
      router: true,
      queryMocks: [mock, exportMock, deleteMock],
    });

    store.dispatch(setTimezone('CET'));
    store.dispatch(setUsername('admin'));

    const defaultSettingfilter = Filter.fromString('foo=bar');
    store.dispatch(loadingActions.success({rowsperpage: {value: '2'}}));
    store.dispatch(
      defaultFilterLoadingActions.success('schedule', defaultSettingfilter),
    );

    render(<SchedulePage />);

    await wait();

    expect(resultFunc).toHaveBeenCalled();

    const selectFields = screen.getAllByTestId('select-open-button');
    fireEvent.click(selectFields[1]);

    const selectItems = screen.getAllByTestId('select-item');
    fireEvent.click(selectItems[2]);

    await wait();

    const selected = screen.getAllByTestId('select-selected-value');
    expect(selected[1]).toHaveTextContent('Apply to all filtered');

    // export all filtered schedules
    const exportIcon = screen.getAllByTitle('Export all filtered');

    expect(exportIcon[0]).toBeInTheDocument();
    fireEvent.click(exportIcon[0]);

    await wait();

    expect(exportResult).toHaveBeenCalled();

    // move all filtered schedules to trashcan
    const deleteIcon = screen.getAllByTitle('Move all filtered to trashcan');

    expect(deleteIcon[0]).toBeInTheDocument();
    fireEvent.click(deleteIcon[0]);

    await wait();

    expect(deleteResult).toHaveBeenCalled();
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

    const {element} = render(
      <ToolBarIcons onScheduleCreateClick={handleScheduleCreateClick} />,
    );

    const links = element.querySelectorAll('a');

    expect(screen.getAllByTitle('Help: Schedules')[0]).toBeInTheDocument();
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

    render(<ToolBarIcons onScheduleCreateClick={handleScheduleCreateClick} />);

    const newIcon = screen.getAllByTitle('New Schedule');

    expect(newIcon[0]).toBeInTheDocument();

    fireEvent.click(newIcon[0]);
    expect(handleScheduleCreateClick).toHaveBeenCalled();
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

    const icons = queryAllByTestId('svg-icon'); // this test is probably approppriate to keep in the old format
    expect(icons.length).toBe(1);
    expect(icons[0]).toHaveAttribute('title', 'Help: Schedules');
  });
});
