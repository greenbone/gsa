/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {
  getSelectItemElementsForSelect,
  rendererWith,
  fireEvent,
  screen,
  wait,
  within,
} from 'web/testing';
import CollectionCounts from 'gmp/collection/CollectionCounts';
import Filter from 'gmp/models/filter';
import NVT from 'gmp/models/nvt';
import {currentSettingsDefaultResponse} from 'web/pages/__mocks__/CurrentSettings';
import NvtsPage, {ToolBarIcons} from 'web/pages/nvts/ListPage';
import {entitiesLoadingActions} from 'web/store/entities/nvts';
import {setTimezone, setUsername} from 'web/store/usersettings/actions';
import {defaultFilterLoadingActions} from 'web/store/usersettings/defaultfilters/actions';
import {loadingActions} from 'web/store/usersettings/defaults/actions';

const nvt = NVT.fromElement({
  _oid: '1.3.6.1.4.1.25623.1.0',
  name: 'foo',
  creation_time: '2019-06-24T11:55:30Z',
  modification_time: '2019-06-24T10:12:27Z',
  nvt: {
    family: 'bar',
    cvss_base: 5,
    qod: {value: 80},
    tags: 'This is a description|solution_type=VendorFix',
    solution: {
      _type: 'VendorFix',
      __text: 'This is a description',
    },
    epss: {
      max_severity: {
        score: 0.8765,
        percentile: 90.0,
        cve: {
          _id: 'CVE-2020-1234',
          severity: 10.0,
        },
      },
      max_epss: {
        score: 0.9876,
        percentile: 80.0,
        cve: {
          _id: 'CVE-2020-5678',
        },
      },
    },
    refs: {
      ref: [
        {_type: 'cve', _id: 'CVE-2020-1234'},
        {_type: 'cve', _id: 'CVE-2020-5678'},
      ],
    },
  },
});

const reloadInterval = -1;
const manualUrl = 'test/';

const currentSettings = testing
  .fn()
  .mockResolvedValue(currentSettingsDefaultResponse);

const getSetting = testing.fn().mockResolvedValue({
  filter: null,
});

const getDashboardSetting = testing.fn().mockResolvedValue({
  data: [],
  meta: {
    filter: Filter.fromString(),
    counts: new CollectionCounts(),
  },
});

