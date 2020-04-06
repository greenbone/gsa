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

import {setLocale} from 'gmp/locale/lang';

import {isDefined} from 'gmp/utils/identity';

import Capabilities from 'gmp/capabilities/capabilities';
import CollectionCounts from 'gmp/collection/collectioncounts';

import Filter from 'gmp/models/filter';
import ScanConfig, {OPENVAS_SCAN_CONFIG_TYPE} from 'gmp/models/scanconfig';

import {entityLoadingActions} from 'web/store/entities/scanconfigs';
import {setTimezone, setUsername} from 'web/store/usersettings/actions';

import {rendererWith, fireEvent} from 'web/utils/testing';

import Detailspage, {ToolBarIcons} from '../detailspage';

if (!isDefined(window.URL)) {
  window.URL = {};
}
window.URL.createObjectURL = jest.fn();

setLocale('en');

const families = [
  {
    name: 'family1',
    nvt_count: '1',
    max_nvt_count: '1',
    growing: 1,
  },
  {
    name: 'family2',
    nvt_count: '2',
    max_nvt_count: '4',
    growing: 0,
  },
  {
    name: 'family3',
    nvt_count: '0',
    max_nvt_count: '2',
    growing: 0,
  },
];

const preferences = {
  preference: [
    {
      name: 'preference0',
      hr_name: 'preference0',
      id: '0',
      value: 'yes',
      type: 'checkbox',
      default: 'no',
      nvt: {
        _oid: '0',
        name: 'nvt0',
      },
    },
    {
      name: 'preference1',
      hr_name: 'preference1',
      id: '1',
      value: 'value2',
      type: 'radio',
      default: 'value1',
      alt: ['value2', 'value3'],
      nvt: {
        _oid: '1',
        name: 'nvt1',
      },
    },
    {
      name: 'preference2',
      hr_name: 'preference2',
      id: '2',
      type: 'entry',
      value: 'foo',
      default: 'bar',
      nvt: {
        _oid: '2',
        name: 'nvt2',
      },
    },
    {
      name: 'scannerpref0',
      hr_name: 'Scanner Preference 1',
      value: '0',
      default: '0',
      nvt: {},
    },
  ],
};

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
  family_count: {growing: 1},
  families: {family: families},
  preferences: preferences,
  permissions: {permission: [{name: 'everything'}]},
  scanner: {name: 'scanner', type: '42'},
  type: OPENVAS_SCAN_CONFIG_TYPE,
  tasks: {
    task: [
      {id: '1234', name: 'task1'},
      {id: '5678', name: 'task2'},
    ],
  },
});

const configId = {
  id: '12345',
};

const config2 = ScanConfig.fromElement({
  _id: '12345',
  name: 'foo',
  comment: 'bar',
  creation_time: '2019-07-16T06:31:29Z',
  modification_time: '2019-07-16T06:44:55Z',
  owner: {name: 'user'},
  writable: '1',
  in_use: '0',
  usage_type: 'scan',
  family_count: {growing: 1},
  families: {family: families},
  preferences: preferences,
  permissions: {permission: [{name: 'get_config'}]},
  scanner: {name: 'scanner', type: '42'},
  type: OPENVAS_SCAN_CONFIG_TYPE,
  tasks: {
    task: [
      {id: '1234', name: 'task1'},
      {id: '5678', name: 'task2'},
    ],
  },
});

const config3 = ScanConfig.fromElement({
  _id: '12345',
  name: 'foo',
  comment: 'bar',
  creation_time: '2019-07-16T06:31:29Z',
  modification_time: '2019-07-16T06:44:55Z',
  owner: {name: 'user'},
  writable: '1',
  in_use: '1',
  usage_type: 'scan',
  family_count: {growing: 1},
  families: {family: families},
  preferences: preferences,
  permissions: {permission: [{name: 'everything'}]},
  scanner: {name: 'scanner', type: '42'},
  type: OPENVAS_SCAN_CONFIG_TYPE,
  tasks: {
    task: [
      {id: '1234', name: 'task1'},
      {id: '5678', name: 'task2'},
    ],
  },
});

