/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {
  changeInputValue,
  closeDialog,
  getSelectItemElementsForSelect,
  screen,
  within,
  rendererWith,
  fireEvent,
} from 'web/testing';
import Credential, {ALL_CREDENTIAL_TYPES} from 'gmp/models/credential';
import CredentialsDialog from 'web/pages/credentials/Dialog';

const gmp = {
  settings: {
    enableKrb5: false,
  },
};

let handleSave;
let handleClose;
let handleErrorClose;

beforeEach(() => {
  handleSave = testing.fn();
  handleClose = testing.fn();
  handleErrorClose = testing.fn();
});

const credentialMock = Credential.fromElement({
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
      gmp,
    });

    render(
      <CredentialsDialog
        types={ALL_CREDENTIAL_TYPES}
        onClose={handleClose}
        onErrorClose={handleErrorClose}
        onSave={handleSave}
      />,
    );

    const dialog = within(screen.getDialog());
    const dialogTitle = dialog.queryDialogTitle();

    const select = dialog.getSelectElement();
    const cancelButton = dialog.getDialogCloseButton();
    const saveButton = dialog.getDialogSaveButton();

    expect(dialogTitle).toHaveTextContent('New Credential');

    const nameInput = dialog.getByName('name');
    expect(nameInput).toHaveValue('Unnamed');

    const commentInput = dialog.getByName('comment');
    expect(commentInput).toHaveValue('');

    expect(select).toHaveValue('Username + Password');

    const credentialLogin = dialog.getByName('credential_login');
    expect(credentialLogin).toHaveValue('');

    const password = dialog.getByName('password');
    expect(password).toHaveValue('');

    expect(cancelButton).toHaveTextContent('Cancel');
    expect(saveButton).toHaveTextContent('Save');
  });

  test('should render with default values', () => {
    const {render} = rendererWith({
      gmp,
      capabilities: true,
    });

    render(
      <CredentialsDialog
        allow_insecure={credentialMock.allow_insecure}
        comment={credentialMock.comment}
        credential={credentialMock}
        credential_type={credentialMock.credential_type}
        name={credentialMock.name}
        types={ALL_CREDENTIAL_TYPES}
        onClose={handleClose}
        onErrorClose={handleErrorClose}
        onSave={handleSave}
      />,
    );

    const select = screen.getSelectElement();

    const nameInput = screen.getByName('name');
    expect(nameInput).toHaveValue('credential 1');

    const commentInput = screen.getByName('comment');
    expect(commentInput).toHaveValue('blah');

    expect(select).toHaveValue('Username + SSH Key');

    const allowInsecure = screen.getAllByName('allow_insecure');
    expect(allowInsecure[0]).toHaveAttribute('value', '1');
    expect(allowInsecure[0]).toBeChecked();
    expect(allowInsecure[1]).toHaveAttribute('value', '0');
  });

  test('should allow to change text field', () => {
    const {render} = rendererWith({
      gmp,
    });

    render(
      <CredentialsDialog
        types={ALL_CREDENTIAL_TYPES}
        onClose={handleClose}
        onErrorClose={handleErrorClose}
        onSave={handleSave}
      />,
    );

    const nameInput = screen.getByName('name');
    expect(nameInput).toHaveValue('Unnamed');
    changeInputValue(nameInput, 'foo');
    expect(nameInput).toHaveValue('foo');

    const commentInput = screen.getByName('comment');
    expect(commentInput).toHaveValue('');
    changeInputValue(commentInput, 'bar');
    expect(commentInput).toHaveValue('bar');

    const saveButton = screen.getDialogSaveButton();
    fireEvent.click(saveButton);

    expect(handleSave).toHaveBeenCalledWith({
      allow_insecure: undefined,
      auth_algorithm: 'sha1',
      autogenerate: 0,
      change_community: undefined,
      change_password: undefined,
      change_passphrase: undefined,
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
      gmp,
    });

    render(
      <CredentialsDialog
        types={ALL_CREDENTIAL_TYPES}
        onClose={handleClose}
        onErrorClose={handleErrorClose}
        onSave={handleSave}
      />,
    );

    const select = screen.getSelectElement();
    expect(select).toHaveValue('Username + Password');

    const selectItems = await getSelectItemElementsForSelect(select);
    expect(selectItems.length).toEqual(6);

    // change to password only
    fireEvent.click(selectItems[5]);
    expect(select).toHaveValue('Password only');

    const saveButton = screen.getDialogSaveButton();
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
      gmp,
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
      gmp,
    });

    render(
      <CredentialsDialog
        credential_type={'usk'}
        types={ALL_CREDENTIAL_TYPES}
        onClose={handleClose}
        onErrorClose={handleErrorClose}
        onSave={handleSave}
      />,
    );

    const select = screen.getSelectElement();

    expect(select).toHaveValue('Username + SSH Key');

    const password = screen.getByName('passphrase');
    expect(password).toHaveValue('');

    const privateKey = screen.getByName('private_key');
    expect(privateKey).toHaveAttribute('type', 'file');
  });

  test('should render form fields for SNMP', () => {
    const {render} = rendererWith({
      gmp,
    });

    render(
      <CredentialsDialog
        credential_type="snmp"
        types={ALL_CREDENTIAL_TYPES}
        onClose={handleClose}
        onErrorClose={handleErrorClose}
        onSave={handleSave}
      />,
    );

    const select = screen.getSelectElement();
    expect(select).toHaveValue('SNMP');

    const snmpCommunity = screen.getByName('community');
    expect(snmpCommunity).toHaveValue('');

    const username = screen.getByName('credential_login');
    expect(username).toHaveValue('');

    const password = screen.getByName('password');
    expect(password).toHaveValue('');
    expect(password).toHaveAttribute('type', 'password');

    const privacyPassword = screen.getByName('privacy_password');
    expect(privacyPassword).toHaveValue('');
    expect(privacyPassword).toHaveAttribute('type', 'password');

    const authAlgorithm = screen.getAllByName('auth_algorithm');
    expect(authAlgorithm[0]).toHaveAttribute('value', 'md5');
    expect(authAlgorithm[1]).toHaveAttribute('value', 'sha1');
    expect(authAlgorithm[1]).toBeChecked();

    const privacyAlgorithm = screen.getAllByName('privacy_algorithm');
    expect(privacyAlgorithm[0]).toHaveAttribute('value', 'aes');
    expect(privacyAlgorithm[0]).toBeChecked();
    expect(privacyAlgorithm[1]).toHaveAttribute('value', 'des');
    expect(privacyAlgorithm[2]).toHaveAttribute('value', '');
  });

  test('should render form fields for S/MIME Certificate', () => {
    const {render} = rendererWith({
      gmp,
    });

    render(
      <CredentialsDialog
        credential_type="smime"
        types={ALL_CREDENTIAL_TYPES}
        onClose={handleClose}
        onErrorClose={handleErrorClose}
        onSave={handleSave}
      />,
    );

    const select = screen.getSelectElement();

    expect(select).toHaveValue('S/MIME Certificate');

    const certificate = screen.getByName('certificate');
    expect(certificate).toHaveAttribute('type', 'file');
  });

  test('should render form fields for PGP Encryption Key', () => {
    const {render} = rendererWith({
      gmp,
    });

    render(
      <CredentialsDialog
        credential_type={'pgp'}
        types={ALL_CREDENTIAL_TYPES}
        onClose={handleClose}
        onErrorClose={handleErrorClose}
        onSave={handleSave}
      />,
    );

    const select = screen.getSelectElement();
    expect(select).toHaveValue('PGP Encryption Key');

    const certificate = screen.getByName('public_key');
    expect(certificate).toHaveAttribute('type', 'file');
  });

  test('should render form fields for Password Only', () => {
    const {render} = rendererWith({
      gmp,
    });

    render(
      <CredentialsDialog
        credential_type={'pw'}
        types={ALL_CREDENTIAL_TYPES}
        onClose={handleClose}
        onErrorClose={handleErrorClose}
        onSave={handleSave}
      />,
    );

    const select = screen.getSelectElement();
    expect(select).toHaveValue('Password only');

    const password = screen.getByTestId('password-input');
    expect(password).toHaveValue('');
    expect(password).toHaveAttribute('type', 'password');
  });

  test('should render form fields for KRB5', () => {
    gmp.settings.enableKrb5 = true;

    const {render} = rendererWith({
      gmp,
    });

    render(
      <CredentialsDialog
        credential_type={'krb5'}
        types={ALL_CREDENTIAL_TYPES}
        onClose={handleClose}
        onErrorClose={handleErrorClose}
        onSave={handleSave}
      />,
    );

    const select = screen.getSelectElement();
    expect(select).toHaveValue('SMB (Kerberos)');

    const allowInsecure = screen.getByName('allow_insecure');
    expect(allowInsecure).toHaveAttribute('value', '1');

    const username = screen.getByName('credential_login');
    expect(username).toHaveValue('');

    const password = screen.getByName('password');
    expect(password).toHaveValue('');
    expect(password).toHaveAttribute('type', 'password');

    const realm = screen.getByName('realm');
    expect(realm).toHaveValue('');

    const kdcs = screen.getByName('kdcs');
    expect(kdcs).toHaveValue('');
  });

  test('should render CredentialsDialog and handle replace password interactions correctly', () => {
    const credentialEntryMock = Credential.fromElement({
      _id: '9b0',
      allow_insecure: 1,
      creation_time: '2025-01-08T15:50:23.000Z',
      comment: 'MockComment',
      formats: {format: 'exe'},
      full_type: 'username + password',
      in_use: 0,
      login: 'user42',
      modification_time: '2025-01-09T08:58:33.000Z',
      name: 'Unnamed',
      owner: {name: 'admin'},
      permissions: {permission: {name: 'Everything'}},
      type: 'up',
      writable: 1,
    });

    const {render} = rendererWith({
      gmp,
    });

    render(
      <CredentialsDialog
        allow_insecure={credentialEntryMock.allow_insecure}
        comment={credentialEntryMock.comment}
        credential={credentialEntryMock}
        credential_type={credentialEntryMock.credential_type}
        name={credentialEntryMock.name}
        title={'Edit Credential'}
        types={ALL_CREDENTIAL_TYPES}
        onClose={handleClose}
        onErrorClose={handleErrorClose}
        onSave={handleSave}
      />,
    );

    const title = screen.getByText('Edit Credential');
    expect(title).toBeVisible();

    const passwordField = screen.getByTestId('password-input');
    expect(passwordField).toBeDisabled();

    const checkbox = screen.getByLabelText('Replace existing password with');

    expect(checkbox).not.toBeChecked();

    fireEvent.click(checkbox);

    expect(checkbox).toBeChecked();

    expect(passwordField).not.toBeDisabled();
  });

  test('should render MultiValueTextField for KRB5 KDCs', () => {
    gmp.settings.enableKrb5 = true;

    const {render} = rendererWith({gmp});

    render(
      <CredentialsDialog
        credential_type="krb5"
        types={ALL_CREDENTIAL_TYPES}
        onClose={handleClose}
        onErrorClose={handleErrorClose}
        onSave={handleSave}
      />,
    );

    const kdcInput = screen.getByPlaceholderText(
      'Enter hostname or IP address, then press Enter or comma to add KDC',
    );
    expect(kdcInput).toBeVisible();

    const label = screen.getByText('Key Distribution Centers');
    expect(label).toBeVisible();
  });
});
