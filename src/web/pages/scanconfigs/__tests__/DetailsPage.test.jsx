/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {screen, rendererWith, fireEvent, within} from 'web/testing';
import {vi} from 'vitest';
import CollectionCounts from 'gmp/collection/collection-counts';
import Response from 'gmp/http/response';
import Filter from 'gmp/models/filter';
import ScanConfig from 'gmp/models/scan-config';
import {currentSettingsDefaultResponse} from 'web/pages/__fixtures__/current-settings';
import DetailsPage from 'web/pages/scanconfigs/DetailsPage';
import {entityLoadingActions} from 'web/store/entities/scanconfigs';
import {setTimezone, setUsername} from 'web/store/usersettings/actions';

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
      id: 0,
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
      id: 1,
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
      id: 2,
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
  comment: 'Some Comment',
  creation_time: '2019-07-16T06:31:29Z',
  modification_time: '2019-07-16T06:44:55Z',
  owner: {name: 'admin'},
  writable: 1,
  in_use: 0,
  family_count: {__text: '', growing: 1},
  families: {family: families},
  preferences: preferences,
  permissions: {permission: [{name: 'everything'}]},
  scanner: {name: 'scanner', type: '42'},
  tasks: {
    task: [
      {_id: '1234', name: 'task1'},
      {_id: '5678', name: 'task2'},
    ],
  },
});

const configId = {
  id: '12345',
};

const scanners = [{name: 'scanner1'}, {name: 'scanner2'}];

const reloadInterval = 1;
const manualUrl = 'test/';

const currentSettings = testing
  .fn()
  .mockResolvedValue(currentSettingsDefaultResponse);

