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

import Capabilities from 'gmp/capabilities/capabilities';
import CollectionCounts from 'gmp/collection/collectioncounts';

import Filter from 'gmp/models/filter';
import ScanConfig, {
  OPENVAS_SCAN_CONFIG_TYPE,
  SCANCONFIG_TREND_STATIC,
  SCANCONFIG_TREND_DYNAMIC,
} from 'gmp/models/scanconfig';

import {setUsername} from 'web/store/usersettings/actions';

import {entitiesLoadingActions} from 'web/store/entities/scanconfigs';
import {loadingActions} from 'web/store/usersettings/defaults/actions';
import {defaultFilterLoadingActions} from 'web/store/usersettings/defaultfilters/actions';

import {rendererWith, waitForElement, fireEvent} from 'web/utils/testing';

import ScanConfigsPage, {ToolBarIcons} from '../listpage';

window.URL.createObjectURL = jest.fn();

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
  type: OPENVAS_SCAN_CONFIG_TYPE,
  tasks: {
    task: [{id: '1234', name: 'task1'}, {id: '5678', name: 'task2'}],
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

const currentSettings = jest.fn().mockResolvedValue({foo: 'bar'});

const getFilters = jest.fn().mockReturnValue(
  Promise.resolve({
    data: [],
    meta: {
      filter: Filter.fromString(),
      counts: new CollectionCounts(),
    },
  }),
);

const getConfigs = jest.fn().mockResolvedValue({
  data: [config],
  meta: {
    filter: Filter.fromString(),
    counts: new CollectionCounts(),
  },
});

const getSetting = jest.fn().mockResolvedValue({filter: null});

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

    const defaultSettingfilter = Filter.fromString('foo=bar');
    store.dispatch(loadingActions.success({rowsperpage: {value: '2'}}));
    store.dispatch(
      defaultFilterLoadingActions.success('scanconfig', defaultSettingfilter),
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

    const {baseElement} = render(<ScanConfigsPage />);

    await waitForElement(() => baseElement.querySelectorAll('table'));

    expect(baseElement).toMatchSnapshot();
  });

  test('should call commands for bulk actions', async () => {
    const deleteByFilter = jest.fn().mockResolvedValue({
      foo: 'bar',
    });

    const exportByFilter = jest.fn().mockResolvedValue({
      foo: 'bar',
    });

    const renewSession = jest.fn().mockResolvedValue({data: {}});

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

    const defaultSettingfilter = Filter.fromString('foo=bar');
    store.dispatch(loadingActions.success({rowsperpage: {value: '2'}}));
    store.dispatch(
      defaultFilterLoadingActions.success('scanconfig', defaultSettingfilter),
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

    const {baseElement, getAllByTestId} = render(<ScanConfigsPage />);

    await waitForElement(() => baseElement.querySelectorAll('table'));

    const icons = getAllByTestId('svg-icon');

    await act(async () => {
      expect(icons[21]).toHaveAttribute(
        'title',
        'Move page contents to trashcan',
      );
      fireEvent.click(icons[21]);
      expect(deleteByFilter).toHaveBeenCalled();

      expect(icons[22]).toHaveAttribute('title', 'Export page contents');
      fireEvent.click(icons[22]);
      expect(exportByFilter).toHaveBeenCalled();
    });
  });
});

describe('ScanConfigsPage ToolBarIcons test', () => {
  test('should render', () => {
    const handleScanConfigCreateClick = jest.fn();
    const handleScanConfigImportClick = jest.fn();

    const gmp = {
      settings: {manualUrl},
    };

    const {render} = rendererWith({
      gmp,
      capabilities: caps,
      router: true,
    });

    const {element, getAllByTestId} = render(
      <ToolBarIcons
        onScanConfigCreateClick={handleScanConfigCreateClick}
        onScanConfigImportClick={handleScanConfigImportClick}
      />,
    );
    expect(element).toMatchSnapshot();

    const icons = getAllByTestId('svg-icon');
    const links = element.querySelectorAll('a');

    expect(icons[0]).toHaveAttribute('title', 'Help: Scan Configs');
    expect(links[0]).toHaveAttribute(
      'href',
      'test/en/scanning.html#managing-scan-configurations',
    );
  });

  test('should call click handlers', () => {
    const handleScanConfigCreateClick = jest.fn();
    const handleScanConfigImportClick = jest.fn();

    const gmp = {
      settings: {manualUrl},
    };

    const {render} = rendererWith({
      gmp,
      capabilities: caps,
      router: true,
    });

    const {getAllByTestId} = render(
      <ToolBarIcons
        onScanConfigCreateClick={handleScanConfigCreateClick}
        onScanConfigImportClick={handleScanConfigImportClick}
      />,
    );

    const icons = getAllByTestId('svg-icon');

    fireEvent.click(icons[1]);
    expect(handleScanConfigCreateClick).toHaveBeenCalled();
    expect(icons[1]).toHaveAttribute('title', 'New Scan Config');

    fireEvent.click(icons[2]);
    expect(handleScanConfigImportClick).toHaveBeenCalled();
    expect(icons[2]).toHaveAttribute('title', 'Import Scan Config');
  });

  test('should not show icons if user does not have the right permissions', () => {
    const handleScanConfigCreateClick = jest.fn();
    const handleScanConfigImportClick = jest.fn();

    const gmp = {settings: {manualUrl}};

    const {render} = rendererWith({
      gmp,
      capabilities: wrongCaps,
      router: true,
    });

    const {queryAllByTestId} = render(
      <ToolBarIcons
        onScanConfigCreateClick={handleScanConfigCreateClick}
        onScanConfigImportClick={handleScanConfigImportClick}
      />,
    );

    const icons = queryAllByTestId('svg-icon');
    expect(icons.length).toBe(1);
    expect(icons[0]).toHaveAttribute('title', 'Help: Scan Configs');
  });
});
