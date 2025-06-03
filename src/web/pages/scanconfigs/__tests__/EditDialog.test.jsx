/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {
  SCANCONFIG_TREND_STATIC,
  SCANCONFIG_TREND_DYNAMIC,
} from 'gmp/models/scanconfig';
import EditScanConfigDialog, {
  handleSearchChange,
} from 'web/pages/scanconfigs/EditDialog';
import {changeInputValue, screen, within} from 'web/testing';
import {rendererWith, fireEvent, waitFor} from 'web/utils/Testing';

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

    render(
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

    expect(screen.queryDialogTitle()).toHaveTextContent('Edit Scan Config');

    const content = screen.queryDialogContent();
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
    render(
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

    expect(screen.queryDialogTitle()).toHaveTextContent('Edit Scan Config');

    const content = screen.queryDialogContent();
    expect(content).not.toHaveTextContent(
      'Edit Network Vulnerability Test Families',
    );
    expect(content).not.toHaveTextContent('Edit Scanner Preferences');
    expect(content).not.toHaveTextContent(
      'Network Vulnerability Test Preferences',
    );

    const scannerSelection = content.querySelector('[role=combobox]');
    expect(scannerSelection).toBeNull();

    const inUseNotification = screen.getByTestId('inline-notification');
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
    render(
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

    expect(screen.queryDialogTitle()).toHaveTextContent('Edit Policy');

    const content = screen.queryDialogContent();
    expect(content).not.toHaveTextContent(
      'Edit Network Vulnerability Test Families',
    );
    expect(content).not.toHaveTextContent('Edit Scanner Preferences');
    expect(content).not.toHaveTextContent(
      'Network Vulnerability Test Preferences',
    );

    const inUseNotification = screen.getByTestId('inline-notification');
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
    render(
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

    const saveButton = screen.getDialogSaveButton();
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
    render(
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

    const closeButton = screen.getByTestId('dialog-close-button');

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
    render(
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

    const content = within(screen.queryDialogContent());
    const inputs = content.queryTextInputs();

    changeInputValue(inputs[0], 'lorem');
    changeInputValue(inputs[1], 'ipsum');

    const saveButton = screen.getDialogSaveButton();
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

  test('should allow to edit nvt families for openvas configs', async () => {
    const handleClose = testing.fn();
    const handleSave = testing.fn();
    const handleOpenEditConfigFamilyDialog = testing.fn();
    const handleOpenEditNvtDetailsDialog = testing.fn();

    const {render} = rendererWith({capabilities: true, router: true});
    render(
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

    const dialogContent = within(screen.queryDialogContent());
    const tableBody = dialogContent.queryTableBody();

    const rows = tableBody.querySelectorAll('tr');

    const family1Inputs = screen.getRadioInputs(rows[0]);
    fireEvent.click(family1Inputs[1]);

    const family2Checkboxes = screen.getAllCheckBoxes(rows[1]);
    fireEvent.click(family2Checkboxes[1]);

    const saveButton = screen.getDialogSaveButton();
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

    const {render} = rendererWith({
      capabilities: true,
      router: true,
    });
    render(
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

    const editNvtFamiliesSection = within(
      screen.getByTestId('nvt-families-section'),
    );
    const editFamilyIcons = editNvtFamiliesSection.getAllByTestId('edit-icon');
    fireEvent.click(editFamilyIcons[0]);

    expect(editFamilyIcons[0]).toHaveAttribute(
      'title',
      'Edit Scan Config Family',
    );
    expect(handleOpenEditConfigFamilyDialog).toHaveBeenCalledWith('family1');

    const editNvtPreferencesSection = within(
      screen.getByTestId('nvt-preferences-section'),
    );
    const editNvtIcons = editNvtPreferencesSection.getAllByTestId('edit-icon');
    fireEvent.click(editNvtIcons[0]);

    expect(editNvtIcons[1]).toHaveAttribute(
      'title',
      'Edit Scan Config NVT Details',
    );
    expect(handleOpenEditNvtDetailsDialog).toHaveBeenCalledWith('1.2.1');
  });

  test('should filter items based on search query', async () => {
    const handleClose = testing.fn();
    const handleSave = testing.fn();
    const handleOpenEditConfigFamilyDialog = testing.fn();
    const handleOpenEditNvtDetailsDialog = testing.fn();

    const {render} = rendererWith({capabilities: true, router: true});
    render(
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

    const searchBar = screen.getByPlaceholderText(
      'Search for families, preferences, or NVTs',
    );
    fireEvent.change(searchBar, {target: {value: 'family4'}});

    expect(searchBar.value).toBe('family4');

    await waitFor(() => {
      const section = screen
        .getByText('Edit Network Vulnerability Test Families (1)')
        .closest('.section-header');
      const rows = screen.getAllByRole('row', {container: section});
      expect(rows).toHaveLength(2);
      expect(rows[1]).toHaveTextContent('family4');
    });

    const familyTwo = screen.queryByText('family2');
    expect(familyTwo).not.toBeInTheDocument();
  });

  test.each([
    {
      description: 'should calculate resultsCount correctly',
      families,
      scannerPreferences,
      nvtPreferences,
      isLoadingConfig: false,
      isLoadingFamilies: false,
      isLoadingScanners: false,
      expectedResultsCount: 8,
    },
    {
      description: 'should calculate resultsCount correctly when loading',
      families,
      scannerPreferences,
      nvtPreferences,
      isLoadingConfig: true,
      isLoadingFamilies: true,
      isLoadingScanners: true,
      expectedResultsCount: 1,
    },
    {
      description:
        'should calculate resultsCount correctly when no items match',
      families: [],
      scannerPreferences: [],
      nvtPreferences: [],
      isLoadingConfig: false,
      isLoadingFamilies: false,
      isLoadingScanners: false,
      expectedResultsCount: 0,
    },
  ])(
    '$description',
    ({
      families,
      scannerPreferences,
      nvtPreferences,
      isLoadingConfig,
      isLoadingFamilies,
      isLoadingScanners,
      expectedResultsCount,
    }) => {
      const handleClose = testing.fn();
      const handleSave = testing.fn();
      const handleOpenEditConfigFamilyDialog = testing.fn();
      const handleOpenEditNvtDetailsDialog = testing.fn();

      const {render} = rendererWith({capabilities: true, router: true});
      render(
        <EditScanConfigDialog
          comment="bar"
          configFamilies={configFamilies}
          configId="c1"
          configIsInUse={false}
          editNvtDetailsTitle="Edit Scan Config NVT Details"
          editNvtFamiliesTitle="Edit Scan Config Family"
          families={families}
          isLoadingConfig={isLoadingConfig}
          isLoadingFamilies={isLoadingFamilies}
          isLoadingScanners={isLoadingScanners}
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

      const searchBar = screen.getByPlaceholderText(
        'Search for families, preferences, or NVTs',
      );

      fireEvent.change(searchBar, {target: {value: 'family1'}});
      expect(searchBar.value).toBe('family1');

      const resultsCount =
        isLoadingConfig || isLoadingFamilies || isLoadingScanners
          ? 1
          : families.length + scannerPreferences.length + nvtPreferences.length;
      expect(resultsCount).toBe(expectedResultsCount);
    },
  );

  // TODO: should allow to change scanner preferences
});

describe('handleSearchChange function tests', () => {
  test('should filter items based on query', () => {
    const items = [
      {name: 'item1'},
      {name: 'item2'},
      {name: 'testItem'},
      {name: 'anotherItem'},
    ];
    const setFilteredItems = testing.fn();

    handleSearchChange('item', items, setFilteredItems, item => item.name);

    expect(setFilteredItems).toHaveBeenCalledWith([
      {name: 'item1'},
      {name: 'item2'},
      {name: 'testItem'},
      {name: 'anotherItem'},
    ]);

    handleSearchChange('test', items, setFilteredItems, item => item.name);

    expect(setFilteredItems).toHaveBeenCalledWith([{name: 'testItem'}]);

    handleSearchChange(
      'nonexistent',
      items,
      setFilteredItems,
      item => item.name,
    );

    expect(setFilteredItems).toHaveBeenCalledWith([]);
  });
});
