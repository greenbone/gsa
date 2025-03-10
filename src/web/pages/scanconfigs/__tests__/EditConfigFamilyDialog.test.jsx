/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import Nvt from 'gmp/models/nvt';
import {
  getDialog,
  getDialogSaveButton,
  getTableBody,
  getTableHeader,
} from 'web/components/testing';
import EditConfigFamilyDialog from 'web/pages/scanconfigs/EditConfigFamilyDialog';
import {rendererWith, fireEvent, within, screen} from 'web/utils/Testing';

const nvt = Nvt.fromElement({
  _oid: '1234',
  name: 'nvt',
  family: 'family',
  cvss_base: 1,
  preference_count: 3,
});

const nvt2 = Nvt.fromElement({
  _oid: '5678',
  name: 'nvt2',
  family: 'family',
  cvss_base: 10,
  timeout: 1,
  preference_count: 4,
});

const nvt3 = Nvt.fromElement({
  _oid: '2345',
  name: 'nvt3',
  family: 'family',
  timeout: 2,
  preference_count: 2,
});

const selected = {
  1234: 0,
  5678: 0,
};

describe('EditConfigFamilyDialog component tests', () => {
  test('should render dialog', () => {
    const handleClose = testing.fn();
    const handleSave = testing.fn();
    const handleOpenEditNvtDetailsDialog = testing.fn();

    const {render} = rendererWith({capabilities: true});
    const {baseElement} = render(
      <EditConfigFamilyDialog
        configId="c1"
        configName="foo"
        configNameLabel="Config"
        familyName="family"
        isLoadingFamily={false}
        nvts={[nvt, nvt2]}
        selected={selected}
        title="Foo title"
        onClose={handleClose}
        onEditNvtDetailsClick={handleOpenEditNvtDetailsDialog}
        onSave={handleSave}
      />,
    );

    expect(baseElement).toBeVisible();

    expect(baseElement).toHaveTextContent('Config');
    expect(baseElement).toHaveTextContent('foo');
  });

  test('should render loading indicator', () => {
    const handleClose = testing.fn();
    const handleSave = testing.fn();
    const handleOpenEditNvtDetailsDialog = testing.fn();

    const {render} = rendererWith({capabilities: true});
    const {baseElement} = render(
      <EditConfigFamilyDialog
        configId="c1"
        configName="foo"
        configNameLabel="Config"
        familyName="family"
        isLoadingFamily={true}
        nvts={[nvt, nvt2]}
        selected={selected}
        title="Foo title"
        onClose={handleClose}
        onEditNvtDetailsClick={handleOpenEditNvtDetailsDialog}
        onSave={handleSave}
      />,
    );

    expect(baseElement).toBeVisible();

    expect(screen.getByTestId('loading')).toBeInTheDocument();

    expect(baseElement).not.toHaveTextContent('Config');
    expect(baseElement).not.toHaveTextContent('foo');
  });

  test('should save data', () => {
    const handleClose = testing.fn();
    const handleSave = testing.fn();
    const handleOpenEditNvtDetailsDialog = testing.fn();

    const {render} = rendererWith({capabilities: true});
    render(
      <EditConfigFamilyDialog
        configId="c1"
        configName="foo"
        configNameLabel="Config"
        familyName="family"
        isLoadingFamily={false}
        nvts={[nvt, nvt2]}
        selected={selected}
        title="Foo title"
        onClose={handleClose}
        onEditNvtDetailsClick={handleOpenEditNvtDetailsDialog}
        onSave={handleSave}
      />,
    );

    const saveButton = getDialogSaveButton();
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

    const {render} = rendererWith({capabilities: true});
    render(
      <EditConfigFamilyDialog
        configId="c1"
        configName="foo"
        configNameLabel="Config"
        familyName="family"
        isLoadingFamily={false}
        nvts={[nvt, nvt2]}
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

    const {render} = rendererWith({capabilities: true});
    const {baseElement} = render(
      <EditConfigFamilyDialog
        configId="c1"
        configName="foo"
        configNameLabel="Config"
        familyName="family"
        isLoadingFamily={false}
        nvts={[nvt, nvt2]}
        selected={selected}
        title="Foo title"
        onClose={handleClose}
        onEditNvtDetailsClick={handleOpenEditNvtDetailsDialog}
        onSave={handleSave}
      />,
    );

    const inputs = baseElement.querySelectorAll('input');
    fireEvent.click(inputs[0]);

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

    const {render} = rendererWith({capabilities: true});
    const {getAllByTestId} = render(
      <EditConfigFamilyDialog
        configId="c1"
        configName="foo"
        configNameLabel="Config"
        familyName="family"
        isLoadingFamily={false}
        nvts={[nvt, nvt2]}
        selected={selected}
        title="Foo title"
        onClose={handleClose}
        onEditNvtDetailsClick={handleOpenEditNvtDetailsDialog}
        onSave={handleSave}
      />,
    );

    const editButtons = getAllByTestId('edit-icon');
    fireEvent.click(editButtons[0]);

    expect(handleOpenEditNvtDetailsDialog).toHaveBeenCalledWith(nvt.id);
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

      const newSelected = {
        1234: 0,
        5678: 1,
        2345: 0,
      };

      const {render} = rendererWith({capabilities: true});
      render(
        <EditConfigFamilyDialog
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

      const dialog = getDialog();
      const tableHeader = getTableHeader(dialog);
      const tableBody = getTableBody(dialog);
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
  test('should allow selecting an NVT', () => {
    const handleClose = testing.fn();
    const handleSave = testing.fn();
    const handleOpenEditNvtDetailsDialog = testing.fn();

    const {render} = rendererWith({capabilities: true});
    const {getAllByRole} = render(
      <EditConfigFamilyDialog
        configId="c1"
        configName="foo"
        configNameLabel="Config"
        familyName="family"
        isLoadingFamily={false}
        nvts={[nvt, nvt2]}
        selected={selected}
        title="Foo title"
        onClose={handleClose}
        onEditNvtDetailsClick={handleOpenEditNvtDetailsDialog}
        onSave={handleSave}
      />,
    );

    const checkboxes = getAllByRole('checkbox');

    expect(checkboxes[0].checked).toBe(false);

    fireEvent.click(checkboxes[0]);

    expect(checkboxes[0].checked).toBe(true);
  });
});