const config4 = ScanConfig.fromElement({
  _id: '12345',
  name: 'foo',
  comment: 'bar',
  creation_time: '2019-07-16T06:31:29Z',
  modification_time: '2019-07-16T06:44:55Z',
  owner: {name: 'user'},
  writable: '0',
  in_use: '0',
  usage_type: 'scan',
  family_count: {growing: 1},
  families: {family: families},
  preferences: preferences,
  permissions: {permission: [{name: 'everything'}]},
  scanner: {name: 'scanner', type: '42'},
  type: OPENVAS_SCAN_CONFIG_TYPE,
  tasks: {
    task: [
      {id: '1234', name: 'task1'},
      {id: '5678', name: 'task2'},
    ],
  },
});

const scanners = [{name: 'scanner1'}, {name: 'scanner2'}];

const caps = new Capabilities(['everything']);
const wrongCaps = new Capabilities(['get_config']);

const entityType = 'scanconfig';
const reloadInterval = 1;
const manualUrl = 'test/';

const currentSettings = jest.fn().mockResolvedValue({
  foo: 'bar',
});

const renewSession = jest.fn().mockResolvedValue({
  foo: 'bar',
});

const getPermissions = jest.fn().mockResolvedValue({
  data: [],
  meta: {
    filter: Filter.fromString(),
    counts: new CollectionCounts(),
  },
});

