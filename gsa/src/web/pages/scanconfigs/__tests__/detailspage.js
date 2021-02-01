/* Copyright (C) 2019-2021 Greenbone Networks GmbH
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

import {setLocale} from 'gmp/locale/lang';

import {isDefined} from 'gmp/utils/identity';

import Capabilities from 'gmp/capabilities/capabilities';
import CollectionCounts from 'gmp/collection/collectioncounts';

import Filter from 'gmp/models/filter';
import ScanConfig from 'gmp/models/scanconfig';

import {createRenewSessionQueryMock} from 'web/graphql/__mocks__/session';
import {createGetScannersQueryMock} from 'web/graphql/__mocks__/scanners';
import {
  createGetPermissionsQueryMock,
  noPermissions,
} from 'web/graphql/__mocks__/permissions';
import {
  createCloneScanConfigQueryMock,
  createDeleteScanConfigsByIdsQueryMock,
  createExportScanConfigsByIdsQueryMock,
  createGetScanConfigQueryMock,
  editableConfig,
  inUseConfig,
  noPermConfig,
  nonWritableConfig,
} from 'web/graphql/__mocks__/scanconfigs';
import {setTimezone} from 'web/store/usersettings/actions';

import {rendererWith, fireEvent, act, wait} from 'web/utils/testing';

import Detailspage, {ToolBarIcons} from '../detailspage';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({
    id: '314',
  }),
}));

if (!isDefined(window.URL)) {
  window.URL = {};
}
window.URL.createObjectURL = jest.fn();

setLocale('en');

const config = ScanConfig.fromObject(editableConfig);

const config2 = ScanConfig.fromObject(noPermConfig);

const config3 = ScanConfig.fromObject(inUseConfig);

const config4 = ScanConfig.fromObject(nonWritableConfig);

const caps = new Capabilities(['everything']);
const wrongCaps = new Capabilities(['get_config']);

const entityType = 'scanconfig';
const reloadInterval = -1;
const manualUrl = 'test/';

let currentSettings;
let getPermissions;
let renewSession;

beforeEach(() => {
  currentSettings = jest.fn().mockResolvedValue({
    foo: 'bar',
  });

  renewSession = jest.fn().mockResolvedValue({
    foo: 'bar',
  });

  getPermissions = jest.fn().mockResolvedValue({
    data: [],
    meta: {
      filter: Filter.fromString(),
      counts: new CollectionCounts(),
    },
  });
});

describe('Scan Config Detailspage tests', () => {
  test('should render full Detailspage', async () => {
    const getConfig = jest.fn().mockResolvedValue({
      data: config,
    });

    const gmp = {
      [entityType]: {
        get: getConfig,
      },
      permissions: {
        get: getPermissions,
      },
      settings: {manualUrl, reloadInterval},
      user: {
        currentSettings,
      },
    };

    const [mock, resultFunc] = createGetScanConfigQueryMock();

    const [renewSessionQueryMock] = createRenewSessionQueryMock();
    const [permissionQueryMock] = createGetPermissionsQueryMock({
      filterString: 'resource_uuid=314 first=1 rows=-1',
    });
    const {render, store} = rendererWith({
      capabilities: caps,
      gmp,
      router: true,
      store: true,
      queryMocks: [mock, renewSessionQueryMock, permissionQueryMock],
    });

    store.dispatch(setTimezone('CET'));

    const {getAllByTestId, baseElement} = render(<Detailspage id="314" />);

    await wait();

    expect(resultFunc).toHaveBeenCalled();

    expect(baseElement).toHaveTextContent('Scan Config: Half empty and slow');

    const links = baseElement.querySelectorAll('a');
    const icons = getAllByTestId('svg-icon');
    const detailslinks = getAllByTestId('details-link');

    expect(icons[0]).toHaveAttribute('title', 'Help: ScanConfigs');
    expect(links[0]).toHaveAttribute(
      'href',
      'test/en/scanning.html#managing-scan-configurations',
    );

    expect(links[1]).toHaveAttribute('href', '/scanconfigs');
    expect(icons[1]).toHaveAttribute('title', 'ScanConfig List');

    expect(baseElement).toHaveTextContent('314');
    expect(baseElement).toHaveTextContent('Mon, Aug 17, 2020 2:18 PM CEST');
    expect(baseElement).toHaveTextContent('Tue, Sep 29, 2020 2:16 PM CEST');
    expect(baseElement).toHaveTextContent('admin');

    expect(baseElement).toHaveTextContent("Most NVT's");

    expect(baseElement).toHaveTextContent('foo');
    expect(detailslinks[0]).toHaveAttribute('href', '/task/457');

    expect(baseElement).not.toHaveTextContent('scanner');
  });

  test('should render nvt families tab', async () => {
    const getConfig = jest.fn().mockResolvedValue({
      data: config,
    });

    const gmp = {
      [entityType]: {
        get: getConfig,
      },
      settings: {manualUrl, reloadInterval},
      user: {
        currentSettings,
        renewSession,
      },
    };

    const [mock, resultFunc] = createGetScanConfigQueryMock();

    const [renewSessionQueryMock] = createRenewSessionQueryMock();
    const [permissionQueryMock] = createGetPermissionsQueryMock({
      filterString: 'resource_uuid=314 first=1 rows=-1',
    });
    const {render, store} = rendererWith({
      capabilities: caps,
      gmp,
      router: true,
      store: true,
      queryMocks: [mock, renewSessionQueryMock, permissionQueryMock],
    });

    store.dispatch(setTimezone('CET'));

    const {getAllByTestId, baseElement} = render(<Detailspage id="314" />);

    await wait();

    expect(resultFunc).toHaveBeenCalled();

    const spans = baseElement.querySelectorAll('span');
    fireEvent.click(spans[12]);

    expect(baseElement).toHaveTextContent('family1');
    expect(baseElement).toHaveTextContent('7 of 10');
    expect(baseElement).toHaveTextContent('family2');
    expect(baseElement).toHaveTextContent('0 of 5');

    const links = baseElement.querySelectorAll('a');

    const icons = getAllByTestId('svg-icon');

    expect(links[2]).toHaveAttribute(
      'href',
      '/nvts?filter=family%3D%22family1%22',
    );
    expect(links[2]).toHaveAttribute('title', 'NVTs of family family1');
    expect(links[3]).toHaveAttribute(
      'href',
      '/nvts?filter=family%3D%22family2%22',
    );
    expect(links[3]).toHaveAttribute('title', 'NVTs of family family2');

    expect(icons[7]).toHaveAttribute('title', 'Import Scan Config');

    expect(icons[9]).toHaveAttribute(
      'title',
      'The families selection is DYNAMIC. New families will automatically be added and considered.',
    );

    expect(icons[10]).toHaveAttribute(
      'title',
      'The NVT selection is DYNAMIC. New NVTs will automatically be added and considered.',
    );
    expect(icons[11]).toHaveAttribute(
      'title',
      'The NVT selection is STATIC. New NVTs will NOT automatically be added and considered.',
    );
  });

  test('should render nvt preferences tab', async () => {
    const getConfig = jest.fn().mockResolvedValue({
      data: config,
    });

    const gmp = {
      [entityType]: {
        get: getConfig,
      },
      settings: {manualUrl, reloadInterval},
      user: {
        currentSettings,
        renewSession,
      },
    };

    const [mock, resultFunc] = createGetScanConfigQueryMock();

    const [renewSessionQueryMock] = createRenewSessionQueryMock();
    const [permissionQueryMock] = createGetPermissionsQueryMock({
      filterString: 'resource_uuid=314 first=1 rows=-1',
    });

    const {render, store} = rendererWith({
      capabilities: caps,
      gmp,
      router: true,
      store: true,
      queryMocks: [mock, renewSessionQueryMock, permissionQueryMock],
    });

    store.dispatch(setTimezone('CET'));

    const {baseElement, getAllByTestId} = render(<Detailspage id="314" />);
    await wait();

    expect(resultFunc).toHaveBeenCalled();

    const spans = baseElement.querySelectorAll('span');
    fireEvent.click(spans[14]);

    const detailsLinks = getAllByTestId('details-link');

    expect(detailsLinks[0]).toHaveAttribute(
      'href',
      '/nvt/1.3.6.1.4.1.25623.1.0.100151',
    );
    expect(detailsLinks[0]).toHaveTextContent('PostgreSQL Detection');
    expect(baseElement).toHaveTextContent('regress');
    expect(baseElement).toHaveTextContent('postgres');
  });

  test('should render user tags tab', async () => {
    const getConfig = jest.fn().mockResolvedValue({
      data: config,
    });

    const getTags = jest.fn().mockResolvedValue({
      data: [],
      meta: {
        filter: Filter.fromString(),
        counts: new CollectionCounts(),
      },
    });

    const gmp = {
      [entityType]: {
        get: getConfig,
      },
      permissions: {
        get: getPermissions,
      },
      tags: {
        get: getTags,
      },
      settings: {manualUrl, reloadInterval},
      user: {
        currentSettings,
        renewSession,
      },
    };

    const [mock, resultFunc] = createGetScanConfigQueryMock();

    const [renewSessionQueryMock] = createRenewSessionQueryMock();
    const [permissionQueryMock] = createGetPermissionsQueryMock({
      filterString: 'resource_uuid=314 first=1 rows=-1',
    });

    const {render, store} = rendererWith({
      capabilities: caps,
      gmp,
      router: true,
      store: true,
      queryMocks: [mock, renewSessionQueryMock, permissionQueryMock],
    });

    store.dispatch(setTimezone('CET'));

    const {baseElement} = render(<Detailspage id="314" />);

    await wait();

    expect(resultFunc).toHaveBeenCalled();

    const spans = baseElement.querySelectorAll('span');
    fireEvent.click(spans[16]);

    expect(baseElement).toHaveTextContent('No user tags available');
  });

  test('should render permissions tab', async () => {
    const getConfig = jest.fn().mockResolvedValue({
      data: config,
    });

    const gmp = {
      [entityType]: {
        get: getConfig,
      },
      permissions: {
        get: getPermissions,
      },
      settings: {manualUrl, reloadInterval},
      user: {
        currentSettings,
        renewSession,
      },
    };

    const [mock, resultFunc] = createGetScanConfigQueryMock(
      '314',
      noPermConfig,
    );

    const [renewSessionQueryMock] = createRenewSessionQueryMock();
    const [permissionQueryMock] = createGetPermissionsQueryMock(
      {
        filterString: 'resource_uuid=314 first=1 rows=-1',
      },
      noPermissions,
    );

    const {render, store} = rendererWith({
      capabilities: caps,
      gmp,
      router: true,
      store: true,
      queryMocks: [mock, renewSessionQueryMock, permissionQueryMock],
    });

    store.dispatch(setTimezone('CET'));

    const {baseElement} = render(<Detailspage id="314" />);

    await wait();

    expect(resultFunc).toHaveBeenCalled();
    const spans = baseElement.querySelectorAll('span');
    fireEvent.click(spans[18]);

    await wait();

    expect(baseElement).toHaveTextContent('No permissions available');
  });

  test('should call commands', async () => {
    const getConfig = jest.fn().mockReturnValue(
      Promise.resolve({
        data: config,
      }),
    );
    const getNvtFamilies = jest.fn().mockReturnValue(
      Promise.resolve({
        foo: 'bar',
      }),
    );

    const gmp = {
      [entityType]: {
        get: getConfig,
      },
      nvtfamilies: {
        get: getNvtFamilies,
      },
      settings: {manualUrl, reloadInterval},
      user: {
        currentSettings,
        renewSession,
      },
    };

    const [mock, resultFunc] = createGetScanConfigQueryMock(
      '314',
      editableConfig,
    );

    const [renewSessionQueryMock] = createRenewSessionQueryMock();
    const [permissionQueryMock] = createGetPermissionsQueryMock({
      filterString: 'resource_uuid=314 first=1 rows=-1',
    });
    const [cloneQueryMock, cloneQueryResult] = createCloneScanConfigQueryMock();
    const [
      exportQueryMock,
      exportQueryResult,
    ] = createExportScanConfigsByIdsQueryMock(['314']);
    const [
      deleteQueryMock,
      deleteQueryResult,
    ] = createDeleteScanConfigsByIdsQueryMock();
    const [scannerQueryMock, scannerQueryResult] = createGetScannersQueryMock();
    const {render, store} = rendererWith({
      capabilities: caps,
      gmp,
      router: true,
      store: true,
      queryMocks: [
        mock,
        renewSessionQueryMock,
        permissionQueryMock,
        cloneQueryMock,
        exportQueryMock,
        deleteQueryMock,
        scannerQueryMock,
      ],
    });

    store.dispatch(setTimezone('CET'));

    const {getAllByTestId} = render(<Detailspage id="314" />);

    await wait();

    expect(resultFunc).toHaveBeenCalled();
    const icons = getAllByTestId('svg-icon');

    expect(icons[0]).toHaveAttribute('title', 'Help: ScanConfigs');
    expect(icons[1]).toHaveAttribute('title', 'ScanConfig List');

    expect(icons[2]).toHaveAttribute('title', 'Create new Scan Config');

    expect(icons[3]).toHaveAttribute('title', 'Clone Scan Config');
    fireEvent.click(icons[3]);
    expect(cloneQueryResult).toHaveBeenCalled();

    expect(icons[4]).toHaveAttribute('title', 'Edit Scan Config');
    fireEvent.click(icons[4]);

    await wait();
    expect(getNvtFamilies).toHaveBeenCalled();
    expect(scannerQueryResult).toHaveBeenCalled();

    expect(icons[5]).toHaveAttribute('title', 'Move Scan Config to trashcan');
    fireEvent.click(icons[5]);
    expect(deleteQueryResult).toHaveBeenCalled();

    expect(icons[6]).toHaveAttribute('title', 'Export Scan Config as XML');
    fireEvent.click(icons[6]);
    expect(exportQueryResult).toHaveBeenCalled();

    expect(icons[7]).toHaveAttribute('title', 'Import Scan Config');
  });

  test('should not call commands without permission', async () => {
    const getConfig = jest.fn().mockReturnValue(
      Promise.resolve({
        data: config2,
      }),
    );

    const getNvtFamilies = jest.fn().mockReturnValue(
      Promise.resolve({
        foo: 'bar',
      }),
    );

    const gmp = {
      [entityType]: {
        get: getConfig,
      },
      nvtfamilies: {
        get: getNvtFamilies,
      },
      settings: {manualUrl, reloadInterval},
      user: {
        currentSettings,
        renewSession,
      },
    };

    const [mock, resultFunc] = createGetScanConfigQueryMock(
      '314',
      noPermConfig,
    );

    const [renewSessionQueryMock] = createRenewSessionQueryMock();
    const [permissionQueryMock] = createGetPermissionsQueryMock(
      {
        filterString: 'resource_uuid=314 first=1 rows=-1',
      },
      noPermissions,
    );
    const [cloneQueryMock, cloneQueryResult] = createCloneScanConfigQueryMock();
    const [
      exportQueryMock,
      exportQueryResult,
    ] = createExportScanConfigsByIdsQueryMock(['314']);
    const [
      deleteQueryMock,
      deleteQueryResult,
    ] = createDeleteScanConfigsByIdsQueryMock();

    const [scannerQueryMock, scannerQueryResult] = createGetScannersQueryMock();

    const {render, store} = rendererWith({
      capabilities: caps,
      gmp,
      router: true,
      store: true,
      queryMocks: [
        mock,
        renewSessionQueryMock,
        permissionQueryMock,
        cloneQueryMock,
        exportQueryMock,
        deleteQueryMock,
        scannerQueryMock,
      ],
    });

    store.dispatch(setTimezone('CET'));

    const {getAllByTestId} = render(<Detailspage id="314" />);

    await wait();

    expect(resultFunc).toHaveBeenCalled();
    const icons = getAllByTestId('svg-icon');

    expect(icons[0]).toHaveAttribute('title', 'Help: ScanConfigs');
    expect(icons[1]).toHaveAttribute('title', 'ScanConfig List');

    expect(icons[2]).toHaveAttribute('title', 'Create new Scan Config');

    await act(async () => {
      fireEvent.click(icons[3]);
      expect(cloneQueryResult).not.toHaveBeenCalled();
      expect(icons[3]).toHaveAttribute(
        'title',
        'Permission to clone Scan Config denied',
      );

      fireEvent.click(icons[4]);
      expect(getNvtFamilies).not.toHaveBeenCalled();
      expect(scannerQueryResult).not.toHaveBeenCalled();
      expect(icons[4]).toHaveAttribute(
        'title',
        'Permission to edit Scan Config denied',
      );

      fireEvent.click(icons[5]);
      expect(deleteQueryResult).not.toHaveBeenCalled();
      expect(icons[5]).toHaveAttribute(
        'title',
        'Permission to move Scan Config to trashcan denied',
      );

      fireEvent.click(icons[6]);
      expect(exportQueryResult).toHaveBeenCalled();
      expect(icons[6]).toHaveAttribute('title', 'Export Scan Config as XML');
    });

    expect(icons[7]).toHaveAttribute('title', 'Import Scan Config');
  });

  test('should (not) call commands if config is in use', async () => {
    const getConfig = jest.fn().mockReturnValue(
      Promise.resolve({
        data: ScanConfig.fromObject(inUseConfig),
      }),
    );

    const getNvtFamilies = jest.fn().mockReturnValue(
      Promise.resolve({
        foo: 'bar',
      }),
    );

    const gmp = {
      [entityType]: {
        get: getConfig,
      },
      nvtfamilies: {
        get: getNvtFamilies,
      },
      settings: {manualUrl, reloadInterval},
      user: {
        currentSettings,
        renewSession,
      },
    };

    const [mock, resultFunc] = createGetScanConfigQueryMock('314', inUseConfig);

    const [renewSessionQueryMock] = createRenewSessionQueryMock();
    const [permissionQueryMock] = createGetPermissionsQueryMock({
      filterString: 'resource_uuid=314 first=1 rows=-1',
    });
    const [cloneQueryMock, cloneQueryResult] = createCloneScanConfigQueryMock();
    const [
      exportQueryMock,
      exportQueryResult,
    ] = createExportScanConfigsByIdsQueryMock(['314']);
    const [
      deleteQueryMock,
      deleteQueryResult,
    ] = createDeleteScanConfigsByIdsQueryMock();

    const [scannerQueryMock, scannerQueryResult] = createGetScannersQueryMock();

    const {render, store} = rendererWith({
      capabilities: caps,
      gmp,
      router: true,
      store: true,
      queryMocks: [
        mock,
        renewSessionQueryMock,
        permissionQueryMock,
        cloneQueryMock,
        exportQueryMock,
        deleteQueryMock,
        scannerQueryMock,
      ],
    });

    store.dispatch(setTimezone('CET'));

    const {getAllByTestId} = render(<Detailspage id="314" />);

    await wait();

    expect(resultFunc).toHaveBeenCalled();
    const icons = getAllByTestId('svg-icon');

    expect(icons[0]).toHaveAttribute('title', 'Help: ScanConfigs');
    expect(icons[1]).toHaveAttribute('title', 'ScanConfig List');

    expect(icons[2]).toHaveAttribute('title', 'Create new Scan Config');

    expect(icons[3]).toHaveAttribute('title', 'Clone Scan Config');
    fireEvent.click(icons[3]);
    await wait();
    expect(cloneQueryResult).toHaveBeenCalled();

    expect(icons[4]).toHaveAttribute('title', 'Edit Scan Config');
    fireEvent.click(icons[4]);
    await wait();

    expect(getNvtFamilies).toHaveBeenCalled();
    expect(scannerQueryResult).toHaveBeenCalled();

    expect(icons[5]).toHaveAttribute('title', 'Scan Config is still in use');
    fireEvent.click(icons[5]);
    await wait();

    expect(deleteQueryResult).not.toHaveBeenCalled();

    expect(icons[6]).toHaveAttribute('title', 'Export Scan Config as XML');
    fireEvent.click(icons[6]);
    await wait();

    expect(exportQueryResult).toHaveBeenCalled();

    expect(icons[7]).toHaveAttribute('title', 'Import Scan Config');
  });

  test('should (not) call commands if config is not writable', async () => {
    const getNvtFamilies = jest.fn().mockReturnValue(
      Promise.resolve({
        foo: 'bar',
      }),
    );

    const gmp = {
      nvtfamilies: {
        get: getNvtFamilies,
      },
      settings: {manualUrl, reloadInterval},
      user: {currentSettings},
    };

    const [mock, resultFunc] = createGetScanConfigQueryMock();

    const [renewSessionQueryMock] = createRenewSessionQueryMock();
    const [permissionQueryMock] = createGetPermissionsQueryMock({
      filterString: 'resource_uuid=314 first=1 rows=-1',
    });
    const [cloneQueryMock, cloneQueryResult] = createCloneScanConfigQueryMock();
    const [
      exportQueryMock,
      exportQueryResult,
    ] = createExportScanConfigsByIdsQueryMock(['314']);
    const [
      deleteQueryMock,
      deleteQueryResult,
    ] = createDeleteScanConfigsByIdsQueryMock();
    const [scannerQueryMock, scannerQueryResult] = createGetScannersQueryMock();
    const {render, store} = rendererWith({
      capabilities: caps,
      gmp,
      router: true,
      store: true,
      queryMocks: [
        mock,
        renewSessionQueryMock,
        permissionQueryMock,
        cloneQueryMock,
        exportQueryMock,
        deleteQueryMock,
        scannerQueryMock,
      ],
    });

    store.dispatch(setTimezone('CET'));

    const {getAllByTestId} = render(<Detailspage id="314" />);

    await wait();

    expect(resultFunc).toHaveBeenCalled();
    const icons = getAllByTestId('svg-icon');

    expect(icons[0]).toHaveAttribute('title', 'Help: ScanConfigs');
    expect(icons[1]).toHaveAttribute('title', 'ScanConfig List');

    expect(icons[2]).toHaveAttribute('title', 'Create new Scan Config');

    expect(icons[3]).toHaveAttribute('title', 'Clone Scan Config');
    fireEvent.click(icons[3]);

    await wait();
    expect(cloneQueryResult).toHaveBeenCalled();

    fireEvent.click(icons[4]);
    expect(getNvtFamilies).not.toHaveBeenCalled();
    expect(scannerQueryResult).not.toHaveBeenCalled();
    expect(icons[4]).toHaveAttribute('title', 'Scan Config is not writable');

    fireEvent.click(icons[5]);
    expect(deleteQueryResult).not.toHaveBeenCalled();
    expect(icons[5]).toHaveAttribute('title', 'Scan Config is not writable');

    fireEvent.click(icons[6]);
    await wait();
    expect(exportQueryResult).toHaveBeenCalled();
    expect(icons[6]).toHaveAttribute('title', 'Export Scan Config as XML');

    expect(icons[7]).toHaveAttribute('title', 'Import Scan Config');
  });

  // TODO: should render scanner preferences tab
});

describe('Scan Config ToolBarIcons tests', () => {
  test('should render', () => {
    const handleScanConfigCreate = jest.fn();
    const handleScanConfigClone = jest.fn();
    const handleScanConfigDelete = jest.fn();
    const handleScanConfigDownload = jest.fn();
    const handleScanConfigEdit = jest.fn();
    const handleScanConfigImport = jest.fn();

    const {render} = rendererWith({
      gmp: {settings: {manualUrl}},
      capabilities: caps,
      router: true,
    });

    const {element, getAllByTestId} = render(
      <ToolBarIcons
        entity={config}
        onScanConfigCreateClick={handleScanConfigCreate}
        onScanConfigCloneClick={handleScanConfigClone}
        onScanConfigDeleteClick={handleScanConfigDelete}
        onScanConfigDownloadClick={handleScanConfigDownload}
        onScanConfigEditClick={handleScanConfigEdit}
        onScanConfigImportClick={handleScanConfigImport}
      />,
    );

    expect(element).toMatchSnapshot();

    const links = element.querySelectorAll('a');
    const icons = getAllByTestId('svg-icon');

    expect(icons[0]).toHaveAttribute('title', 'Help: ScanConfigs');
    expect(links[0]).toHaveAttribute(
      'href',
      'test/en/scanning.html#managing-scan-configurations',
    );

    expect(links[1]).toHaveAttribute('href', '/scanconfigs');
    expect(icons[1]).toHaveAttribute('title', 'ScanConfig List');
  });

  test('should call click handlers', () => {
    const handleScanConfigCreate = jest.fn();
    const handleScanConfigClone = jest.fn();
    const handleScanConfigDelete = jest.fn();
    const handleScanConfigDownload = jest.fn();
    const handleScanConfigEdit = jest.fn();
    const handleScanConfigImport = jest.fn();

    const {render} = rendererWith({
      gmp: {settings: {manualUrl}},
      capabilities: caps,
      router: true,
    });

    const {getAllByTestId} = render(
      <ToolBarIcons
        entity={config}
        onScanConfigCreateClick={handleScanConfigCreate}
        onScanConfigCloneClick={handleScanConfigClone}
        onScanConfigDeleteClick={handleScanConfigDelete}
        onScanConfigDownloadClick={handleScanConfigDownload}
        onScanConfigEditClick={handleScanConfigEdit}
        onScanConfigImportClick={handleScanConfigImport}
      />,
    );

    const icons = getAllByTestId('svg-icon');

    expect(icons[0]).toHaveAttribute('title', 'Help: ScanConfigs');
    expect(icons[1]).toHaveAttribute('title', 'ScanConfig List');

    fireEvent.click(icons[2]);
    expect(handleScanConfigCreate).toHaveBeenCalled();
    expect(icons[2]).toHaveAttribute('title', 'Create new Scan Config');

    fireEvent.click(icons[3]);
    expect(handleScanConfigClone).toHaveBeenCalledWith(config);
    expect(icons[3]).toHaveAttribute('title', 'Clone Scan Config');

    fireEvent.click(icons[4]);
    expect(handleScanConfigEdit).toHaveBeenCalledWith(config);
    expect(icons[4]).toHaveAttribute('title', 'Edit Scan Config');

    fireEvent.click(icons[5]);
    expect(handleScanConfigDelete).toHaveBeenCalledWith(config);
    expect(icons[5]).toHaveAttribute('title', 'Move Scan Config to trashcan');

    fireEvent.click(icons[6]);
    expect(handleScanConfigDownload).toHaveBeenCalledWith(config);
    expect(icons[6]).toHaveAttribute('title', 'Export Scan Config as XML');

    fireEvent.click(icons[7]);
    expect(handleScanConfigImport).toHaveBeenCalled();
    expect(icons[7]).toHaveAttribute('title', 'Import Scan Config');
  });

  test('should not call click handlers without permission', () => {
    const handleScanConfigCreate = jest.fn();
    const handleScanConfigClone = jest.fn();
    const handleScanConfigDelete = jest.fn();
    const handleScanConfigDownload = jest.fn();
    const handleScanConfigEdit = jest.fn();
    const handleScanConfigImport = jest.fn();

    const {render} = rendererWith({
      gmp: {settings: {manualUrl}},
      capabilities: wrongCaps,
      router: true,
    });

    const {getAllByTestId} = render(
      <ToolBarIcons
        entity={config2}
        onScanConfigCreateClick={handleScanConfigCreate}
        onScanConfigCloneClick={handleScanConfigClone}
        onScanConfigDeleteClick={handleScanConfigDelete}
        onScanConfigDownloadClick={handleScanConfigDownload}
        onScanConfigEditClick={handleScanConfigEdit}
        onScanConfigImportClick={handleScanConfigImport}
      />,
    );

    const icons = getAllByTestId('svg-icon');

    expect(icons.length).toBe(6);
    // because create icon and import icon are not rendered

    expect(icons[0]).toHaveAttribute('title', 'Help: ScanConfigs');
    expect(icons[1]).toHaveAttribute('title', 'ScanConfig List');

    fireEvent.click(icons[2]);
    expect(handleScanConfigClone).not.toHaveBeenCalled();
    expect(icons[2]).toHaveAttribute(
      'title',
      'Permission to clone Scan Config denied',
    );

    fireEvent.click(icons[3]);
    expect(handleScanConfigEdit).not.toHaveBeenCalled();
    expect(icons[3]).toHaveAttribute(
      'title',
      'Permission to edit Scan Config denied',
    );

    fireEvent.click(icons[4]);
    expect(handleScanConfigDelete).not.toHaveBeenCalled();
    expect(icons[4]).toHaveAttribute(
      'title',
      'Permission to move Scan Config to trashcan denied',
    );

    fireEvent.click(icons[5]);
    expect(handleScanConfigDownload).toHaveBeenCalledWith(config2);
    expect(icons[5]).toHaveAttribute('title', 'Export Scan Config as XML');
  });

  test('should (not) call click handlers if config is in use', () => {
    const handleScanConfigCreate = jest.fn();
    const handleScanConfigClone = jest.fn();
    const handleScanConfigDelete = jest.fn();
    const handleScanConfigDownload = jest.fn();
    const handleScanConfigEdit = jest.fn();
    const handleScanConfigImport = jest.fn();

    const {render} = rendererWith({
      gmp: {settings: {manualUrl}},
      capabilities: caps,
      router: true,
    });

    const {getAllByTestId} = render(
      <ToolBarIcons
        entity={config3}
        onScanConfigCreateClick={handleScanConfigCreate}
        onScanConfigCloneClick={handleScanConfigClone}
        onScanConfigDeleteClick={handleScanConfigDelete}
        onScanConfigDownloadClick={handleScanConfigDownload}
        onScanConfigEditClick={handleScanConfigEdit}
        onScanConfigImportClick={handleScanConfigImport}
      />,
    );

    const icons = getAllByTestId('svg-icon');

    expect(icons[0]).toHaveAttribute('title', 'Help: ScanConfigs');
    expect(icons[1]).toHaveAttribute('title', 'ScanConfig List');

    fireEvent.click(icons[2]);
    expect(handleScanConfigCreate).toHaveBeenCalled();
    expect(icons[2]).toHaveAttribute('title', 'Create new Scan Config');

    fireEvent.click(icons[3]);
    expect(handleScanConfigClone).toHaveBeenCalledWith(config3);
    expect(icons[3]).toHaveAttribute('title', 'Clone Scan Config');

    fireEvent.click(icons[4]);
    expect(handleScanConfigEdit).toHaveBeenCalledWith(config3);
    expect(icons[4]).toHaveAttribute('title', 'Edit Scan Config');

    fireEvent.click(icons[5]);
    expect(handleScanConfigDelete).not.toHaveBeenCalled();
    expect(icons[5]).toHaveAttribute('title', 'Scan Config is still in use');

    fireEvent.click(icons[6]);
    expect(handleScanConfigDownload).toHaveBeenCalledWith(config3);
    expect(icons[6]).toHaveAttribute('title', 'Export Scan Config as XML');

    fireEvent.click(icons[7]);
    expect(handleScanConfigImport).toHaveBeenCalled();
    expect(icons[7]).toHaveAttribute('title', 'Import Scan Config');
  });

  test('should (not) call click handlers if config is not writable', () => {
    const handleScanConfigCreate = jest.fn();
    const handleScanConfigClone = jest.fn();
    const handleScanConfigDelete = jest.fn();
    const handleScanConfigDownload = jest.fn();
    const handleScanConfigEdit = jest.fn();
    const handleScanConfigImport = jest.fn();

    const {render} = rendererWith({
      gmp: {settings: {manualUrl}},
      capabilities: caps,
      router: true,
    });

    const {getAllByTestId} = render(
      <ToolBarIcons
        entity={config4}
        onScanConfigCreateClick={handleScanConfigCreate}
        onScanConfigCloneClick={handleScanConfigClone}
        onScanConfigDeleteClick={handleScanConfigDelete}
        onScanConfigDownloadClick={handleScanConfigDownload}
        onScanConfigEditClick={handleScanConfigEdit}
        onScanConfigImportClick={handleScanConfigImport}
      />,
    );

    const icons = getAllByTestId('svg-icon');

    expect(icons[0]).toHaveAttribute('title', 'Help: ScanConfigs');
    expect(icons[1]).toHaveAttribute('title', 'ScanConfig List');

    fireEvent.click(icons[2]);
    expect(handleScanConfigCreate).toHaveBeenCalled();
    expect(icons[2]).toHaveAttribute('title', 'Create new Scan Config');

    fireEvent.click(icons[3]);
    expect(handleScanConfigClone).toHaveBeenCalledWith(config4);
    expect(icons[3]).toHaveAttribute('title', 'Clone Scan Config');

    fireEvent.click(icons[4]);
    expect(handleScanConfigEdit).not.toHaveBeenCalled();
    expect(icons[4]).toHaveAttribute('title', 'Scan Config is not writable');

    fireEvent.click(icons[5]);
    expect(handleScanConfigDelete).not.toHaveBeenCalled();
    expect(icons[5]).toHaveAttribute('title', 'Scan Config is not writable');

    fireEvent.click(icons[6]);
    expect(handleScanConfigDownload).toHaveBeenCalledWith(config4);
    expect(icons[6]).toHaveAttribute('title', 'Export Scan Config as XML');

    fireEvent.click(icons[7]);
    expect(handleScanConfigImport).toHaveBeenCalled();
    expect(icons[7]).toHaveAttribute('title', 'Import Scan Config');
  });
});
