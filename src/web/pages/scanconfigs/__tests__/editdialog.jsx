/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';

import {
  SCANCONFIG_TREND_STATIC,
  SCANCONFIG_TREND_DYNAMIC,
} from 'gmp/models/scanconfig';

import {rendererWith, fireEvent, getAllByTestId} from 'web/utils/testing';

import EditScanConfigDialog from '../editdialog';

const families = [
  {
    name: 'family1',
    maxNvtCount: 1,
  },
  {
    name: 'family2',
    maxNvtCount: 4,
  },
  {
    name: 'family3',
    maxNvtCount: 2,
  },
  {
    name: 'family4',
    maxNvtCount: 6,
  },
];

const configFamilies = {
  family1: {
    name: 'family1',
    nvts: {
      count: 1,
      max: 1,
    },
    trend: SCANCONFIG_TREND_DYNAMIC,
  },
  family2: {
    name: 'family2',
    nvts: {
      count: 2,
      max: 4,
    },
    trend: SCANCONFIG_TREND_STATIC,
  },
  family3: {
    name: 'family3',
    nvts: {
      count: 0,
      max: 2,
    },
    trend: SCANCONFIG_TREND_STATIC,
  },
};

const nvtPreferences = [
  {
    name: 'preference1',
    value: '3',
    nvt: {
      oid: '1.2.1',
      name: 'preference0',
    },
  },
  {
    name: 'preference2',
    value: '4',
    nvt: {
      oid: '1.2.2',
      name: 'preference1',
    },
  },
  {
    name: 'preference',
    value: '5',
    nvt: {
      oid: '1.2.3',
      name: 'preference2',
      value: 'foo',
    },
  },
];

const scanners = [
  {name: 'scanner1', id: '1'},
  {name: 'scanner2', id: '2'},
  {name: 'scanner3', id: '3'},
];

const select = {
  family1: 1,
  family2: 0,
  family3: 0,
  family4: 0,
};

const trend = {
  family1: SCANCONFIG_TREND_DYNAMIC,
  family2: SCANCONFIG_TREND_STATIC,
  family3: SCANCONFIG_TREND_STATIC,
  family4: SCANCONFIG_TREND_STATIC,
};

const scannerPreferences = [
  {
    name: 'scannerpref0',
    hr_name: 'Scanner Preference 1',
    value: 0,
  },
];

