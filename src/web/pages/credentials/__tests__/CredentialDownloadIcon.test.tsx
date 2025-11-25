/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {fireEvent, render, screen} from 'web/testing';
import Credential, {
  type CredentialType,
  CERTIFICATE_CREDENTIAL_TYPE,
  CREDENTIAL_STORE_CERTIFICATE_CREDENTIAL_TYPE,
  CREDENTIAL_STORE_KRB5_CREDENTIAL_TYPE,
  CREDENTIAL_STORE_PASSWORD_ONLY_CREDENTIAL_TYPE,
  CREDENTIAL_STORE_PGP_CREDENTIAL_TYPE,
  CREDENTIAL_STORE_SMIME_CREDENTIAL_TYPE,
  CREDENTIAL_STORE_SNMP_CREDENTIAL_TYPE,
  CREDENTIAL_STORE_USERNAME_PASSWORD_CREDENTIAL_TYPE,
  CREDENTIAL_STORE_USERNAME_SSH_KEY_CREDENTIAL_TYPE,
  KRB5_CREDENTIAL_TYPE,
  PASSWORD_ONLY_CREDENTIAL_TYPE,
  PGP_CREDENTIAL_TYPE,
  SMIME_CREDENTIAL_TYPE,
  SNMP_CREDENTIAL_TYPE,
  USERNAME_PASSWORD_CREDENTIAL_TYPE,
  USERNAME_SSH_KEY_CREDENTIAL_TYPE,
} from 'gmp/models/credential';
import CredentialDownloadIcon from 'web/pages/credentials/CredentialDownloadIcon';

describe('CredentialDownloadIcon tests', () => {
  test('should allow to download ssh key credential files', async () => {
    const handleDownload = testing.fn();
    const credential = new Credential({
      id: 'cred-ssh-key',
      name: 'SSH Key Credential',
      credentialType: USERNAME_SSH_KEY_CREDENTIAL_TYPE,
    });
    render(
      <CredentialDownloadIcon
        credential={credential}
        onDownload={handleDownload}
      />,
    );

    fireEvent.click(screen.getByTitle('Download RPM (.rpm) Package'));
    expect(handleDownload).toHaveBeenCalledWith(credential, 'rpm');

    fireEvent.click(screen.getByTitle('Download Debian (.deb) Package'));
    expect(handleDownload).toHaveBeenCalledWith(credential, 'deb');

    fireEvent.click(screen.getByTitle('Download Public Key'));
    expect(handleDownload).toHaveBeenCalledWith(credential, 'key');

    expect(
      screen.queryByTitle('Download Windows Executable (.exe)'),
    ).not.toBeInTheDocument();
  });

  test('should allow to download username/password credential files', async () => {
    const handleDownload = testing.fn();
    const credential = new Credential({
      id: 'cred-username-password',
      name: 'Username/Password Credential',
      credentialType: USERNAME_PASSWORD_CREDENTIAL_TYPE,
    });
    render(
      <CredentialDownloadIcon
        credential={credential}
        onDownload={handleDownload}
      />,
    );

    fireEvent.click(screen.getByTitle('Download Windows Executable (.exe)'));
    expect(handleDownload).toHaveBeenCalledWith(credential, 'exe');

    expect(
      screen.queryByTitle('Download RPM (.rpm) Package'),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTitle('Download Debian (.deb) Package'),
    ).not.toBeInTheDocument();
    expect(screen.queryByTitle('Download Public Key')).not.toBeInTheDocument();
  });

  test.each([
    {name: 'SNMP', credentialType: SNMP_CREDENTIAL_TYPE},
    {name: 'Client Certificate', credentialType: CERTIFICATE_CREDENTIAL_TYPE},
    {name: 'Kerberos', credentialType: KRB5_CREDENTIAL_TYPE},
    {name: 'Password Only', credentialType: PASSWORD_ONLY_CREDENTIAL_TYPE},
    {name: 'PGP Key', credentialType: PGP_CREDENTIAL_TYPE},
    {name: 'SMIME', credentialType: SMIME_CREDENTIAL_TYPE},
    {
      name: 'Credential Store Username+Password',
      credentialType: CREDENTIAL_STORE_USERNAME_PASSWORD_CREDENTIAL_TYPE,
    },
    {
      name: 'Credential Store Username+SSH Key',
      credentialType: CREDENTIAL_STORE_USERNAME_SSH_KEY_CREDENTIAL_TYPE,
    },
    {
      name: 'Credential Store Client Certificate',
      credentialType: CREDENTIAL_STORE_CERTIFICATE_CREDENTIAL_TYPE,
    },
    {
      name: 'Credential Store',
      credentialType: CREDENTIAL_STORE_SNMP_CREDENTIAL_TYPE,
    },
    {
      name: 'Credential Store PGP Key',
      credentialType: CREDENTIAL_STORE_PGP_CREDENTIAL_TYPE,
    },
    {
      name: 'Credential Store Password Only',
      credentialType: CREDENTIAL_STORE_PASSWORD_ONLY_CREDENTIAL_TYPE,
    },
    {
      name: 'Credential Store SMIME',
      credentialType: CREDENTIAL_STORE_SMIME_CREDENTIAL_TYPE,
    },
    {
      name: 'Credential Store Kerberos',
      credentialType: CREDENTIAL_STORE_KRB5_CREDENTIAL_TYPE,
    },
  ] as {name: string; credentialType: CredentialType}[])(
    'should render nothing for $name credential type',
    async ({name, credentialType}) => {
      const credential = new Credential({
        id: 'cred-other',
        name,
        credentialType,
      });
      render(<CredentialDownloadIcon credential={credential} />);

      expect(
        screen.queryByTitle('Download RPM (.rpm) Package'),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByTitle('Download Debian (.deb) Package'),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByTitle('Download Public Key'),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByTitle('Download Windows Executable (.exe)'),
      ).not.toBeInTheDocument();
    },
  );
});
