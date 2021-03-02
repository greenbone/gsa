/* Copyright (C) 2021 Greenbone Networks GmbH
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
import React from 'react';

import {setLocale} from 'gmp/locale/lang';
import Credential, {ALL_CREDENTIAL_TYPES} from 'gmp/models/credential';

import {render, fireEvent} from 'web/utils/testing';

import CredentialsDialog from '../dialog';

setLocale('en');

let handleSave;
let handleClose;
let handleErrorClose;

beforeEach(() => {
  handleSave = jest.fn();
  handleClose = jest.fn();
  handleErrorClose = jest.fn();
});

const credential = Credential.fromElement({
  _id: 'foo',
  allow_insecure: 1,
  creation_time: '2020-12-16T15:23:59Z',
  comment: 'blah',
  formats: {format: 'pem'},
  full_type: 'client certificate',
  in_use: 0,
  login: '',
  modification_time: '2021-03-02T10:28:15Z',
  name: 'credential 1',
  owner: {name: 'admin'},
  permissions: {permission: {name: 'Everything'}},
  type: 'cc',
  writable: 1,
});

describe('CredentialsDialog component tests', () => {
  test('should render', () => {
    const {getAllByTestId, getByTestId, getByName} = render(
      <CredentialsDialog
        types={ALL_CREDENTIAL_TYPES}
        onClose={handleClose}
        onSave={handleSave}
        onErrorClose={handleErrorClose}
      />,
    );

    const titleBar = getByTestId('dialog-title-bar');
    const cancelButton = getByTestId('dialog-close-button');
    const saveButton = getByTestId('dialog-save-button');
    const formGroups = getAllByTestId('formgroup-title');
    const selectedValue = getByTestId('select-selected-value');

    expect(titleBar).toHaveTextContent('New Credential');

    const nameInput = getByName('name');
    expect(formGroups[0]).toHaveTextContent('Name');
    expect(nameInput).toHaveAttribute('value', 'Unnamed');

    const commentInput = getByName('comment');
    expect(formGroups[1]).toHaveTextContent('Comment');
    expect(commentInput).toHaveAttribute('value', '');

    expect(formGroups[2]).toHaveTextContent('Type');
    expect(selectedValue).toHaveTextContent('Username + Password');

    expect(formGroups[3]).toHaveTextContent('Allow insecure use');

    expect(formGroups[4]).toHaveTextContent('Auto-generate');

    const credentialLogin = getByName('credential_login');
    expect(formGroups[5]).toHaveTextContent('Username');
    expect(credentialLogin).toHaveAttribute('value', '');

    const password = getByName('password');
    expect(formGroups[6]).toHaveTextContent('Password');
    expect(password).toHaveAttribute('value', '');

    expect(cancelButton).toHaveTextContent('Cancel');
    expect(saveButton).toHaveTextContent('Save');
  });

  test('should render with default values', () => {
    const {getAllByTestId, getByTestId, getByName, getAllByName} = render(
      <CredentialsDialog
        allow_insecure={credential.allow_insecure}
        comment={credential.comment}
        credential={credential}
        credential_type={credential.credential_type}
        name={credential.name}
        types={ALL_CREDENTIAL_TYPES}
        onClose={handleClose}
        onSave={handleSave}
        onErrorClose={handleErrorClose}
      />,
    );

    const formGroups = getAllByTestId('formgroup-title');
    const selectedValue = getByTestId('select-selected-value');

    const nameInput = getByName('name');
    expect(formGroups[0]).toHaveTextContent('Name');
    expect(nameInput).toHaveAttribute('value', 'credential 1');

    const commentInput = getByName('comment');
    expect(formGroups[1]).toHaveTextContent('Comment');
    expect(commentInput).toHaveAttribute('value', 'blah');

    expect(formGroups[2]).toHaveTextContent('Type');
    expect(selectedValue).toHaveTextContent('Client Certificate');

    const allowInsecure = getAllByName('allow_insecure');
    expect(formGroups[3]).toHaveTextContent('Allow insecure use');
    expect(allowInsecure[0]).toHaveAttribute('value', '1');
    expect(allowInsecure[0]).toHaveAttribute('checked');
    expect(allowInsecure[1]).toHaveAttribute('value', '0');
  });

  test('should allow to change text field', () => {
    const {getByName, getByTestId} = render(
      <CredentialsDialog
        types={ALL_CREDENTIAL_TYPES}
        onClose={handleClose}
        onSave={handleSave}
        onErrorClose={handleErrorClose}
      />,
    );

    const nameInput = getByName('name');
    expect(nameInput).toHaveAttribute('value', 'Unnamed');
    fireEvent.change(nameInput, {target: {value: 'foo'}});
    expect(nameInput).toHaveAttribute('value', 'foo');

    const commentInput = getByName('comment');
    expect(commentInput).toHaveAttribute('value', '');
    fireEvent.change(commentInput, {target: {value: 'bar'}});
    expect(commentInput).toHaveAttribute('value', 'bar');

    const saveButton = getByTestId('dialog-save-button');
    fireEvent.click(saveButton);

    expect(handleSave).toHaveBeenCalledWith({
      allow_insecure: 0,
      auth_algorithm: 'sha1',
      autogenerate: 0,
      change_community: 0,
      change_passphrase: 0,
      change_password: 0,
      change_privacy_password: 0,
      comment: 'bar',
      community: '',
      credential_login: '',
      credential_type: 'up',
      id: undefined,
      name: 'foo',
      passphrase: '',
      password: '',
      privacy_algorithm: 'aes',
      privacy_password: '',
      public_key: undefined,
    });
  });

  test('should allow changing select values', () => {
    const {getAllByTestId, getByTestId} = render(
      <CredentialsDialog
        types={ALL_CREDENTIAL_TYPES}
        onClose={handleClose}
        onSave={handleSave}
        onErrorClose={handleErrorClose}
      />,
    );

    const selectedValues = getAllByTestId('select-selected-value');
    const selectOpenButton = getAllByTestId('select-open-button');
    expect(selectOpenButton.length).toBe(1);
    expect(selectedValues.length).toBe(1);

    expect(selectedValues[0]).toHaveTextContent('Username + Password');

    fireEvent.click(selectOpenButton[0]);

    const selectItems = getAllByTestId('select-item');

    expect(selectItems.length).toBe(7);
    fireEvent.click(selectItems[6]);

    expect(selectedValues[0]).toHaveTextContent('Password only');

    const saveButton = getByTestId('dialog-save-button');
    fireEvent.click(saveButton);

    expect(handleSave).toHaveBeenCalledWith({
      allow_insecure: 0,
      auth_algorithm: 'sha1',
      autogenerate: 0,
      change_community: 0,
      change_passphrase: 0,
      change_password: 0,
      change_privacy_password: 0,
      comment: '',
      community: '',
      credential_login: '',
      credential_type: 'pw',
      id: undefined,
      name: 'Unnamed',
      passphrase: '',
      password: '',
      privacy_algorithm: 'aes',
      privacy_password: '',
      public_key: undefined,
    });
  });

  test('should allow to close the dialog', () => {
    const {getByTestId} = render(
      <CredentialsDialog
        types={ALL_CREDENTIAL_TYPES}
        onClose={handleClose}
        onSave={handleSave}
        onErrorClose={handleErrorClose}
      />,
    );

    const closeButton = getByTestId('dialog-title-close-button');

    fireEvent.click(closeButton);

    expect(handleClose).toHaveBeenCalled();
  });

  test('should render form fields for Username + SSH', () => {
    const {getAllByTestId, getByName} = render(
      <CredentialsDialog
        credential_type={'usk'}
        types={ALL_CREDENTIAL_TYPES}
        onClose={handleClose}
        onSave={handleSave}
        onErrorClose={handleErrorClose}
      />,
    );

    const selectedValues = getAllByTestId('select-selected-value');

    expect(selectedValues[0]).toHaveTextContent('Username + SSH Key');

    const formGroups = getAllByTestId('formgroup-title');

    const password = getByName('passphrase');
    expect(formGroups[6]).toHaveTextContent('Passphrase');
    expect(password).toHaveAttribute('value', '');

    const privateKey = getByName('private_key');
    expect(formGroups[7]).toHaveTextContent('Private Key');
    expect(privateKey).toHaveAttribute('type', 'file');
  });

  test('should render form fields for Client Certificate', () => {
    const {getAllByTestId, getByName} = render(
      <CredentialsDialog
        credential_type={'cc'}
        types={ALL_CREDENTIAL_TYPES}
        onClose={handleClose}
        onSave={handleSave}
        onErrorClose={handleErrorClose}
      />,
    );

    const selectedValues = getAllByTestId('select-selected-value');

    expect(selectedValues[0]).toHaveTextContent('Client Certificate');

    const formGroups = getAllByTestId('formgroup-title');

    const password = getByName('passphrase');
    expect(formGroups[4]).toHaveTextContent('Passphrase');
    expect(password).toHaveAttribute('value', '');

    const certificate = getByName('certificate');
    expect(formGroups[5]).toHaveTextContent('Certificate');
    expect(certificate).toHaveAttribute('type', 'file');

    const privateKey = getByName('private_key');
    expect(formGroups[6]).toHaveTextContent('Private Key');
    expect(privateKey).toHaveAttribute('type', 'file');
  });

  test('should render form fields for SNMP', () => {
    const {getAllByTestId, getByName, getAllByName} = render(
      <CredentialsDialog
        credential_type={'snmp'}
        types={ALL_CREDENTIAL_TYPES}
        onClose={handleClose}
        onSave={handleSave}
        onErrorClose={handleErrorClose}
      />,
    );

    const selectedValues = getAllByTestId('select-selected-value');

    expect(selectedValues[0]).toHaveTextContent('SNMP');

    const formGroups = getAllByTestId('formgroup-title');

    const snmpCommunity = getByName('community');
    expect(formGroups[4]).toHaveTextContent('SNMP Community');
    expect(snmpCommunity).toHaveAttribute('value', '');

    const username = getByName('credential_login');
    expect(formGroups[5]).toHaveTextContent('Username');
    expect(username).toHaveAttribute('value', '');

    const password = getByName('password');
    expect(formGroups[6]).toHaveTextContent('Password');
    expect(password).toHaveAttribute('value', '');
    expect(password).toHaveAttribute('type', 'password');

    const privacyPassword = getByName('privacy_password');
    expect(formGroups[7]).toHaveTextContent('Privacy Password');
    expect(privacyPassword).toHaveAttribute('value', '');
    expect(privacyPassword).toHaveAttribute('type', 'password');

    const authAlgorithm = getAllByName('auth_algorithm');
    expect(authAlgorithm[0]).toHaveAttribute('value', 'md5');
    expect(authAlgorithm[1]).toHaveAttribute('value', 'sha1');
    expect(authAlgorithm[1]).toHaveAttribute('checked');

    const privacyAlgorithm = getAllByName('privacy_algorithm');
    expect(privacyAlgorithm[0]).toHaveAttribute('value', 'aes');
    expect(privacyAlgorithm[0]).toHaveAttribute('checked');
    expect(privacyAlgorithm[1]).toHaveAttribute('value', 'des');
    expect(privacyAlgorithm[2]).toHaveAttribute('value', '');
  });

  test('should render form fields for S/MIME Certificate', () => {
    const {getAllByTestId, getByName} = render(
      <CredentialsDialog
        credential_type={'smime'}
        types={ALL_CREDENTIAL_TYPES}
        onClose={handleClose}
        onSave={handleSave}
        onErrorClose={handleErrorClose}
      />,
    );

    const selectedValues = getAllByTestId('select-selected-value');

    expect(selectedValues[0]).toHaveTextContent('S/MIME Certificate');

    const formGroups = getAllByTestId('formgroup-title');

    const certificate = getByName('certificate');
    expect(formGroups[4]).toHaveTextContent('S/MIME Certificate');
    expect(certificate).toHaveAttribute('type', 'file');
  });

  test('should render form fields for PGP Encryption Key', () => {
    const {getAllByTestId, getByName} = render(
      <CredentialsDialog
        credential_type={'pgp'}
        types={ALL_CREDENTIAL_TYPES}
        onClose={handleClose}
        onSave={handleSave}
        onErrorClose={handleErrorClose}
      />,
    );

    const selectedValues = getAllByTestId('select-selected-value');

    expect(selectedValues[0]).toHaveTextContent('PGP Encryption Key');

    const formGroups = getAllByTestId('formgroup-title');

    const certificate = getByName('public_key');
    expect(formGroups[4]).toHaveTextContent('PGP Public Key');
    expect(certificate).toHaveAttribute('type', 'file');
  });

  test('should render form fields for Password Only', () => {
    const {getAllByTestId, getByName} = render(
      <CredentialsDialog
        credential_type={'pw'}
        types={ALL_CREDENTIAL_TYPES}
        onClose={handleClose}
        onSave={handleSave}
        onErrorClose={handleErrorClose}
      />,
    );

    const selectedValues = getAllByTestId('select-selected-value');

    expect(selectedValues[0]).toHaveTextContent('Password only');

    const formGroups = getAllByTestId('formgroup-title');

    const password = getByName('password');
    expect(formGroups[4]).toHaveTextContent('Password');
    expect(password).toHaveAttribute('value', '');
    expect(password).toHaveAttribute('type', 'password');
  });
});
