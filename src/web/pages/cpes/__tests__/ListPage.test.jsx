/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import CollectionCounts from 'gmp/collection/collectioncounts';
import CPE from 'gmp/models/cpe';
import Filter from 'gmp/models/filter';
import {
  clickElement,
  queryCheckBoxes,
  queryPowerFilter,
  getSelectElement,
  getSelectItemElementsForSelect,
  queryTable,
  queryTableBody,
  queryTableFooter,
  queryTextInputs,
} from 'web/components/testing';
import {currentSettingsDefaultResponse} from 'web/pages/__mocks__/CurrentSettings';
import CpesPage, {ToolBarIcons} from 'web/pages/cpes/ListPage';
import {entitiesLoadingActions} from 'web/store/entities/cpes';
import {setTimezone, setUsername} from 'web/store/usersettings/actions';
import {defaultFilterLoadingActions} from 'web/store/usersettings/defaultfilters/actions';
import {loadingActions} from 'web/store/usersettings/defaults/actions';
import {getByTestId, rendererWith, screen, wait} from 'web/utils/Testing';

const cpe = CPE.fromElement({
  _id: 'cpe:/a:foo',
  name: 'foo',
  title: 'bar',
  creation_time: '2019-06-24T11:55:30Z',
  modification_time: '2019-06-24T10:12:27Z',
  update_time: '2019-06-24T10:12:27Z',
  cve_refs: '3',
  cves: {
    cve: [
      {entry: {cvss: {base_metrics: {score: 9.8}}, _id: 'CVE-2020-1234'}},
      {entry: {cvss: {base_metrics: {score: 7.8}}, _id: 'CVE-2020-5678'}},
      {entry: {cvss: {base_metrics: {score: 7.8}}, _id: 'CVE-2019-5678'}},
    ],
  },
  severity: 9.8,
  status: '',
  nvd_id: '',
});

const reloadInterval = -1;
const manualUrl = 'test/';

let getCpes;
let getFilters;
let getDashboardSetting;
let getAggregates;
let getSetting;
let currentSettings;
let renewSession;

