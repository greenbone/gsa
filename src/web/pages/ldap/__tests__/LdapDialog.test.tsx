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
import LdapDialog from 'web/pages/ldap/LdapDialog';
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

    const dialog = getDialog();
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

    // @ts-expect-error
    const button = getDialogSaveButton();
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

    const closeButton = getDialogCloseButton();
    fireEvent.click(closeButton);
    expect(handleClose).toHaveBeenCalled();
  });

  test('should allow to change data', () => {
    const handleClose = testing.fn();
    const handleSave = testing.fn();

    const {getByTestId} = render(
      <LdapDialog
        authdn="foo"
        ldapEnabled={true}
        ldapHost="bar"
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

    // @ts-expect-error
    const saveButton = getDialogSaveButton();
    fireEvent.click(saveButton);

    expect(handleSave).toHaveBeenCalledWith({
      ldapsOnly: true,
      authdn: 'lorem',
      ldapEnabled: false,
      ldapHost: 'ipsum',
    });
  });
});
