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
import Alert from 'gmp/models/alert';
import Filter from 'gmp/models/filter';
import {currentSettingsDefaultResponse} from 'web/pages/__mocks__/CurrentSettings';
import AlertPage, {ToolBarIcons} from 'web/pages/alerts/ListPage';
import {entitiesLoadingActions} from 'web/store/entities/alerts';
import {setTimezone, setUsername} from 'web/store/usersettings/actions';
import {defaultFilterLoadingActions} from 'web/store/usersettings/defaultfilters/actions';
import {loadingActions} from 'web/store/usersettings/defaults/actions';

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

  currentSettings = testing
    .fn()
    .mockResolvedValue(currentSettingsDefaultResponse);
});

describe('Alert ListPage tests', () => {
  test('should render full alert ListPage', async () => {
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

    const select = screen.getByTestId('powerfilter-select');
    const inputs = screen.queryTextInputs();

    // Toolbar Icons
    expect(screen.getByTestId('help-icon')).toHaveAttribute(
      'title',
      'Help: Alerts',
    );

    // Powerfilter
    expect(inputs[0]).toHaveAttribute('name', 'userFilterString');
    expect(select).toHaveAttribute('title', 'Loaded filter');
    expect(select).toHaveValue('--');

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
      user: {currentSettings, getSetting: getSetting},
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

    // export page contents
    const tableFooter = within(screen.queryTableFooter());
    const exportIcon = tableFooter.getByTestId('export-icon');
    expect(exportByFilter).not.toHaveBeenCalled();
    expect(exportIcon).toHaveAttribute('title', 'Export page contents');
    fireEvent.click(exportIcon);
    expect(exportByFilter).toHaveBeenCalled();

    // move page contents to trashcan
    const deleteIcon = tableFooter.getByTestId('trash-icon');
    expect(deleteByFilter).not.toHaveBeenCalled();
    expect(deleteIcon).toHaveAttribute(
      'title',
      'Move page contents to trashcan',
    );
    fireEvent.click(deleteIcon);
    testBulkTrashcanDialog(screen, deleteByFilter);
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
      user: {currentSettings, getSetting: getSetting},
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
    const tableFooter = within(screen.queryTableFooter());
    const selectElement = tableFooter.getSelectElement();
    const selectItems = await getSelectItemElementsForSelect(selectElement);
    fireEvent.click(selectItems[1]);
    expect(selectElement).toHaveValue('Apply to selection');

    // select an alert
    const tableBody = within(screen.queryTableBody());
    const inputs = tableBody.getAllCheckBoxes();
    fireEvent.click(inputs[0]);

    // export selected alert
    expect(exportByIds).not.toHaveBeenCalled();
    const exportIcon = tableFooter.getByTestId('export-icon');
    expect(exportIcon).toHaveAttribute('title', 'Export selection');
    fireEvent.click(exportIcon);
    expect(exportByIds).toHaveBeenCalled();

    // move selected alert to trashcan
    expect(deleteByIds).not.toHaveBeenCalled();
    const deleteIcon = tableFooter.getByTestId('trash-icon');
    expect(deleteIcon).toHaveAttribute('title', 'Move selection to trashcan');
    fireEvent.click(deleteIcon);
    testBulkTrashcanDialog(screen, deleteByIds);
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
      user: {currentSettings, getSetting: getSetting},
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
    const tableFooter = within(screen.queryTableFooter());
    const selectElement = tableFooter.getSelectElement();
    const selectItems = await getSelectItemElementsForSelect(selectElement);
    fireEvent.click(selectItems[2]);
    expect(selectElement).toHaveValue('Apply to all filtered');

    // export all filtered alerts
    expect(exportByFilter).not.toHaveBeenCalled();
    const exportIcon = tableFooter.getByTestId('export-icon');
    expect(exportIcon).toHaveAttribute('title', 'Export all filtered');
    fireEvent.click(exportIcon);
    expect(exportByFilter).toHaveBeenCalled();

    // move all filtered alerts to trashcan
    const deleteIcon = tableFooter.getByTestId('trash-icon');
    expect(deleteByFilter).not.toHaveBeenCalled();
    expect(deleteIcon).toHaveAttribute(
      'title',
      'Move all filtered to trashcan',
    );
    fireEvent.click(deleteIcon);
    testBulkTrashcanDialog(screen, deleteByFilter);
  });
});

describe('Alert ListPage ToolBarIcons test', () => {
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

    const links = element.querySelectorAll('a');

    expect(screen.getByTestId('help-icon')).toHaveAttribute(
      'title',
      'Help: Alerts',
    );
    expect(links[0]).toHaveAttribute(
      'href',
      'test/en/scanning.html#managing-alerts',
    );
    expect(screen.getByTestId('new-icon')).toHaveAttribute(
      'title',
      'New Alert',
    );
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

    const newIcon = screen.getByTestId('new-icon');
    fireEvent.click(newIcon);
    expect(handleAlertCreateClick).toHaveBeenCalled();
    expect(newIcon).toHaveAttribute('title', 'New Alert');
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

    expect(screen.queryByTestId('new-icon')).toBeNull();
  });
});
