/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {
  changeInputValue,
  closeDialog,
  getDialog,
  getDialogCloseButton,
  getDialogSaveButton,
} from 'web/components/testing';
import CreatePolicyDialog from 'web/pages/policies/Dialog';
import {render, fireEvent} from 'web/utils/Testing';

describe('CreatePolicyDialog component tests', () => {
  test('should render dialog', () => {
    const handleClose = testing.fn();
    const handleSave = testing.fn();

    render(
      <CreatePolicyDialog
        title="New Policy"
        onClose={handleClose}
        onSave={handleSave}
      />,
    );

    expect(getDialog()).toBeInTheDocument();
  });

  test('should allow to close the dialog', () => {
    const handleClose = testing.fn();
    const handleSave = testing.fn();

    render(
      <CreatePolicyDialog
        title={'New Policy'}
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
      <CreatePolicyDialog
        title={'New Policy'}
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
      <CreatePolicyDialog
        title={'New Policy'}
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
      comment: 'bar',
      name: 'foo',
    });
  });
});
