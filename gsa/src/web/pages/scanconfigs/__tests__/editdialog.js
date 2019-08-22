/* Copyright (C) 2019 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301 USA.
 */
import React from 'react';

import _ from 'gmp/locale';

import ScanConfig from 'gmp/models/scanconfig';
import Policy from 'gmp/models/policy';

import {rendererWith, fireEvent} from 'web/utils/testing';

import EditDialog from '../editdialog';

const families = [
  {
    name: 'family1',
    nvt_count: '1',
    max_nvt_count: '1',
    growing: '0',
  },
  {
    name: 'family2',
    nvt_count: '2',
    max_nvt_count: '4',
    growing: '0',
  },
  {
    name: 'family3',
    nvt_count: '0',
    max_nvt_count: '2',
    growing: '0',
  },
];

const preferences = {
  preference: [
    {
      name: 'preference',
      value: '3',
      nvt: {
        _oid: '0',
        id: '0',
        hr_name: 'preference0',
        name: 'preference0',
        type: 'checkbox',
        value: 'no',
        default: 'no',
      },
    },
    {
      name: 'preference',
      value: '4',
      nvt: {
        _oid: '1',
        id: '1',
        hr_name: 'preference1',
        name: 'preference1',
        type: 'radio',
        value: '1',
        alt: ['2', '3'],
        default: '1',
      },
    },
    {
      name: 'preference',
      value: '5',
      nvt: {
        _oid: '2',
        id: '2',
        hr_name: 'preference2',
        name: 'preference2',
        type: 'entry',
        value: 'foo',
        default: 'foo',
      },
    },
    {name: 'scannerpref0', value: 0, nvt: {}},
  ],
};

const config = new ScanConfig({
  name: 'foo',
  comment: 'bar',
  writable: '1',
  in_use: '0',
  permissions: {permission: [{name: 'everything'}]},
  type: 0,
  usage_type: 'scan',
  families: {family: families},
  preferences: preferences,
});

const config2 = new ScanConfig({
  name: 'foo',
  comment: 'bar',
  writable: '1',
  in_use: '1',
  permissions: {permission: [{name: 'everything'}]},
  type: 0,
  usage_type: 'scan',
  families: {family: families},
  preferences: preferences,
});

const ospConfig = new ScanConfig({
  name: 'foo',
  comment: 'bar',
  writable: '1',
  in_use: '0',
  permissions: {permission: [{name: 'everything'}]},
  type: 1,
  usage_type: 'scan',
  families: {family: families},
  preferences: preferences,
});

const policy = new Policy({
  name: 'foo',
  comment: 'bar',
  writable: '1',
  in_use: '0',
  permissions: {permission: [{name: 'everything'}]},
  type: 0,
  usage_type: 'policy',
  families: {family: families},
  preferences: preferences,
});

const scanners = [
  {name: 'scanner1', id: '1'},
  {name: 'scanner2', id: '2'},
  {name: 'scanner3', id: '3'},
];

const select = {
  family1: 0,
  family2: 0,
  family3: 0,
};

const trend = {
  family1: 1,
  family2: 0,
  family3: 0,
};

const scannerPreferenceValues = {
  scannerpref0: {name: 'scannerpref0', value: 0},
};

