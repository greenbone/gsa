/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, expect, test, testing} from '@gsa/testing';
import {rendererWithTableBody, screen} from 'web/testing';
import Credential, {
  CERTIFICATE_CREDENTIAL_TYPE,
  USERNAME_SSH_KEY_CREDENTIAL_TYPE,
} from 'gmp/models/credential';
import CredentialTableRow from 'web/pages/credentials/CredentialTableRow';

describe('CredentialTableRow tests', () => {
  test('should render entity name', async () => {
    const credential = new Credential({
      id: '1',
      name: 'Test Credential',
      credentialType: CERTIFICATE_CREDENTIAL_TYPE,
    });
    const {render} = rendererWithTableBody({capabilities: true});
    render(<CredentialTableRow entity={credential} />);
    expect(
      screen.getByRole('cell', {name: /test credential/i}),
    ).toBeInTheDocument();
  });

  test('should render credential type', async () => {
    const credential = new Credential({
      id: '1',
      name: 'Test Credential',
      credentialType: CERTIFICATE_CREDENTIAL_TYPE,
    });
    const {render} = rendererWithTableBody({capabilities: true});
    render(<CredentialTableRow entity={credential} />);
    expect(
      screen.getByRole('cell', {name: /client certificate \(cc\)/i}),
    ).toBeInTheDocument();
  });

  test('should render login', async () => {
    const credential = new Credential({
      id: '1',
      name: 'Test Credential',
      credentialType: CERTIFICATE_CREDENTIAL_TYPE,
      login: 'Foo Bar',
    });
    const {render} = rendererWithTableBody({capabilities: true});
    render(<CredentialTableRow entity={credential} />);
    expect(screen.getByRole('cell', {name: /foo bar/i})).toBeInTheDocument();
  });

  test('should render table actions', async () => {
    const credential = new Credential({
      id: '1',
      name: 'Test Credential',
      credentialType: USERNAME_SSH_KEY_CREDENTIAL_TYPE,
    });
    const handleDownloadInstaller = testing.fn();
    const {render} = rendererWithTableBody({capabilities: true});
    render(
      <CredentialTableRow
        entity={credential}
        onCredentialInstallerDownloadClick={handleDownloadInstaller}
      />,
    );
    expect(screen.getByRole('button', {name: /delete/i})).toBeInTheDocument();
    expect(screen.getByRole('button', {name: /edit/i})).toBeInTheDocument();
    expect(screen.getByRole('button', {name: /clone/i})).toBeInTheDocument();
    expect(
      screen.getByRole('button', {name: /download rpm/i}),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', {name: /download deb/i}),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', {name: /download key/i}),
    ).toBeInTheDocument();
  });
});
