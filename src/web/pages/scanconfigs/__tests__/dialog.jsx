/* Copyright (C) 2019-2022 Greenbone AG
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
import {describe, test, expect, testing} from '@gsa/testing';

import {render, fireEvent} from 'web/utils/testing';

import {
  changeInputValue,
  closeDialog,
  getDialog,
  getDialogCloseButton,
  getDialogSaveButton,
  getRadioInputs,
} from 'web/components/testing';

import CreateScanConfigDialog from '../dialog';

describe('CreateScanConfigDialog component tests', () => {
  test('should render dialog with base config as default', () => {
    const handleClose = testing.fn();
    const handleSave = testing.fn();

    render(
      <CreateScanConfigDialog
        title={'New Scan Config'}
        onClose={handleClose}
        onSave={handleSave}
      />,
    );

    const dialog = getDialog();
    const radioInputs = getRadioInputs(dialog);
    const radioTitles = dialog.querySelectorAll('.mantine-Radio-label');

    expect(radioInputs[0]).toHaveAttribute(
      'value',
      'd21f6c81-2b88-4ac1-b7b4-a2a9f2ad4663',
    );
    expect(radioInputs[0]).toBeChecked();
    expect(radioTitles[0]).toHaveTextContent('Base with a minimum set of NVTs');

    expect(radioInputs[1]).toHaveAttribute(
      'value',
      '085569ce-73ed-11df-83c3-002264764cea',
    );
    expect(radioInputs[1]).not.toBeChecked();
    expect(radioTitles[1]).toHaveTextContent('Empty, static and fast');

    expect(radioInputs[2]).toHaveAttribute(
      'value',
      'daba56c8-73ec-11df-a475-002264764cea',
    );
    expect(radioInputs[2].checked).toEqual(false);
    expect(radioTitles[2]).toHaveTextContent('Full and fast');
  });

  test('should allow to close the dialog', () => {
    const handleClose = testing.fn();
    const handleSave = testing.fn();

    render(
      <CreateScanConfigDialog
        title={'New Scan Config'}
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

    render(
      <CreateScanConfigDialog
        title={'New Scan Config'}
        onClose={handleClose}
        onSave={handleSave}
      />,
    );

    const cancelButton = getDialogCloseButton();
    fireEvent.click(cancelButton);
    expect(handleClose).toHaveBeenCalled();
  });

  test('should allow to save the dialog', () => {
    const handleClose = testing.fn();
    const handleSave = testing.fn();

    const {getByName} = render(
      <CreateScanConfigDialog
        title={'New Scan Config'}
        onClose={handleClose}
        onSave={handleSave}
      />,
    );

    const nameInput = getByName('name');
    changeInputValue(nameInput, 'foo');

    const commentInput = getByName('comment');
    changeInputValue(commentInput, 'bar');

    const saveButton = getDialogSaveButton();
    fireEvent.click(saveButton);

    expect(handleSave).toHaveBeenCalledWith({
      baseScanConfig: 'd21f6c81-2b88-4ac1-b7b4-a2a9f2ad4663',
      comment: 'bar',
      name: 'foo',
      scannerId: undefined,
    });
  });

  test('should allow to change the base', () => {
    const handleClose = testing.fn();
    const handleSave = testing.fn();

    const {getByName} = render(
      <CreateScanConfigDialog
        title={'New Scan Config'}
        onClose={handleClose}
        onSave={handleSave}
      />,
    );

    const dialog = getDialog();

    const nameInput = getByName('name');
    changeInputValue(nameInput, 'foo');

    const commentInput = getByName('comment');
    changeInputValue(commentInput, 'bar');

    const radioInputs = getRadioInputs(dialog);
    fireEvent.click(radioInputs[1]);

    const saveButton = getDialogSaveButton();
    fireEvent.click(saveButton);

    expect(handleSave).toHaveBeenCalledWith({
      baseScanConfig: '085569ce-73ed-11df-83c3-002264764cea',
      comment: 'bar',
      name: 'foo',
      scannerId: undefined,
    });
  });
});
