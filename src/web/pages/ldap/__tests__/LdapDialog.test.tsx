/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import LdapDialog from 'web/pages/ldap/LdapDialog';
import {changeInputValue, screen} from 'web/testing';
import {render, fireEvent} from 'web/utils/Testing';

describe('Ldap dialog component tests', () => {
  test('should render dialog', () => {
    const handleClose = testing.fn();
    const handleSave = testing.fn();

    render(
      <LdapDialog
        authdn="foo"
        ldapEnabled={true}
        ldapHost="bar"
        ldapsOnly={true}
        onClose={handleClose}
        onSave={handleSave}
      />,
    );

    const dialog = screen.getDialog();
    expect(dialog).toBeInTheDocument();
  });

  test('should save data', () => {
    const handleClose = testing.fn();
    const handleSave = testing.fn();

    render(
      <LdapDialog
        authdn="foo"
        ldapEnabled={true}
        ldapHost="bar"
        ldapsOnly={true}
        onClose={handleClose}
        onSave={handleSave}
      />,
    );

    const button = screen.getDialogSaveButton();
    fireEvent.click(button);
    expect(handleSave).toHaveBeenCalledWith({
      authdn: 'foo',
      ldapEnabled: true,
      ldapHost: 'bar',
      ldapsOnly: true,
    });
  });

  test('should allow to close the dialog', () => {
    const handleClose = testing.fn();
    const handleSave = testing.fn();

    render(
      <LdapDialog
        authdn="foo"
        ldapEnabled={true}
        ldapHost="bar"
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
      <LdapDialog
        authdn="foo"
        ldapEnabled={true}
        ldapHost="bar"
        ldapsOnly={false}
        onClose={handleClose}
        onSave={handleSave}
      />,
    );

    const checkBox = screen.getByTestId('enable-checkbox');
    fireEvent.click(checkBox);

    const authdnTextField = screen.getByTestId('authdn-textfield');
    changeInputValue(authdnTextField, 'lorem');

    const ldapHostTextField = screen.getByTestId('ldaphost-textfield');
    changeInputValue(ldapHostTextField, 'ipsum');

    const ldapsOnlyCheck = screen.getByTestId('ldapsOnly-checkbox');
    fireEvent.click(ldapsOnlyCheck);

    const saveButton = screen.getDialogSaveButton();
    fireEvent.click(saveButton);

    expect(handleSave).toHaveBeenCalledWith({
      ldapsOnly: true,
      authdn: 'lorem',
      ldapEnabled: false,
      ldapHost: 'ipsum',
    });
  });
});
