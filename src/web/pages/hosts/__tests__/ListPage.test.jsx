/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import Capabilities from 'gmp/capabilities/capabilities';
import CollectionCounts from 'gmp/collection/collectioncounts';
import Filter from 'gmp/models/filter';
import Host from 'gmp/models/host';
import {
  clickElement,
  getPowerFilter,
  getSelectElement,
  getSelectItemElementsForSelect,
  getTableFooter,
  getTextInputs,
  testBulkDeleteDialog,
} from 'web/components/testing';
import {currentSettingsDefaultResponse} from 'web/pages/__mocks__/CurrentSettings';
import HostPage, {ToolBarIcons} from 'web/pages/hosts/ListPage';
import {entitiesLoadingActions} from 'web/store/entities/hosts';
import {setTimezone, setUsername} from 'web/store/usersettings/actions';
import {defaultFilterLoadingActions} from 'web/store/usersettings/defaultfilters/actions';
import {loadingActions} from 'web/store/usersettings/defaults/actions';
import {rendererWith, fireEvent, screen, wait} from 'web/utils/Testing';

// setup

const capabilities = new Capabilities(['everything']);
const wrongCapabilities = new Capabilities(['get_host']);

const reloadInterval = -1;
const manualUrl = 'test/';

// mock entity

const host = Host.fromElement({
  _id: '1234',
  name: 'Foo',
  comment: 'bar',
  owner: {name: 'admin'},
  creation_time: '2019-06-02T12:00:22Z',
  modification_time: '2019-06-03T11:00:22Z',
  writable: '1',
  in_use: '0',
  permissions: {permission: [{name: 'everything'}]},
  host: {
    severity: {
      value: 10.0,
    },
  },
  identifiers: {
    identifier: [
      {
        _id: '5678',
        name: 'hostname',
        value: 'foo',
        source: {
          _id: '910',
          type: 'Report Host Detail',
        },
      },
      {
        _id: '1112',
        name: 'ip',
        value: '123.456.789.10',
      },
      {
        _id: '1314',
        name: 'OS',
        value: 'cpe:/o:linux:kernel',
      },
    ],
  },
});

// mock gmp commands

let getHosts;
let getFilters;
let getDashboardSetting;
let getAggregates;
let getSetting;
let currentSettings;
let renewSession;

