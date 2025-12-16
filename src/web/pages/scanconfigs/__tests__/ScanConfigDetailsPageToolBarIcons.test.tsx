/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {screen, rendererWith, fireEvent} from 'web/testing';
import Capabilities from 'gmp/capabilities/capabilities';
import ScanConfig from 'gmp/models/scan-config';
import ScanConfigDetailsPageToolBarIcons from 'web/pages/scanconfigs/ScanConfigDetailsPageToolBarIcons';

const manualUrl = 'test/';

const wrongCaps = new Capabilities(['get_configs']);

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
describe('ScanConfigDetailPageToolBarIcons tests', () => {
  test('should render', () => {
    const handleScanConfigCreate = testing.fn();
    const handleScanConfigClone = testing.fn();
    const handleScanConfigDelete = testing.fn();
    const handleScanConfigDownload = testing.fn();
    const handleScanConfigEdit = testing.fn();
    const handleScanConfigImport = testing.fn();

    const {render} = rendererWith({
      gmp: {settings: {manualUrl}},
      capabilities: true,
      router: true,
    });

    render(
      <ScanConfigDetailsPageToolBarIcons
        entity={config}
        onScanConfigCloneClick={handleScanConfigClone}
        onScanConfigCreateClick={handleScanConfigCreate}
        onScanConfigDeleteClick={handleScanConfigDelete}
        onScanConfigDownloadClick={handleScanConfigDownload}
        onScanConfigEditClick={handleScanConfigEdit}
        onScanConfigImportClick={handleScanConfigImport}
      />,
    );

    expect(screen.getByTitle('Help: ScanConfigs')).toBeInTheDocument();
    expect(screen.getByTestId('manual-link')).toHaveAttribute(
      'href',
      'test/en/scanning.html#managing-scan-configurations',
    );

    expect(screen.getByTitle('ScanConfig List')).toBeInTheDocument();
    expect(screen.getByTestId('list-link-icon')).toHaveAttribute(
      'href',
      '/scanconfigs',
    );

    expect(screen.getByTitle('Create new Scan Config')).toBeInTheDocument();
    expect(screen.getByTitle('Clone Scan Config')).toBeInTheDocument();
    expect(screen.getByTitle('Edit Scan Config')).toBeInTheDocument();
    expect(
      screen.getByTitle('Move Scan Config to trashcan'),
    ).toBeInTheDocument();
    expect(screen.getByTitle('Export Scan Config as XML')).toBeInTheDocument();
    expect(screen.getByTitle('Import Scan Config')).toBeInTheDocument();
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
      capabilities: true,
      router: true,
    });

    render(
      <ScanConfigDetailsPageToolBarIcons
        entity={config}
        onScanConfigCloneClick={handleScanConfigClone}
        onScanConfigCreateClick={handleScanConfigCreate}
        onScanConfigDeleteClick={handleScanConfigDelete}
        onScanConfigDownloadClick={handleScanConfigDownload}
        onScanConfigEditClick={handleScanConfigEdit}
        onScanConfigImportClick={handleScanConfigImport}
      />,
    );

    fireEvent.click(screen.getByTitle('Create new Scan Config'));
    expect(handleScanConfigCreate).toHaveBeenCalled();

    fireEvent.click(screen.getByTitle('Clone Scan Config'));
    expect(handleScanConfigClone).toHaveBeenCalledWith(config);

    fireEvent.click(screen.getByTitle('Edit Scan Config'));
    expect(handleScanConfigEdit).toHaveBeenCalledWith(config);

    fireEvent.click(screen.getByTitle('Move Scan Config to trashcan'));
    expect(handleScanConfigDelete).toHaveBeenCalledWith(config);

    fireEvent.click(screen.getByTitle('Export Scan Config as XML'));
    expect(handleScanConfigDownload).toHaveBeenCalledWith(config);

    fireEvent.click(screen.getByTitle('Import Scan Config'));
    expect(handleScanConfigImport).toHaveBeenCalled();
  });

  test('should not call click handlers without permission', () => {
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
      <ScanConfigDetailsPageToolBarIcons
        entity={config2}
        onScanConfigCloneClick={handleScanConfigClone}
        onScanConfigCreateClick={handleScanConfigCreate}
        onScanConfigDeleteClick={handleScanConfigDelete}
        onScanConfigDownloadClick={handleScanConfigDownload}
        onScanConfigEditClick={handleScanConfigEdit}
        onScanConfigImportClick={handleScanConfigImport}
      />,
    );

    expect(
      screen.queryByTitle('Create new Scan Config'),
    ).not.toBeInTheDocument();

    fireEvent.click(
      screen.getByTitle('Permission to clone Scan Config denied'),
    );
    expect(handleScanConfigClone).not.toHaveBeenCalled();

    fireEvent.click(screen.getByTitle('Permission to edit Scan Config denied'));
    expect(handleScanConfigEdit).not.toHaveBeenCalled();

    fireEvent.click(
      screen.getByTitle('Permission to move Scan Config to trashcan denied'),
    );
    expect(handleScanConfigDelete).not.toHaveBeenCalled();

    fireEvent.click(screen.getByTitle('Export Scan Config as XML'));
    expect(handleScanConfigDownload).toHaveBeenCalledWith(config2);
  });

  test('should (not) call click handlers if config is in use', () => {
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
    const handleScanConfigCreate = testing.fn();
    const handleScanConfigClone = testing.fn();
    const handleScanConfigDelete = testing.fn();
    const handleScanConfigDownload = testing.fn();
    const handleScanConfigEdit = testing.fn();
    const handleScanConfigImport = testing.fn();

    const {render} = rendererWith({
      gmp: {settings: {manualUrl}},
      capabilities: true,
      router: true,
    });

    render(
      <ScanConfigDetailsPageToolBarIcons
        entity={config3}
        onScanConfigCloneClick={handleScanConfigClone}
        onScanConfigCreateClick={handleScanConfigCreate}
        onScanConfigDeleteClick={handleScanConfigDelete}
        onScanConfigDownloadClick={handleScanConfigDownload}
        onScanConfigEditClick={handleScanConfigEdit}
        onScanConfigImportClick={handleScanConfigImport}
      />,
    );

    fireEvent.click(screen.getByTitle('Create new Scan Config'));
    expect(handleScanConfigCreate).toHaveBeenCalled();

    fireEvent.click(screen.getByTitle('Clone Scan Config'));
    expect(handleScanConfigClone).toHaveBeenCalledWith(config3);

    fireEvent.click(screen.getByTitle('Edit Scan Config'));
    expect(handleScanConfigEdit).toHaveBeenCalledWith(config3);

    fireEvent.click(screen.getByTitle('Scan Config is still in use'));
    expect(handleScanConfigDelete).not.toHaveBeenCalled();

    fireEvent.click(screen.getByTitle('Export Scan Config as XML'));
    expect(handleScanConfigDownload).toHaveBeenCalledWith(config3);

    fireEvent.click(screen.getByTitle('Import Scan Config'));
    expect(handleScanConfigImport).toHaveBeenCalled();
  });

  test('should (not) call click handlers if config is not writable', () => {
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
    const handleScanConfigCreate = testing.fn();
    const handleScanConfigClone = testing.fn();
    const handleScanConfigDelete = testing.fn();
    const handleScanConfigDownload = testing.fn();
    const handleScanConfigEdit = testing.fn();
    const handleScanConfigImport = testing.fn();

    const {render} = rendererWith({
      gmp: {settings: {manualUrl}},
      capabilities: true,
      router: true,
    });

    render(
      <ScanConfigDetailsPageToolBarIcons
        entity={config4}
        onScanConfigCloneClick={handleScanConfigClone}
        onScanConfigCreateClick={handleScanConfigCreate}
        onScanConfigDeleteClick={handleScanConfigDelete}
        onScanConfigDownloadClick={handleScanConfigDownload}
        onScanConfigEditClick={handleScanConfigEdit}
        onScanConfigImportClick={handleScanConfigImport}
      />,
    );

    fireEvent.click(screen.getByTitle('Create new Scan Config'));
    expect(handleScanConfigCreate).toHaveBeenCalled();

    fireEvent.click(screen.getByTitle('Clone Scan Config'));
    expect(handleScanConfigClone).toHaveBeenCalledWith(config4);

    fireEvent.click(screen.getByTestId('edit-icon'));
    expect(handleScanConfigEdit).not.toHaveBeenCalled();

    fireEvent.click(screen.getByTestId('trashcan-icon'));
    expect(handleScanConfigDelete).not.toHaveBeenCalled();

    fireEvent.click(screen.getByTitle('Export Scan Config as XML'));
    expect(handleScanConfigDownload).toHaveBeenCalledWith(config4);

    fireEvent.click(screen.getByTitle('Import Scan Config'));
    expect(handleScanConfigImport).toHaveBeenCalled();
  });
});
