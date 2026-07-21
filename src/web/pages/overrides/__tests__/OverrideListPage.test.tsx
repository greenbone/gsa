/* SPDX-FileCopyrightText: 2026 Greenbone AG
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
import CollectionCounts from 'gmp/collection/collection-counts';
import BaseFilter from 'gmp/models/filter/base-filter';
import Override from 'gmp/models/override';
import {createSession} from 'gmp/testing';
import {currentSettingsDefaultResponse} from 'web/pages/__fixtures__/current-settings';
import OverrideListPage from 'web/pages/overrides/OverrideListPage';
import {entitiesLoadingActions} from 'web/store/entities/overrides';
import {defaultFilterLoadingActions} from 'web/store/usersettings/defaultfilters/actions';
import {loadingActions} from 'web/store/usersettings/defaults/actions';

const createOverride = (id: string, text: string) =>
  Override.fromElement({
    _id: id,
    active: 1,
    creation_time: '2020-12-23T14:14:11Z',
    hosts: '127.0.0.1',
    in_use: 0,
    modification_time: '2021-01-04T11:54:12Z',
    new_severity: -1, // false positive
    nvt: {
      _oid: '123',
      name: 'foo nvt',
    },
    owner: {name: 'admin'},
    permissions: {permission: {name: 'Everything'}},
    port: '666',
    severity: 0.1,
    text,
    writable: 1,
  });

const createOverrides = (count: number) =>
  Array.from({length: count}, (_, index) =>
    createOverride(`override-${index + 1}`, `override text ${index + 1}`),
  );

const override = createOverride(
  '6d00d22f-551b-4fbe-8215-d8615eff73ea',
  'override text',
);

const reloadInterval = -1;
const manualUrl = 'test/';

const createGmp = ({
  currentSettings = testing
    .fn()
    .mockResolvedValue(currentSettingsDefaultResponse),
  getSetting = testing.fn().mockResolvedValue({
    filter: null,
  }),
  getDashboardSetting = testing.fn().mockResolvedValue({
    data: [],
    meta: {
      filter: BaseFilter.fromString(),
      counts: new CollectionCounts(),
    },
  }),
  getAggregates = testing.fn().mockResolvedValue({
    data: [],
    meta: {
      filter: BaseFilter.fromString(),
      counts: new CollectionCounts(),
    },
  }),
  getFilters = testing.fn().mockResolvedValue({
    data: [],
    meta: {
      filter: BaseFilter.fromString(),
      counts: new CollectionCounts(),
    },
  }),
  getOverrides = testing.fn().mockResolvedValue({
    data: [override],
    meta: {
      filter: BaseFilter.fromString(),
      counts: new CollectionCounts(),
    },
  }),
  deleteByFilter = testing.fn().mockResolvedValue({
    foo: 'bar',
  }),
  exportByFilter = testing.fn().mockResolvedValue({
    foo: 'bar',
  }),
  deleteByIds = testing.fn().mockResolvedValue({
    foo: 'bar',
  }),
  exportByIds = testing.fn().mockResolvedValue({
    foo: 'bar',
  }),
} = {}) => ({
  dashboard: {
    getSetting: getDashboardSetting,
  },
  overrides: {
    get: getOverrides,
    getActiveDaysAggregates: getAggregates,
    getCreatedAggregates: getAggregates,
    getWordCountsAggregates: getAggregates,
    deleteByFilter,
    exportByFilter,
    delete: deleteByIds,
    export: exportByIds,
  },
  filters: {
    get: getFilters,
  },
  settings: {
    manualUrl,
    reloadInterval,
  },
  session: createSession(),
  user: {currentSettings, getSetting},
});

describe('OverrideListPage tests', () => {
  test('should render full OverrideListPage', async () => {
    const gmp = createGmp();

    const {render, store} = rendererWith({
      gmp,
      capabilities: true,
      store: true,
      router: true,
    });

    const defaultSettingFilter = BaseFilter.fromString('foo=bar');
    store.dispatch(loadingActions.success({rowsperpage: {value: '2'}}));
    store.dispatch(
      defaultFilterLoadingActions.success('override', defaultSettingFilter),
    );

    const counts = new CollectionCounts({
      first: 1,
      all: 1,
      filtered: 1,
      length: 1,
      rows: 10,
    });
    const filter = BaseFilter.fromString('first=1 rows=10');
    const loadedFilter = BaseFilter.fromString('first=1 rows=10');
    store.dispatch(
      entitiesLoadingActions.success([override], filter, loadedFilter, counts),
    );

    render(<OverrideListPage />);

    await wait();

    const powerFilter = within(screen.getPowerFilter());
    const select = powerFilter.getByTestId('powerfilter-select');
    const inputs = powerFilter.queryTextInputs();
    const display = screen.getAllByTestId('grid-item');

    // Toolbar Icons
    expect(screen.getByTitle('Help: Overrides')).toBeInTheDocument();
    expect(screen.getByTitle('New Override')).toBeInTheDocument();

    // Powerfilter
    expect(inputs[0]).toHaveAttribute('name', 'userFilterString');
    expect(screen.getByTitle('Update Filter')).toBeInTheDocument();
    expect(screen.getByTitle('Remove Filter')).toBeInTheDocument();
    expect(screen.getByTitle('Reset to Default Filter')).toBeInTheDocument();
    expect(screen.getByTitle('Help: Powerfilter')).toBeInTheDocument();
    expect(screen.getByTitle('Edit Filter')).toBeInTheDocument();
    expect(select).toHaveAttribute('title', 'Loaded filter');
    expect(select).toHaveValue('--');

    // Dashboard
    expect(screen.getByTitle('Add new Dashboard Display')).toBeInTheDocument();
    expect(screen.getByTitle('Reset to Defaults')).toBeInTheDocument();
    expect(display[0]).toHaveTextContent('Overrides by Active Days (Total: 0)');
    expect(display[1]).toHaveTextContent('Overrides by Creation Time');
    expect(display[2]).toHaveTextContent('Overrides Text Word Cloud');

    // Table
    const table = screen.getByRole('table');
    const tableContent = within(table);
    const header = tableContent.getAllByRole('columnheader');

    expect(header[0]).toHaveTextContent('Text');
    expect(header[1]).toHaveTextContent('NVT');
    expect(header[2]).toHaveTextContent('Hosts');
    expect(header[3]).toHaveTextContent('Location');
    expect(header[4]).toHaveTextContent('From');
    expect(header[5]).toHaveTextContent('To');
    expect(header[6]).toHaveTextContent('Active');
    expect(header[7]).toHaveTextContent('Actions');

    const row = tableContent.getAllByRole('row');

    expect(row[1]).toHaveTextContent('override text');
    expect(row[1]).toHaveTextContent('foo nvt');
    expect(row[1]).toHaveTextContent('127.0.0.1');
    expect(row[1]).toHaveTextContent('666');
    expect(row[1]).toHaveTextContent('> 0.0');
    expect(row[1]).toHaveTextContent('False Positive');
    expect(row[1]).toHaveTextContent('yes');

    expect(screen.getByTitle('Move Override to trashcan')).toBeInTheDocument();
    expect(screen.getByTitle('Edit Override')).toBeInTheDocument();
    expect(screen.getByTitle('Clone Override')).toBeInTheDocument();
    expect(screen.getByTitle('Export Override')).toBeInTheDocument();
  });

  test('should allow to bulk action on page contents', async () => {
    const gmp = createGmp();

    const {render, store} = rendererWith({
      gmp,
      capabilities: true,
      store: true,
      router: true,
    });

    const defaultSettingFilter = BaseFilter.fromString('foo=bar');
    store.dispatch(loadingActions.success({rowsperpage: {value: '2'}}));
    store.dispatch(
      defaultFilterLoadingActions.success('override', defaultSettingFilter),
    );

    const counts = new CollectionCounts({
      first: 1,
      all: 1,
      filtered: 1,
      length: 1,
      rows: 10,
    });
    const filter = BaseFilter.fromString('first=1 rows=10');
    const loadedFilter = BaseFilter.fromString('first=1 rows=10');
    store.dispatch(
      entitiesLoadingActions.success([override], filter, loadedFilter, counts),
    );

    render(<OverrideListPage />);

    await wait();

    // export page contents
    const exportIcon = screen.getByTitle('Export page contents');
    fireEvent.click(exportIcon);
    expect(gmp.overrides.exportByFilter).toHaveBeenCalled();

    // move page contents to trashcan
    const deleteIcon = screen.getByTitle('Move page contents to trashcan');
    fireEvent.click(deleteIcon);
    testBulkTrashcanDialog(screen, gmp.overrides.deleteByFilter);
  });

  test('should allow to bulk action on selected overrides', async () => {
    const gmp = createGmp();

    const {render, store} = rendererWith({
      gmp,
      capabilities: true,
      store: true,
      router: true,
    });

    const defaultSettingFilter = BaseFilter.fromString('foo=bar');
    store.dispatch(loadingActions.success({rowsperpage: {value: '2'}}));
    store.dispatch(
      defaultFilterLoadingActions.success('override', defaultSettingFilter),
    );

    const counts = new CollectionCounts({
      first: 1,
      all: 1,
      filtered: 1,
      length: 1,
      rows: 10,
    });
    const filter = BaseFilter.fromString('first=1 rows=10');
    const loadedFilter = BaseFilter.fromString('first=1 rows=10');
    store.dispatch(
      entitiesLoadingActions.success([override], filter, loadedFilter, counts),
    );

    render(<OverrideListPage />);

    await wait();

    // change to apply to selection
    const tableFooter = within(screen.queryTableFooter() as HTMLElement);
    const select = tableFooter.getSelectElement();
    const selectItems = await getSelectItemElementsForSelect(select);
    fireEvent.click(selectItems[1]);
    expect(select).toHaveValue('Apply to selection');

    // select an override
    const tableBody = within(screen.queryTableBody() as HTMLElement);
    const inputs = tableBody.queryCheckBoxes();
    fireEvent.click(inputs[0]);

    // export selected override
    const exportIcon = screen.getByTitle('Export selection');
    fireEvent.click(exportIcon);
    expect(gmp.overrides.export).toHaveBeenCalled();

    // move selected override to trashcan
    const deleteIcon = screen.getByTitle('Move selection to trashcan');
    fireEvent.click(deleteIcon);
    testBulkTrashcanDialog(screen, gmp.overrides.delete);
  });

  test('should allow to bulk action on filtered overrides', async () => {
    const gmp = createGmp();

    const {render, store} = rendererWith({
      gmp,
      capabilities: true,
      store: true,
      router: true,
    });

    const defaultSettingFilter = BaseFilter.fromString('foo=bar');
    store.dispatch(loadingActions.success({rowsperpage: {value: '2'}}));
    store.dispatch(
      defaultFilterLoadingActions.success('override', defaultSettingFilter),
    );

    const counts = new CollectionCounts({
      first: 1,
      all: 1,
      filtered: 1,
      length: 1,
      rows: 10,
    });
    const filter = BaseFilter.fromString('first=1 rows=10');
    const loadedFilter = BaseFilter.fromString('first=1 rows=10');
    store.dispatch(
      entitiesLoadingActions.success([override], filter, loadedFilter, counts),
    );

    render(<OverrideListPage />);

    await wait();

    // change to all filtered
    const tableFooter = within(screen.queryTableFooter() as HTMLElement);
    const select = tableFooter.getSelectElement();
    const selectItems = await getSelectItemElementsForSelect(select);
    fireEvent.click(selectItems[2]);
    expect(select).toHaveValue('Apply to all filtered');

    // export all filtered overrides
    const exportIcon = screen.getByTitle('Export all filtered');
    fireEvent.click(exportIcon);
    expect(gmp.overrides.exportByFilter).toHaveBeenCalled();

    // move all filtered overrides to trashcan
    const deleteIcon = screen.getByTitle('Move all filtered to trashcan');
    fireEvent.click(deleteIcon);
    testBulkTrashcanDialog(screen, gmp.overrides.deleteByFilter);
  });

  test('should render loading state while overrides are being fetched', async () => {
    const pendingPromise = new Promise(() => {});
    const gmp = createGmp({
      getOverrides: testing.fn().mockReturnValue(pendingPromise),
    });

    const {render, store} = rendererWith({
      gmp,
      capabilities: true,
      store: true,
      router: true,
    });

    const defaultSettingFilter = BaseFilter.fromString('foo=bar');
    store.dispatch(loadingActions.success({rowsperpage: {value: '2'}}));
    store.dispatch(
      defaultFilterLoadingActions.success('override', defaultSettingFilter),
    );

    render(<OverrideListPage />);

    await wait();

    expect(screen.getByTestId('loading')).toBeInTheDocument();
  });

  test('should render an error message when loading overrides fails', async () => {
    const error = new Error('Loading overrides failed');
    const gmp = createGmp({
      getOverrides: testing.fn().mockRejectedValue(error),
    });

    const {render, store} = rendererWith({
      gmp,
      capabilities: true,
      store: true,
      router: true,
    });

    const defaultSettingFilter = BaseFilter.fromString('foo=bar');
    store.dispatch(loadingActions.success({rowsperpage: {value: '2'}}));
    store.dispatch(
      defaultFilterLoadingActions.success('override', defaultSettingFilter),
    );

    render(<OverrideListPage />);

    await wait();

    expect(screen.getByTestId('error-message')).toHaveTextContent(
      'Loading overrides failed',
    );
  });

  test('should allow to navigate with pagination controls', async () => {
    const overrides = createOverrides(10);

    const counts = new CollectionCounts({
      first: 11,
      all: 100,
      filtered: 50,
      length: 10,
      rows: 10,
    });
    const listFilter = BaseFilter.fromString('first=11 rows=10');
    const getOverrides = testing.fn().mockResolvedValue({
      data: overrides,
      meta: {
        filter: listFilter,
        counts,
      },
    });

    const gmp = createGmp({
      getOverrides,
    });

    const {render, store} = rendererWith({
      gmp,
      capabilities: true,
      store: true,
      router: true,
    });

    store.dispatch(loadingActions.success({rowsperpage: {value: '10'}}));
    store.dispatch(defaultFilterLoadingActions.success('override', listFilter));

    render(<OverrideListPage />);

    await wait();

    // Ignore initial load calls and validate only pagination-triggered fetches.
    getOverrides.mockClear();

    const footer = within(screen.getByTestId('entities-table-footer'));

    fireEvent.click(footer.getByTitle('Next'));
    await wait();

    const nextFilterString =
      getOverrides.mock.calls[0][0].filter.toFilterString();
    expect(nextFilterString).toContain('first=21');
    expect(nextFilterString).toContain('rows=10');
    getOverrides.mockClear();

    fireEvent.click(footer.getByTitle('Previous'));
    await wait();

    const previousFilterString =
      getOverrides.mock.calls[0][0].filter.toFilterString();
    expect(previousFilterString).toContain('first=1');
    expect(previousFilterString).toContain('rows=10');
    getOverrides.mockClear();

    fireEvent.click(footer.getByTitle('First'));
    await wait();

    const firstFilterString =
      getOverrides.mock.calls[0][0].filter.toFilterString();
    expect(firstFilterString).toContain('first=1');
    expect(firstFilterString).toContain('rows=10');
    getOverrides.mockClear();

    fireEvent.click(footer.getByTitle('Last'));
    await wait();

    const lastFilterString =
      getOverrides.mock.calls[0][0].filter.toFilterString();
    expect(lastFilterString).toContain('first=41');
    expect(lastFilterString).toContain('rows=10');
  });
});