const getAggregates = testing.fn().mockResolvedValue({
  data: [],
  meta: {
    filter: Filter.fromString(),
    counts: new CollectionCounts(),
  },
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

const getNvts = testing.fn().mockResolvedValue({
  data: [nvt],
  meta: {
    filter: Filter.fromString(),
    counts: new CollectionCounts(),
  },
});

describe('NvtsPage tests', () => {
  test('should render full NvtsPage', async () => {
    const gmp = {
      dashboard: {
        getSetting: getDashboardSetting,
      },
      nvts: {
        get: getNvts,
        getFamilyAggregates: getAggregates,
        getSeverityAggregates: getAggregates,
        getCreatedAggregates: getAggregates,
      },
      filters: {
        get: getFilters,
      },
      settings: {manualUrl, reloadInterval, enableEPSS: true},
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
      defaultFilterLoadingActions.success('nvt', defaultSettingFilter),
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
      entitiesLoadingActions.success([nvt], filter, loadedFilter, counts),
    );

    const {baseElement} = render(<NvtsPage />);

    await wait();

    const display = screen.getAllByTestId('grid-item');
    const powerFilter = within(screen.queryPowerFilter());
    const select = powerFilter.getByTestId('powerfilter-select');
    const inputs = powerFilter.queryTextInputs();

    // Toolbar Icons
    expect(screen.getAllByTitle('Help: NVTs')[0]).toBeInTheDocument();

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
    expect(display[0]).toHaveTextContent('NVTs by Severity Class (Total: 0)');
    expect(display[1]).toHaveTextContent('NVTs by Creation Time');
    expect(display[2]).toHaveTextContent('NVTs by Family (Total: 0)');

    // Table
    const header = baseElement.querySelectorAll('th');

    expect(header[0]).toHaveTextContent('Name');
    expect(header[1]).toHaveTextContent('Family');
    expect(header[2]).toHaveTextContent('Created');
    expect(header[3]).toHaveTextContent('Modified');
    expect(header[4]).toHaveTextContent('CVE');
    expect(header[6]).toHaveTextContent('Severity');
    expect(header[7]).toHaveTextContent('QoD');
    expect(header[8]).toHaveTextContent('EPSS');
    expect(header[9]).toHaveTextContent('Score');
    expect(header[10]).toHaveTextContent('Percentile');

    const row = baseElement.querySelectorAll('tr');

    expect(row[2]).toHaveTextContent('foo');
    expect(row[2]).toHaveTextContent('bar');
    expect(row[2]).toHaveTextContent(
      'Mon, Jun 24, 2019 1:55 PM Central European Summer Time',
    );
    expect(row[2]).toHaveTextContent(
      'Mon, Jun 24, 2019 12:12 PM Central European Summer Time',
    );
    expect(row[2]).toHaveTextContent('CVE-2020-1234');
    expect(row[2]).toHaveTextContent('CVE-2020-5678');
    expect(row[2]).toHaveTextContent('80 %');
    expect(row[2]).toHaveTextContent('98.760%');
    expect(row[2]).toHaveTextContent('80th');
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
      nvts: {
        get: getNvts,
        deleteByFilter,
        exportByFilter,
        getSeverityAggregates: getAggregates,
        getFamilyAggregates: getAggregates,
        getCreatedAggregates: getAggregates,
      },
      filters: {
        get: getFilters,
      },
      settings: {manualUrl, reloadInterval, enableEPSS: true},
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
      defaultFilterLoadingActions.success('nvt', defaultSettingFilter),
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
      entitiesLoadingActions.success([nvt], filter, loadedFilter, counts),
    );

    render(<NvtsPage />);

    await wait();

    // export page contents
    const exportIcon = screen.getAllByTitle('Export page contents')[0];
    fireEvent.click(exportIcon);
    expect(exportByFilter).toHaveBeenCalled();
  });

  test('should allow to bulk action on selected nvts', async () => {
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
      nvts: {
        get: getNvts,
        delete: deleteByIds,
        export: exportByIds,
        getSeverityAggregates: getAggregates,
        getFamilyAggregates: getAggregates,
        getCreatedAggregates: getAggregates,
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
      defaultFilterLoadingActions.success('nvt', defaultSettingFilter),
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
      entitiesLoadingActions.success([nvt], filter, loadedFilter, counts),
    );

    render(<NvtsPage />);

    await wait();

    // change to apply to selection
    const tableFooter = within(screen.queryTableFooter());
    const select = tableFooter.getSelectElement();
    const selectItems = await getSelectItemElementsForSelect(select);
    fireEvent.click(selectItems[1]);
    expect(select).toHaveValue('Apply to selection');

    // select a nvt
    const tableBody = within(screen.queryTableBody());
    const inputs = tableBody.getAllCheckBoxes();
    fireEvent.click(inputs[0]);

    // export selected nvt
    const exportIcon = screen.getAllByTitle('Export selection')[0];
    fireEvent.click(exportIcon);
    expect(exportByIds).toHaveBeenCalled();
  });

  test('should allow to bulk action on filtered nvts', async () => {
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
      nvts: {
        get: getNvts,
        deleteByFilter,
        exportByFilter,
        getSeverityAggregates: getAggregates,
        getFamilyAggregates: getAggregates,
        getCreatedAggregates: getAggregates,
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
      defaultFilterLoadingActions.success('nvt', defaultSettingFilter),
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
      entitiesLoadingActions.success([nvt], filter, loadedFilter, counts),
    );

    render(<NvtsPage />);

    await wait();

    // change to all filtered
    const tableFooter = within(screen.queryTableFooter());
    const select = tableFooter.getSelectElement();
    const selectItems = await getSelectItemElementsForSelect(select);
    fireEvent.click(selectItems[2]);
    expect(select).toHaveValue('Apply to all filtered');

    // export all filtered nvts
    const exportIcon = screen.getAllByTitle('Export all filtered')[0];
    fireEvent.click(exportIcon);
    expect(exportByFilter).toHaveBeenCalled();
  });
});

describe('NvtsPage ToolBarIcons test', () => {
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
    expect(screen.getAllByTitle('Help: NVTs')[0]).toBeInTheDocument();
    expect(links[0]).toHaveAttribute(
      'href',
      'test/en/managing-secinfo.html#vulnerability-tests-vt',
    );
  });
});
