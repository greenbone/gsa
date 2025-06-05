/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import Dialog from 'web/pages/radius/RadiusDialog';
import {changeInputValue, screen} from 'web/testing';
import {render, fireEvent} from 'web/utils/Testing';

describe('RADIUS dialog component tests', () => {
  test('should render dialog', () => {
    const handleClose = testing.fn();
    const handleSave = testing.fn();

    render(
      <Dialog
        radiusEnabled={true}
        radiusHost="foo"
        onClose={handleClose}
        onSave={handleSave}
      />,
    );

    expect(screen.getDialog()).toBeInTheDocument();
  });

  test('should save data', () => {
    const handleClose = testing.fn();
    const handleSave = testing.fn();

    render(
      <Dialog
        radiusEnabled={true}
        radiusHost="foo"
        onClose={handleClose}
        onSave={handleSave}
      />,
    );

    const saveButton = screen.getDialogSaveButton();
    fireEvent.click(saveButton);
    expect(handleSave).toHaveBeenCalledWith({
      radiusEnabled: true,
      radiusHost: 'foo',
      radiusKey: '',
    });
  });

  test('should allow to close the dialog', () => {
    const handleClose = testing.fn();
    const handleSave = testing.fn();

    render(
      <Dialog
        radiusEnabled={true}
        radiusHost="foo"
        onClose={handleClose}
        onSave={handleSave}
      />,
    );

    const closeButton = screen.getDialogCloseButton();
    fireEvent.click(closeButton);
    expect(handleClose).toHaveBeenCalled();
  });

  test('should allow to change data', () => {
    const handleClose = testing.fn();
    const handleSave = testing.fn();

    render(
      <Dialog
        radiusEnabled={true}
        radiusHost="foo"
        onClose={handleClose}
        onSave={handleSave}
      />,
    );

    const checkBox = screen.getByTestId('enable-checkbox');
    fireEvent.click(checkBox);

    const radiusHostTextField = screen.getByTestId('radiushost-textfield');
    changeInputValue(radiusHostTextField, 'lorem');

    const radiusKeyTextField = screen.getByTestId('radiuskey-textfield');
    changeInputValue(radiusKeyTextField, 'bar');

    const saveButton = screen.getDialogSaveButton();
    fireEvent.click(saveButton);
    expect(handleSave).toHaveBeenCalledWith({
      radiusHost: 'lorem',
      radiusEnabled: false,
      radiusKey: 'bar',
    });
  });
});
