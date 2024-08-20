/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';

import Capabilities from 'gmp/capabilities/capabilities';
import CollectionCounts from 'gmp/collection/collectioncounts';

import Filter from 'gmp/models/filter';
import Alert from 'gmp/models/alert';

import {setTimezone, setUsername} from 'web/store/usersettings/actions';

import {entitiesLoadingActions} from 'web/store/entities/alerts';
import {loadingActions} from 'web/store/usersettings/defaults/actions';
import {defaultFilterLoadingActions} from 'web/store/usersettings/defaultfilters/actions';

import {rendererWith, fireEvent, screen, wait} from 'web/utils/testing';

import AlertPage, {ToolBarIcons} from '../listpage';
import {
  clickElement,
  getBulkActionItems,
  getCheckBoxes,
  getPowerFilter,
  getSelectElement,
  getSelectElements,
  getSelectItemElementsForSelect,
  getTableBody,
  getTableFooter,
  getTextInputs,
} from 'web/components/testing';

const caps = new Capabilities(['everything']);
const wrongCaps = new Capabilities(['get_config']);

const reloadInterval = -1;
const manualUrl = 'test/';

const alert = Alert.fromElement({
  _id: '1234',
  owner: {name: 'admin'},
  name: 'foo',
  comment: 'bar',
  permissions: {permission: [{name: 'everything'}]},
  active: 1,
  condition: 'Always',
  event: {
    data: {
      name: 'status',
      __text: 'Done',
    },
    __text: 'Task run status changed',
  },
  filter: {
    _id: 'filter id',
    name: 'report results filter',
  },
  method: {
    __text: 'SMB',
  },
});

let getAlerts;
let getFilters;
let getSetting;
let currentSettings;
let renewSession;

beforeEach(() => {
  getAlerts = testing.fn().mockResolvedValue({
    data: [alert],
    meta: {
      filter: Filter.fromString(),
      counts: new CollectionCounts(),
    },
  });

  getFilters = testing.fn().mockReturnValue(
    Promise.resolve({
      data: [],
      meta: {
        filter: Filter.fromString(),
        counts: new CollectionCounts(),
      },
    }),
  );

  getSetting = testing.fn().mockResolvedValue({
    filter: null,
  });

  currentSettings = testing.fn().mockResolvedValue({
    foo: 'bar',
  });

  renewSession = testing.fn().mockResolvedValue({
    foo: 'bar',
  });
});

