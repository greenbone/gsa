/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import {screen, rendererWithTableBody} from 'web/testing';
import {
  CREDENTIAL_STORE_KRB5_CREDENTIAL_TYPE,
  CREDENTIAL_STORE_SNMP_CREDENTIAL_TYPE,
  CREDENTIAL_STORE_USERNAME_PASSWORD_CREDENTIAL_TYPE,
} from 'gmp/models/credential';
import CredentialStoreFields from 'web/pages/credentials/CredentialStoreFields';

describe('CredentialStoreFields', () => {
  test('should render basic vault and host identifier fields', () => {
    const credentialStore = {
      vaultId: 'vault-123',
      hostIdentifier: 'host.example.com',
    };

    const {render} = rendererWithTableBody();
    render(
      <CredentialStoreFields
        credentialStore={credentialStore}
        credentialType={CREDENTIAL_STORE_USERNAME_PASSWORD_CREDENTIAL_TYPE}
      />,
    );

    expect(screen.getByText('Vault ID')).toBeInTheDocument();
    expect(screen.getByText('vault-123')).toBeInTheDocument();
    expect(screen.getByText('Host Identifier')).toBeInTheDocument();
    expect(screen.getByText('host.example.com')).toBeInTheDocument();
  });

  test('should render KRB5 specific fields for Kerberos credential store', () => {
    const credentialStore = {
      vaultId: 'vault-123',
      hostIdentifier: 'host.example.com',
    };

    const {render} = rendererWithTableBody();
    render(
      <CredentialStoreFields
        authAlgorithm="SHA1"
        credentialStore={credentialStore}
        credentialType={CREDENTIAL_STORE_KRB5_CREDENTIAL_TYPE}
        kdcs={['kdc1.example.com', 'kdc2.example.com']}
        realm="EXAMPLE.COM"
      />,
    );

    expect(screen.getByText('Vault ID')).toBeInTheDocument();
    expect(screen.getByText('Host Identifier')).toBeInTheDocument();
    expect(screen.getByText('Realm')).toBeInTheDocument();
    expect(screen.getByText('EXAMPLE.COM')).toBeInTheDocument();
    expect(screen.getByText('Key Distribution Center')).toBeInTheDocument();
    expect(screen.getByText('kdc1.example.com')).toBeInTheDocument();
    expect(screen.getByText('kdc2.example.com')).toBeInTheDocument();
  });

  test('should render SNMP specific fields for SNMP credential store', () => {
    const credentialStore = {
      vaultId: 'vault-123',
      hostIdentifier: 'host.example.com',
    };

    const {render} = rendererWithTableBody();
    render(
      <CredentialStoreFields
        authAlgorithm="MD5"
        credentialStore={credentialStore}
        credentialType={CREDENTIAL_STORE_SNMP_CREDENTIAL_TYPE}
        privacyAlgorithm="AES"
        privacyHostIdentifier="privacy.example.com"
      />,
    );

    expect(screen.getByText('Vault ID')).toBeInTheDocument();
    expect(screen.getByText('Host Identifier')).toBeInTheDocument();
    expect(screen.getByText('Auth Algorithm')).toBeInTheDocument();
    expect(screen.getByText('MD5')).toBeInTheDocument();
    expect(screen.getByText('Privacy Algorithm')).toBeInTheDocument();
    expect(screen.getByText('AES')).toBeInTheDocument();
    expect(screen.getByText('Privacy Host Identifier')).toBeInTheDocument();
    expect(screen.getByText('privacy.example.com')).toBeInTheDocument();
  });

  test('should handle empty credential store object', () => {
    const {render} = rendererWithTableBody();
    render(
      <CredentialStoreFields
        credentialStore={{}}
        credentialType={CREDENTIAL_STORE_USERNAME_PASSWORD_CREDENTIAL_TYPE}
      />,
    );

    expect(screen.getByText('Vault ID')).toBeInTheDocument();
    expect(screen.getByText('Host Identifier')).toBeInTheDocument();
    // Should not crash and render empty cells
  });

  test('should handle undefined credential store', () => {
    const {render} = rendererWithTableBody();
    render(
      <CredentialStoreFields
        credentialType={CREDENTIAL_STORE_USERNAME_PASSWORD_CREDENTIAL_TYPE}
      />,
    );

    expect(screen.getByText('Vault ID')).toBeInTheDocument();
    expect(screen.getByText('Host Identifier')).toBeInTheDocument();
    // Should not crash and render empty cells
  });

  test('should handle empty kdcs array for KRB5 type', () => {
    const {render} = rendererWithTableBody();
    render(
      <CredentialStoreFields
        credentialStore={{vaultId: 'vault-123'}}
        credentialType={CREDENTIAL_STORE_KRB5_CREDENTIAL_TYPE}
        kdcs={[]}
        realm="EXAMPLE.COM"
      />,
    );

    expect(screen.getByText('Key Distribution Center')).toBeInTheDocument();
    expect(screen.getByText('Realm')).toBeInTheDocument();
    expect(screen.getByText('EXAMPLE.COM')).toBeInTheDocument();
  });
});
