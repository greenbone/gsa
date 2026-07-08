/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {
  changeInputValue,
  closeDialog,
  getSelectItemElementsForSelect,
  screen,
  render,
  fireEvent,
} from 'web/testing';
import ScanConfig, {
  BASE_SCAN_CONFIG_ID,
  EMPTY_SCAN_CONFIG_ID,
  FULL_AND_FAST_SCAN_CONFIG_ID,
} from 'gmp/models/scan-config';
import ScanConfigCreateDialog from 'web/pages/scanconfigs/ScanConfigCreateDialog';

const createScanConfigs = () => [
  new ScanConfig({
    id: BASE_SCAN_CONFIG_ID,
    name: 'Base with a minimum set of NVTs',
  }),
  new ScanConfig({
    id: EMPTY_SCAN_CONFIG_ID,
    name: 'Empty, static and fast',
  }),
  new ScanConfig({
    id: FULL_AND_FAST_SCAN_CONFIG_ID,
    name: 'Full and fast',
  }),
];

describe('ScanConfigCreateDialog component tests', () => {
  test('should render dialog', async () => {
    const handleClose = testing.fn();
    const handleSave = testing.fn();
    const scanConfigs = createScanConfigs();

    render(
      <ScanConfigCreateDialog
        scanConfigs={scanConfigs}
        onClose={handleClose}
        onSave={handleSave}
      />,
    );

    expect(screen.getDialogTitle()).toHaveTextContent('New Scan Config');

    const templateSelect = screen.getSelectElement();
    expect(templateSelect).toBeEnabled();

    const selectItems = await getSelectItemElementsForSelect(templateSelect);
    expect(selectItems).toHaveLength(3);
    expect(selectItems[0]).toHaveTextContent('Base with a minimum set of NVTs');
    expect(selectItems[1]).toHaveTextContent('Empty, static and fast');
    expect(selectItems[2]).toHaveTextContent('Full and fast');
  });

  test('should allow to close the dialog', () => {
    const handleClose = testing.fn();
    const handleSave = testing.fn();
    const scanConfigs = createScanConfigs();

    render(
      <ScanConfigCreateDialog
        scanConfigs={scanConfigs}
        onClose={handleClose}
        onSave={handleSave}
      />,
    );

    closeDialog();
    expect(handleClose).toHaveBeenCalled();
  });

  test('should allow to cancel the dialog', () => {
    const handleClose = testing.fn();
    const handleSave = testing.fn();
    const scanConfigs = createScanConfigs();

    render(
      <ScanConfigCreateDialog
        scanConfigs={scanConfigs}
        onClose={handleClose}
        onSave={handleSave}
      />,
    );

    const cancelButton = screen.getDialogCloseButton();
    fireEvent.click(cancelButton);
    expect(handleClose).toHaveBeenCalled();
  });

  test('should allow to change the name and comment', async () => {
    const handleClose = testing.fn();
    const handleSave = testing.fn();
    const scanConfigs = createScanConfigs();

    render(
      <ScanConfigCreateDialog
        comment="bar"
        name="foo"
        scanConfigs={scanConfigs}
        onClose={handleClose}
        onSave={handleSave}
      />,
    );

    const nameInput = screen.getByRole('textbox', {name: /name/i});
    changeInputValue(nameInput, 'new name');
    const commentInput = screen.getByRole('textbox', {name: /comment/i});
    changeInputValue(commentInput, 'new comment');

    const saveButton = screen.getDialogSaveButton();
    fireEvent.click(saveButton);

    expect(handleSave).toHaveBeenCalledWith({
      baseScanConfig: BASE_SCAN_CONFIG_ID,
      comment: 'new comment',
      name: 'new name',
    });
  });

  test('should allow to change the template scan config', async () => {
    const handleClose = testing.fn();
    const handleSave = testing.fn();
    const scanConfigs = createScanConfigs();

    render(
      <ScanConfigCreateDialog
        comment="bar"
        name="foo"
        scanConfigs={scanConfigs}
        onClose={handleClose}
        onSave={handleSave}
      />,
    );

    const scanConfigSelect = screen.getSelectElement();
    const scanConfigItems =
      await getSelectItemElementsForSelect(scanConfigSelect);
    fireEvent.click(scanConfigItems[1]);

    const saveButton = screen.getDialogSaveButton();
    fireEvent.click(saveButton);

    expect(handleSave).toHaveBeenCalledWith({
      baseScanConfig: EMPTY_SCAN_CONFIG_ID,
      comment: 'bar',
      name: 'foo',
    });
  });
});
