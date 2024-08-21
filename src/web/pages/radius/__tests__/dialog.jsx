/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';

import {render, fireEvent, userEvent} from 'web/utils/testing';

import Dialog from '../dialog';

describe('RADIUS dialog component tests', () => {
  test('should render dialog', () => {
    const handleClose = testing.fn();
    const handleSave = testing.fn();

    const {baseElement} = render(
      <Dialog
        enable={true}
        radiushost="foo"
        onClose={handleClose}
        onSave={handleSave}
      />,
    );

    expect(baseElement).toBeVisible();
  });

  test('should save data', () => {
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

    const checkBox = getByTestId('dialog-save-button');
    fireEvent.click(checkBox);
    expect(handleSave).toHaveBeenCalledWith({
      enable: true,
      radiushost: 'foo',
      radiuskey: '',
    });
  });

  test('should allow to close the dialog', () => {
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

    const closeButton = getByTestId('dialog-close-button');

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
    userEvent.type(radiusHostTextField, 'lorem');

    const radiusKeyTextField = getByTestId('radiuskey-textfield');
    userEvent.type(radiusKeyTextField, 'bar');

    const saveButton = getByTestId('dialog-save-button');
    fireEvent.click(saveButton);

    expect(handleSave).toHaveBeenCalledWith({
      radiushost: 'foolorem',
      enable: false,
      radiuskey: 'bar',
    });
  });
});