describe('Scan Config Detailspage tests', () => {
  test('should render full Detailspage', () => {
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
      reloadInterval,
      settings: {manualUrl},
      user: {
        currentSettings,
      },
    };

    const {render, store} = rendererWith({
      capabilities: caps,
      gmp,
      router: true,
      store: true,
    });

    store.dispatch(setTimezone('CET'));
    store.dispatch(setUsername('admin'));

    store.dispatch(entityLoadingActions.success('12345', config));

    const {baseElement, element, getAllByTestId} = render(
      <Detailspage id="12345" />,
    );

    expect(element).toMatchSnapshot();
    expect(element).toHaveTextContent('Scan Config: foo');

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

    expect(element).toHaveTextContent('12345');
    expect(element).toHaveTextContent('Tue, Jul 16, 2019 8:31 AM CEST');
    expect(element).toHaveTextContent('Tue, Jul 16, 2019 8:44 AM CEST');
    expect(element).toHaveTextContent('admin');

    expect(element).toHaveTextContent('bar');

    expect(element).toHaveTextContent('task1');
    expect(detailslinks[0]).toHaveAttribute('href', '/task/1234');

    expect(element).toHaveTextContent('task2');
    expect(detailslinks[1]).toHaveAttribute('href', '/task/5678');

    expect(element).not.toHaveTextContent('scanner');
  });

  test('should render nvt families tab', () => {
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
      reloadInterval,
      settings: {manualUrl},
      user: {
        currentSettings,
        renewSession,
      },
    };

    const {render, store} = rendererWith({
      capabilities: caps,
      gmp,
      router: true,
      store: true,
    });

    store.dispatch(setTimezone('CET'));
    store.dispatch(setUsername('admin'));

    store.dispatch(entityLoadingActions.success('12345', config));

    const {baseElement, element, getAllByTestId} = render(
      <Detailspage id="12345" />,
    );

    const spans = baseElement.querySelectorAll('span');
    fireEvent.click(spans[12]);

    expect(element).toHaveTextContent('family1');
    expect(element).toHaveTextContent('1 of 1');
    expect(element).toHaveTextContent('family2');
    expect(element).toHaveTextContent('2 of 4');
    expect(element).toHaveTextContent('family3');
    expect(element).toHaveTextContent('0 of 2');

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
    expect(links[4]).toHaveAttribute(
      'href',
      '/nvts?filter=family%3D%22family3%22',
    );
    expect(links[4]).toHaveAttribute('title', 'NVTs of family family3');

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
    expect(icons[12]).toHaveAttribute(
      'title',
      'The NVT selection is STATIC. New NVTs will NOT automatically be added and considered.',
    );
  });

  test('should render nvt preferences tab', () => {
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
      reloadInterval,
      settings: {manualUrl},
      user: {
        currentSettings,
        renewSession,
      },
    };

    const {render, store} = rendererWith({
      capabilities: caps,
      gmp,
      router: true,
      store: true,
    });

    store.dispatch(setTimezone('CET'));
    store.dispatch(setUsername('admin'));

    store.dispatch(entityLoadingActions.success('12345', config));

    const {baseElement, element, getAllByTestId} = render(
      <Detailspage id="12345" />,
    );

    const spans = baseElement.querySelectorAll('span');
    fireEvent.click(spans[14]);

    const detailsLinks = getAllByTestId('details-link');

    expect(detailsLinks[0]).toHaveAttribute('href', '/nvt/0');
    expect(detailsLinks[0]).toHaveTextContent('nvt0');
    expect(element).toHaveTextContent('value2');
    expect(element).toHaveTextContent('value1');

    expect(detailsLinks[1]).toHaveAttribute('href', '/nvt/1');
    expect(detailsLinks[1]).toHaveTextContent('nvt1');
    expect(element).toHaveTextContent('yes');
    expect(element).toHaveTextContent('no');

    expect(detailsLinks[2]).toHaveAttribute('href', '/nvt/2');
    expect(detailsLinks[2]).toHaveTextContent('nvt2');
    expect(element).toHaveTextContent('foo');
    expect(element).toHaveTextContent('bar');
  });

  test('should render user tags tab', () => {
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
      reloadInterval,
      settings: {manualUrl},
      user: {
        currentSettings,
        renewSession,
      },
    };

    const {render, store} = rendererWith({
      capabilities: caps,
      gmp,
      router: true,
      store: true,
    });

    store.dispatch(setTimezone('CET'));
    store.dispatch(setUsername('admin'));

    store.dispatch(entityLoadingActions.success('12345', config));

    const {baseElement, element} = render(<Detailspage id="12345" />);

    const spans = baseElement.querySelectorAll('span');
    fireEvent.click(spans[16]);

    expect(element).toHaveTextContent('No user tags available');
  });

  test('should render permissions tab', () => {
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
      reloadInterval,
      settings: {manualUrl},
      user: {
        currentSettings,
        renewSession,
      },
    };

    const {render, store} = rendererWith({
      capabilities: caps,
      gmp,
      router: true,
      store: true,
    });

    store.dispatch(setTimezone('CET'));
    store.dispatch(setUsername('admin'));

    store.dispatch(entityLoadingActions.success('12345', config));

    const {baseElement, element} = render(<Detailspage id="12345" />);

    const spans = baseElement.querySelectorAll('span');
    fireEvent.click(spans[18]);

    expect(element).toHaveTextContent('No permissions available');
  });

  test('should call commands', async () => {
    const getConfig = jest.fn().mockReturnValue(
      Promise.resolve({
        data: config,
      }),
    );
    const clone = jest.fn().mockReturnValue(
      Promise.resolve({
        data: {id: 'foo'},
      }),
    );
    const getNvtFamilies = jest.fn().mockReturnValue(
      Promise.resolve({
        foo: 'bar',
      }),
    );
    const getAllScanners = jest.fn().mockReturnValue(
      Promise.resolve({
        data: scanners,
      }),
    );
    const deleteFunc = jest.fn().mockReturnValue(
      Promise.resolve({
        foo: 'bar',
      }),
    );
    const exportFunc = jest.fn().mockReturnValue(
      Promise.resolve({
        foo: 'bar',
      }),
    );

    const gmp = {
      [entityType]: {
        get: getConfig,
        clone,
        delete: deleteFunc,
        export: exportFunc,
      },
      permissions: {
        get: getPermissions,
      },
      nvtfamilies: {
        get: getNvtFamilies,
      },
      scanners: {
        getAll: getAllScanners,
      },
      reloadInterval,
      settings: {manualUrl},
      user: {
        currentSettings,
        renewSession,
      },
    };

    const {render, store} = rendererWith({
      capabilities: caps,
      gmp,
      router: true,
      store: true,
    });

    store.dispatch(setTimezone('CET'));
    store.dispatch(setUsername('admin'));
    store.dispatch(entityLoadingActions.success('12345', config));

    const {getAllByTestId} = render(<Detailspage id="12345" />);

    const icons = getAllByTestId('svg-icon');
    expect(icons[0]).toHaveAttribute('title', 'Help: ScanConfigs');
    expect(icons[1]).toHaveAttribute('title', 'ScanConfig List');

    expect(icons[2]).toHaveAttribute('title', 'Create new Scan Config');

    await act(async () => {
      fireEvent.click(icons[3]);
      expect(clone).toHaveBeenCalledWith(config);
      expect(icons[3]).toHaveAttribute('title', 'Clone Scan Config');

      fireEvent.click(icons[4]);
      expect(getNvtFamilies).toHaveBeenCalled();
      expect(getAllScanners).toHaveBeenCalled();
      expect(icons[4]).toHaveAttribute('title', 'Edit Scan Config');

      fireEvent.click(icons[5]);
      expect(deleteFunc).toHaveBeenCalledWith(configId);
      expect(icons[5]).toHaveAttribute('title', 'Move Scan Config to trashcan');

      fireEvent.click(icons[6]);
      expect(exportFunc).toHaveBeenCalledWith(config);
      expect(icons[6]).toHaveAttribute('title', 'Export Scan Config as XML');
    });

    expect(icons[7]).toHaveAttribute('title', 'Import Scan Config');
  });

  test('should not call commands without permission', async () => {
    const getConfig = jest.fn().mockReturnValue(
      Promise.resolve({
        data: config2,
      }),
    );

    const clone = jest.fn().mockReturnValue(
      Promise.resolve({
        data: {id: 'foo'},
      }),
    );
    const getNvtFamilies = jest.fn().mockReturnValue(
      Promise.resolve({
        foo: 'bar',
      }),
    );
    const getAllScanners = jest.fn().mockReturnValue(
      Promise.resolve({
        data: scanners,
      }),
    );
    const deleteFunc = jest.fn().mockReturnValue(
      Promise.resolve({
        foo: 'bar',
      }),
    );
    const exportFunc = jest.fn().mockReturnValue(
      Promise.resolve({
        foo: 'bar',
      }),
    );

    const gmp = {
      [entityType]: {
        get: getConfig,
        clone,
        delete: deleteFunc,
        export: exportFunc,
      },
      permissions: {
        get: getPermissions,
      },
      nvtfamilies: {
        get: getNvtFamilies,
      },
      scanners: {
        getAll: getAllScanners,
      },
      reloadInterval,
      settings: {manualUrl},
      user: {
        currentSettings,
        renewSession,
      },
    };

    const {render, store} = rendererWith({
      capabilities: caps,
      gmp,
      router: true,
      store: true,
    });

    store.dispatch(setTimezone('CET'));
    store.dispatch(setUsername('admin'));
    store.dispatch(entityLoadingActions.success('12345', config2));

    const {getAllByTestId} = render(<Detailspage id="12345" />);

    const icons = getAllByTestId('svg-icon');

    expect(icons[0]).toHaveAttribute('title', 'Help: ScanConfigs');
    expect(icons[1]).toHaveAttribute('title', 'ScanConfig List');

    expect(icons[2]).toHaveAttribute('title', 'Create new Scan Config');

    await act(async () => {
      fireEvent.click(icons[3]);
      expect(clone).not.toHaveBeenCalled();
      expect(icons[3]).toHaveAttribute(
        'title',
        'Permission to clone Scan Config denied',
      );

      fireEvent.click(icons[4]);
      expect(getNvtFamilies).not.toHaveBeenCalled();
      expect(getAllScanners).not.toHaveBeenCalled();
      expect(icons[4]).toHaveAttribute(
        'title',
        'Permission to edit Scan Config denied',
      );

      fireEvent.click(icons[5]);
      expect(deleteFunc).not.toHaveBeenCalled();
      expect(icons[5]).toHaveAttribute(
        'title',
        'Permission to move Scan Config to trashcan denied',
      );

      fireEvent.click(icons[6]);
      expect(exportFunc).toHaveBeenCalledWith(config2);
      expect(icons[6]).toHaveAttribute('title', 'Export Scan Config as XML');
    });

    expect(icons[7]).toHaveAttribute('title', 'Import Scan Config');
  });

  test('should (not) call commands if config is in use', async () => {
    const getConfig = jest.fn().mockReturnValue(
      Promise.resolve({
        data: config3,
      }),
    );

    const clone = jest.fn().mockReturnValue(
      Promise.resolve({
        data: {id: 'foo'},
      }),
    );
    const getNvtFamilies = jest.fn().mockReturnValue(
      Promise.resolve({
        foo: 'bar',
      }),
    );
    const getAllScanners = jest.fn().mockReturnValue(
      Promise.resolve({
        data: scanners,
      }),
    );
    const deleteFunc = jest.fn().mockReturnValue(
      Promise.resolve({
        foo: 'bar',
      }),
    );
    const exportFunc = jest.fn().mockReturnValue(
      Promise.resolve({
        foo: 'bar',
      }),
    );

    const gmp = {
      [entityType]: {
        get: getConfig,
        clone,
        delete: deleteFunc,
        export: exportFunc,
      },
      permissions: {
        get: getPermissions,
      },
      nvtfamilies: {
        get: getNvtFamilies,
      },
      scanners: {
        getAll: getAllScanners,
      },
      reloadInterval,
      settings: {manualUrl},
      user: {
        currentSettings,
        renewSession,
      },
    };

    const {render, store} = rendererWith({
      capabilities: caps,
      gmp,
      router: true,
      store: true,
    });

    store.dispatch(setTimezone('CET'));
    store.dispatch(setUsername('admin'));
    store.dispatch(entityLoadingActions.success('12345', config3));

    const {getAllByTestId} = render(<Detailspage id="12345" />);

    const icons = getAllByTestId('svg-icon');

    expect(icons[0]).toHaveAttribute('title', 'Help: ScanConfigs');
    expect(icons[1]).toHaveAttribute('title', 'ScanConfig List');

    expect(icons[2]).toHaveAttribute('title', 'Create new Scan Config');

    await act(async () => {
      fireEvent.click(icons[3]);
      expect(clone).toHaveBeenCalledWith(config3);
      expect(icons[3]).toHaveAttribute('title', 'Clone Scan Config');

      fireEvent.click(icons[4]);
      expect(getNvtFamilies).toHaveBeenCalled();
      expect(getAllScanners).toHaveBeenCalled();
      expect(icons[4]).toHaveAttribute('title', 'Edit Scan Config');

      fireEvent.click(icons[5]);
      expect(deleteFunc).not.toHaveBeenCalled();
      expect(icons[5]).toHaveAttribute('title', 'Scan Config is still in use');

      fireEvent.click(icons[6]);
      expect(exportFunc).toHaveBeenCalledWith(config3);
      expect(icons[6]).toHaveAttribute('title', 'Export Scan Config as XML');
    });

    expect(icons[7]).toHaveAttribute('title', 'Import Scan Config');
  });

  test('should (not) call commands if config is not writable', async () => {
    const getConfig = jest.fn().mockReturnValue(
      Promise.resolve({
        data: config4,
      }),
    );

    const clone = jest.fn().mockReturnValue(
      Promise.resolve({
        data: {id: 'foo'},
      }),
    );
    const getNvtFamilies = jest.fn().mockReturnValue(
      Promise.resolve({
        foo: 'bar',
      }),
    );
    const getAllScanners = jest.fn().mockReturnValue(
      Promise.resolve({
        data: scanners,
      }),
    );
    const deleteFunc = jest.fn().mockReturnValue(
      Promise.resolve({
        foo: 'bar',
      }),
    );
    const exportFunc = jest.fn().mockReturnValue(
      Promise.resolve({
        foo: 'bar',
      }),
    );

    const gmp = {
      [entityType]: {
        get: getConfig,
        clone,
        delete: deleteFunc,
        export: exportFunc,
      },
      permissions: {
        get: getPermissions,
      },
      nvtfamilies: {
        get: getNvtFamilies,
      },
      scanners: {
        getAll: getAllScanners,
      },
      reloadInterval,
      settings: {manualUrl},
      user: {
        currentSettings,
        renewSession,
      },
    };

    const {render, store} = rendererWith({
      capabilities: caps,
      gmp,
      router: true,
      store: true,
    });

    store.dispatch(setTimezone('CET'));
    store.dispatch(setUsername('admin'));
    store.dispatch(entityLoadingActions.success('12345', config4));

    const {getAllByTestId} = render(<Detailspage id="12345" />);

    const icons = getAllByTestId('svg-icon');

    expect(icons[0]).toHaveAttribute('title', 'Help: ScanConfigs');
    expect(icons[1]).toHaveAttribute('title', 'ScanConfig List');

    expect(icons[2]).toHaveAttribute('title', 'Create new Scan Config');

    await act(async () => {
      fireEvent.click(icons[3]);
      expect(clone).toHaveBeenCalledWith(config4);
      expect(icons[3]).toHaveAttribute('title', 'Clone Scan Config');

      fireEvent.click(icons[4]);
      expect(getNvtFamilies).not.toHaveBeenCalled();
      expect(getAllScanners).not.toHaveBeenCalled();
      expect(icons[4]).toHaveAttribute('title', 'Scan Config is not writable');

      fireEvent.click(icons[5]);
      expect(deleteFunc).not.toHaveBeenCalled();
      expect(icons[5]).toHaveAttribute('title', 'Scan Config is not writable');

      fireEvent.click(icons[6]);
      expect(exportFunc).toHaveBeenCalledWith(config4);
      expect(icons[6]).toHaveAttribute('title', 'Export Scan Config as XML');
    });

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