const createGmp = ({
  getConfigResponse = new Response(config),
  getTagsResponse = {
    data: [],
    meta: {
      filter: Filter.fromString(),
      counts: new CollectionCounts(),
    },
  },
  getPermissionsResponse = {
    data: [],
    meta: {
      filter: Filter.fromString(),
      counts: new CollectionCounts(),
    },
  },
  getNvtFamiliesResponse = {},
  getScannersResponse = {data: scanners},
  cloneConfigResponse = new Response({id: 'cloned-id'}),
  deleteConfigResponse = undefined,
  exportConfigResponse = new Response('some-data'),
  getConfig = testing.fn().mockResolvedValue(getConfigResponse),
  getTags = testing.fn().mockResolvedValue(getTagsResponse),
  getPermissions = testing.fn().mockResolvedValue(getPermissionsResponse),
  getNvtFamilies = testing.fn().mockResolvedValue(getNvtFamiliesResponse),
  getScanners = testing.fn().mockResolvedValue(getScannersResponse),
  cloneConfig = testing.fn().mockResolvedValue(cloneConfigResponse),
  deleteConfig = testing.fn().mockResolvedValue(deleteConfigResponse),
  exportConfig = testing.fn().mockResolvedValue(exportConfigResponse),
} = {}) => {
  return {
    nvtfamilies: {
      get: getNvtFamilies,
    },
    scanconfig: {
      get: getConfig,
      clone: cloneConfig,
      delete: deleteConfig,
      export: exportConfig,
    },
    scanners: {
      getAll: getScanners,
    },
    tags: {
      get: getTags,
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
};

describe('ScanConfigDetailsPage tests', () => {
  test('should render full DetailsPage', async () => {
    const gmp = createGmp();
    const {render, store} = rendererWith({
      gmp,
      capabilities: true,
      router: true,
      store: true,
    });

    store.dispatch(setTimezone('CET'));
    store.dispatch(setUsername('admin'));

    store.dispatch(entityLoadingActions.success('12345', config));

    render(<DetailsPage id="12345" />);

    expect(
      screen.getByRole('heading', {name: /Scan Config: foo/}),
    ).toBeInTheDocument();

    expect(screen.getByTitle('Help: ScanConfigs')).toBeInTheDocument();
    expect(screen.getByTestId('manual-link')).toHaveAttribute(
      'href',
      'test/en/scanning.html#managing-scan-configurations',
    );

    expect(screen.getByTestId('list-link-icon')).toHaveAttribute(
      'href',
      '/scan-configs',
    );
    screen.getByTitle('ScanConfig List');

    const entityInfo = within(screen.getByTestId('entity-info'));
    const infoRows = entityInfo.getAllByRole('row');
    expect(infoRows[0]).toHaveTextContent('12345');
    expect(infoRows[1]).toHaveTextContent(
      'Tue, Jul 16, 2019 8:31 AM Central European Summer Time',
    );
    expect(infoRows[2]).toHaveTextContent(
      'Tue, Jul 16, 2019 8:44 AM Central European Summer Time',
    );
    expect(infoRows[3]).toHaveTextContent('admin');

    const tablist = await screen.findByRole('tablist');
    within(tablist).getByRole('tab', {name: /^information/i});
    within(tablist).getByRole('tab', {name: /^scanner preferences/i});
    within(tablist).getByRole('tab', {name: /^nvt families/i});
    within(tablist).getByRole('tab', {name: /^nvt preferences/i});
    within(tablist).getByRole('tab', {name: /^user tags/i});
    within(tablist).getByRole('tab', {name: /^permissions/i});

    screen.getByText('Some Comment');

    const tasksRow = within(
      screen.getByText('Tasks using this Scan Config').closest('tr'),
    );
    expect(tasksRow.getByText('task1')).toHaveAttribute('href', '/task/1234');
    expect(tasksRow.getByText('task2')).toHaveAttribute('href', '/task/5678');
  });

  test('should render nvt families tab', async () => {
    const gmp = createGmp();
    const {render, store} = rendererWith({
      gmp,
      capabilities: true,
      router: true,
      store: true,
    });

    store.dispatch(setTimezone('CET'));
    store.dispatch(setUsername('admin'));

    store.dispatch(entityLoadingActions.success('12345', config));

    render(<DetailsPage id="12345" />);

    const tablist = await screen.findByRole('tablist');
    fireEvent.click(within(tablist).getByRole('tab', {name: /nvt families/i}));

    screen.getByText('1 of 1');
    screen.getByText('2 of 4');
    screen.getByText('0 of 2');

    const familyRow1 = within(screen.getByRole('cell', {name: /family1/i}));
    const familyRow1Link = familyRow1.getByRole('link');
    expect(familyRow1Link).toHaveAttribute(
      'href',
      '/nvts?filter=family%3D%22family1%22',
    );
    expect(familyRow1Link).toHaveAttribute('title', 'NVTs of family family1');

    const familyRow2 = within(screen.getByRole('cell', {name: /family2/i}));
    const familyRow2Link = familyRow2.getByRole('link');
    expect(familyRow2Link).toHaveAttribute(
      'href',
      '/nvts?filter=family%3D%22family2%22',
    );
    expect(familyRow2Link).toHaveAttribute('title', 'NVTs of family family2');

    const familyRow3 = within(screen.getByRole('cell', {name: /family3/i}));
    const familyRow3Link = familyRow3.getByRole('link');
    expect(familyRow3Link).toHaveAttribute(
      'href',
      '/nvts?filter=family%3D%22family3%22',
    );
    expect(familyRow3Link).toHaveAttribute('title', 'NVTs of family family3');

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

  test('should render nvt preferences tab', async () => {
    const gmp = createGmp();
    const {render, store} = rendererWith({
      gmp,
      capabilities: true,
      router: true,
      store: true,
    });

    store.dispatch(setTimezone('CET'));
    store.dispatch(setUsername('admin'));

    store.dispatch(entityLoadingActions.success('12345', config));

    render(<DetailsPage id="12345" />);

    const tablist = await screen.findByRole('tablist');
    const preferencesTab = within(tablist).getByRole('tab', {
      name: /^nvt preferences/i,
    });
    fireEvent.click(preferencesTab);

    // Verify preferences are displayed
    screen.getByText('preference0');
    screen.getByText('preference1');
    screen.getByText('preference2');

    // Validate NVT detail links without expensive row queries
    const detailsLinks = screen.getAllByTestId('details-link');
    expect(detailsLinks[0]).toHaveAttribute('href', '/nvt/0');
    expect(detailsLinks[1]).toHaveAttribute('href', '/nvt/1');
    expect(detailsLinks[2]).toHaveAttribute('href', '/nvt/2');
  });

  test('should render user tags tab', async () => {
    const gmp = createGmp();
    const {render, store} = rendererWith({
      gmp,
      capabilities: true,
      router: true,
      store: true,
    });

    store.dispatch(setTimezone('CET'));
    store.dispatch(setUsername('admin'));

    store.dispatch(entityLoadingActions.success('12345', config));

    const {container} = render(<DetailsPage id="12345" />);

    const tablist = await screen.findByRole('tablist');
    const userTagsTab = within(tablist).getByRole('tab', {name: /^user tags/i});
    fireEvent.click(userTagsTab);

    expect(container).toHaveTextContent('No user tags available');
  });

  test('should render permissions tab', async () => {
    const gmp = createGmp();
    const {render, store} = rendererWith({
      gmp,
      capabilities: true,
      router: true,
      store: true,
    });

    store.dispatch(setTimezone('CET'));
    store.dispatch(setUsername('admin'));

    store.dispatch(entityLoadingActions.success('12345', config));

    const {container} = render(<DetailsPage id="12345" />);

    const tablist = await screen.findByRole('tablist');
    const permissionsTab = within(tablist).getByRole('tab', {
      name: /^permissions/i,
    });
    fireEvent.click(permissionsTab);

    expect(container).toHaveTextContent('No permissions available');
  });

  test('should call commands', async () => {
    const deleteFunc = testing.fn().mockRejectedValue({
      foo: 'bar',
    });
    const gmp = createGmp({
      deleteConfig: deleteFunc,
    });
    const {render, store} = rendererWith({
      gmp,
      capabilities: true,
      router: true,
      store: true,
    });

    store.dispatch(setTimezone('CET'));
    store.dispatch(setUsername('admin'));
    store.dispatch(entityLoadingActions.success('12345', config));

    render(<DetailsPage id="12345" />);

    const cloneIcon = await screen.findByTitle('Clone Scan Config');
    fireEvent.click(cloneIcon);
    expect(gmp.scanconfig.clone).toHaveBeenCalledWith(config);

    const editIcon = screen.getByTitle('Edit Scan Config');
    expect(editIcon).toBeInTheDocument();
    fireEvent.click(editIcon);
    expect(gmp.nvtfamilies.get).toHaveBeenCalled();
    expect(gmp.scanners.getAll).toHaveBeenCalled();

    const exportIcon = screen.getByTitle('Export Scan Config as XML');
    fireEvent.click(exportIcon);
    expect(gmp.scanconfig.export).toHaveBeenCalledWith(config);

    const trashcanIcon = screen.getByTitle('Move Scan Config to trashcan');
    fireEvent.click(trashcanIcon);
    expect(gmp.scanconfig.delete).toHaveBeenCalledWith(configId);

    expect(
      screen.queryByRole('heading', {name: 'Import Scan Config'}),
    ).not.toBeInTheDocument();
    const importButton = screen.getByTitle('Import Scan Config');
    fireEvent.click(importButton);
    expect(
      screen.getByRole('heading', {name: 'Import Scan Config'}),
    ).toBeInTheDocument();
  });

  test('should not call commands without permission', async () => {
    const config2 = ScanConfig.fromElement({
      _id: '12345',
      name: 'foo',
      comment: 'bar',
      creation_time: '2019-07-16T06:31:29Z',
      modification_time: '2019-07-16T06:44:55Z',
      owner: {name: 'user'},
      writable: 1,
      in_use: 0,
      family_count: {__text: '', growing: 1},
      families: {family: families},
      preferences: preferences,
      permissions: {permission: [{name: 'get_config'}]},
      scanner: {name: 'scanner', type: '42'},
      tasks: {
        task: [
          {_id: '1234', name: 'task1'},
          {_id: '5678', name: 'task2'},
        ],
      },
    });
    const gmp = createGmp({
      getConfigResponse: new Response(config2),
    });
    const {render, store} = rendererWith({
      gmp,
      capabilities: true,
      router: true,
      store: true,
    });

    store.dispatch(setTimezone('CET'));
    store.dispatch(setUsername('admin'));
    store.dispatch(entityLoadingActions.success('12345', config2));

    render(<DetailsPage id="12345" />);

    expect(screen.getByTestId('new-icon')).toHaveAttribute(
      'title',
      'Create new Scan Config',
    );

    const cloneIcon = screen.getByTitle(
      'Permission to clone Scan Config denied',
    );
    fireEvent.click(cloneIcon);
    expect(gmp.scanconfig.clone).not.toHaveBeenCalled();

    const editIcon = screen.getByTitle('Permission to edit Scan Config denied');
    fireEvent.click(editIcon);
    expect(gmp.nvtfamilies.get).not.toHaveBeenCalled();
    expect(gmp.scanners.getAll).not.toHaveBeenCalled();

    const exportIcon = screen.getByTitle('Export Scan Config as XML');
    fireEvent.click(exportIcon);
    expect(gmp.scanconfig.export).toHaveBeenCalledWith(config2);

    const deleteIcon = screen.getByTitle(
      'Permission to move Scan Config to trashcan denied',
    );
    fireEvent.click(deleteIcon);
    expect(gmp.scanconfig.delete).not.toHaveBeenCalled();

    expect(
      screen.queryByRole('heading', {name: 'Import Scan Config'}),
    ).not.toBeInTheDocument();
    const importButton = screen.getByTitle('Import Scan Config');
    fireEvent.click(importButton);
    expect(
      screen.getByRole('heading', {name: 'Import Scan Config'}),
    ).toBeInTheDocument();
  });

  test('should (not) call commands if config is in use', async () => {
    const config3 = ScanConfig.fromElement({
      _id: '12345',
      name: 'foo',
      comment: 'bar',
      creation_time: '2019-07-16T06:31:29Z',
      modification_time: '2019-07-16T06:44:55Z',
      owner: {name: 'user'},
      writable: 1,
      in_use: 1,
      family_count: {__text: '', growing: 1},
      families: {family: families},
      preferences: preferences,
      permissions: {permission: [{name: 'everything'}]},
      scanner: {name: 'scanner', type: '42'},
      tasks: {
        task: [
          {_id: '1234', name: 'task1'},
          {_id: '5678', name: 'task2'},
        ],
      },
    });
    const gmp = createGmp({
      getConfigResponse: new Response(config3),
    });
    const {render, store} = rendererWith({
      gmp,
      capabilities: true,
      router: true,
      store: true,
    });

    store.dispatch(setTimezone('CET'));
    store.dispatch(setUsername('admin'));
    store.dispatch(entityLoadingActions.success('12345', config3));

    render(<DetailsPage id="12345" />);

    expect(screen.getByTitle('Create new Scan Config')).toBeInTheDocument();

    const cloneIcon = screen.getByTitle('Clone Scan Config');
    fireEvent.click(cloneIcon);
    expect(gmp.scanconfig.clone).toHaveBeenCalledWith(config3);

    const editIcon = screen.getByTitle('Edit Scan Config');
    expect(editIcon).toBeInTheDocument();
    fireEvent.click(editIcon);
    expect(gmp.nvtfamilies.get).toHaveBeenCalled();
    expect(gmp.scanners.getAll).toHaveBeenCalled();

    const deleteIcon = screen.getByTitle('Scan Config is still in use');
    fireEvent.click(deleteIcon);
    expect(gmp.scanconfig.delete).not.toHaveBeenCalled();

    const exportIcon = screen.getByTitle('Export Scan Config as XML');
    fireEvent.click(exportIcon);
    expect(gmp.scanconfig.export).toHaveBeenCalledWith(config3);

    expect(
      screen.queryByRole('heading', {name: 'Import Scan Config'}),
    ).not.toBeInTheDocument();
    const importButton = screen.getByTitle('Import Scan Config');
    fireEvent.click(importButton);
    expect(
      screen.getByRole('heading', {name: 'Import Scan Config'}),
    ).toBeInTheDocument();
  });

  test('should (not) call commands if config is not writable', async () => {
    const config4 = ScanConfig.fromElement({
      _id: '12345',
      name: 'foo',
      comment: 'bar',
      creation_time: '2019-07-16T06:31:29Z',
      modification_time: '2019-07-16T06:44:55Z',
      owner: {name: 'user'},
      writable: 0,
      in_use: 0,
      family_count: {__text: '', growing: 1},
      families: {family: families},
      preferences: preferences,
      permissions: {permission: [{name: 'everything'}]},
      scanner: {name: 'scanner', type: '42'},
      tasks: {
        task: [
          {_id: '1234', name: 'task1'},
          {_id: '5678', name: 'task2'},
        ],
      },
    });
    const gmp = createGmp({
      getConfigResponse: new Response(config4),
    });
    const {render, store} = rendererWith({
      gmp,
      capabilities: true,
      router: true,
      store: true,
    });

    store.dispatch(setTimezone('CET'));
    store.dispatch(setUsername('admin'));
    store.dispatch(entityLoadingActions.success('12345', config4));

    render(<DetailsPage id="12345" />);

    const createIcon = screen.getByTitle('Create new Scan Config');
    expect(createIcon).toBeInTheDocument();

    const cloneIcon = screen.getByTitle('Clone Scan Config');
    fireEvent.click(cloneIcon);
    expect(gmp.scanconfig.clone).toHaveBeenCalledWith(config4);

    const editIcon = screen.getByTestId('edit-icon');
    fireEvent.click(editIcon);
    expect(gmp.nvtfamilies.get).not.toHaveBeenCalled();
    expect(gmp.scanners.getAll).not.toHaveBeenCalled();
    expect(editIcon).toHaveAttribute('title', 'Scan Config is not writable');

    const deleteIcon = screen.getByTestId('trashcan-icon');
    fireEvent.click(deleteIcon);
    expect(gmp.scanconfig.delete).not.toHaveBeenCalled();
    expect(deleteIcon).toHaveAttribute('title', 'Scan Config is not writable');

    const exportIcon = screen.getByTitle('Export Scan Config as XML');
    fireEvent.click(exportIcon);
    expect(gmp.scanconfig.export).toHaveBeenCalledWith(config4);

    expect(
      screen.queryByRole('heading', {name: 'Import Scan Config'}),
    ).not.toBeInTheDocument();
    const importButton = screen.getByTitle('Import Scan Config');
    fireEvent.click(importButton);
    expect(
      screen.getByRole('heading', {name: 'Import Scan Config'}),
    ).toBeInTheDocument();
  });
});
