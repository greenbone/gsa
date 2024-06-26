/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';

import {render, fireEvent} from 'web/utils/testing';

import Dialog from '../dialog';

describe('Ldap dialog component tests', () => {
  test('should render dialog', () => {
    const handleChange = testing.fn();
    const handleClose = testing.fn();
    const handleSave = testing.fn();

    const {baseElement} = render(
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

    expect(baseElement).toBeVisible();
  });

  test('should save data', () => {
    const handleClose = testing.fn();
    const handleSave = testing.fn();
    const handleValueChange = testing.fn();

    const {getByTestId} = render(
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

    const checkBox = getByTestId('dialog-save-button');
    fireEvent.click(checkBox);
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

    const {getByTestId} = render(
      <Dialog
        authdn="foo"
        enable={true}
        ldaphost="bar"
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

    const saveButton = getByTestId('dialog-save-button');
    fireEvent.click(saveButton);

    expect(handleSave).toHaveBeenCalledWith({
      ldapsOnly: true,
      authdn: 'lorem',
      enable: false,
      ldaphost: 'ipsum',
    });
  });
});
