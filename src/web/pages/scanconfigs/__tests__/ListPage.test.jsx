/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {
  screen,
  testBulkTrashcanDialog,
  rendererWith,
  fireEvent,
  wait,
} from 'web/testing';
import Capabilities from 'gmp/capabilities/capabilities';
import CollectionCounts from 'gmp/collection/CollectionCounts';
import Filter from 'gmp/models/filter';
import ScanConfig, {
  SCANCONFIG_TREND_STATIC,
  SCANCONFIG_TREND_DYNAMIC,
} from 'gmp/models/scanconfig';
import {currentSettingsDefaultResponse} from 'web/pages/__mocks__/CurrentSettings';
import ScanConfigsPage, {ToolBarIcons} from 'web/pages/scanconfigs/ListPage';
import {entitiesLoadingActions} from 'web/store/entities/scanconfigs';
import {setUsername} from 'web/store/usersettings/actions';
import {defaultFilterLoadingActions} from 'web/store/usersettings/defaultfilters/actions';
import {loadingActions} from 'web/store/usersettings/defaults/actions';

const config = ScanConfig.fromElement({
  _id: '12345',
  name: 'foo',
  comment: 'bar',
  creation_time: '2019-07-16T06:31:29Z',
  modification_time: '2019-07-16T06:44:55Z',
  owner: {name: 'admin'},
  writable: '1',
  in_use: '0',
  usage_type: 'scan',
  permissions: {permission: [{name: 'everything'}]},
  scanner: {name: 'scanner', type: '42'},
  tasks: {
    task: [
      {id: '1234', name: 'task1'},
      {id: '5678', name: 'task2'},
    ],
  },
  family_count: {
    __text: 2,
    growing: SCANCONFIG_TREND_STATIC,
  },
  nvt_count: {
    __text: 4,
    growing: SCANCONFIG_TREND_DYNAMIC,
  },
});

const caps = new Capabilities(['everything']);
const wrongCaps = new Capabilities(['get_config']);

const reloadInterval = 1;
const manualUrl = 'test/';

const currentSettings = testing
  .fn()
  .mockResolvedValue(currentSettingsDefaultResponse);

const getFilters = testing.fn().mockReturnValue(
  Promise.resolve({
    data: [],
    meta: {
      filter: Filter.fromString(),
      counts: new CollectionCounts(),
    },
  }),
);

const getConfigs = testing.fn().mockResolvedValue({
  data: [config],
  meta: {
    filter: Filter.fromString(),
    counts: new CollectionCounts(),
  },
});

const getSetting = testing.fn().mockResolvedValue({filter: null});

describe('ScanConfigsPage tests', () => {
  test('should render full ScanConfigsPage', async () => {
    const gmp = {
      scanconfigs: {
        get: getConfigs,
      },
      filters: {
        get: getFilters,
      },
      reloadInterval,
      settings: {manualUrl},
      user: {currentSettings, getSetting: getSetting},
    };

    const {render, store} = rendererWith({
      gmp,
      capabilities: true,
      store: true,
      router: true,
    });

    store.dispatch(setUsername('admin'));

    const defaultSettingFilter = Filter.fromString('foo=bar');
    store.dispatch(loadingActions.success({rowsperpage: {value: '2'}}));
    store.dispatch(
      defaultFilterLoadingActions.success('scanconfig', defaultSettingFilter),
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
      entitiesLoadingActions.success([config], filter, loadedFilter, counts),
    );

    const {baseElement} = render(
      <ScanConfigsPage openEditNvtDetailsDialog={testing.fn()} />,
    );

    await wait();

    expect(baseElement).toBeInTheDocument();
    expect(screen.queryTable()).toBeInTheDocument();
  });

  test('should call commands for bulk actions', async () => {
    const deleteByFilter = testing.fn().mockResolvedValue({
      foo: 'bar',
    });

    const exportByFilter = testing.fn().mockResolvedValue({
      foo: 'bar',
    });

    const renewSession = testing.fn().mockResolvedValue({data: {}});

    const gmp = {
      scanconfigs: {
        get: getConfigs,
        deleteByFilter,
        exportByFilter,
      },
      filters: {
        get: getFilters,
      },
      reloadInterval,
      settings: {manualUrl},
      user: {currentSettings, getSetting, renewSession},
    };

    const {render, store} = rendererWith({
      gmp,
      capabilities: true,
      store: true,
      router: true,
    });

    store.dispatch(setUsername('admin'));

    const defaultSettingFilter = Filter.fromString('foo=bar');
    store.dispatch(loadingActions.success({rowsperpage: {value: '2'}}));
    store.dispatch(
      defaultFilterLoadingActions.success('scanconfig', defaultSettingFilter),
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
      entitiesLoadingActions.success([config], filter, loadedFilter, counts),
    );

    render(<ScanConfigsPage openEditNvtDetailsDialog={testing.fn()} />);

    await wait();

    const deleteIcon = screen.getAllByTitle(
      'Move page contents to trashcan',
    )[0];
    fireEvent.click(deleteIcon);
    testBulkTrashcanDialog(screen, deleteByFilter);

    const exportIcon = screen.getAllByTitle('Export page contents')[0];
    fireEvent.click(exportIcon);
    expect(exportByFilter).toHaveBeenCalled();
  });
});

