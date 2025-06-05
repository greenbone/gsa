/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import CreatePolicyDialog from 'web/pages/policies/Dialog';
import {changeInputValue, screen, render, fireEvent} from 'web/testing';

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

    expect(screen.getDialog()).toBeInTheDocument();
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

    const closeButton = screen.getDialogXButton();
    fireEvent.click(closeButton);
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

    const cancelButton = screen.getDialogCloseButton();
    fireEvent.click(cancelButton);
    expect(handleClose).toHaveBeenCalled();
  });

  test('should allow to save the dialog', () => {
    const handleClose = testing.fn();
    const handleSave = testing.fn();

    render(
      <CreatePolicyDialog
        title={'New Policy'}
        onClose={handleClose}
        onSave={handleSave}
      />,
    );

    const nameInput = screen.getByName('name');
    changeInputValue(nameInput, 'foo');

    const commentInput = screen.getByName('comment');
    changeInputValue(commentInput, 'bar');

    const saveButton = screen.getDialogSaveButton();
    fireEvent.click(saveButton);

    expect(handleSave).toHaveBeenCalledWith({
      comment: 'bar',
      name: 'foo',
    });
  });
});
