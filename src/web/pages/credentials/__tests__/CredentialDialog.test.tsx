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
import Features from 'gmp/capabilities/features';
import Credential, {
  ALL_CREDENTIAL_TYPES,
  CERTIFICATE_CREDENTIAL_TYPE,
  CREDENTIAL_STORE_KRB5_CREDENTIAL_TYPE,
  CREDENTIAL_STORE_SNMP_CREDENTIAL_TYPE,
} from 'gmp/models/credential';
import CredentialDialog from 'web/pages/credentials/CredentialDialog';

const createGmp = (settings = {}) => ({
  settings: {
    enableKrb5: false,
    ...settings,
  },
});

const credential = Credential.fromElement({
  _id: 'foo',
  creation_time: '2020-12-16T15:23:59Z',
  comment: 'blah',
  in_use: 0,
  login: '',
  modification_time: '2021-03-02T10:28:15Z',
  name: 'credential 1',
  owner: {name: 'admin'},
  permissions: {permission: {name: 'Everything'}},
  type: 'usk',
  writable: 1,
});

describe('CredentialDialog tests', () => {
  test('should render', () => {
    const {render} = rendererWith({
      gmp: createGmp(),
    });

    render(<CredentialDialog types={ALL_CREDENTIAL_TYPES} />);

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

    const credentialLogin = dialog.getByName('credentialLogin');
    expect(credentialLogin).toHaveValue('');

    const password = dialog.getByName('password');
    expect(password).toHaveValue('');

    expect(cancelButton).toHaveTextContent('Cancel');
    expect(saveButton).toHaveTextContent('Save');
  });

  test('should render with default values', () => {
    const {render} = rendererWith({
      gmp: createGmp(),
      capabilities: true,
    });

    render(
      <CredentialDialog
        comment={credential.comment}
        credential={credential}
        credentialType={credential.credentialType}
        name={credential.name}
        types={ALL_CREDENTIAL_TYPES}
      />,
    );

    const select = screen.getSelectElement();

    const nameInput = screen.getByName('name');
    expect(nameInput).toHaveValue('credential 1');

    const commentInput = screen.getByName('comment');
    expect(commentInput).toHaveValue('blah');

    expect(select).toHaveValue('Username + SSH Key');
  });

  test('should allow to change text field', () => {
    const {render} = rendererWith({
      gmp: createGmp(),
    });
    const handleSave = testing.fn();

    render(
      <CredentialDialog types={ALL_CREDENTIAL_TYPES} onSave={handleSave} />,
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
      authAlgorithm: 'sha1',
      autogenerate: false,
      certificate: undefined,
      comment: 'bar',
      community: undefined,
      credentialLogin: undefined,
      credentialType: 'up',
      id: undefined,
      name: 'foo',
      passphrase: undefined,
      password: undefined,
      privacyAlgorithm: 'aes',
      privacyPassword: undefined,
      publicKey: undefined,
      vaultId: undefined,
      hostIdentifier: undefined,
    });
  });

  test('should allow changing select values', async () => {
    const {render} = rendererWith({
      gmp: createGmp(),
    });
    const handleSave = testing.fn();

    render(
      <CredentialDialog types={ALL_CREDENTIAL_TYPES} onSave={handleSave} />,
    );

    const select = screen.getSelectElement();
    expect(select).toHaveValue('Username + Password');

    const selectItems = await getSelectItemElementsForSelect(select);
    expect(selectItems.length).toEqual(7);

    // change to password only
    fireEvent.click(selectItems[5]);
    expect(select).toHaveValue('Password only');

    const saveButton = screen.getDialogSaveButton();
    fireEvent.click(saveButton);

    expect(handleSave).toHaveBeenCalledWith({
      authAlgorithm: 'sha1',
      autogenerate: false,
      certificate: undefined,
      comment: '',
      community: undefined,
      credentialLogin: undefined,
      credentialType: 'pw',
      id: undefined,
      name: 'Unnamed',
      passphrase: undefined,
      password: undefined,
      privacyAlgorithm: 'aes',
      privacyPassword: undefined,
      publicKey: undefined,
      vaultId: undefined,
      hostIdentifier: undefined,
    });
  });

  test('should allow to close the dialog', () => {
    const {render} = rendererWith({
      gmp: createGmp(),
    });
    const handleClose = testing.fn();

    render(
      <CredentialDialog types={ALL_CREDENTIAL_TYPES} onClose={handleClose} />,
    );

    closeDialog();
    expect(handleClose).toHaveBeenCalled();
  });

  test('should render form fields for Username + SSH', () => {
    const {render} = rendererWith({
      gmp: createGmp(),
    });

    render(
      <CredentialDialog credentialType="usk" types={ALL_CREDENTIAL_TYPES} />,
    );

    const select = screen.getSelectElement();

    expect(select).toHaveValue('Username + SSH Key');

    const password = screen.getByName('passphrase');
    expect(password).toHaveValue('');

    const privateKey = screen.getByName('privateKey');
    expect(privateKey).toHaveAttribute('type', 'file');
  });

  test('should render form fields for SNMP', () => {
    const {render} = rendererWith({
      gmp: createGmp(),
    });

    render(
      <CredentialDialog credentialType="snmp" types={ALL_CREDENTIAL_TYPES} />,
    );

    const select = screen.getSelectElement();
    expect(select).toHaveValue('SNMP');

    const snmpCommunity = screen.getByName('community');
    expect(snmpCommunity).toHaveValue('');

    const username = screen.getByName('credentialLogin');
    expect(username).toHaveValue('');

    const password = screen.getByName('password');
    expect(password).toHaveValue('');
    expect(password).toHaveAttribute('type', 'password');

    const privacyPassword = screen.getByName('privacyPassword');
    expect(privacyPassword).toHaveValue('');
    expect(privacyPassword).toHaveAttribute('type', 'password');

    const authAlgorithm = screen.getAllByName('authAlgorithm');
    expect(authAlgorithm[0]).toHaveAttribute('value', 'md5');
    expect(authAlgorithm[1]).toHaveAttribute('value', 'sha1');
    expect(authAlgorithm[1]).toBeChecked();

    const privacyAlgorithm = screen.getAllByName('privacyAlgorithm');
    expect(privacyAlgorithm[0]).toHaveAttribute('value', 'aes');
    expect(privacyAlgorithm[0]).toBeChecked();
    expect(privacyAlgorithm[1]).toHaveAttribute('value', 'des');
    expect(privacyAlgorithm[2]).toHaveAttribute('value', '');
  });

  test('should render form fields for S/MIME Certificate', () => {
    const {render} = rendererWith({
      gmp: createGmp(),
    });

    render(
      <CredentialDialog credentialType="smime" types={ALL_CREDENTIAL_TYPES} />,
    );

    const select = screen.getSelectElement();

    expect(select).toHaveValue('S/MIME Certificate');

    const certificate = screen.getByName('certificate');
    expect(certificate).toHaveAttribute('type', 'file');
  });

  test('should render form fields for PGP Encryption Key', () => {
    const {render} = rendererWith({
      gmp: createGmp(),
    });

    render(
      <CredentialDialog credentialType="pgp" types={ALL_CREDENTIAL_TYPES} />,
    );

    const select = screen.getSelectElement();
    expect(select).toHaveValue('PGP Encryption Key');

    const certificate = screen.getByName('publicKey');
    expect(certificate).toHaveAttribute('type', 'file');
  });

  test('should render form fields for Password Only', () => {
    const {render} = rendererWith({
      gmp: createGmp(),
    });

    render(
      <CredentialDialog credentialType="pw" types={ALL_CREDENTIAL_TYPES} />,
    );

    const select = screen.getSelectElement();
    expect(select).toHaveValue('Password only');

    const password = screen.getByTestId('password-input');
    expect(password).toHaveValue('');
    expect(password).toHaveAttribute('type', 'password');
  });

  test('should render form fields for KRB5', () => {
    const {render} = rendererWith({
      gmp: createGmp({enableKrb5: true}),
    });

    render(
      <CredentialDialog credentialType="krb5" types={ALL_CREDENTIAL_TYPES} />,
    );

    const select = screen.getSelectElement();
    expect(select).toHaveValue('SMB (Kerberos)');

    const username = screen.getByName('credentialLogin');
    expect(username).toHaveValue('');

    const password = screen.getByName('password');
    expect(password).toHaveValue('');
    expect(password).toHaveAttribute('type', 'password');

    const realm = screen.getByName('realm');
    expect(realm).toHaveValue('');

    const kdcs = screen.getByName('kdcs');
    expect(kdcs).toHaveValue('');
  });

  test('should render form fields for Client Certificate', () => {
    const {render} = rendererWith({
      gmp: createGmp(),
    });

    render(
      <CredentialDialog
        credentialType={CERTIFICATE_CREDENTIAL_TYPE}
        types={ALL_CREDENTIAL_TYPES}
      />,
    );

    const select = screen.getSelectElement();
    expect(select).toHaveValue('Client Certificate');

    const certificate = screen.getByName('certificate');
    expect(certificate).toHaveValue('');
    expect(certificate).toHaveAttribute('type', 'file');
    expect(
      screen.getByRole('button', {name: 'Client Certificate'}),
    ).toBeVisible();

    const privateKey = screen.getByName('privateKey');
    expect(privateKey).toHaveValue('');
    expect(privateKey).toHaveAttribute('type', 'file');
    expect(
      screen.getByRole('button', {name: 'Client Private Key'}),
    ).toBeVisible();

    const passphrase = screen.getByName('passphrase');
    expect(passphrase).toHaveValue('');
    expect(passphrase).toHaveAttribute('type', 'password');
  });

  test('should handle replace password interactions correctly', () => {
    const credentialEntryMock = Credential.fromElement({
      _id: '9b0',
      creation_time: '2025-01-08T15:50:23.000Z',
      comment: 'MockComment',
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
      gmp: createGmp(),
    });

    render(
      <CredentialDialog
        comment={credentialEntryMock.comment}
        credential={credentialEntryMock}
        credentialType={credentialEntryMock.credentialType}
        name={credentialEntryMock.name}
        title="Edit Credential"
        types={ALL_CREDENTIAL_TYPES}
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
    const {render} = rendererWith({
      gmp: createGmp({enableKrb5: true}),
    });

    render(
      <CredentialDialog credentialType="krb5" types={ALL_CREDENTIAL_TYPES} />,
    );

    const kdcInput = screen.getByPlaceholderText(
      'Enter hostname or IP address, then press Enter to add KDC',
    );
    expect(kdcInput).toBeVisible();

    const label = screen.getByText('Key Distribution Center');
    expect(label).toBeVisible();
  });

  test('should render form fields for KRB5 credential store type', () => {
    const {render} = rendererWith({
      gmp: createGmp(),
      capabilities: true,
      features: new Features(['ENABLE_CREDENTIAL_STORES']),
    });

    render(
      <CredentialDialog
        credentialType={CREDENTIAL_STORE_KRB5_CREDENTIAL_TYPE}
        types={ALL_CREDENTIAL_TYPES}
      />,
    );

    const select = screen.getSelectElement();
    expect(select).toHaveValue('Credential Store SMB (Kerberos)');

    const vaultId = screen.getByName('vaultId');
    expect(vaultId).toBeVisible();
    expect(vaultId).toHaveValue('');

    const hostIdentifier = screen.getByName('hostIdentifier');
    expect(hostIdentifier).toBeVisible();
    expect(hostIdentifier).toHaveValue('');

    const realm = screen.getByName('realm');
    expect(realm).toBeVisible();
    expect(realm).toHaveValue('');

    const kdcInput = screen.getByPlaceholderText(
      'Enter hostname or IP address, then press Enter to add KDC',
    );
    expect(kdcInput).toBeVisible();

    const kdcLabel = screen.getByText('Key Distribution Center');
    expect(kdcLabel).toBeVisible();
  });

  test('should render form fields for SNMP credential store type', () => {
    const {render} = rendererWith({
      gmp: createGmp(),
      capabilities: true,
      features: new Features(['ENABLE_CREDENTIAL_STORES']),
    });

    render(
      <CredentialDialog
        credentialType={CREDENTIAL_STORE_SNMP_CREDENTIAL_TYPE}
        types={ALL_CREDENTIAL_TYPES}
      />,
    );

    const select = screen.getSelectElement();
    expect(select).toHaveValue('Credential Store SNMP');

    const vaultId = screen.getByName('vaultId');
    expect(vaultId).toBeVisible();
    expect(vaultId).toHaveValue('');

    const hostIdentifier = screen.getByName('hostIdentifier');
    expect(hostIdentifier).toBeVisible();
    expect(hostIdentifier).toHaveValue('');

    const privacyHostIdentifier = screen.getByName('privacyHostIdentifier');
    expect(privacyHostIdentifier).toBeVisible();
    expect(privacyHostIdentifier).toHaveValue('');

    const privacyAlgorithms = screen.getAllByName('privacyAlgorithm');
    expect(privacyAlgorithms[0]).toHaveAttribute('value', 'aes');
    expect(privacyAlgorithms[0]).toBeChecked();
    expect(privacyAlgorithms[1]).toHaveAttribute('value', 'des');
    expect(privacyAlgorithms[2]).toHaveAttribute('value', '');

    const authAlgorithms = screen.getAllByName('authAlgorithm');
    expect(authAlgorithms[0]).toHaveAttribute('value', 'md5');
    expect(authAlgorithms[1]).toHaveAttribute('value', 'sha1');
    expect(authAlgorithms[1]).toBeChecked();

    expect(screen.getByText('Privacy Algorithm')).toBeVisible();
    expect(screen.getByText('Auth Algorithm')).toBeVisible();
  });

  test('should save KRB5 credential store with proper values', async () => {
    const handleSave = testing.fn();

    const {render} = rendererWith({
      gmp: createGmp(),
      capabilities: true,
      features: new Features(['ENABLE_CREDENTIAL_STORES']),
    });

    render(
      <CredentialDialog
        credentialType={CREDENTIAL_STORE_KRB5_CREDENTIAL_TYPE}
        types={ALL_CREDENTIAL_TYPES}
        onSave={handleSave}
      />,
    );

    const nameInput = screen.getByName('name');
    changeInputValue(nameInput, 'KRB5 Credential Store');

    const vaultIdInput = screen.getByName('vaultId');
    changeInputValue(vaultIdInput, 'vault123');

    const hostIdentifierInput = screen.getByName('hostIdentifier');
    changeInputValue(hostIdentifierInput, 'host456');

    const realmInput = screen.getByName('realm');
    changeInputValue(realmInput, 'EXAMPLE.COM');

    const saveButton = screen.getDialogSaveButton();
    fireEvent.click(saveButton);

    expect(handleSave).toHaveBeenCalledWith({
      authAlgorithm: 'sha1',
      autogenerate: false,
      certificate: undefined,
      comment: '',
      community: undefined,
      credentialLogin: undefined,
      credentialType: CREDENTIAL_STORE_KRB5_CREDENTIAL_TYPE,
      hostIdentifier: 'host456',
      id: undefined,
      kdcs: undefined,
      name: 'KRB5 Credential Store',
      passphrase: undefined,
      password: undefined,
      privacyAlgorithm: 'aes',
      privacyHostIdentifier: undefined,
      privacyPassword: undefined,
      publicKey: undefined,
      realm: 'EXAMPLE.COM',
      vaultId: 'vault123',
    });
  });

  test('should save SNMP credential store with proper values', async () => {
    const handleSave = testing.fn();

    const {render} = rendererWith({
      gmp: createGmp(),
      capabilities: true,
      features: new Features(['ENABLE_CREDENTIAL_STORES']),
    });

    render(
      <CredentialDialog
        credentialType={CREDENTIAL_STORE_SNMP_CREDENTIAL_TYPE}
        types={ALL_CREDENTIAL_TYPES}
        onSave={handleSave}
      />,
    );

    const nameInput = screen.getByName('name');
    changeInputValue(nameInput, 'SNMP Credential Store');

    const vaultIdInput = screen.getByName('vaultId');
    changeInputValue(vaultIdInput, 'snmp-vault');

    const hostIdentifierInput = screen.getByName('hostIdentifier');
    changeInputValue(hostIdentifierInput, 'snmp-host');

    const privacyHostIdentifierInput = screen.getByName(
      'privacyHostIdentifier',
    );
    changeInputValue(privacyHostIdentifierInput, 'privacy-host');

    const privacyAlgorithms = screen.getAllByName('privacyAlgorithm');
    fireEvent.click(privacyAlgorithms[1]);

    const authAlgorithms = screen.getAllByName('authAlgorithm');
    fireEvent.click(authAlgorithms[0]);

    const saveButton = screen.getDialogSaveButton();
    fireEvent.click(saveButton);

    expect(handleSave).toHaveBeenCalledWith({
      authAlgorithm: 'md5',
      autogenerate: false,
      certificate: undefined,
      comment: '',
      community: undefined,
      credentialLogin: undefined,
      credentialType: CREDENTIAL_STORE_SNMP_CREDENTIAL_TYPE,
      hostIdentifier: 'snmp-host',
      id: undefined,
      kdcs: undefined,
      name: 'SNMP Credential Store',
      passphrase: undefined,
      password: undefined,
      privacyAlgorithm: 'des',
      privacyHostIdentifier: 'privacy-host',
      privacyPassword: undefined,
      publicKey: undefined,
      realm: undefined,
      vaultId: 'snmp-vault',
    });
  });
});
