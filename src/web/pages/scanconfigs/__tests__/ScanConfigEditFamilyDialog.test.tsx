/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {screen, within, rendererWith, fireEvent} from 'web/testing';
import {
  type ScanConfigFamilyNvt,
  type ScanConfigNvtsSelected,
} from 'gmp/commands/scan-config';
import {DEFAULT_SEVERITY_RATING} from 'gmp/utils/severity';
import ScanConfigEditFamilyDialog from 'web/pages/scanconfigs/ScanConfigEditFamilyDialog';

const nvt: ScanConfigFamilyNvt = {
  oid: '1234',
  name: 'nvt',
  severity: 1,
  preferenceCount: 3,
};

const nvt2: ScanConfigFamilyNvt = {
  oid: '5678',
  name: 'nvt2',
  severity: 10,
  timeout: 1,
  preferenceCount: 4,
};

const nvt3: ScanConfigFamilyNvt = {
  oid: '2345',
  name: 'nvt3',
  timeout: 2,
  preferenceCount: 2,
};

const selected: ScanConfigNvtsSelected = {
  1234: 0,
  5678: 0,
};

const createGmp = () => ({
  settings: {
    severityRating: DEFAULT_SEVERITY_RATING,
  },
});

const nvts = [nvt, nvt2];

describe('ScanConfigEditFamilyDialog component tests', () => {
  test('should render dialog', () => {
    const handleClose = testing.fn();
    const handleSave = testing.fn();
    const handleOpenEditNvtDetailsDialog = testing.fn();

    const {render} = rendererWith({capabilities: true, gmp: createGmp()});
    render(
      <ScanConfigEditFamilyDialog
        configId="c1"
        configName="foo"
        configNameLabel="Config"
        familyName="family"
        isLoadingFamily={false}
        nvts={nvts}
        selected={selected}
        title="Foo title"
        onClose={handleClose}
        onEditNvtDetailsClick={handleOpenEditNvtDetailsDialog}
        onSave={handleSave}
      />,
    );

    const dialog = screen.getDialog();
    const dialogContent = screen.getDialogContent();
    const tableBody = within(dialog).getTableBody();
    const rows = tableBody.querySelectorAll('tr');

    expect(dialog).toBeVisible();

    expect(dialogContent).toHaveTextContent('Config');
    expect(dialogContent).toHaveTextContent('foo');

    // preference count is rendered as preferenceCount + 1 in the Prefs column
    expect(
      within(rows[0]).getByRole('cell', {
        name: String((nvt.preferenceCount ?? 0) + 1),
      }),
    ).toBeVisible();
    expect(
      within(rows[1]).getByRole('cell', {
        name: String((nvt2.preferenceCount ?? 0) + 1),
      }),
    ).toBeVisible();
  });

  test('should render loading indicator', () => {
    const handleClose = testing.fn();
    const handleSave = testing.fn();
    const handleOpenEditNvtDetailsDialog = testing.fn();

    const {render} = rendererWith({capabilities: true, gmp: createGmp()});
    render(
      <ScanConfigEditFamilyDialog
        configId="c1"
        configName="foo"
        configNameLabel="Config"
        familyName="family"
        isLoadingFamily={true}
        nvts={nvts}
        selected={selected}
        title="Foo title"
        onClose={handleClose}
        onEditNvtDetailsClick={handleOpenEditNvtDetailsDialog}
        onSave={handleSave}
      />,
    );

    expect(screen.getByTestId('loading')).toBeInTheDocument();
    expect(screen.queryDialog()).not.toBeInTheDocument();
  });

  test('should save data', () => {
    const handleClose = testing.fn();
    const handleSave = testing.fn();
    const handleOpenEditNvtDetailsDialog = testing.fn();

    const {render} = rendererWith({capabilities: true, gmp: createGmp()});
    render(
      <ScanConfigEditFamilyDialog
        configId="c1"
        configName="foo"
        configNameLabel="Config"
        familyName="family"
        isLoadingFamily={false}
        nvts={nvts}
        selected={selected}
        title="Foo title"
        onClose={handleClose}
        onEditNvtDetailsClick={handleOpenEditNvtDetailsDialog}
        onSave={handleSave}
      />,
    );

    const saveButton = screen.getDialogSaveButton();
    fireEvent.click(saveButton);

    expect(handleSave).toHaveBeenCalledWith({
      configId: 'c1',
      familyName: 'family',
      selected: selected,
    });
  });

  test('should allow to close the dialog', () => {
    const handleClose = testing.fn();
    const handleSave = testing.fn();
    const handleOpenEditNvtDetailsDialog = testing.fn();

    const {render} = rendererWith({capabilities: true, gmp: createGmp()});
    render(
      <ScanConfigEditFamilyDialog
        configId="c1"
        configName="foo"
        configNameLabel="Config"
        familyName="family"
        isLoadingFamily={false}
        nvts={nvts}
        selected={selected}
        title="Foo title"
        onClose={handleClose}
        onEditNvtDetailsClick={handleOpenEditNvtDetailsDialog}
        onSave={handleSave}
      />,
    );

    const closeButton = screen.getByTestId('dialog-close-button');

    fireEvent.click(closeButton);

    expect(handleClose).toHaveBeenCalled();
    expect(handleSave).not.toHaveBeenCalled();
  });

  test('should allow to change data', () => {
    const handleClose = testing.fn();
    const handleSave = testing.fn();
    const handleOpenEditNvtDetailsDialog = testing.fn();

    const {render} = rendererWith({capabilities: true, gmp: createGmp()});
    render(
      <ScanConfigEditFamilyDialog
        configId="c1"
        configName="foo"
        configNameLabel="Config"
        familyName="family"
        isLoadingFamily={false}
        nvts={nvts}
        selected={selected}
        title="Foo title"
        onClose={handleClose}
        onEditNvtDetailsClick={handleOpenEditNvtDetailsDialog}
        onSave={handleSave}
      />,
    );

    const dialog = within(screen.getDialog());
    const nvtCheckbox = dialog.getByName('1234') as HTMLInputElement;
    fireEvent.click(nvtCheckbox);

    const saveButton = screen.getByTestId('dialog-save-button');
    fireEvent.click(saveButton);

    const newSelected = {
      1234: 1,
      5678: 0,
    };

    expect(handleSave).toHaveBeenCalledWith({
      configId: 'c1',
      familyName: 'family',
      selected: newSelected,
    });
  });

  test('should call click handler', () => {
    const handleClose = testing.fn();
    const handleSave = testing.fn();
    const handleOpenEditNvtDetailsDialog = testing.fn();

    const {render} = rendererWith({capabilities: true, gmp: createGmp()});
    render(
      <ScanConfigEditFamilyDialog
        configId="c1"
        configName="foo"
        configNameLabel="Config"
        familyName="family"
        isLoadingFamily={false}
        nvts={nvts}
        selected={selected}
        title="Foo title"
        onClose={handleClose}
        onEditNvtDetailsClick={handleOpenEditNvtDetailsDialog}
        onSave={handleSave}
      />,
    );

    const editButtons = screen.getAllByTestId('edit-icon');
    fireEvent.click(editButtons[0]);

    expect(handleOpenEditNvtDetailsDialog).toHaveBeenCalledWith(nvt.oid);
  });

  test.each`
    columnIndex | columnName    | initialOrder                | sortedOrder
    ${0}        | ${'Name'}     | ${['1234', '5678', '2345']} | ${['2345', '5678', '1234']}
    ${1}        | ${'OID'}      | ${['1234', '5678', '2345']} | ${['1234', '2345', '5678']}
    ${2}        | ${'Severity'} | ${['1234', '5678', '2345']} | ${['2345', '1234', '5678']}
    ${3}        | ${'Timeout'}  | ${['1234', '5678', '2345']} | ${['1234', '5678', '2345']}
    ${5}        | ${'Selected'} | ${['1234', '5678', '2345']} | ${['5678', '1234', '2345']}
  `(
    'should sort table by $columnName column',
    async ({columnName, initialOrder, sortedOrder}) => {
      const handleClose = testing.fn();
      const handleSave = testing.fn();
      const handleOpenEditNvtDetailsDialog = testing.fn();

      const newSelected: ScanConfigNvtsSelected = {
        1234: 0,
        5678: 1,
        2345: 0,
      };

      const {render} = rendererWith({capabilities: true, gmp: createGmp()});
      render(
        <ScanConfigEditFamilyDialog
          configId="c1"
          configName="foo"
          configNameLabel="Config"
          familyName="family"
          isLoadingFamily={false}
          nvts={[nvt, nvt2, nvt3]}
          selected={newSelected}
          title="Foo title"
          onClose={handleClose}
          onEditNvtDetailsClick={handleOpenEditNvtDetailsDialog}
          onSave={handleSave}
        />,
      );

      const getOidColumn = row => row.querySelectorAll('td')[1];

      const dialog = within(screen.getDialog());
      const tableHeader = dialog.getTableHeader();
      const tableBody = dialog.getTableBody();
      let rows = tableBody.querySelectorAll('tr');
      const columns = within(tableHeader).getAllByRole('columnheader');
      expect(columns).toHaveLength(7);

      initialOrder.forEach((oid, index) => {
        expect(getOidColumn(rows[index])).toHaveTextContent(oid);
      });

      const columnHeader = screen.getByText(columnName);
      fireEvent.click(columnHeader);

      rows = tableBody.querySelectorAll('tr');

      sortedOrder.forEach((oid, index) => {
        expect(getOidColumn(rows[index])).toHaveTextContent(oid);
      });
    },
  );

  test('should allow selecting an NVT', async () => {
    const handleClose = testing.fn();
    const handleSave = testing.fn();
    const handleOpenEditNvtDetailsDialog = testing.fn();

    const {render} = rendererWith({capabilities: true, gmp: createGmp()});
    render(
      <ScanConfigEditFamilyDialog
        configId="c1"
        configName="foo"
        configNameLabel="Config"
        familyName="family"
        isLoadingFamily={false}
        nvts={nvts}
        selected={selected}
        title="Foo title"
        onClose={handleClose}
        onEditNvtDetailsClick={handleOpenEditNvtDetailsDialog}
        onSave={handleSave}
      />,
    );

    const dialog = within(screen.getDialog());
    const nvtCheckbox = dialog.getByName('1234') as HTMLInputElement;
    expect(nvtCheckbox).not.toBeChecked();

    fireEvent.click(nvtCheckbox);
    // the checkbox must visually reflect the new selection state
    expect(nvtCheckbox).toBeChecked();
    fireEvent.click(screen.getDialogSaveButton());

    expect(handleSave).toHaveBeenCalledWith({
      configId: 'c1',
      familyName: 'family',
      selected: {
        1234: 1,
        5678: 0,
      },
    });
  });

  test('should allow deselecting an NVT', () => {
    const handleClose = testing.fn();
    const handleSave = testing.fn();
    const handleOpenEditNvtDetailsDialog = testing.fn();

    const allSelected: ScanConfigNvtsSelected = {
      1234: 1,
      5678: 1,
    };

    const {render} = rendererWith({capabilities: true, gmp: createGmp()});
    render(
      <ScanConfigEditFamilyDialog
        configId="c1"
        configName="foo"
        configNameLabel="Config"
        familyName="family"
        isLoadingFamily={false}
        nvts={nvts}
        selected={allSelected}
        title="Foo title"
        onClose={handleClose}
        onEditNvtDetailsClick={handleOpenEditNvtDetailsDialog}
        onSave={handleSave}
      />,
    );

    const dialog = within(screen.getDialog());
    const nvtCheckbox = dialog.getByName('1234') as HTMLInputElement;
    expect(nvtCheckbox).toBeChecked();

    fireEvent.click(nvtCheckbox);
    // the checkbox must visually reflect the deselection
    expect(nvtCheckbox).not.toBeChecked();
    fireEvent.click(screen.getDialogSaveButton());

    expect(handleSave).toHaveBeenCalledWith({
      configId: 'c1',
      familyName: 'family',
      selected: {
        1234: 0,
        5678: 1,
      },
    });
  });
});
