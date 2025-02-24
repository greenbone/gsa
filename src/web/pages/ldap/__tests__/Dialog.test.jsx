/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {
  getDialog,
  getDialogCloseButton,
  getDialogSaveButton,
} from 'web/components/testing';
import Dialog from 'web/pages/ldap/Dialog';
import {render, fireEvent} from 'web/utils/Testing';


describe('Ldap dialog component tests', () => {
  test('should render dialog', () => {
    const handleChange = testing.fn();
    const handleClose = testing.fn();
    const handleSave = testing.fn();

    render(
      <Dialog
        authdn="foo"
        enable={true}
        ldaphost="bar"
        ldapsOnly={true}
        onChange={handleChange}
        onClose={handleClose}
        onSave={handleSave}
      />,
    );

    const dialog = getDialog();
    expect(dialog).toBeInTheDocument();
  });

  test('should save data', () => {
    const handleClose = testing.fn();
    const handleSave = testing.fn();
    const handleValueChange = testing.fn();

    render(
      <Dialog
        authdn="foo"
        enable={true}
        ldaphost="bar"
        ldapsOnly={true}
        onChange={handleValueChange}
        onClose={handleClose}
        onSave={handleSave}
      />,
    );

    const button = getDialogSaveButton();
    fireEvent.click(button);
    expect(handleSave).toHaveBeenCalledWith({
      authdn: 'foo',
      enable: true,
      ldaphost: 'bar',
      ldapsOnly: true,
    });
  });

  test('should allow to close the dialog', () => {
    const handleClose = testing.fn();
    const handleSave = testing.fn();

    render(
      <Dialog
        authdn="foo"
        enable={true}
        ldaphost="bar"
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
        authdn="foo"
        enable={true}
        ldaphost="bar"
        ldapsOnly={false}
        onClose={handleClose}
        onSave={handleSave}
      />,
    );

    const checkBox = getByTestId('enable-checkbox');
    fireEvent.click(checkBox);

    const authdnTextField = getByTestId('authdn-textfield');
    fireEvent.change(authdnTextField, {target: {value: 'lorem'}});

    const ldapHostTextField = getByTestId('ldaphost-textfield');
    fireEvent.change(ldapHostTextField, {target: {value: 'ipsum'}});

    const ldapsOnlyCheck = getByTestId('ldapsOnly-checkbox');
    fireEvent.click(ldapsOnlyCheck);

    const saveButton = getDialogSaveButton();
    fireEvent.click(saveButton);

    expect(handleSave).toHaveBeenCalledWith({
      ldapsOnly: true,
      authdn: 'lorem',
      enable: false,
      ldaphost: 'ipsum',
    });
  });
});