describe('Alert listpage tests', () => {
  test('should render full alert listpage', async () => {
    const gmp = {
      alerts: {
        get: getAlerts,
      },
      filters: {
        get: getFilters,
      },
      settings: {manualUrl, reloadInterval},
      user: {currentSettings},
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
      defaultFilterLoadingActions.success('alert', defaultSettingFilter),
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
      entitiesLoadingActions.success([alert], filter, loadedFilter, counts),
    );

    const {baseElement} = render(<AlertPage />);

    await wait();

    const icons = screen.getAllByTestId('svg-icon');
    const powerFilter = getPowerFilter();
    const selects = getSelectElements(powerFilter);
    const inputs = getTextInputs(powerFilter);

    // Toolbar Icons
    expect(icons[0]).toHaveAttribute('title', 'Help: Alerts');

    // Powerfilter
    expect(inputs[0]).toHaveAttribute('name', 'userFilterString');
    expect(icons[2]).toHaveAttribute('title', 'Update Filter');
    expect(icons[3]).toHaveAttribute('title', 'Remove Filter');
    expect(icons[4]).toHaveAttribute('title', 'Reset to Default Filter');
    expect(icons[5]).toHaveAttribute('title', 'Help: Powerfilter');
    expect(icons[6]).toHaveAttribute('title', 'Edit Filter');

    expect(selects[0]).toHaveAttribute('title', 'Loaded filter');
    expect(selects[0]).toHaveValue('--');

    // Table
    const header = baseElement.querySelectorAll('th');

    expect(header[0]).toHaveTextContent('Name');
    expect(header[1]).toHaveTextContent('Event');
    expect(header[2]).toHaveTextContent('Condition');
    expect(header[3]).toHaveTextContent('Method');
    expect(header[4]).toHaveTextContent('Filter');
    expect(header[5]).toHaveTextContent('Active');
    expect(header[6]).toHaveTextContent('Actions');

    const row = baseElement.querySelectorAll('tr');

    expect(row[1]).toHaveTextContent('foo');
    expect(row[1]).toHaveTextContent('(bar)');
    expect(row[1]).toHaveTextContent('Task run status changed to Done');
    expect(row[1]).toHaveTextContent('Always');
    expect(row[1]).toHaveTextContent('SMB');
    expect(row[1]).toHaveTextContent('report results filter');
    expect(row[1]).toHaveTextContent('Yes');

    expect(icons[13]).toHaveAttribute('title', 'Move Alert to trashcan');
    expect(icons[14]).toHaveAttribute('title', 'Edit Alert');
    expect(icons[15]).toHaveAttribute('title', 'Clone Alert');
    expect(icons[16]).toHaveAttribute('title', 'Export Alert');
    expect(icons[17]).toHaveAttribute('title', 'Test Alert');
  });

  test('should allow to bulk action on page contents', async () => {
    const deleteByFilter = testing.fn().mockResolvedValue({
      foo: 'bar',
    });

    const exportByFilter = testing.fn().mockResolvedValue({
      foo: 'bar',
    });

    const gmp = {
      alerts: {
        get: getAlerts,
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
      defaultFilterLoadingActions.success('alert', defaultSettingFilter),
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
      entitiesLoadingActions.success([alert], filter, loadedFilter, counts),
    );

    render(<AlertPage />);

    await wait();

    const icons = getBulkActionItems();

    // export page contents
    expect(exportByFilter).not.toHaveBeenCalled();
    expect(icons[2]).toHaveAttribute('title', 'Export page contents');
    await clickElement(icons[2]);
    expect(exportByFilter).toHaveBeenCalled();

    // move page contents to trashcan
    expect(deleteByFilter).not.toHaveBeenCalled();
    expect(icons[1]).toHaveAttribute('title', 'Move page contents to trashcan');
    await clickElement(icons[1]);
    expect(deleteByFilter).toHaveBeenCalled();
  });

  test('should allow to bulk action on selected alerts', async () => {
    const deleteByIds = testing.fn().mockResolvedValue({
      foo: 'bar',
    });

    const exportByIds = testing.fn().mockResolvedValue({
      foo: 'bar',
    });

    const gmp = {
      alerts: {
        get: getAlerts,
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
      defaultFilterLoadingActions.success('alert', defaultSettingFilter),
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
      entitiesLoadingActions.success([alert], filter, loadedFilter, counts),
    );

    render(<AlertPage />);

    await wait();

    // change bulk action to apply to selection
    const tableFooter = getTableFooter();
    const selectElement = getSelectElement(tableFooter);
    const selectItems = await getSelectItemElementsForSelect(selectElement);
    await clickElement(selectItems[1]);
    expect(selectElement).toHaveValue('Apply to selection');

    // select an alert
    const tableBody = getTableBody();
    const inputs = getCheckBoxes(tableBody);
    await clickElement(inputs[1]);

    // export selected alert
    expect(exportByIds).not.toHaveBeenCalled();
    const icons = getBulkActionItems();
    expect(icons[2]).toHaveAttribute('title', 'Export selection');
    await clickElement(icons[2]);
    expect(exportByIds).toHaveBeenCalled();

    // move selected alert to trashcan
    expect(deleteByIds).not.toHaveBeenCalled();
    expect(icons[1]).toHaveAttribute('title', 'Move selection to trashcan');
    await clickElement(icons[1]);
    expect(deleteByIds).toHaveBeenCalled();
  });

  test('should allow to bulk action on filtered alerts', async () => {
    const deleteByFilter = testing.fn().mockResolvedValue({
      foo: 'bar',
    });

    const exportByFilter = testing.fn().mockResolvedValue({
      foo: 'bar',
    });

    const gmp = {
      alerts: {
        get: getAlerts,
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
      defaultFilterLoadingActions.success('alert', defaultSettingFilter),
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
      entitiesLoadingActions.success([alert], filter, loadedFilter, counts),
    );

    render(<AlertPage />);

    await wait();

    // change bulk action to apply to all filtered
    const tableFooter = getTableFooter();
    const selectElement = getSelectElement(tableFooter);
    const selectItems = await getSelectItemElementsForSelect(selectElement);
    await clickElement(selectItems[2]);
    expect(selectElement).toHaveValue('Apply to all filtered');

    // export all filtered alerts
    expect(exportByFilter).not.toHaveBeenCalled();
    const icons = getBulkActionItems();
    expect(icons[2]).toHaveAttribute('title', 'Export all filtered');
    await clickElement(icons[2]);
    expect(exportByFilter).toHaveBeenCalled();

    // move all filtered alerts to trashcan
    expect(deleteByFilter).not.toHaveBeenCalled();
    expect(icons[1]).toHaveAttribute('title', 'Move all filtered to trashcan');
    await clickElement(icons[1]);
    expect(deleteByFilter).toHaveBeenCalled();
  });
});

describe('Alert listpage ToolBarIcons test', () => {
  test('should render', () => {
    const handleAlertCreateClick = testing.fn();

    const gmp = {
      settings: {manualUrl},
    };

    const {render} = rendererWith({
      gmp,
      capabilities: caps,
      router: true,
    });

    const {element} = render(
      <ToolBarIcons onAlertCreateClick={handleAlertCreateClick} />,
    );

    const icons = screen.getAllByTestId('svg-icon');
    const links = element.querySelectorAll('a');

    expect(icons.length).toBe(2);

    expect(icons[0]).toHaveAttribute('title', 'Help: Alerts');
    expect(links[0]).toHaveAttribute(
      'href',
      'test/en/scanning.html#managing-alerts',
    );

    expect(icons[1]).toHaveAttribute('title', 'New Alert');
  });

  test('should call click handlers', () => {
    const handleAlertCreateClick = testing.fn();

    const gmp = {
      settings: {manualUrl},
    };

    const {render} = rendererWith({
      gmp,
      capabilities: caps,
      router: true,
    });

    render(<ToolBarIcons onAlertCreateClick={handleAlertCreateClick} />);

    const icons = screen.getAllByTestId('svg-icon');

    fireEvent.click(icons[1]);
    expect(handleAlertCreateClick).toHaveBeenCalled();
    expect(icons[1]).toHaveAttribute('title', 'New Alert');
  });

  test('should not show icons if user does not have the right permissions', () => {
    const handleAlertCreateClick = testing.fn();

    const gmp = {
      settings: {manualUrl},
    };

    const {render} = rendererWith({
      gmp,
      capabilities: wrongCaps,
      router: true,
    });

    render(<ToolBarIcons onAlertCreateClick={handleAlertCreateClick} />);

    const icons = screen.getAllByTestId('svg-icon');
    expect(icons.length).toBe(1);
    expect(icons[0]).toHaveAttribute('title', 'Help: Alerts');
  });
});