describe('EditScanConfigDialog component tests', () => {
  test('should render dialog', () => {
    const handleClose = testing.fn();
    const handleSave = testing.fn();
    const handleOpenEditConfigFamilyDialog = testing.fn();
    const handleOpenEditNvtDetailsDialog = testing.fn();

    const {render} = rendererWith({capabilities: true});

    const {baseElement, getByTestId} = render(
      <EditScanConfigDialog
        comment="bar"
        configFamilies={configFamilies}
        configId="c1"
        configIsInUse={false}
        editNvtDetailsTitle="Edit Scan Config NVT Details"
        editNvtFamiliesTitle="Edit Scan Config Family"
        families={families}
        isLoadingConfig={false}
        isLoadingFamilies={false}
        isLoadingScanners={false}
        name="Config"
        nvtPreferences={nvtPreferences}
        scannerPreferences={scannerPreferences}
        scanners={scanners}
        title="Edit Scan Config"
        onClose={handleClose}
        onEditConfigFamilyClick={handleOpenEditConfigFamilyDialog}
        onEditNvtDetailsClick={handleOpenEditNvtDetailsDialog}
        onSave={handleSave}
      />,
    );

    expect(baseElement).toMatchSnapshot();

    const titleBar = getByTestId('dialog-title-bar');
    expect(titleBar).toHaveTextContent('Edit Scan Config');

    const content = getByTestId('save-dialog-content');
    expect(content).toHaveTextContent(
      'Edit Network Vulnerability Test Families',
    );
    expect(content).toHaveTextContent('Edit Scanner Preferences');
    expect(content).toHaveTextContent('Network Vulnerability Test Preferences');

    const scannerSelection = content.querySelector('[role=combobox]');
    expect(scannerSelection).toBeNull();
  });

  test('should render dialog for config in use', () => {
    const handleClose = testing.fn();
    const handleSave = testing.fn();
    const handleOpenEditConfigFamilyDialog = testing.fn();
    const handleOpenEditNvtDetailsDialog = testing.fn();

    const {render} = rendererWith({capabilities: true});
    const {baseElement, getByTestId} = render(
      <EditScanConfigDialog
        comment="bar"
        configFamilies={configFamilies}
        configId="c1"
        configIsInUse={true}
        editNvtDetailsTitle="Edit Scan Config NVT Details"
        editNvtFamiliesTitle="Edit Scan Config Family"
        families={families}
        isLoadingConfig={false}
        isLoadingFamilies={false}
        isLoadingScanners={false}
        name="Config"
        nvtPreferences={nvtPreferences}
        scannerPreferences={scannerPreferences}
        scanners={scanners}
        title="Edit Scan Config"
        onClose={handleClose}
        onEditConfigFamilyClick={handleOpenEditConfigFamilyDialog}
        onEditNvtDetailsClick={handleOpenEditNvtDetailsDialog}
        onSave={handleSave}
      />,
    );

    expect(baseElement).toMatchSnapshot();

    const titleBar = getByTestId('dialog-title-bar');
    expect(titleBar).toHaveTextContent('Edit Scan Config');

    const content = getByTestId('save-dialog-content');
    expect(content).not.toHaveTextContent(
      'Edit Network Vulnerability Test Families',
    );
    expect(content).not.toHaveTextContent('Edit Scanner Preferences');
    expect(content).not.toHaveTextContent(
      'Network Vulnerability Test Preferences',
    );

    const scannerSelection = content.querySelector('[role=combobox]');
    expect(scannerSelection).toBeNull();

    const inUseNotification = getByTestId('inline-notification');
    expect(inUseNotification).toHaveTextContent(
      'The scan config is currently in use by one or more tasks, therefore only name and comment can be modified.',
    );
  });

  test('should render dialog inline notification for policy in use', () => {
    const handleClose = testing.fn();
    const handleSave = testing.fn();
    const handleOpenEditConfigFamilyDialog = testing.fn();
    const handleOpenEditNvtDetailsDialog = testing.fn();

    const {render} = rendererWith({capabilities: true});
    const {baseElement, getByTestId} = render(
      <EditScanConfigDialog
        comment="bar"
        configFamilies={configFamilies}
        configId="c1"
        configIsInUse={true}
        editNvtDetailsTitle="Edit Policy NVT Details"
        editNvtFamiliesTitle="Edit Policy Family'"
        families={families}
        isLoadingConfig={false}
        isLoadingFamilies={false}
        isLoadingScanners={false}
        name="Policy"
        nvtPreferences={nvtPreferences}
        scannerPreferences={scannerPreferences}
        scanners={scanners}
        title="Edit Policy"
        usageType="policy"
        onClose={handleClose}
        onEditConfigFamilyClick={handleOpenEditConfigFamilyDialog}
        onEditNvtDetailsClick={handleOpenEditNvtDetailsDialog}
        onSave={handleSave}
      />,
    );

    expect(baseElement).toMatchSnapshot();

    const titleBar = getByTestId('dialog-title-bar');
    expect(titleBar).toHaveTextContent('Edit Policy');

    const content = getByTestId('save-dialog-content');
    expect(content).not.toHaveTextContent(
      'Edit Network Vulnerability Test Families',
    );
    expect(content).not.toHaveTextContent('Edit Scanner Preferences');
    expect(content).not.toHaveTextContent(
      'Network Vulnerability Test Preferences',
    );

    const inUseNotification = getByTestId('inline-notification');
    expect(inUseNotification).toHaveTextContent(
      'The policy is currently in use by one or more audits, therefore only name and comment can be modified.',
    );
  });

  test('should save data', () => {
    const handleClose = testing.fn();
    const handleSave = testing.fn();
    const handleOpenEditConfigFamilyDialog = testing.fn();
    const handleOpenEditNvtDetailsDialog = testing.fn();

    const {render} = rendererWith({capabilities: true, router: true});
    const {getByTestId} = render(
      <EditScanConfigDialog
        comment="bar"
        configFamilies={configFamilies}
        configId="c1"
        configIsInUse={false}
        editNvtDetailsTitle="Edit Scan Config NVT Details"
        editNvtFamiliesTitle="Edit Scan Config Family"
        families={families}
        isLoadingConfig={false}
        isLoadingFamilies={false}
        isLoadingScanners={false}
        name="Config"
        nvtPreferences={nvtPreferences}
        scannerPreferences={scannerPreferences}
        scanners={scanners}
        title="Edit Scan Config"
        onClose={handleClose}
        onEditConfigFamilyClick={handleOpenEditConfigFamilyDialog}
        onEditNvtDetailsClick={handleOpenEditNvtDetailsDialog}
        onSave={handleSave}
      />,
    );

    const saveButton = getByTestId('dialog-save-button');
    fireEvent.click(saveButton);

    expect(handleSave).toHaveBeenCalledWith({
      comment: 'bar',
      id: 'c1',
      name: 'Config',
      scannerId: undefined,
      scannerPreferenceValues: {
        scannerpref0: 0,
      },
      select,
      trend,
    });
  });

  test('should allow to close the dialog', () => {
    const handleClose = testing.fn();
    const handleSave = testing.fn();
    const handleOpenEditConfigFamilyDialog = testing.fn();
    const handleOpenEditNvtDetailsDialog = testing.fn();

    const {render} = rendererWith({capabilities: true, router: true});
    const {getByTestId} = render(
      <EditScanConfigDialog
        comment="bar"
        configFamilies={configFamilies}
        configId="c1"
        configIsInUse={false}
        editNvtDetailsTitle="Edit Scan Config NVT Details"
        editNvtFamiliesTitle="Edit Scan Config Family"
        families={families}
        isLoadingConfig={false}
        isLoadingFamilies={false}
        isLoadingScanners={false}
        name="Config"
        nvtPreferences={nvtPreferences}
        scannerPreferences={scannerPreferences}
        scanners={scanners}
        title="Edit Scan Config"
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
    const handleClose = testing.fn();
    const handleSave = testing.fn();
    const handleOpenEditConfigFamilyDialog = testing.fn();
    const handleOpenEditNvtDetailsDialog = testing.fn();

    const {render} = rendererWith({capabilities: true, router: true});
    const {getByTestId} = render(
      <EditScanConfigDialog
        comment="bar"
        configFamilies={configFamilies}
        configId="c1"
        configIsInUse={false}
        editNvtDetailsTitle="Edit Scan Config NVT Details"
        editNvtFamiliesTitle="Edit Scan Config Family"
        families={families}
        isLoadingConfig={false}
        isLoadingFamilies={false}
        isLoadingScanners={false}
        name="Config"
        nvtPreferences={nvtPreferences}
        scannerPreferences={scannerPreferences}
        scanners={scanners}
        title="Edit Scan Config"
        onClose={handleClose}
        onEditConfigFamilyClick={handleOpenEditConfigFamilyDialog}
        onEditNvtDetailsClick={handleOpenEditNvtDetailsDialog}
        onSave={handleSave}
      />,
    );

    const content = getByTestId('save-dialog-content');
    const inputs = content.querySelectorAll('input');

    fireEvent.change(inputs[0], {target: {value: 'lorem'}});
    fireEvent.change(inputs[1], {target: {value: 'ipsum'}});

    const saveButton = getByTestId('dialog-save-button');
    fireEvent.click(saveButton);

    expect(handleSave).toHaveBeenCalledWith({
      comment: 'ipsum',
      id: 'c1',
      name: 'lorem',
      scannerId: undefined,
      scannerPreferenceValues: {
        scannerpref0: 0,
      },
      select,
      trend,
    });
  });

  test('should allow to edit nvt families for openvas configs', () => {
    const handleClose = testing.fn();
    const handleSave = testing.fn();
    const handleOpenEditConfigFamilyDialog = testing.fn();
    const handleOpenEditNvtDetailsDialog = testing.fn();

    const {render} = rendererWith({capabilities: true, router: true});
    const {getByTestId, queryAllByName} = render(
      <EditScanConfigDialog
        comment="bar"
        configFamilies={configFamilies}
        configId="c1"
        configIsInUse={false}
        editNvtDetailsTitle="Edit Scan Config NVT Details"
        editNvtFamiliesTitle="Edit Scan Config Family"
        families={families}
        isLoadingConfig={false}
        isLoadingFamilies={false}
        isLoadingScanners={false}
        name="Config"
        nvtPreferences={nvtPreferences}
        scannerPreferences={scannerPreferences}
        scanners={scanners}
        title="Edit Scan Config"
        onClose={handleClose}
        onEditConfigFamilyClick={handleOpenEditConfigFamilyDialog}
        onEditNvtDetailsClick={handleOpenEditNvtDetailsDialog}
        onSave={handleSave}
      />,
    );

    const family1Inputs = queryAllByName('family1');
    expect(family1Inputs.length).toEqual(3);
    fireEvent.click(family1Inputs[1]);

    const family2Inputs = queryAllByName('family2');
    expect(family2Inputs.length).toEqual(3);
    fireEvent.click(family2Inputs[2]);

    const saveButton = getByTestId('dialog-save-button');
    fireEvent.click(saveButton);

    const newSelect = {
      family1: 1,
      family2: 1,
      family3: 0,
      family4: 0,
    };

    const newTrend = {
      family1: SCANCONFIG_TREND_STATIC,
      family2: SCANCONFIG_TREND_STATIC,
      family3: SCANCONFIG_TREND_STATIC,
      family4: SCANCONFIG_TREND_STATIC,
    };

    expect(handleSave).toHaveBeenCalledWith({
      comment: 'bar',
      id: 'c1',
      name: 'Config',
      scannerId: undefined,
      scannerPreferenceValues: {
        scannerpref0: 0,
      },
      select: newSelect,
      trend: newTrend,
    });
  });

  test('should call click handlers for edit families and edit nvt details', () => {
    const handleClose = testing.fn();
    const handleSave = testing.fn();
    const handleOpenEditConfigFamilyDialog = testing.fn();
    const handleOpenEditNvtDetailsDialog = testing.fn();

    const {render} = rendererWith({capabilities: true, router: true});
    const {getByTestId} = render(
      <EditScanConfigDialog
        comment="bar"
        configFamilies={configFamilies}
        configId="c1"
        configIsInUse={false}
        editNvtDetailsTitle="Edit Scan Config NVT Details"
        editNvtFamiliesTitle="Edit Scan Config Family"
        families={families}
        isLoadingConfig={false}
        isLoadingFamilies={false}
        isLoadingScanners={false}
        name="Config"
        nvtPreferences={nvtPreferences}
        scannerPreferences={scannerPreferences}
        scanners={scanners}
        title="Edit Scan Config"
        onClose={handleClose}
        onEditConfigFamilyClick={handleOpenEditConfigFamilyDialog}
        onEditNvtDetailsClick={handleOpenEditNvtDetailsDialog}
        onSave={handleSave}
      />,
    );

    const content = getByTestId('save-dialog-content');
    const sections = content.querySelectorAll('section');

    const editFamilyIcons = getAllByTestId(sections[0], 'svg-icon');
    fireEvent.click(editFamilyIcons[3]);

    expect(editFamilyIcons[3]).toHaveAttribute(
      'title',
      'Edit Scan Config Family',
    );

    const editNvtIcons = getAllByTestId(sections[2], 'svg-icon');
    fireEvent.click(editNvtIcons[1]);

    expect(editNvtIcons[1]).toHaveAttribute(
      'title',
      'Edit Scan Config NVT Details',
    );

    expect(handleOpenEditConfigFamilyDialog).toHaveBeenCalledWith('family1');

    expect(handleOpenEditNvtDetailsDialog).toHaveBeenCalledWith('1.2.1');
  });

  // TODO: should allow to change scanner preferences
});