describe('EditDialog component tests', () => {
  test('should render dialog', () => {
    const handleClose = jest.fn();
    const handleSave = jest.fn();
    const handleOpenEditConfigFamilyDialog = jest.fn();
    const handleOpenEditNvtDetailsDialog = jest.fn();

    const {render} = rendererWith({capabilities: true});
    const {baseElement} = render(
      <EditDialog
        comment={config.comment}
        config={config}
        families={families}
        name={config.name}
        scanner_id={'0'}
        scanner_preference_values={scannerPreferenceValues}
        scanners={scanners}
        select={select}
        title={_('Edit Scan Config {{name}}', {
          name: config.name,
        })}
        trend={trend}
        onClose={handleClose}
        onEditConfigFamilyClick={handleOpenEditConfigFamilyDialog}
        onEditNvtDetailsClick={handleOpenEditNvtDetailsDialog}
        onSave={handleSave}
      />,
    );

    expect(baseElement).toMatchSnapshot();
    expect(baseElement).toHaveTextContent('Edit Scan Config');
    expect(baseElement).not.toHaveTextContent('Policy');
    expect(baseElement).toHaveTextContent(
      'Edit Network Vulnerability Test Families',
    );
    expect(baseElement).toHaveTextContent('Edit Scanner Preferences');
    expect(baseElement).toHaveTextContent(
      'Network Vulnerability Test Preferences',
    );
  });

  test('should render dialog for config in use', () => {
    const handleClose = jest.fn();
    const handleSave = jest.fn();
    const handleOpenEditConfigFamilyDialog = jest.fn();
    const handleOpenEditNvtDetailsDialog = jest.fn();

    const {render} = rendererWith({capabilities: true});
    const {baseElement} = render(
      <EditDialog
        comment={config2.comment}
        config={config2}
        families={families}
        name={config2.name}
        scanner_id={'0'}
        scanner_preference_values={scannerPreferenceValues}
        scanners={scanners}
        select={select}
        title={_('Edit Scan Config {{name}}', {
          name: config2.name,
        })}
        trend={trend}
        onClose={handleClose}
        onEditConfigFamilyClick={handleOpenEditConfigFamilyDialog}
        onEditNvtDetailsClick={handleOpenEditNvtDetailsDialog}
        onSave={handleSave}
      />,
    );

    expect(baseElement).toHaveTextContent('Edit Scan Config');
    expect(baseElement).not.toHaveTextContent('Policy');
    expect(baseElement).not.toHaveTextContent(
      'Edit Network Vulnerability Test Families',
    );
    expect(baseElement).not.toHaveTextContent('Edit Scanner Preferences');
    expect(baseElement).not.toHaveTextContent(
      'Network Vulnerability Test Preferences',
    );
  });

  test('should render dialog for osp config', () => {
    const handleClose = jest.fn();
    const handleSave = jest.fn();
    const handleOpenEditConfigFamilyDialog = jest.fn();
    const handleOpenEditNvtDetailsDialog = jest.fn();

    const {render} = rendererWith({capabilities: true, router: true});
    const {baseElement} = render(
      <EditDialog
        comment={ospConfig.comment}
        config={ospConfig}
        families={families}
        name={ospConfig.name}
        scanner_id={'1'}
        scanner_preference_values={scannerPreferenceValues}
        scanners={scanners}
        select={select}
        title={_('Edit Scan Config {{name}}', {
          name: ospConfig.name,
        })}
        trend={trend}
        onClose={handleClose}
        onEditConfigFamilyClick={handleOpenEditConfigFamilyDialog}
        onEditNvtDetailsClick={handleOpenEditNvtDetailsDialog}
        onSave={handleSave}
      />,
    );

    expect(baseElement).toMatchSnapshot();
    expect(baseElement).toHaveTextContent('Edit Scan Config');
    expect(baseElement).not.toHaveTextContent('Policy');
    expect(baseElement).not.toHaveTextContent(
      'Edit Network Vulnerability Test Families',
    );
    expect(baseElement).toHaveTextContent('Edit Scanner Preferences');
    expect(baseElement).not.toHaveTextContent(
      'Network Vulnerability Test Preferences',
    );
  });

  test('should render dialog for policy', () => {
    const handleClose = jest.fn();
    const handleSave = jest.fn();
    const handleOpenEditConfigFamilyDialog = jest.fn();
    const handleOpenEditNvtDetailsDialog = jest.fn();

    const {render} = rendererWith({capabilities: true, router: true});
    const {baseElement, getAllByTestId} = render(
      <EditDialog
        comment={policy.comment}
        config={policy}
        families={families}
        name={policy.name}
        scanner_id={'0'}
        scanner_preference_values={scannerPreferenceValues}
        scanners={scanners}
        select={select}
        title={_('Edit Policy {{name}}', {
          name: policy.name,
        })}
        trend={trend}
        onClose={handleClose}
        onEditConfigFamilyClick={handleOpenEditConfigFamilyDialog}
        onEditNvtDetailsClick={handleOpenEditNvtDetailsDialog}
        onSave={handleSave}
      />,
    );

    expect(baseElement).toMatchSnapshot();
    expect(baseElement).toHaveTextContent('Edit Policy');
    expect(baseElement).not.toHaveTextContent('Config');
    expect(baseElement).toHaveTextContent(
      'Edit Network Vulnerability Test Families',
    );
    expect(baseElement).toHaveTextContent('Edit Scanner Preferences');
    expect(baseElement).toHaveTextContent(
      'Network Vulnerability Test Preferences',
    );

    const icons = getAllByTestId('svg-icon');
    expect(icons[3]).toHaveAttribute('title', 'Edit Policy Family');
    expect(icons[12]).toHaveAttribute('title', 'Edit Policy NVT Details');
  });

  test('should save data', () => {
    const handleClose = jest.fn();
    const handleSave = jest.fn();
    const handleOpenEditConfigFamilyDialog = jest.fn();
    const handleOpenEditNvtDetailsDialog = jest.fn();

    const {render} = rendererWith({capabilities: true, router: true});
    const {getByTestId} = render(
      <EditDialog
        comment={config.comment}
        config={config}
        families={families}
        name={config.name}
        scanner_id={'0'}
        scanner_preference_values={scannerPreferenceValues}
        scanners={scanners}
        select={select}
        title={_('Edit Scan Config {{name}}', {
          name: config.name,
        })}
        trend={trend}
        onClose={handleClose}
        onEditConfigFamilyClick={handleOpenEditConfigFamilyDialog}
        onEditNvtDetailsClick={handleOpenEditNvtDetailsDialog}
        onSave={handleSave}
      />,
    );

    const saveButton = getByTestId('dialog-save-button');
    fireEvent.click(saveButton);

    expect(handleSave).toHaveBeenCalledWith({
      base: 0,
      comment: 'bar',
      id: undefined,
      name: 'foo',
      scanner_id: '0',
      scanner_preference_values: scannerPreferenceValues,
      select: select,
      trend: trend,
    });
  });

  test('should allow to close the dialog', () => {
    const handleClose = jest.fn();
    const handleSave = jest.fn();
    const handleOpenEditConfigFamilyDialog = jest.fn();
    const handleOpenEditNvtDetailsDialog = jest.fn();

    const {render} = rendererWith({capabilities: true, router: true});
    const {getByTestId} = render(
      <EditDialog
        comment={config.comment}
        config={config}
        families={families}
        name={config.name}
        scanner_id={'0'}
        scanner_preference_values={scannerPreferenceValues}
        scanners={scanners}
        select={select}
        title={_('Edit Scan Config {{name}}', {
          name: config.name,
        })}
        trend={trend}
        onClose={handleClose}
        onEditConfigFamilyClick={handleOpenEditConfigFamilyDialog}
        onEditNvtDetailsClick={handleOpenEditNvtDetailsDialog}
        onSave={handleSave}
      />,
    );

    const closeButton = getByTestId('dialog-close-button');

    fireEvent.click(closeButton);

    expect(handleClose).toHaveBeenCalled();
    expect(handleSave).not.toHaveBeenCalled();
  });

  test('should allow to change name and comment', () => {
    const handleClose = jest.fn();
    const handleSave = jest.fn();
    const handleOpenEditConfigFamilyDialog = jest.fn();
    const handleOpenEditNvtDetailsDialog = jest.fn();

    const {render} = rendererWith({capabilities: true, router: true});
    const {baseElement, getByTestId} = render(
      <EditDialog
        comment={config.comment}
        config={config}
        families={families}
        name={config.name}
        scanner_id={'0'}
        scanner_preference_values={scannerPreferenceValues}
        scanners={scanners}
        select={select}
        title={_('Edit Scan Config {{name}}', {
          name: config.name,
        })}
        trend={trend}
        onClose={handleClose}
        onEditConfigFamilyClick={handleOpenEditConfigFamilyDialog}
        onEditNvtDetailsClick={handleOpenEditNvtDetailsDialog}
        onSave={handleSave}
      />,
    );

    const inputs = baseElement.querySelectorAll('input');
    fireEvent.change(inputs[0], {target: {value: 'lorem'}});
    fireEvent.change(inputs[1], {target: {value: 'ipsum'}});

    const saveButton = getByTestId('dialog-save-button');
    fireEvent.click(saveButton);

    expect(handleSave).toHaveBeenCalledWith({
      base: 0,
      comment: 'ipsum',
      id: undefined,
      name: 'lorem',
      scanner_id: '0',
      scanner_preference_values: scannerPreferenceValues,
      select: select,
      trend: trend,
    });
  });

  test('should allow to edit nvt families for openvas configs', () => {
    const handleClose = jest.fn();
    const handleSave = jest.fn();
    const handleOpenEditConfigFamilyDialog = jest.fn();
    const handleOpenEditNvtDetailsDialog = jest.fn();

    const {render} = rendererWith({capabilities: true, router: true});
    const {baseElement, getByTestId} = render(
      <EditDialog
        comment={config.comment}
        config={config}
        families={families}
        name={config.name}
        scanner_id={'0'}
        scanner_preference_values={scannerPreferenceValues}
        scanners={scanners}
        select={select}
        title={_('Edit Scan Config {{name}}', {
          name: config.name,
        })}
        trend={trend}
        onClose={handleClose}
        onEditConfigFamilyClick={handleOpenEditConfigFamilyDialog}
        onEditNvtDetailsClick={handleOpenEditNvtDetailsDialog}
        onSave={handleSave}
      />,
    );

    const inputs = baseElement.querySelectorAll('input');
    fireEvent.click(inputs[3]);
    fireEvent.click(inputs[4]);

    const saveButton = getByTestId('dialog-save-button');
    fireEvent.click(saveButton);

    const newSelect = {
      family1: 1,
      family2: 0,
      family3: 0,
    };

    const newTrend = {
      family1: 0,
      family2: 0,
      family3: 0,
    };

    expect(handleSave).toHaveBeenCalledWith({
      base: 0,
      comment: 'bar',
      id: undefined,
      name: 'foo',
      scanner_id: '0',
      scanner_preference_values: scannerPreferenceValues,
      select: newSelect,
      trend: newTrend,
    });
  });

  test('should call click handlers for edit families and edit nvt details', () => {
    const handleClose = jest.fn();
    const handleSave = jest.fn();
    const handleOpenEditConfigFamilyDialog = jest.fn();
    const handleOpenEditNvtDetailsDialog = jest.fn();

    const {render} = rendererWith({capabilities: true, router: true});
    const {getAllByTestId} = render(
      <EditDialog
        comment={config.comment}
        config={config}
        families={families}
        name={config.name}
        scanner_id={''}
        scanner_preference_values={scannerPreferenceValues}
        scanners={scanners}
        select={select}
        title={_('Edit Scan Config {{name}}', {
          name: config.name,
        })}
        trend={trend}
        onClose={handleClose}
        onEditConfigFamilyClick={handleOpenEditConfigFamilyDialog}
        onEditNvtDetailsClick={handleOpenEditNvtDetailsDialog}
        onSave={handleSave}
      />,
    );

    const icons = getAllByTestId('svg-icon');
    fireEvent.click(icons[3]);
    fireEvent.click(icons[12]);

    expect(icons[3]).toHaveAttribute('title', 'Edit Scan Config Family');
    expect(icons[12]).toHaveAttribute('title', 'Edit Scan Config NVT Details');

    expect(handleOpenEditConfigFamilyDialog).toHaveBeenCalledWith({
      config: config,
      name: 'family1',
    });
    expect(handleOpenEditNvtDetailsDialog).toHaveBeenCalledWith({
      config: config,
      nvt: {
        oid: '0',
        id: '0',
        hr_name: 'preference0',
        name: 'preference0',
        type: 'checkbox',
        value: 'no',
        default: 'no',
      },
    });
  });

  // TODO: should allow to change scanner preferences
});
