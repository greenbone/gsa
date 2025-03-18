/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import Capabilities from 'gmp/capabilities/capabilities';
import CollectionCounts from 'gmp/collection/collectioncounts';
import Filter from 'gmp/models/filter';
import ScanConfig from 'gmp/models/scanconfig';
import {vi} from 'vitest';
import {currentSettingsDefaultResponse} from 'web/pages/__mocks__/CurrentSettings';
import DetailsPage, {ToolBarIcons} from 'web/pages/scanconfigs/DetailsPage';
import {entityLoadingActions} from 'web/store/entities/scanconfigs';
import {setTimezone, setUsername} from 'web/store/usersettings/actions';
import {rendererWith, fireEvent, act, wait, screen} from 'web/utils/Testing';

vi.mock('web/pages/scanconfigs/EditDialog', () => ({
  default: () => null,
}));

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

const currentSettings = testing
  .fn()
  .mockResolvedValue(currentSettingsDefaultResponse);

const renewSession = testing.fn().mockResolvedValue({
  foo: 'bar',
});

const getPermissions = testing.fn().mockResolvedValue({
  data: [],
  meta: {
    filter: Filter.fromString(),
    counts: new CollectionCounts(),
  },
});

describe('Scan Config DetailsPage tests', () => {
  test('should render full DetailsPage', () => {
    const getConfig = testing.fn().mockResolvedValue({
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

    const {baseElement} = render(<DetailsPage id="12345" />);

    expect(baseElement).toBeVisible();
    expect(baseElement).toHaveTextContent('Scan Config: foo');

    const links = baseElement.querySelectorAll('a');
    const detailsLinks = screen.getAllByTestId('details-link');

    expect(screen.getByTestId('help-icon')).toHaveAttribute(
      'title',
      'Help: ScanConfigs',
    );
    expect(links[0]).toHaveAttribute(
      'href',
      'test/en/scanning.html#managing-scan-configurations',
    );

    expect(links[1]).toHaveAttribute('href', '/scanconfigs');
    expect(screen.getByTestId('list-icon')).toHaveAttribute(
      'title',
      'ScanConfig List',
    );

    expect(baseElement).toHaveTextContent('12345');
    expect(baseElement).toHaveTextContent(
      'Tue, Jul 16, 2019 8:31 AM Central European Summer Time',
    );
    expect(baseElement).toHaveTextContent(
      'Tue, Jul 16, 2019 8:44 AM Central European Summer Time',
    );
    expect(baseElement).toHaveTextContent('admin');

    expect(baseElement).toHaveTextContent('bar');

    expect(baseElement).toHaveTextContent('task1');
    expect(detailsLinks[0]).toHaveAttribute('href', '/task/1234');

    expect(baseElement).toHaveTextContent('task2');
    expect(detailsLinks[1]).toHaveAttribute('href', '/task/5678');

    expect(baseElement).not.toHaveTextContent('scanner');
  });

  test('should render nvt families tab', () => {
    const getConfig = testing.fn().mockResolvedValue({
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

    const {baseElement} = render(<DetailsPage id="12345" />);

    const spans = baseElement.querySelectorAll('span');
    fireEvent.click(spans[12]);

    expect(baseElement).toHaveTextContent('family1');
    expect(baseElement).toHaveTextContent('1 of 1');
    expect(baseElement).toHaveTextContent('family2');
    expect(baseElement).toHaveTextContent('2 of 4');
    expect(baseElement).toHaveTextContent('family3');
    expect(baseElement).toHaveTextContent('0 of 2');

    const links = baseElement.querySelectorAll('a');

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

    expect(screen.getAllByTestId('trend-more-icon')[0]).toHaveAttribute(
      'title',
      'The families selection is DYNAMIC. New families will automatically be added and considered.',
    );
    expect(screen.getAllByTestId('trend-more-icon')[1]).toHaveAttribute(
      'title',
      'The NVT selection is DYNAMIC. New NVTs will automatically be added and considered.',
    );
    expect(screen.getAllByTestId('trend-nochange-icon')[0]).toHaveAttribute(
      'title',
      'The NVT selection is STATIC. New NVTs will NOT automatically be added and considered.',
    );
    expect(screen.getAllByTestId('trend-nochange-icon')[1]).toHaveAttribute(
      'title',
      'The NVT selection is STATIC. New NVTs will NOT automatically be added and considered.',
    );
  });

  test('should render nvt preferences tab', () => {
    const getConfig = testing.fn().mockResolvedValue({
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

    const {baseElement, getAllByTestId} = render(<DetailsPage id="12345" />);

    const spans = baseElement.querySelectorAll('span');
    fireEvent.click(spans[14]);

    const detailsLinks = getAllByTestId('details-link');

    expect(detailsLinks[0]).toHaveAttribute('href', '/nvt/0');
    expect(detailsLinks[0]).toHaveTextContent('nvt0');
    expect(baseElement).toHaveTextContent('value2');
    expect(baseElement).toHaveTextContent('value1');

    expect(detailsLinks[1]).toHaveAttribute('href', '/nvt/1');
    expect(detailsLinks[1]).toHaveTextContent('nvt1');
    expect(baseElement).toHaveTextContent('yes');
    expect(baseElement).toHaveTextContent('no');

    expect(detailsLinks[2]).toHaveAttribute('href', '/nvt/2');
    expect(detailsLinks[2]).toHaveTextContent('nvt2');
    expect(baseElement).toHaveTextContent('foo');
    expect(baseElement).toHaveTextContent('bar');
  });

  test('should render user tags tab', () => {
    const getConfig = testing.fn().mockResolvedValue({
      data: config,
    });

    const getTags = testing.fn().mockResolvedValue({
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

    const {baseElement} = render(<DetailsPage id="12345" />);

    const spans = baseElement.querySelectorAll('span');
    fireEvent.click(spans[16]);

    expect(baseElement).toHaveTextContent('No user tags available');
  });

  test('should render permissions tab', () => {
    const getConfig = testing.fn().mockResolvedValue({
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

    const {baseElement} = render(<DetailsPage id="12345" />);

    const spans = baseElement.querySelectorAll('span');
    fireEvent.click(spans[18]);

    expect(baseElement).toHaveTextContent('No permissions available');
  });

  test('should call commands', async () => {
    const getConfig = testing.fn().mockResolvedValue({
      data: config,
    });
    const clone = testing.fn().mockResolvedValue({
      data: {id: 'foo'},
    });
    const getNvtFamilies = testing.fn().mockResolvedValue({
      foo: 'bar',
    });
    const getAllScanners = testing.fn().mockResolvedValue({
      data: scanners,
    });
    const deleteFunc = testing.fn().mockRejectedValue({
      foo: 'bar',
    });
    const exportFunc = testing.fn().mockResolvedValue({
      foo: 'bar',
    });

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

    render(<DetailsPage id="12345" />);

    expect(screen.getByTestId('help-icon')).toHaveAttribute(
      'title',
      'Help: ScanConfigs',
    );
    expect(screen.getByTestId('list-icon')).toHaveAttribute(
      'title',
      'ScanConfig List',
    );
    expect(screen.getByTestId('new-icon')).toHaveAttribute(
      'title',
      'Create new Scan Config',
    );
    expect(screen.getByTestId('upload-icon')).toHaveAttribute(
      'title',
      'Import Scan Config',
    );

    const cloneIcon = screen.getByTestId('clone-icon');
    fireEvent.click(cloneIcon);
    expect(clone).toHaveBeenCalledWith(config);
    await wait();
    expect(cloneIcon).toHaveAttribute('title', 'Clone Scan Config');

    const editIcon = screen.getByTestId('edit-icon');
    fireEvent.click(editIcon);
    expect(getNvtFamilies).toHaveBeenCalled();
    expect(getAllScanners).toHaveBeenCalled();
    await wait();
    expect(editIcon).toHaveAttribute('title', 'Edit Scan Config');

    const exportIcon = screen.getByTestId('export-icon');
    fireEvent.click(exportIcon);
    await wait();
    expect(exportFunc).toHaveBeenCalledWith(config);
    expect(exportIcon).toHaveAttribute('title', 'Export Scan Config as XML');

    act(() => {
      const trashcanIcon = screen.getByTestId('trashcan-icon');
      fireEvent.click(trashcanIcon);
      expect(deleteFunc).toHaveBeenCalledWith(configId);
      expect(trashcanIcon).toHaveAttribute(
        'title',
        'Move Scan Config to trashcan',
      );
    });
  });

  test('should not call commands without permission', async () => {
    const getConfig = testing.fn().mockResolvedValue({
      data: config2,
    });
    const clone = testing.fn().mockResolvedValue({
      data: {id: 'foo'},
    });
    const getNvtFamilies = testing.fn().mockResolvedValue({
      foo: 'bar',
    });
    const getAllScanners = testing.fn().mockResolvedValue({
      data: scanners,
    });
    const deleteFunc = testing.fn().mockResolvedValue({
      foo: 'bar',
    });
    const exportFunc = testing.fn().mockResolvedValue({
      foo: 'bar',
    });

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

    render(<DetailsPage id="12345" />);

    expect(screen.getByTestId('help-icon')).toHaveAttribute(
      'title',
      'Help: ScanConfigs',
    );
    expect(screen.getByTestId('list-icon')).toHaveAttribute(
      'title',
      'ScanConfig List',
    );
    expect(screen.getByTestId('new-icon')).toHaveAttribute(
      'title',
      'Create new Scan Config',
    );

    const cloneIcon = screen.getByTestId('clone-icon');
    fireEvent.click(cloneIcon);
    expect(clone).not.toHaveBeenCalled();
    expect(cloneIcon).toHaveAttribute(
      'title',
      'Permission to clone Scan Config denied',
    );

    const editIcon = screen.getByTestId('edit-icon');
    fireEvent.click(editIcon);
    expect(getNvtFamilies).not.toHaveBeenCalled();
    expect(getAllScanners).not.toHaveBeenCalled();
    expect(editIcon).toHaveAttribute(
      'title',
      'Permission to edit Scan Config denied',
    );

    const exportIcon = screen.getByTestId('export-icon');
    fireEvent.click(exportIcon);
    expect(exportFunc).toHaveBeenCalledWith(config2);
    await wait();
    expect(exportIcon).toHaveAttribute('title', 'Export Scan Config as XML');

    expect(screen.getByTestId('upload-icon')).toHaveAttribute(
      'title',
      'Import Scan Config',
    );

    const deleteIcon = screen.getByTestId('trashcan-icon');
    fireEvent.click(deleteIcon);
    expect(deleteFunc).not.toHaveBeenCalled();
    expect(deleteIcon).toHaveAttribute(
      'title',
      'Permission to move Scan Config to trashcan denied',
    );
  });

  test('should (not) call commands if config is in use', async () => {
    const getConfig = testing.fn().mockResolvedValue({
      data: config3,
    });
    const clone = testing.fn().mockResolvedValue({
      data: {id: 'foo'},
    });
    const getNvtFamilies = testing.fn().mockResolvedValue({
      foo: 'bar',
    });
    const getAllScanners = testing.fn().mockResolvedValue({
      data: scanners,
    });
    const deleteFunc = testing.fn().mockResolvedValue({
      foo: 'bar',
    });
    const exportFunc = testing.fn().mockResolvedValue({
      foo: 'bar',
    });

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

    render(<DetailsPage id="12345" />);

    expect(screen.getByTestId('help-icon')).toHaveAttribute(
      'title',
      'Help: ScanConfigs',
    );
    expect(screen.getByTestId('list-icon')).toHaveAttribute(
      'title',
      'ScanConfig List',
    );
    expect(screen.getByTestId('new-icon')).toHaveAttribute(
      'title',
      'Create new Scan Config',
    );

    const cloneIcon = screen.getByTestId('clone-icon');
    fireEvent.click(cloneIcon);
    expect(clone).toHaveBeenCalledWith(config3);
    await wait();
    expect(cloneIcon).toHaveAttribute('title', 'Clone Scan Config');

    const editIcon = screen.getByTestId('edit-icon');
    fireEvent.click(editIcon);
    expect(getNvtFamilies).toHaveBeenCalled();
    expect(getAllScanners).toHaveBeenCalled();
    expect(editIcon).toHaveAttribute('title', 'Edit Scan Config');

    const deleteIcon = screen.getByTestId('trashcan-icon');
    fireEvent.click(deleteIcon);
    expect(deleteFunc).not.toHaveBeenCalled();
    expect(deleteIcon).toHaveAttribute('title', 'Scan Config is still in use');

    const exportIcon = screen.getByTestId('export-icon');
    fireEvent.click(exportIcon);
    expect(exportFunc).toHaveBeenCalledWith(config3);
    await wait();
    expect(exportIcon).toHaveAttribute('title', 'Export Scan Config as XML');

    expect(screen.getByTestId('upload-icon')).toHaveAttribute(
      'title',
      'Import Scan Config',
    );
  });

  test('should (not) call commands if config is not writable', async () => {
    const getConfig = testing.fn().mockResolvedValue({
      data: config4,
    });
    const clone = testing.fn().mockResolvedValue({
      data: {id: 'foo'},
    });
    const getNvtFamilies = testing.fn().mockResolvedValue({
      foo: 'bar',
    });
    const getAllScanners = testing.fn().mockResolvedValue({
      data: scanners,
    });
    const deleteFunc = testing.fn().mockResolvedValue({
      foo: 'bar',
    });
    const exportFunc = testing.fn().mockResolvedValue({
      foo: 'bar',
    });

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

    render(<DetailsPage id="12345" />);

    expect(screen.getByTestId('help-icon')).toHaveAttribute(
      'title',
      'Help: ScanConfigs',
    );
    expect(screen.getByTestId('list-icon')).toHaveAttribute(
      'title',
      'ScanConfig List',
    );
    expect(screen.getByTestId('new-icon')).toHaveAttribute(
      'title',
      'Create new Scan Config',
    );

    const cloneIcon = screen.getByTestId('clone-icon');
    fireEvent.click(cloneIcon);
    expect(clone).toHaveBeenCalledWith(config4);
    await wait();
    expect(cloneIcon).toHaveAttribute('title', 'Clone Scan Config');

    const editIcon = screen.getByTestId('edit-icon');
    fireEvent.click(editIcon);
    expect(getNvtFamilies).not.toHaveBeenCalled();
    expect(getAllScanners).not.toHaveBeenCalled();
    expect(editIcon).toHaveAttribute('title', 'Scan Config is not writable');

    const deleteIcon = screen.getByTestId('trashcan-icon');
    fireEvent.click(deleteIcon);
    expect(deleteFunc).not.toHaveBeenCalled();
    expect(deleteIcon).toHaveAttribute('title', 'Scan Config is not writable');

    const exportIcon = screen.getByTestId('export-icon');
    fireEvent.click(exportIcon);
    expect(exportFunc).toHaveBeenCalledWith(config4);
    await wait();
    expect(exportIcon).toHaveAttribute('title', 'Export Scan Config as XML');

    expect(screen.getByTestId('upload-icon')).toHaveAttribute(
      'title',
      'Import Scan Config',
    );
  });
});

describe('Scan Config ToolBarIcons tests', () => {
  test('should render', () => {
    const handleScanConfigCreate = testing.fn();
    const handleScanConfigClone = testing.fn();
    const handleScanConfigDelete = testing.fn();
    const handleScanConfigDownload = testing.fn();
    const handleScanConfigEdit = testing.fn();
    const handleScanConfigImport = testing.fn();

    const {render} = rendererWith({
      gmp: {settings: {manualUrl}},
      capabilities: caps,
      router: true,
    });

    const {element} = render(
      <ToolBarIcons
        entity={config}
        onScanConfigCloneClick={handleScanConfigClone}
        onScanConfigCreateClick={handleScanConfigCreate}
        onScanConfigDeleteClick={handleScanConfigDelete}
        onScanConfigDownloadClick={handleScanConfigDownload}
        onScanConfigEditClick={handleScanConfigEdit}
        onScanConfigImportClick={handleScanConfigImport}
      />,
    );

    expect(element).toBeVisible();

    const links = element.querySelectorAll('a');
    expect(screen.getByTestId('help-icon')).toHaveAttribute(
      'title',
      'Help: ScanConfigs',
    );
    expect(links[0]).toHaveAttribute(
      'href',
      'test/en/scanning.html#managing-scan-configurations',
    );

    expect(links[1]).toHaveAttribute('href', '/scanconfigs');
    expect(screen.getByTestId('list-icon')).toHaveAttribute(
      'title',
      'ScanConfig List',
    );
  });

  test('should call click handlers', () => {
    const handleScanConfigCreate = testing.fn();
    const handleScanConfigClone = testing.fn();
    const handleScanConfigDelete = testing.fn();
    const handleScanConfigDownload = testing.fn();
    const handleScanConfigEdit = testing.fn();
    const handleScanConfigImport = testing.fn();

    const {render} = rendererWith({
      gmp: {settings: {manualUrl}},
      capabilities: caps,
      router: true,
    });

    render(
      <ToolBarIcons
        entity={config}
        onScanConfigCloneClick={handleScanConfigClone}
        onScanConfigCreateClick={handleScanConfigCreate}
        onScanConfigDeleteClick={handleScanConfigDelete}
        onScanConfigDownloadClick={handleScanConfigDownload}
        onScanConfigEditClick={handleScanConfigEdit}
        onScanConfigImportClick={handleScanConfigImport}
      />,
    );

    expect(screen.getByTestId('help-icon')).toHaveAttribute(
      'title',
      'Help: ScanConfigs',
    );
    expect(screen.getByTestId('list-icon')).toHaveAttribute(
      'title',
      'ScanConfig List',
    );

    const createIcon = screen.getByTestId('new-icon');
    fireEvent.click(createIcon);
    expect(handleScanConfigCreate).toHaveBeenCalled();
    expect(createIcon).toHaveAttribute('title', 'Create new Scan Config');

    const cloneIcon = screen.getByTestId('clone-icon');
    fireEvent.click(cloneIcon);
    expect(handleScanConfigClone).toHaveBeenCalledWith(config);
    expect(cloneIcon).toHaveAttribute('title', 'Clone Scan Config');

    const editIcon = screen.getByTestId('edit-icon');
    fireEvent.click(editIcon);
    expect(handleScanConfigEdit).toHaveBeenCalledWith(config);
    expect(editIcon).toHaveAttribute('title', 'Edit Scan Config');

    const deleteIcon = screen.getByTestId('trashcan-icon');
    fireEvent.click(deleteIcon);
    expect(handleScanConfigDelete).toHaveBeenCalledWith(config);
    expect(deleteIcon).toHaveAttribute('title', 'Move Scan Config to trashcan');

    const exportIcon = screen.getByTestId('export-icon');
    fireEvent.click(exportIcon);
    expect(handleScanConfigDownload).toHaveBeenCalledWith(config);
    expect(exportIcon).toHaveAttribute('title', 'Export Scan Config as XML');

    const uploadIcon = screen.getByTestId('upload-icon');
    fireEvent.click(uploadIcon);
    expect(handleScanConfigImport).toHaveBeenCalled();
    expect(uploadIcon).toHaveAttribute('title', 'Import Scan Config');
  });

  test('should not call click handlers without permission', () => {
    const handleScanConfigCreate = testing.fn();
    const handleScanConfigClone = testing.fn();
    const handleScanConfigDelete = testing.fn();
    const handleScanConfigDownload = testing.fn();
    const handleScanConfigEdit = testing.fn();
    const handleScanConfigImport = testing.fn();

    const {render} = rendererWith({
      gmp: {settings: {manualUrl}},
      capabilities: wrongCaps,
      router: true,
    });

    render(
      <ToolBarIcons
        entity={config2}
        onScanConfigCloneClick={handleScanConfigClone}
        onScanConfigCreateClick={handleScanConfigCreate}
        onScanConfigDeleteClick={handleScanConfigDelete}
        onScanConfigDownloadClick={handleScanConfigDownload}
        onScanConfigEditClick={handleScanConfigEdit}
        onScanConfigImportClick={handleScanConfigImport}
      />,
    );

    expect(screen.getByTestId('help-icon')).toHaveAttribute(
      'title',
      'Help: ScanConfigs',
    );
    expect(screen.getByTestId('list-icon')).toHaveAttribute(
      'title',
      'ScanConfig List',
    );

    const cloneIcon = screen.getByTestId('clone-icon');
    fireEvent.click(cloneIcon);
    expect(handleScanConfigClone).not.toHaveBeenCalled();
    expect(cloneIcon).toHaveAttribute(
      'title',
      'Permission to clone Scan Config denied',
    );

    const editIcon = screen.getByTestId('edit-icon');
    fireEvent.click(editIcon);
    expect(handleScanConfigEdit).not.toHaveBeenCalled();
    expect(editIcon).toHaveAttribute(
      'title',
      'Permission to edit Scan Config denied',
    );

    const deleteIcon = screen.getByTestId('trashcan-icon');
    fireEvent.click(deleteIcon);
    expect(handleScanConfigDelete).not.toHaveBeenCalled();
    expect(deleteIcon).toHaveAttribute(
      'title',
      'Permission to move Scan Config to trashcan denied',
    );

    const exportIcon = screen.getByTestId('export-icon');
    fireEvent.click(exportIcon);
    expect(handleScanConfigDownload).toHaveBeenCalledWith(config2);
    expect(exportIcon).toHaveAttribute('title', 'Export Scan Config as XML');
  });

  test('should (not) call click handlers if config is in use', () => {
    const handleScanConfigCreate = testing.fn();
    const handleScanConfigClone = testing.fn();
    const handleScanConfigDelete = testing.fn();
    const handleScanConfigDownload = testing.fn();
    const handleScanConfigEdit = testing.fn();
    const handleScanConfigImport = testing.fn();

    const {render} = rendererWith({
      gmp: {settings: {manualUrl}},
      capabilities: caps,
      router: true,
    });

    render(
      <ToolBarIcons
        entity={config3}
        onScanConfigCloneClick={handleScanConfigClone}
        onScanConfigCreateClick={handleScanConfigCreate}
        onScanConfigDeleteClick={handleScanConfigDelete}
        onScanConfigDownloadClick={handleScanConfigDownload}
        onScanConfigEditClick={handleScanConfigEdit}
        onScanConfigImportClick={handleScanConfigImport}
      />,
    );

    expect(screen.getByTestId('help-icon')).toHaveAttribute(
      'title',
      'Help: ScanConfigs',
    );
    expect(screen.getByTestId('list-icon')).toHaveAttribute(
      'title',
      'ScanConfig List',
    );

    const newIcon = screen.getByTestId('new-icon');
    fireEvent.click(newIcon);
    expect(handleScanConfigCreate).toHaveBeenCalled();
    expect(newIcon).toHaveAttribute('title', 'Create new Scan Config');

    const cloneIcon = screen.getByTestId('clone-icon');
    fireEvent.click(cloneIcon);
    expect(handleScanConfigClone).toHaveBeenCalledWith(config3);
    expect(cloneIcon).toHaveAttribute('title', 'Clone Scan Config');

    const editIcon = screen.getByTestId('edit-icon');
    fireEvent.click(editIcon);
    expect(handleScanConfigEdit).toHaveBeenCalledWith(config3);
    expect(editIcon).toHaveAttribute('title', 'Edit Scan Config');

    const deleteIcon = screen.getByTestId('trashcan-icon');
    fireEvent.click(deleteIcon);
    expect(handleScanConfigDelete).not.toHaveBeenCalled();
    expect(deleteIcon).toHaveAttribute('title', 'Scan Config is still in use');

    const exportIcon = screen.getByTestId('export-icon');
    fireEvent.click(exportIcon);
    expect(handleScanConfigDownload).toHaveBeenCalledWith(config3);
    expect(exportIcon).toHaveAttribute('title', 'Export Scan Config as XML');

    const uploadIcon = screen.getByTestId('upload-icon');
    fireEvent.click(uploadIcon);
    expect(handleScanConfigImport).toHaveBeenCalled();
    expect(uploadIcon).toHaveAttribute('title', 'Import Scan Config');
  });

  test('should (not) call click handlers if config is not writable', () => {
    const handleScanConfigCreate = testing.fn();
    const handleScanConfigClone = testing.fn();
    const handleScanConfigDelete = testing.fn();
    const handleScanConfigDownload = testing.fn();
    const handleScanConfigEdit = testing.fn();
    const handleScanConfigImport = testing.fn();

    const {render} = rendererWith({
      gmp: {settings: {manualUrl}},
      capabilities: caps,
      router: true,
    });

    render(
      <ToolBarIcons
        entity={config4}
        onScanConfigCloneClick={handleScanConfigClone}
        onScanConfigCreateClick={handleScanConfigCreate}
        onScanConfigDeleteClick={handleScanConfigDelete}
        onScanConfigDownloadClick={handleScanConfigDownload}
        onScanConfigEditClick={handleScanConfigEdit}
        onScanConfigImportClick={handleScanConfigImport}
      />,
    );

    expect(screen.getByTestId('help-icon')).toHaveAttribute(
      'title',
      'Help: ScanConfigs',
    );
    expect(screen.getByTestId('list-icon')).toHaveAttribute(
      'title',
      'ScanConfig List',
    );

    const newIcon = screen.getByTestId('new-icon');
    fireEvent.click(newIcon);
    expect(handleScanConfigCreate).toHaveBeenCalled();
    expect(newIcon).toHaveAttribute('title', 'Create new Scan Config');

    const cloneIcon = screen.getByTestId('clone-icon');
    fireEvent.click(cloneIcon);
    expect(handleScanConfigClone).toHaveBeenCalledWith(config4);
    expect(cloneIcon).toHaveAttribute('title', 'Clone Scan Config');

    const editIcon = screen.getByTestId('edit-icon');
    fireEvent.click(editIcon);
    expect(handleScanConfigEdit).not.toHaveBeenCalled();
    expect(editIcon).toHaveAttribute('title', 'Scan Config is not writable');

    const deleteIcon = screen.getByTestId('trashcan-icon');
    fireEvent.click(deleteIcon);
    expect(handleScanConfigDelete).not.toHaveBeenCalled();
    expect(deleteIcon).toHaveAttribute('title', 'Scan Config is not writable');

    const exportIcon = screen.getByTestId('export-icon');
    fireEvent.click(exportIcon);
    expect(handleScanConfigDownload).toHaveBeenCalledWith(config4);
    expect(exportIcon).toHaveAttribute('title', 'Export Scan Config as XML');

    const uploadIcon = screen.getByTestId('upload-icon');
    fireEvent.click(uploadIcon);
    expect(handleScanConfigImport).toHaveBeenCalled();
    expect(uploadIcon).toHaveAttribute('title', 'Import Scan Config');
  });
});