beforeEach(() => {
  getCpes = testing.fn().mockResolvedValue({
    data: [cpe],
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

describe('CpesPage tests', () => {
  test('should render full CpesPage', async () => {
    const gmp = {
      dashboard: {
        getSetting: getDashboardSetting,
      },
      cpes: {
        get: getCpes,
        getSeverityAggregates: getAggregates,
        getCreatedAggregates: getAggregates,
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
      defaultFilterLoadingActions.success('cpe', defaultSettingFilter),
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
      entitiesLoadingActions.success([cpe], filter, loadedFilter, counts),
    );

    render(<CpesPage />);

    await wait();

    const display = screen.getAllByTestId('grid-item');
    const powerFilter = queryPowerFilter();
    const inputs = queryTextInputs(powerFilter);
    const select = getSelectElement(powerFilter);

    // Toolbar Icons
    expect(screen.getAllByTitle('Help: CPEs')[0]).toBeInTheDocument();

    // Powerfilter
    expect(inputs[0]).toHaveAttribute('name', 'userFilterString');
    expect(screen.getAllByTitle('Update Filter')[0]).toBeInTheDocument();
    expect(screen.getAllByTitle('Remove Filter')[0]).toBeInTheDocument();
    expect(
      screen.getAllByTitle('Reset to Default Filter')[0],
    ).toBeInTheDocument();
    expect(screen.getAllByTitle('Help: Powerfilter')[0]).toBeInTheDocument();
    expect(screen.getAllByTitle('Edit Filter')[0]).toBeInTheDocument();
    expect(select).toHaveValue('--');
    expect(select).toHaveAttribute('title', 'Loaded filter');

    // Dashboard
    expect(
      screen.getAllByTitle('Add new Dashboard Display')[0],
    ).toBeInTheDocument();
    expect(screen.getAllByTitle('Reset to Defaults')[0]).toBeInTheDocument();
    expect(display[0]).toHaveTextContent('CPEs by Severity Class (Total: 0)');
    expect(display[1]).toHaveTextContent('CPEs by Creation Time');
    expect(display[2]).toHaveTextContent('CPEs by CVSS (Total: 0)');

    // Table
    const table = queryTable();
    const header = table.querySelectorAll('th');

    expect(header[0]).toHaveTextContent('Name');
    expect(header[1]).toHaveTextContent('Title');
    expect(header[2]).toHaveTextContent('Modified');
    expect(header[3]).toHaveTextContent('CVEs');
    expect(header[4]).toHaveTextContent('Severity');

    const row = table.querySelectorAll('tr');

    expect(row[1]).toHaveTextContent('foo');
    expect(row[1]).toHaveTextContent('bar');
    expect(row[1]).toHaveTextContent(
      'Mon, Jun 24, 2019 12:12 PM Central European Summer Time',
    );
    expect(row[1]).toHaveTextContent('3');
    expect(row[1]).toHaveTextContent('9.8 (Critical)');
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
      cpes: {
        get: getCpes,
        deleteByFilter,
        exportByFilter,
        getSeverityAggregates: getAggregates,
        getActiveDaysAggregates: getAggregates,
        getCreatedAggregates: getAggregates,
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
      defaultFilterLoadingActions.success('cpe', defaultSettingFilter),
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
      entitiesLoadingActions.success([cpe], filter, loadedFilter, counts),
    );

    render(<CpesPage />);

    await wait();

    // export page contents
    const tableFooter = queryTableFooter();
    const exportIcon = getByTestId(tableFooter, 'export-icon');
    await clickElement(exportIcon);
    expect(exportByFilter).toHaveBeenCalled();
  });

  test('should allow to bulk action on selected cpes', async () => {
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
      cpes: {
        get: getCpes,
        delete: deleteByIds,
        export: exportByIds,
        getSeverityAggregates: getAggregates,
        getActiveDaysAggregates: getAggregates,
        getCreatedAggregates: getAggregates,
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
      defaultFilterLoadingActions.success('cpe', defaultSettingFilter),
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
      entitiesLoadingActions.success([cpe], filter, loadedFilter, counts),
    );

    render(<CpesPage />);

    await wait();

    // change bulk action to apply to selection
    const tableFooter = queryTableFooter();
    const selectElement = getSelectElement(tableFooter);
    const selectItems = await getSelectItemElementsForSelect(selectElement);
    await clickElement(selectItems[1]);
    expect(selectElement).toHaveValue('Apply to selection');

    // select a cpe
    const tableBody = queryTableBody();
    const inputs = queryCheckBoxes(tableBody);
    await clickElement(inputs[1]);

    // export selected cpe
    const exportIcon = getByTestId(tableFooter, 'export-icon');
    await clickElement(exportIcon);

    expect(exportByIds).toHaveBeenCalled();
  });

  test('should allow to bulk action on filtered cpes', async () => {
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
      cpes: {
        get: getCpes,
        deleteByFilter,
        exportByFilter,
        getSeverityAggregates: getAggregates,
        getActiveDaysAggregates: getAggregates,
        getCreatedAggregates: getAggregates,
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
      defaultFilterLoadingActions.success('cpe', defaultSettingFilter),
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
      entitiesLoadingActions.success([cpe], filter, loadedFilter, counts),
    );

    render(<CpesPage />);

    await wait();

    // change bulk action to apply to all filtered
    const tableFooter = queryTableFooter();
    const selectElement = getSelectElement(tableFooter);
    const selectItems = await getSelectItemElementsForSelect(selectElement);
    await clickElement(selectItems[2]);
    expect(selectElement).toHaveValue('Apply to all filtered');

    // export all filtered cpes
    const exportIcon = getByTestId(tableFooter, 'export-icon');
    await clickElement(exportIcon);

    expect(exportByFilter).toHaveBeenCalled();
  });
});

describe('CpesPage ToolBarIcons test', () => {
  test('should render', () => {
    const gmp = {
      settings: {manualUrl},
    };

    const {render} = rendererWith({
      gmp,
      router: true,
    });

    const {baseElement} = render(<ToolBarIcons />);

    const links = baseElement.querySelectorAll('a');
    expect(screen.getAllByTitle('Help: CPEs')[0]).toBeInTheDocument();
    expect(links[0]).toHaveAttribute(
      'href',
      'test/en/managing-secinfo.html#cpe',
    );
  });
});
