/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import Credential, {ALL_CREDENTIAL_TYPES} from 'gmp/models/credential';
import {
  changeInputValue,
  clickElement,
  closeDialog,
  getDialog,
  getDialogCloseButton,
  getDialogSaveButton,
  getDialogTitle,
  getSelectElement,
  getSelectItemElementsForSelect,
} from 'web/components/testing';
import {rendererWith, fireEvent} from 'web/utils/testing';

import CredentialsDialog from '../dialog';

let handleSave;
let handleClose;
let handleErrorClose;

beforeEach(() => {
  handleSave = testing.fn();
  handleClose = testing.fn();
  handleErrorClose = testing.fn();
});

const credential = Credential.fromElement({
  _id: 'foo',
  allow_insecure: 1,
  creation_time: '2020-12-16T15:23:59Z',
  comment: 'blah',
  formats: {format: 'pem'},
  full_type: 'Username + SSH Key',
  in_use: 0,
  login: '',
  modification_time: '2021-03-02T10:28:15Z',
  name: 'credential 1',
  owner: {name: 'admin'},
  permissions: {permission: {name: 'Everything'}},
  type: 'usk',
  writable: 1,
});

describe('CredentialsDialog component tests', () => {
  test('should render', () => {
    const {render} = rendererWith({
      capabilities: true,
    });

    const {getByName} = render(
      <CredentialsDialog
        types={ALL_CREDENTIAL_TYPES}
        onClose={handleClose}
        onErrorClose={handleErrorClose}
        onSave={handleSave}
      />,
    );

    const dialog = getDialog();
    const dialogTitle = getDialogTitle(dialog);

    const select = getSelectElement(dialog);
    const cancelButton = getDialogCloseButton();
    const saveButton = getDialogSaveButton();

    expect(dialogTitle).toHaveTextContent('New Credential');

    const nameInput = getByName('name');
    expect(nameInput).toHaveValue('Unnamed');

    const commentInput = getByName('comment');
    expect(commentInput).toHaveValue('');

    expect(select).toHaveValue('Username + Password');

    const credentialLogin = getByName('credential_login');
    expect(credentialLogin).toHaveValue('');

    const password = getByName('password');
    expect(password).toHaveValue('');

    expect(cancelButton).toHaveTextContent('Cancel');
    expect(saveButton).toHaveTextContent('Save');
  });

  test('should render with default values', () => {
    const {render} = rendererWith({
      capabilities: true,
    });

    const {getByName, getAllByName} = render(
      <CredentialsDialog
        allow_insecure={credential.allow_insecure}
        comment={credential.comment}
        credential={credential}
        credential_type={credential.credential_type}
        name={credential.name}
        types={ALL_CREDENTIAL_TYPES}
        onClose={handleClose}
        onErrorClose={handleErrorClose}
        onSave={handleSave}
      />,
    );

    const select = getSelectElement();

    const nameInput = getByName('name');
    expect(nameInput).toHaveValue('credential 1');

    const commentInput = getByName('comment');
    expect(commentInput).toHaveValue('blah');

    expect(select).toHaveValue('Username + SSH Key');

    const allowInsecure = getAllByName('allow_insecure');
    expect(allowInsecure[0]).toHaveAttribute('value', '1');
    expect(allowInsecure[0]).toBeChecked();
    expect(allowInsecure[1]).toHaveAttribute('value', '0');
  });

  test('should allow to change text field', () => {
    const {render} = rendererWith({
      capabilities: true,
    });

    const {getByName} = render(
      <CredentialsDialog
        types={ALL_CREDENTIAL_TYPES}
        onClose={handleClose}
        onErrorClose={handleErrorClose}
        onSave={handleSave}
      />,
    );

    const nameInput = getByName('name');
    expect(nameInput).toHaveValue('Unnamed');
    changeInputValue(nameInput, 'foo');
    expect(nameInput).toHaveValue('foo');

    const commentInput = getByName('comment');
    expect(commentInput).toHaveValue('');
    changeInputValue(commentInput, 'bar');
    expect(commentInput).toHaveValue('bar');

    const saveButton = getDialogSaveButton();
    fireEvent.click(saveButton);

    expect(handleSave).toHaveBeenCalledWith({
      allow_insecure: undefined,
      auth_algorithm: 'sha1',
      autogenerate: 0,
      change_community: undefined,
      change_passphrase: undefined,
      change_password: undefined,
      change_privacy_password: undefined,
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

  test('should allow changing select values', async () => {
    const {render} = rendererWith({
      capabilities: true,
    });

    render(
      <CredentialsDialog
        types={ALL_CREDENTIAL_TYPES}
        onClose={handleClose}
        onErrorClose={handleErrorClose}
        onSave={handleSave}
      />,
    );

    const select = getSelectElement();
    expect(select).toHaveValue('Username + Password');

    const selectItems = await getSelectItemElementsForSelect(select);
    expect(selectItems.length).toEqual(6);

    // change to password only
    await clickElement(selectItems[5]);
    expect(select).toHaveValue('Password only');

    const saveButton = getDialogSaveButton();
    fireEvent.click(saveButton);

    expect(handleSave).toHaveBeenCalledWith({
      allow_insecure: undefined,
      auth_algorithm: 'sha1',
      autogenerate: 0,
      change_community: undefined,
      change_passphrase: undefined,
      change_password: undefined,
      change_privacy_password: undefined,
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
    const {render} = rendererWith({
      capabilities: true,
    });

    render(
      <CredentialsDialog
        types={ALL_CREDENTIAL_TYPES}
        onClose={handleClose}
        onErrorClose={handleErrorClose}
        onSave={handleSave}
      />,
    );

    closeDialog();
    expect(handleClose).toHaveBeenCalled();
  });

  test('should render form fields for Username + SSH', () => {
    const {render} = rendererWith({
      capabilities: true,
    });

    const {getByName} = render(
      <CredentialsDialog
        credential_type={'usk'}
        types={ALL_CREDENTIAL_TYPES}
        onClose={handleClose}
        onErrorClose={handleErrorClose}
        onSave={handleSave}
      />,
    );

    const select = getSelectElement();

    expect(select).toHaveValue('Username + SSH Key');

    const password = getByName('passphrase');
    expect(password).toHaveValue('');

    const privateKey = getByName('private_key');
    expect(privateKey).toHaveAttribute('type', 'file');
  });

  test('should render form fields for SNMP', () => {
    const {render} = rendererWith({
      capabilities: true,
    });

    const {getByName, getAllByName} = render(
      <CredentialsDialog
        credential_type="snmp"
        types={ALL_CREDENTIAL_TYPES}
        onClose={handleClose}
        onErrorClose={handleErrorClose}
        onSave={handleSave}
      />,
    );

    const select = getSelectElement();
    expect(select).toHaveValue('SNMP');

    const snmpCommunity = getByName('community');
    expect(snmpCommunity).toHaveValue('');

    const username = getByName('credential_login');
    expect(username).toHaveValue('');

    const password = getByName('password');
    expect(password).toHaveValue('');
    expect(password).toHaveAttribute('type', 'password');

    const privacyPassword = getByName('privacy_password');
    expect(privacyPassword).toHaveValue('');
    expect(privacyPassword).toHaveAttribute('type', 'password');

    const authAlgorithm = getAllByName('auth_algorithm');
    expect(authAlgorithm[0]).toHaveAttribute('value', 'md5');
    expect(authAlgorithm[1]).toHaveAttribute('value', 'sha1');
    expect(authAlgorithm[1]).toBeChecked();

    const privacyAlgorithm = getAllByName('privacy_algorithm');
    expect(privacyAlgorithm[0]).toHaveAttribute('value', 'aes');
    expect(privacyAlgorithm[0]).toBeChecked();
    expect(privacyAlgorithm[1]).toHaveAttribute('value', 'des');
    expect(privacyAlgorithm[2]).toHaveAttribute('value', '');
  });

  test('should render form fields for S/MIME Certificate', () => {
    const {render} = rendererWith({
      capabilities: true,
    });

    const {getByName} = render(
      <CredentialsDialog
        credential_type="smime"
        types={ALL_CREDENTIAL_TYPES}
        onClose={handleClose}
        onErrorClose={handleErrorClose}
        onSave={handleSave}
      />,
    );

    const select = getSelectElement();

    expect(select).toHaveValue('S/MIME Certificate');

    const certificate = getByName('certificate');
    expect(certificate).toHaveAttribute('type', 'file');
  });

  test('should render form fields for PGP Encryption Key', () => {
    const {render} = rendererWith({
      capabilities: true,
    });

    const {getByName} = render(
      <CredentialsDialog
        credential_type={'pgp'}
        types={ALL_CREDENTIAL_TYPES}
        onClose={handleClose}
        onErrorClose={handleErrorClose}
        onSave={handleSave}
      />,
    );

    const select = getSelectElement();
    expect(select).toHaveValue('PGP Encryption Key');

    const certificate = getByName('public_key');
    expect(certificate).toHaveAttribute('type', 'file');
  });

  test('should render form fields for Password Only', () => {
    const {render} = rendererWith({
      capabilities: true,
    });

    const {getByName} = render(
      <CredentialsDialog
        credential_type={'pw'}
        types={ALL_CREDENTIAL_TYPES}
        onClose={handleClose}
        onErrorClose={handleErrorClose}
        onSave={handleSave}
      />,
    );

    const select = getSelectElement();
    expect(select).toHaveValue('Password only');

    const password = getByName('password');
    expect(password).toHaveValue('');
    expect(password).toHaveAttribute('type', 'password');
  });
});
