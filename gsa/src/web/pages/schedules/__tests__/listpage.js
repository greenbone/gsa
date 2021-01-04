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
import {act} from 'react-dom/test-utils';

import {setLocale} from 'gmp/locale/lang';

import Capabilities from 'gmp/capabilities/capabilities';
import CollectionCounts from 'gmp/collection/collectioncounts';

import Filter from 'gmp/models/filter';
import Schedule from 'gmp/models/schedule';

import {setTimezone, setUsername} from 'web/store/usersettings/actions';

import {entitiesLoadingActions} from 'web/store/entities/schedules';
import {loadingActions} from 'web/store/usersettings/defaults/actions';
import {defaultFilterLoadingActions} from 'web/store/usersettings/defaultfilters/actions';

import {rendererWith, waitFor, fireEvent} from 'web/utils/testing';

import SchedulePage, {ToolBarIcons} from '../listpage';

setLocale('en');

window.URL.createObjectURL = jest.fn();

const schedule = Schedule.fromElement({
  comment: 'hello world',
  creation_time: '2020-12-23T14:14:11Z',
  icalendar: `BEGIN:VCALENDAR VERSION:2.0
    PRODID:-//Greenbone.net//NONSGML Greenbone Security Manager 
     21.4.0~dev1~git-0f6ee4c-master//EN
    BEGIN:VEVENT
    DTSTART:20201223T150000Z
    DURATION:PT0S
    UID:6e5ebd05-87e5-4478-b9cf-756246bd772a
    DTSTAMP:20201223T141420Z
    END:VEVENT
    END:VCALENDAR
    `,
  in_use: 0,
  modification_time: '2020-12-23T14:14:21Z',
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
  });

  test('should call commands for bulk actions', async () => {
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

    const {baseElement, getAllByTestId} = render(<SchedulePage />);

    await waitFor(() => baseElement.querySelectorAll('table'));

    const icons = getAllByTestId('svg-icon');

    await act(async () => {
      expect(icons[18]).toHaveAttribute(
        'title',
        'Move page contents to trashcan',
      );
      fireEvent.click(icons[18]);
      expect(deleteByFilter).toHaveBeenCalled();

      expect(icons[19]).toHaveAttribute('title', 'Export page contents');
      fireEvent.click(icons[19]);
      expect(exportByFilter).toHaveBeenCalled();
    });
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