describe('ScanConfigsPage ToolBarIcons test', () => {
  test('should render', () => {
    const handleScanConfigCreateClick = testing.fn();
    const handleScanConfigImportClick = testing.fn();

    const gmp = {
      settings: {manualUrl},
    };

    const {render} = rendererWith({
      gmp,
      capabilities: caps,
      router: true,
    });

    const {element} = render(
      <ToolBarIcons
        onScanConfigCreateClick={handleScanConfigCreateClick}
        onScanConfigImportClick={handleScanConfigImportClick}
      />,
    );
    expect(element).toBeVisible();

    const helpIcon = screen.getByTestId('help-icon');
    const links = element.querySelectorAll('a');

    expect(helpIcon).toHaveAttribute('title', 'Help: Scan Configs');
    expect(links[0]).toHaveAttribute(
      'href',
      'test/en/scanning.html#managing-scan-configurations',
    );
  });

  test('should call click handlers', () => {
    const handleScanConfigCreateClick = testing.fn();
    const handleScanConfigImportClick = testing.fn();

    const gmp = {
      settings: {manualUrl},
    };

    const {render} = rendererWith({
      gmp,
      capabilities: caps,
      router: true,
    });

    render(
      <ToolBarIcons
        onScanConfigCreateClick={handleScanConfigCreateClick}
        onScanConfigImportClick={handleScanConfigImportClick}
      />,
    );

    const newIcon = screen.getByTestId('new-icon');
    fireEvent.click(newIcon);
    expect(handleScanConfigCreateClick).toHaveBeenCalled();
    expect(newIcon).toHaveAttribute('title', 'New Scan Config');

    const uploadIcon = screen.getByTestId('upload-icon');
    fireEvent.click(uploadIcon);
    expect(handleScanConfigImportClick).toHaveBeenCalled();
    expect(uploadIcon).toHaveAttribute('title', 'Import Scan Config');
  });

  test('should not show icons if user does not have the right permissions', () => {
    const handleScanConfigCreateClick = testing.fn();
    const handleScanConfigImportClick = testing.fn();

    const gmp = {settings: {manualUrl}};

    const {render} = rendererWith({
      gmp,
      capabilities: wrongCaps,
      router: true,
    });

    render(
      <ToolBarIcons
        onScanConfigCreateClick={handleScanConfigCreateClick}
        onScanConfigImportClick={handleScanConfigImportClick}
      />,
    );

    const newIcon = screen.queryByTestId('new-icon');
    expect(newIcon).toBeNull();
    const uploadIcon = screen.queryByTestId('upload-icon');
    expect(uploadIcon).toBeNull();

    expect(screen.getByTestId('help-icon')).toHaveAttribute(
      'title',
      'Help: Scan Configs',
    );
  });
});
