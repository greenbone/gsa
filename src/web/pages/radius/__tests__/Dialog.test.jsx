/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {
  changeInputValue,
  getDialog,
  getDialogCloseButton,
  getDialogSaveButton,
} from 'web/components/testing';
import {render, fireEvent} from 'web/utils/Testing';

import Dialog from '../Dialog';

describe('RADIUS dialog component tests', () => {
  test('should render dialog', () => {
    const handleClose = testing.fn();
    const handleSave = testing.fn();

    render(
      <Dialog
        enable={true}
        radiushost="foo"
        onClose={handleClose}
        onSave={handleSave}
      />,
    );

    expect(getDialog()).toBeInTheDocument();
  });

  test('should save data', () => {
    const handleClose = testing.fn();
    const handleSave = testing.fn();

    render(
      <Dialog
        enable={true}
        radiushost="foo"
        onClose={handleClose}
        onSave={handleSave}
      />,
    );

    const saveButton = getDialogSaveButton();
    fireEvent.click(saveButton);
    expect(handleSave).toHaveBeenCalledWith({
      enable: true,
      radiushost: 'foo',
      radiuskey: '',
    });
  });

  test('should allow to close the dialog', () => {
    const handleClose = testing.fn();
    const handleSave = testing.fn();

    render(
      <Dialog
        enable={true}
        radiushost="foo"
        onClose={handleClose}
        onSave={handleSave}
      />,
    );

    const closeButton = getDialogCloseButton();
    fireEvent.click(closeButton);
    expect(handleClose).toHaveBeenCalled();
  });

  test('should allow to change data', () => {
    const handleClose = testing.fn();
    const handleSave = testing.fn();

    const {getByTestId} = render(
      <Dialog
        enable={true}
        radiushost="foo"
        onClose={handleClose}
        onSave={handleSave}
      />,
    );

    const checkBox = getByTestId('enable-checkbox');
    fireEvent.click(checkBox);

    const radiusHostTextField = getByTestId('radiushost-textfield');
    changeInputValue(radiusHostTextField, 'lorem');

    const radiusKeyTextField = getByTestId('radiuskey-textfield');
    changeInputValue(radiusKeyTextField, 'bar');

    const saveButton = getDialogSaveButton();
    fireEvent.click(saveButton);
    expect(handleSave).toHaveBeenCalledWith({
      radiushost: 'lorem',
      enable: false,
      radiuskey: 'bar',
    });
  });
});
