/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing, beforeEach} from '@gsa/testing';
import {render, screen, fireEvent} from 'web/testing';
import {
  CREDENTIAL_STORE_KRB5_CREDENTIAL_TYPE,
  CREDENTIAL_STORE_SNMP_CREDENTIAL_TYPE,
  CREDENTIAL_STORE_USERNAME_PASSWORD_CREDENTIAL_TYPE,
  SNMP_PRIVACY_ALGORITHM_AES,
  SNMP_PRIVACY_ALGORITHM_DES,
  SNMP_AUTH_ALGORITHM_MD5,
  SNMP_AUTH_ALGORITHM_SHA1,
} from 'gmp/models/credential';
import CredentialStoreDialogFields from 'web/pages/credentials/CredentialStoreDialogFields';

const mockTranslate = (str: string) => str;
const mockValidateKdc = testing.fn().mockReturnValue(true);
const mockOnValueChange = testing.fn();

describe('CredentialStoreDialogFields', () => {
  beforeEach(() => {
    testing.clearAllMocks();
  });

  test('should render basic vault and host identifier fields', () => {
    render(
      <CredentialStoreDialogFields
        _={mockTranslate}
        credentialType={CREDENTIAL_STORE_USERNAME_PASSWORD_CREDENTIAL_TYPE}
        hostIdentifier="host.example.com"
        validateKdc={mockValidateKdc}
        vaultId="vault-123"
        onValueChange={mockOnValueChange}
      />,
    );

    expect(screen.getByDisplayValue('vault-123')).toBeInTheDocument();
    expect(screen.getByDisplayValue('host.example.com')).toBeInTheDocument();
    expect(screen.getByText('Vault ID')).toBeInTheDocument();
    expect(screen.getByText('Host Identifier')).toBeInTheDocument();
  });

  test('should call onValueChange when vault ID is changed', () => {
    render(
      <CredentialStoreDialogFields
        _={mockTranslate}
        credentialType={CREDENTIAL_STORE_USERNAME_PASSWORD_CREDENTIAL_TYPE}
        validateKdc={mockValidateKdc}
        vaultId="vault-123"
        onValueChange={mockOnValueChange}
      />,
    );

    const vaultIdInput = screen.getByDisplayValue('vault-123');
    fireEvent.change(vaultIdInput, {target: {value: 'new-vault-456'}});

    expect(mockOnValueChange).toHaveBeenCalledWith('new-vault-456', 'vaultId');
  });

  test('should call onValueChange when host identifier is changed', () => {
    render(
      <CredentialStoreDialogFields
        _={mockTranslate}
        credentialType={CREDENTIAL_STORE_USERNAME_PASSWORD_CREDENTIAL_TYPE}
        hostIdentifier="host.example.com"
        validateKdc={mockValidateKdc}
        onValueChange={mockOnValueChange}
      />,
    );

    const hostInput = screen.getByDisplayValue('host.example.com');
    fireEvent.change(hostInput, {target: {value: 'newhost.example.com'}});

    expect(mockOnValueChange).toHaveBeenCalledWith(
      'newhost.example.com',
      'hostIdentifier',
    );
  });

  test('should render KRB5 specific fields for Kerberos credential store', () => {
    render(
      <CredentialStoreDialogFields
        _={mockTranslate}
        credentialType={CREDENTIAL_STORE_KRB5_CREDENTIAL_TYPE}
        kdcs={['kdc1.example.com', 'kdc2.example.com']}
        realm="EXAMPLE.COM"
        validateKdc={mockValidateKdc}
        vaultId="vault-123"
        onValueChange={mockOnValueChange}
      />,
    );

    expect(screen.getByText('Vault ID')).toBeInTheDocument();
    expect(screen.getByText('Host Identifier')).toBeInTheDocument();
    expect(screen.getByText('Realm')).toBeInTheDocument();
    expect(screen.getByText('Key Distribution Center')).toBeInTheDocument();
    expect(screen.getByDisplayValue('EXAMPLE.COM')).toBeInTheDocument();
  });

  test('should call onValueChange when realm is changed for KRB5', () => {
    render(
      <CredentialStoreDialogFields
        _={mockTranslate}
        credentialType={CREDENTIAL_STORE_KRB5_CREDENTIAL_TYPE}
        realm="EXAMPLE.COM"
        validateKdc={mockValidateKdc}
        onValueChange={mockOnValueChange}
      />,
    );

    const realmInput = screen.getByDisplayValue('EXAMPLE.COM');
    fireEvent.change(realmInput, {target: {value: 'NEW.EXAMPLE.COM'}});

    expect(mockOnValueChange).toHaveBeenCalledWith('NEW.EXAMPLE.COM', 'realm');
  });

  test('should render SNMP specific fields for SNMP credential store', () => {
    render(
      <CredentialStoreDialogFields
        _={mockTranslate}
        authAlgorithm={SNMP_AUTH_ALGORITHM_SHA1}
        credentialType={CREDENTIAL_STORE_SNMP_CREDENTIAL_TYPE}
        privacyAlgorithm={SNMP_PRIVACY_ALGORITHM_AES}
        privacyHostIdentifier="privacy.example.com"
        validateKdc={mockValidateKdc}
        vaultId="vault-123"
        onValueChange={mockOnValueChange}
      />,
    );

    expect(screen.getByText('Vault ID')).toBeInTheDocument();
    expect(screen.getByText('Host Identifier')).toBeInTheDocument();
    expect(screen.getByText('Privacy Host Identifier')).toBeInTheDocument();
    expect(screen.getByText('Privacy Algorithm')).toBeInTheDocument();
    expect(screen.getByText('Auth Algorithm')).toBeInTheDocument();
    expect(screen.getByDisplayValue('privacy.example.com')).toBeInTheDocument();
  });

  test('should call onValueChange when privacy host identifier is changed for SNMP', () => {
    render(
      <CredentialStoreDialogFields
        _={mockTranslate}
        credentialType={CREDENTIAL_STORE_SNMP_CREDENTIAL_TYPE}
        privacyHostIdentifier="privacy.example.com"
        validateKdc={mockValidateKdc}
        onValueChange={mockOnValueChange}
      />,
    );

    const privacyHostInput = screen.getByDisplayValue('privacy.example.com');
    fireEvent.change(privacyHostInput, {
      target: {value: 'newprivacy.example.com'},
    });

    expect(mockOnValueChange).toHaveBeenCalledWith(
      'newprivacy.example.com',
      'privacyHostIdentifier',
    );
  });

  test('should handle privacy algorithm radio button changes for SNMP', () => {
    render(
      <CredentialStoreDialogFields
        _={mockTranslate}
        authAlgorithm={SNMP_AUTH_ALGORITHM_SHA1}
        credentialType={CREDENTIAL_STORE_SNMP_CREDENTIAL_TYPE}
        privacyAlgorithm={SNMP_PRIVACY_ALGORITHM_AES}
        validateKdc={mockValidateKdc}
        onValueChange={mockOnValueChange}
      />,
    );

    const desRadio = screen.getByRole('radio', {name: 'DES'});
    fireEvent.click(desRadio);

    expect(mockOnValueChange).toHaveBeenCalledWith(
      SNMP_PRIVACY_ALGORITHM_DES,
      'privacyAlgorithm',
    );
  });

  test('should handle auth algorithm radio button changes for SNMP', () => {
    render(
      <CredentialStoreDialogFields
        _={mockTranslate}
        authAlgorithm={SNMP_AUTH_ALGORITHM_SHA1}
        credentialType={CREDENTIAL_STORE_SNMP_CREDENTIAL_TYPE}
        privacyAlgorithm={SNMP_PRIVACY_ALGORITHM_AES}
        validateKdc={mockValidateKdc}
        onValueChange={mockOnValueChange}
      />,
    );

    const md5Radio = screen.getByRole('radio', {name: 'MD5'});
    fireEvent.click(md5Radio);

    expect(mockOnValueChange).toHaveBeenCalledWith(
      SNMP_AUTH_ALGORITHM_MD5,
      'authAlgorithm',
    );
  });

  test('should show correct checked state for privacy algorithm radios', () => {
    render(
      <CredentialStoreDialogFields
        _={mockTranslate}
        credentialType={CREDENTIAL_STORE_SNMP_CREDENTIAL_TYPE}
        privacyAlgorithm={SNMP_PRIVACY_ALGORITHM_DES}
        validateKdc={mockValidateKdc}
        onValueChange={mockOnValueChange}
      />,
    );

    const aesRadio = screen.getByRole('radio', {name: 'AES'});
    const desRadio = screen.getByRole('radio', {name: 'DES'});
    const noneRadio = screen.getByRole('radio', {name: 'None'});

    expect(aesRadio).not.toBeChecked();
    expect(desRadio).toBeChecked();
    expect(noneRadio).not.toBeChecked();
  });

  test('should show correct checked state for auth algorithm radios', () => {
    render(
      <CredentialStoreDialogFields
        _={mockTranslate}
        authAlgorithm={SNMP_AUTH_ALGORITHM_MD5}
        credentialType={CREDENTIAL_STORE_SNMP_CREDENTIAL_TYPE}
        privacyAlgorithm={SNMP_PRIVACY_ALGORITHM_AES}
        validateKdc={mockValidateKdc}
        onValueChange={mockOnValueChange}
      />,
    );

    const md5Radio = screen.getByRole('radio', {name: 'MD5'});
    const sha1Radio = screen.getByRole('radio', {name: 'SHA1'});

    expect(md5Radio).toBeChecked();
    expect(sha1Radio).not.toBeChecked();
  });

  test('should not render type-specific fields for basic credential store types', () => {
    render(
      <CredentialStoreDialogFields
        _={mockTranslate}
        credentialType={CREDENTIAL_STORE_USERNAME_PASSWORD_CREDENTIAL_TYPE}
        validateKdc={mockValidateKdc}
        onValueChange={mockOnValueChange}
      />,
    );

    expect(screen.getByText('Vault ID')).toBeInTheDocument();
    expect(screen.getByText('Host Identifier')).toBeInTheDocument();
    expect(screen.queryByText('Realm')).not.toBeInTheDocument();
    expect(screen.queryByText('Privacy Algorithm')).not.toBeInTheDocument();
    expect(screen.queryByText('Auth Algorithm')).not.toBeInTheDocument();
  });
});
