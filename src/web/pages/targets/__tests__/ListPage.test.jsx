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
import Target from 'gmp/models/target';
import {currentSettingsDefaultResponse} from 'web/pages/__mocks__/CurrentSettings';
import TargetPage, {ToolBarIcons} from 'web/pages/targets/ListPage';
import {entitiesLoadingActions} from 'web/store/entities/targets';
import {setTimezone, setUsername} from 'web/store/usersettings/actions';
import {defaultFilterLoadingActions} from 'web/store/usersettings/defaultfilters/actions';
import {loadingActions} from 'web/store/usersettings/defaults/actions';

let currentSettings;
let getSetting;
let getFilters;
let getTargets;
let renewSession;

beforeEach(() => {
  currentSettings = testing
    .fn()
    .mockResolvedValue(currentSettingsDefaultResponse);

  getSetting = testing.fn().mockResolvedValue({
    filter: null,
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

  getTargets = testing.fn().mockResolvedValue({
    data: [target],
    meta: {
      filter: Filter.fromString(),
      counts: new CollectionCounts(),
    },
  });

  renewSession = testing.fn().mockResolvedValue({
    foo: 'bar',
  });
});

const target = Target.fromElement({
  _id: '46264',
  name: 'target 1',
  comment: 'hello world',
  creation_time: '2020-12-23T14:14:11Z',
  modification_time: '2021-01-04T11:54:12Z',
  in_use: 0,
  permissions: {permission: {name: 'Everything'}},
  owner: {name: 'admin'},
  writable: 1,
  port_list: {
    _id: '32323',
    name: 'All IANA assigned TCP',
    trash: 0,
  },
  hosts: '127.0.0.1, 123.456.574.64',
  exclude_hosts: '192.168.0.1',
  max_hosts: 2,
  reverse_lookup_only: 1,
  reverse_lookup_unify: 0,
  tasks: {task: {_id: '465', name: 'foo'}},
  alive_tests: 'Scan Config Default',
  allow_simultaneous_ips: 1,
  port_range: '1-5',
  ssh_credential: {
    _id: '1235',
    name: 'ssh',
    port: '22',
    trash: '0',
  },
  ssh_elevate_credential: {
    _id: '3456',
    name: 'ssh_elevate',
    trash: '0',
  },
});

const caps = new Capabilities(['everything']);
const wrongCaps = new Capabilities(['get_config']);

const reloadInterval = -1;
const manualUrl = 'test/';

describe('TargetsListPage tests', () => {
  test('should render full TargetPage', async () => {
    const gmp = {
      targets: {
        get: getTargets,
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
      defaultFilterLoadingActions.success('target', defaultSettingFilter),
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
      entitiesLoadingActions.success([target], filter, loadedFilter, counts),
    );

    const {baseElement} = render(<TargetPage />);

    await wait();

    const powerFilter = within(screen.queryPowerFilter());
    const select = powerFilter.getSelectElement();
    const inputs = powerFilter.queryTextInputs();

    // Toolbar Icons
    expect(screen.getAllByTitle('Help: Targets')[0]).toBeInTheDocument();
    expect(screen.getAllByTitle('New Target')[0]).toBeInTheDocument();

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
    expect(header[1]).toHaveTextContent('Hosts');
    expect(header[2]).toHaveTextContent('IPs');
    expect(header[4]).toHaveTextContent('Credentials');
    expect(header[5]).toHaveTextContent('Actions');

    const row = baseElement.querySelectorAll('tr');

    expect(row[1]).toHaveTextContent('target 1');
    expect(row[1]).toHaveTextContent('127.0.0.1, 123.456.574.642');
    expect(row[1]).toHaveTextContent('2');
    expect(row[1]).toHaveTextContent('All IANA assigned TCP');

    expect(row[1]).toHaveTextContent('SSH: ssh');
    expect(row[1]).toHaveTextContent('SSH Elevate: ssh_elevate');

    expect(
      screen.getAllByTitle('Move Target to trashcan')[0],
    ).toBeInTheDocument();
    expect(screen.getAllByTitle('Edit Target')[0]).toBeInTheDocument();
    expect(screen.getAllByTitle('Clone Target')[0]).toBeInTheDocument();
    expect(screen.getAllByTitle('Export Target')[0]).toBeInTheDocument();
  });

  test('should allow to bulk action on page contents', async () => {
    const deleteByFilter = testing.fn().mockResolvedValue({
      foo: 'bar',
    });

    const exportByFilter = testing.fn().mockResolvedValue({
      foo: 'bar',
    });

    const gmp = {
      targets: {
        get: getTargets,
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
      defaultFilterLoadingActions.success('target', defaultSettingFilter),
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
      entitiesLoadingActions.success([target], filter, loadedFilter, counts),
    );

    render(<TargetPage />);

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

  test('should allow to bulk action on selected targets', async () => {
    // mock cache issues will cause these tests to randomly fail. Will fix later.
    const deleteByIds = testing.fn().mockResolvedValue({
      foo: 'bar',
    });

    const exportByIds = testing.fn().mockResolvedValue({
      foo: 'bar',
    });

    const gmp = {
      targets: {
        get: getTargets,
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
      defaultFilterLoadingActions.success('target', defaultSettingFilter),
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
      entitiesLoadingActions.success([target], filter, loadedFilter, counts),
    );

    render(<TargetPage />);

    await wait();

    // change to apply to selection
    const tableFooter = within(screen.queryTableFooter());
    const select = tableFooter.getSelectElement();
    const selectItems = await getSelectItemElementsForSelect(select);
    fireEvent.click(selectItems[1]);
    expect(select).toHaveValue('Apply to selection');

    // select an target
    const tableBody = within(screen.queryTableBody());
    const inputs = tableBody.queryCheckBoxes();
    fireEvent.click(inputs[0]);

    // export selected target
    const exportIcon = screen.getAllByTitle('Export selection')[0];
    fireEvent.click(exportIcon);
    expect(exportByIds).toHaveBeenCalled();

    // move selected target to trashcan
    const deleteIcon = screen.getAllByTitle('Move selection to trashcan')[0];
    fireEvent.click(deleteIcon);
    testBulkTrashcanDialog(screen, deleteByIds);
  });

  test('should allow to bulk action on filtered targets', async () => {
    // mock cache issues will cause these tests to randomly fail. Will fix later.
    const deleteByFilter = testing.fn().mockResolvedValue({
      foo: 'bar',
    });

    const exportByFilter = testing.fn().mockResolvedValue({
      foo: 'bar',
    });

    const gmp = {
      targets: {
        get: getTargets,
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
      defaultFilterLoadingActions.success('target', defaultSettingFilter),
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
      entitiesLoadingActions.success([target], filter, loadedFilter, counts),
    );

    render(<TargetPage />);

    await wait();

    // change to all filtered
    const tableFooter = within(screen.queryTableFooter());
    const select = tableFooter.getSelectElement();
    const selectItems = await getSelectItemElementsForSelect(select);
    fireEvent.click(selectItems[2]);
    expect(select).toHaveValue('Apply to all filtered');

    // export all filtered targets
    const exportIcon = screen.getAllByTitle('Export all filtered')[0];
    fireEvent.click(exportIcon);
    expect(exportByFilter).toHaveBeenCalled();

    // move all filtered targets to trashcan
    const deleteIcon = screen.getAllByTitle('Move all filtered to trashcan')[0];
    fireEvent.click(deleteIcon);
    testBulkTrashcanDialog(screen, deleteByFilter);
  });
});

describe('TargetPage ToolBarIcons test', () => {
  test('should render', () => {
    const handleTargetCreateClick = testing.fn();

    const gmp = {
      settings: {manualUrl},
    };

    const {render} = rendererWith({
      gmp,
      capabilities: caps,
      router: true,
    });

    const {element} = render(
      <ToolBarIcons onTargetCreateClick={handleTargetCreateClick} />,
    );

    const links = element.querySelectorAll('a');

    expect(screen.getAllByTitle('Help: Targets')[0]).toBeInTheDocument();
    expect(links[0]).toHaveAttribute(
      'href',
      'test/en/scanning.html#managing-targets',
    );
  });

  test('should call click handlers', () => {
    const handleTargetCreateClick = testing.fn();

    const gmp = {
      settings: {manualUrl},
    };

    const {render} = rendererWith({
      gmp,
      capabilities: caps,
      router: true,
    });

    render(<ToolBarIcons onTargetCreateClick={handleTargetCreateClick} />);

    const newIcon = screen.getByTestId('new-icon');
    expect(newIcon).toHaveAttribute('title', 'New Target');
    fireEvent.click(newIcon);
    expect(handleTargetCreateClick).toHaveBeenCalled();
  });

  test('should not show icons if user does not have the right permissions', () => {
    const handleTargetCreateClick = testing.fn();

    const gmp = {
      settings: {manualUrl},
    };

    const {render} = rendererWith({
      gmp,
      capabilities: wrongCaps,
      router: true,
    });

    render(<ToolBarIcons onTargetCreateClick={handleTargetCreateClick} />);

    const newIcon = screen.queryByTestId('new-icon');
    expect(newIcon).toBeNull();
  });
});