beforeEach(() => {
  getHosts = testing.fn().mockResolvedValue({
    data: [host],
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

  getDashboardSetting = testing.fn().mockResolvedValue({
    data: [],
    meta: {
      filter: Filter.fromString(),
      counts: new CollectionCounts(),
    },
  });

  getAggregates = testing.fn().mockResolvedValue({
    data: [],
    meta: {
      filter: Filter.fromString(),
      counts: new CollectionCounts(),
    },
  });

  getSetting = testing.fn().mockResolvedValue({
    filter: null,
  });

  currentSettings = testing
    .fn()
    .mockResolvedValue(currentSettingsDefaultResponse);

  renewSession = testing.fn().mockResolvedValue({
    foo: 'bar',
  });
});

describe('Host ListPage tests', () => {
  test('should render full host ListPage', async () => {
    const gmp = {
      hosts: {
        get: getHosts,
        getSeverityAggregates: getAggregates,
        getModifiedAggregates: getAggregates,
      },
      filters: {
        get: getFilters,
      },
      dashboard: {
        getSetting: getDashboardSetting,
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
      defaultFilterLoadingActions.success('host', defaultSettingFilter),
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
      entitiesLoadingActions.success([host], filter, loadedFilter, counts),
    );

    const {baseElement} = render(<HostPage />);

    await wait();

    const powerFilter = getPowerFilter();
    const select = getSelectElement(powerFilter);
    const inputs = getTextInputs(powerFilter);

    // Toolbar Icons
    expect(screen.getAllByTitle('Help: Hosts')[0]).toBeInTheDocument();
    expect(screen.getAllByTitle('New Host')[0]).toBeInTheDocument();

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

    const display = screen.getAllByTestId('grid-item');
    expect(display[0]).toHaveTextContent('Hosts by Severity Class (Total: 0)');
    expect(display[1]).toHaveTextContent('Hosts Topology');
    expect(display[2]).toHaveTextContent(
      'Hosts by Modification Time (Total: 0)',
    );

    // Table
    const header = baseElement.querySelectorAll('th');

    expect(header[0]).toHaveTextContent('Name');
    expect(header[1]).toHaveTextContent('Hostname');
    expect(header[2]).toHaveTextContent('IP Address');
    expect(header[3]).toHaveTextContent('OS');
    expect(header[4]).toHaveTextContent('Severity');
    expect(header[5]).toHaveTextContent('Modified');
    expect(header[6]).toHaveTextContent('Actions');

    // Row
    const row = baseElement.querySelectorAll('tr');

    expect(row[1]).toHaveTextContent('Foo');
    expect(row[1]).toHaveTextContent('bar');
    expect(row[1]).toHaveTextContent('foo');
    expect(row[1]).toHaveTextContent('123.456.789.10');
    expect(row[1]).toHaveTextContent('10.0 (Critical)');
    expect(row[1]).toHaveTextContent('Mon, Jun 3, 2019 1:00 PM CEST');

    const osImage = baseElement.querySelector('img');
    expect(osImage).toHaveAttribute('src', '/img/os_linux.svg');

    expect(screen.getAllByTitle('Delete Host')[0]).toBeInTheDocument();
    expect(screen.getAllByTitle('Edit Host')[0]).toBeInTheDocument();
    expect(
      screen.getAllByTitle('Create Target from Host')[0],
    ).toBeInTheDocument();
    expect(screen.getAllByTitle('Export Host')[0]).toBeInTheDocument();

    // Footer
    expect(
      screen.getAllByTitle('Add tag to page contents')[0],
    ).toBeInTheDocument();
    expect(screen.getAllByTitle('Delete page contents')[0]).toBeInTheDocument();
    expect(screen.getAllByTitle('Export page contents')[0]).toBeInTheDocument();
    expect(
      screen.getAllByTitle('Create Target from page contents')[0],
    ).toBeInTheDocument();
  });

  test('should allow to bulk action on page contents', async () => {
    const deleteByFilter = testing.fn().mockResolvedValue({
      foo: 'bar',
    });

    const exportByFilter = testing.fn().mockResolvedValue({
      foo: 'bar',
    });

    const gmp = {
      hosts: {
        get: getHosts,
        deleteByFilter,
        exportByFilter,
        getSeverityAggregates: getAggregates,
        getModifiedAggregates: getAggregates,
      },
      filters: {
        get: getFilters,
      },
      dashboard: {
        getSetting: getDashboardSetting,
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
      defaultFilterLoadingActions.success('host', defaultSettingFilter),
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
      entitiesLoadingActions.success([host], filter, loadedFilter, counts),
    );

    render(<HostPage />);

    await wait();

    // export page contents
    fireEvent.click(screen.getAllByTitle('Export page contents')[0]);
    await wait();
    expect(exportByFilter).toHaveBeenCalled();

    // delete page contents
    fireEvent.click(screen.getAllByTitle('Delete page contents')[0]);
    await wait();
    testBulkDeleteDialog(screen, deleteByFilter);
  });

  test('should allow to bulk action on selected hosts', async () => {
    const deleteByIds = testing.fn().mockResolvedValue({
      foo: 'bar',
    });

    const exportByIds = testing.fn().mockResolvedValue({
      foo: 'bar',
    });

    const gmp = {
      hosts: {
        get: getHosts,
        delete: deleteByIds,
        export: exportByIds,
        getSeverityAggregates: getAggregates,
        getModifiedAggregates: getAggregates,
      },
      filters: {
        get: getFilters,
      },
      dashboard: {
        getSetting: getDashboardSetting,
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
      defaultFilterLoadingActions.success('host', defaultSettingFilter),
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
      entitiesLoadingActions.success([host], filter, loadedFilter, counts),
    );

    render(<HostPage />);

    await wait();

    // change to apply to selection
    const tableFooter = getTableFooter();
    const select = getSelectElement(tableFooter);
    const selectItems = await getSelectItemElementsForSelect(select);
    await clickElement(selectItems[1]);

    // export selected host
    await clickElement(screen.getAllByTitle('Export selection')[0]);
    expect(exportByIds).toHaveBeenCalled();

    // delete selected host
    await clickElement(screen.getAllByTitle('Delete selection')[0]);
    testBulkDeleteDialog(screen, deleteByIds);
  });

  test('should allow to bulk action on filtered hosts', async () => {
    const deleteByFilter = testing.fn().mockResolvedValue({
      foo: 'bar',
    });

    const exportByFilter = testing.fn().mockResolvedValue({
      foo: 'bar',
    });

    const gmp = {
      hosts: {
        get: getHosts,
        deleteByFilter,
        exportByFilter,
        getSeverityAggregates: getAggregates,
        getModifiedAggregates: getAggregates,
      },
      filters: {
        get: getFilters,
      },
      dashboard: {
        getSetting: getDashboardSetting,
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
      defaultFilterLoadingActions.success('host', defaultSettingFilter),
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
      entitiesLoadingActions.success([host], filter, loadedFilter, counts),
    );

    render(<HostPage />);

    await wait();

    // change to all filtered
    const tableFooter = getTableFooter();
    const select = getSelectElement(tableFooter);
    const selectItems = await getSelectItemElementsForSelect(select);
    await clickElement(selectItems[2]);
    expect(select).toHaveValue('Apply to all filtered');

    // export all filtered hosts
    await clickElement(screen.getAllByTitle('Export all filtered')[0]);
    expect(exportByFilter).toHaveBeenCalled();

    await clickElement(screen.getAllByTitle('Delete all filtered')[0]);
    testBulkDeleteDialog(screen, deleteByFilter);
  });
});

describe('Host ListPage ToolBarIcons test', () => {
  test('should render', () => {
    const handleCreateHostClick = testing.fn();

    const gmp = {
      settings: {manualUrl},
    };

    const {render} = rendererWith({
      gmp,
      capabilities: capabilities,
      router: true,
    });

    const {element} = render(
      <ToolBarIcons onHostCreateClick={handleCreateHostClick} />,
    );

    const links = element.querySelectorAll('a');

    expect(screen.getByTestId('help-icon')).toHaveAttribute(
      'title',
      'Help: Hosts',
    );
    expect(links[0]).toHaveAttribute(
      'href',
      'test/en/managing-assets.html#managing-hosts',
    );

    expect(screen.getByTestId('new-icon')).toHaveAttribute('title', 'New Host');
  });

  test('should call click handlers', () => {
    const handleCreateHostClick = testing.fn();

    const gmp = {
      settings: {manualUrl},
    };

    const {render} = rendererWith({
      gmp,
      capabilities: capabilities,
      router: true,
    });

    render(<ToolBarIcons onHostCreateClick={handleCreateHostClick} />);

    fireEvent.click(screen.getAllByTitle('New Host')[0]);
    expect(handleCreateHostClick).toHaveBeenCalled();
  });

  test('should not show icons if user does not have the right permissions', () => {
    const handleCreateHostClick = testing.fn();

    const gmp = {
      settings: {manualUrl},
    };

    const {render} = rendererWith({
      gmp,
      capabilities: wrongCapabilities,
      router: true,
    });

    render(<ToolBarIcons onHostCreateClick={handleCreateHostClick} />);

    expect(screen.getAllByTitle('Help: Hosts')[0]).toBeInTheDocument();
    expect(screen.queryByTitle('New Host')).not.toBeInTheDocument();
  });
});
