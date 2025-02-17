/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import Capabilities from 'gmp/capabilities/capabilities';
import CollectionCounts from 'gmp/collection/collectioncounts';
import Filter from 'gmp/models/filter';
import Schedule from 'gmp/models/schedule';
import {
  clickElement,
  getCheckBoxes,
  getPowerFilter,
  getSelectElement,
  getSelectItemElementsForSelect,
  getTableBody,
  getTableFooter,
  getTextInputs,
  testBulkTrashcanDialog,
} from 'web/components/testing';
import {entitiesLoadingActions} from 'web/store/entities/schedules';
import {setTimezone, setUsername} from 'web/store/usersettings/actions';
import {defaultFilterLoadingActions} from 'web/store/usersettings/defaultfilters/actions';
import {loadingActions} from 'web/store/usersettings/defaults/actions';
import {rendererWith, fireEvent, screen, wait} from 'web/utils/testing';

import SchedulePage, {ToolBarIcons} from '../listpage';

const schedule = Schedule.fromElement({
  comment: 'hello world',
  creation_time: '2020-12-23T14:14:11Z',
  icalendar:
    'BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//Greenbone.net//NONSGML Greenbone Security Manager \n 21.4.0~dev1~git-5f8b6cf-master//EN\nBEGIN:VEVENT\nDTSTART:20210104T115400Z\nDURATION:PT0S\nUID:foo\nDTSTAMP:20210111T134141Z\nEND:VEVENT\nEND:VCALENDAR',
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

const currentSettings = testing.fn().mockResolvedValue({
  foo: 'bar',
});

const getSetting = testing.fn().mockResolvedValue({
  filter: null,
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

const getSchedules = testing.fn().mockResolvedValue({
  data: [schedule],
  meta: {
    filter: Filter.fromString(),
    counts: new CollectionCounts(),
  },
});

const renewSession = testing.fn().mockResolvedValue({
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

    const defaultSettingFilter = Filter.fromString('foo=bar');
    store.dispatch(loadingActions.success({rowsperpage: {value: '2'}}));
    store.dispatch(
      defaultFilterLoadingActions.success('schedule', defaultSettingFilter),
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

    await wait();

    const powerFilter = getPowerFilter();
    const select = getSelectElement(powerFilter);
    const inputs = getTextInputs(powerFilter);

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
    expect(select).toHaveAttribute('title', 'Loaded filter');
    expect(select).toHaveValue('--');

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
    const deleteByFilter = testing.fn().mockResolvedValue({
      foo: 'bar',
    });

    const exportByFilter = testing.fn().mockResolvedValue({
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

    const defaultSettingFilter = Filter.fromString('foo=bar');
    store.dispatch(loadingActions.success({rowsperpage: {value: '2'}}));
    store.dispatch(
      defaultFilterLoadingActions.success('schedule', defaultSettingFilter),
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

    // export page contents
    const exportIcon = screen.getAllByTitle('Export page contents')[0];
    await clickElement(exportIcon);
    expect(exportByFilter).toHaveBeenCalled();

    // move page contents to trashcan
    const deleteIcon = screen.getAllByTitle(
      'Move page contents to trashcan',
    )[0];
    await clickElement(deleteIcon);
    testBulkTrashcanDialog(screen, deleteByFilter);
  });

  test('should allow to bulk action on selected schedules', async () => {
    const deleteByIds = testing.fn().mockResolvedValue({
      foo: 'bar',
    });

    const exportByIds = testing.fn().mockResolvedValue({
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

    const defaultSettingFilter = Filter.fromString('foo=bar');
    store.dispatch(loadingActions.success({rowsperpage: {value: '2'}}));
    store.dispatch(
      defaultFilterLoadingActions.success('schedule', defaultSettingFilter),
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

    // change to apply to selection
    const tableFooter = getTableFooter();
    const select = getSelectElement(tableFooter);
    const selectItems = await getSelectItemElementsForSelect(select);
    await clickElement(selectItems[1]);
    expect(select).toHaveValue('Apply to selection');

    // select an schedule
    const tableBody = getTableBody();
    const inputs = getCheckBoxes(tableBody);
    await clickElement(inputs[1]);

    // export selected schedule
    const exportIcon = screen.getAllByTitle('Export selection')[0];
    await clickElement(exportIcon);
    expect(exportByIds).toHaveBeenCalled();

    // move selected schedule to trashcan
    const deleteIcon = screen.getAllByTitle('Move selection to trashcan')[0];
    await clickElement(deleteIcon);
    testBulkTrashcanDialog(screen, deleteByIds);
  });

  test('should allow to bulk action on filtered schedules', async () => {
    const deleteByFilter = testing.fn().mockResolvedValue({
      foo: 'bar',
    });

    const exportByFilter = testing.fn().mockResolvedValue({
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

    const defaultSettingFilter = Filter.fromString('foo=bar');
    store.dispatch(loadingActions.success({rowsperpage: {value: '2'}}));
    store.dispatch(
      defaultFilterLoadingActions.success('schedule', defaultSettingFilter),
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

    // change to all filtered
    const tableFooter = getTableFooter();
    const select = getSelectElement(tableFooter);
    const selectItems = await getSelectItemElementsForSelect(select);
    await clickElement(selectItems[2]);
    expect(select).toHaveValue('Apply to all filtered');

    // export all filtered schedules
    const exportIcon = screen.getAllByTitle('Export all filtered')[0];
    await clickElement(exportIcon);
    expect(exportByFilter).toHaveBeenCalled();

    // move all filtered schedules to trashcan
    const deleteIcon = screen.getAllByTitle('Move all filtered to trashcan')[0];
    await clickElement(deleteIcon);
    testBulkTrashcanDialog(screen, deleteByFilter);
  });
});

describe('SchedulePage ToolBarIcons test', () => {
  test('should render', () => {
    const handleScheduleCreateClick = testing.fn();

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
    const handleScheduleCreateClick = testing.fn();

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
    const handleScheduleCreateClick = testing.fn();

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

    const icons = queryAllByTestId('svg-icon'); // this test is probably appropriate to keep in the old format
    expect(icons.length).toBe(1);
    expect(icons[0]).toHaveAttribute('title', 'Help: Schedules');
  });
});
