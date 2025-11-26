/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {rendererWith, screen, fireEvent} from 'web/testing';
import Capabilities from 'gmp/capabilities/capabilities';
import EverythingCapabilities from 'gmp/capabilities/everything';
import Credential, {
  USERNAME_PASSWORD_CREDENTIAL_TYPE,
  USERNAME_SSH_KEY_CREDENTIAL_TYPE,
} from 'gmp/models/credential';
import CredentialDetailsPageToolBarIcons from 'web/pages/credentials/CredentialDetailsPageToolBarIcons';

const manualUrl = 'test/';

describe('CredentialDetailsPageToolBarIcons tests', () => {
  test('should render all icons', () => {
    const credential = new Credential({
      id: '6575',
      name: 'Credential 1',
      credentialType: USERNAME_PASSWORD_CREDENTIAL_TYPE,
      inUse: false,
      userCapabilities: new EverythingCapabilities(),
    });
    const gmp = {settings: {manualUrl}};
    const handleCredentialCloneClick = testing.fn();
    const handleCredentialDeleteClick = testing.fn();
    const handleCredentialDownloadClick = testing.fn();
    const handleCredentialEditClick = testing.fn();
    const handleCredentialCreateClick = testing.fn();
    const handleCredentialInstallerDownloadClick = testing.fn();
    const {render} = rendererWith({
      gmp,
      capabilities: true,
      router: true,
    });

    render(
      <CredentialDetailsPageToolBarIcons
        entity={credential}
        onCredentialCloneClick={handleCredentialCloneClick}
        onCredentialCreateClick={handleCredentialCreateClick}
        onCredentialDeleteClick={handleCredentialDeleteClick}
        onCredentialDownloadClick={handleCredentialDownloadClick}
        onCredentialEditClick={handleCredentialEditClick}
        onCredentialInstallerDownloadClick={
          handleCredentialInstallerDownloadClick
        }
      />,
    );

    expect(screen.getByTitle('Help: Credentials')).toBeInTheDocument();
    expect(screen.getByTitle('Credential List')).toBeInTheDocument();
    expect(screen.getByTitle('Create new Credential')).toBeInTheDocument();
    expect(screen.getByTitle('Clone Credential')).toBeInTheDocument();
    expect(screen.getByTitle('Edit Credential')).toBeInTheDocument();
    expect(
      screen.getByTitle('Move Credential to trashcan'),
    ).toBeInTheDocument();
    expect(screen.getByTitle('Export Credential as XML')).toBeInTheDocument();
    expect(
      screen.getByTitle('Download Windows Executable (.exe)'),
    ).toBeInTheDocument();

    expect(screen.getByTestId('manual-link')).toHaveAttribute(
      'href',
      'test/en/scanning.html#managing-credentials',
    );
    expect(screen.getByTestId('list-link-icon')).toHaveAttribute(
      'href',
      '/credentials',
    );
  });

  test('should call click handlers', () => {
    const credential = new Credential({
      id: '6575',
      name: 'Credential 1',
      credentialType: USERNAME_SSH_KEY_CREDENTIAL_TYPE,
      inUse: false,
      userCapabilities: new EverythingCapabilities(),
    });
    const gmp = {settings: {manualUrl}};
    const handleCredentialCloneClick = testing.fn();
    const handleCredentialDeleteClick = testing.fn();
    const handleCredentialDownloadClick = testing.fn();
    const handleCredentialEditClick = testing.fn();
    const handleCredentialCreateClick = testing.fn();
    const handleCredentialInstallerDownloadClick = testing.fn();
    const {render} = rendererWith({
      gmp,
      capabilities: true,
      router: true,
    });

    render(
      <CredentialDetailsPageToolBarIcons
        entity={credential}
        onCredentialCloneClick={handleCredentialCloneClick}
        onCredentialCreateClick={handleCredentialCreateClick}
        onCredentialDeleteClick={handleCredentialDeleteClick}
        onCredentialDownloadClick={handleCredentialDownloadClick}
        onCredentialEditClick={handleCredentialEditClick}
        onCredentialInstallerDownloadClick={
          handleCredentialInstallerDownloadClick
        }
      />,
    );

    const cloneIcon = screen.getByTitle('Clone Credential');
    fireEvent.click(cloneIcon);
    expect(handleCredentialCloneClick).toHaveBeenCalledWith(credential);

    const editIcon = screen.getByTitle('Edit Credential');
    fireEvent.click(editIcon);
    expect(handleCredentialEditClick).toHaveBeenCalledWith(credential);

    const deleteIcon = screen.getByTitle('Move Credential to trashcan');
    fireEvent.click(deleteIcon);
    expect(handleCredentialDeleteClick).toHaveBeenCalledWith(credential);

    const exportIcon = screen.getByTitle('Export Credential as XML');
    fireEvent.click(exportIcon);
    expect(handleCredentialDownloadClick).toHaveBeenCalledWith(credential);

    const downloadDebIcon = screen.getByTitle('Download Debian (.deb) Package');
    fireEvent.click(downloadDebIcon);
    expect(handleCredentialInstallerDownloadClick).toHaveBeenCalledWith(
      credential,
      'deb',
    );

    const downloadRpmIcon = screen.getByTitle('Download RPM (.rpm) Package');
    fireEvent.click(downloadRpmIcon);
    expect(handleCredentialInstallerDownloadClick).toHaveBeenCalledWith(
      credential,
      'rpm',
    );

    const downloadPublicKeyIcon = screen.getByTitle('Download Public Key');
    fireEvent.click(downloadPublicKeyIcon);
    expect(handleCredentialInstallerDownloadClick).toHaveBeenCalledWith(
      credential,
      'key',
    );
  });

  test('should not call click handlers without permission additional permissions', () => {
    const credential = new Credential({
      id: '6575',
      name: 'Credential 1',
      credentialType: USERNAME_SSH_KEY_CREDENTIAL_TYPE,
      inUse: false,
      // the user is at least allowed to get the credentials
      // otherwise he would not see the details page at all
      userCapabilities: new Capabilities(['get_credentials']),
    });
    const gmp = {settings: {manualUrl}};
    const handleCredentialCloneClick = testing.fn();
    const handleCredentialDeleteClick = testing.fn();
    const handleCredentialDownloadClick = testing.fn();
    const handleCredentialEditClick = testing.fn();
    const handleCredentialCreateClick = testing.fn();
    const handleCredentialInstallerDownloadClick = testing.fn();
    const {render} = rendererWith({
      gmp,
      capabilities: true,
      router: true,
    });

    render(
      <CredentialDetailsPageToolBarIcons
        entity={credential}
        onCredentialCloneClick={handleCredentialCloneClick}
        onCredentialCreateClick={handleCredentialCreateClick}
        onCredentialDeleteClick={handleCredentialDeleteClick}
        onCredentialDownloadClick={handleCredentialDownloadClick}
        onCredentialEditClick={handleCredentialEditClick}
        onCredentialInstallerDownloadClick={
          handleCredentialInstallerDownloadClick
        }
      />,
    );

    const cloneIcon = screen.getByTitle('Clone Credential');
    expect(cloneIcon).toBeInTheDocument();
    fireEvent.click(cloneIcon);
    expect(handleCredentialCloneClick).toHaveBeenCalledWith(credential);

    const editIcon = screen.getByTitle('Permission to edit Credential denied');
    expect(editIcon).toBeInTheDocument();
    fireEvent.click(editIcon);
    expect(handleCredentialEditClick).not.toHaveBeenCalled();

    const deleteIcon = screen.getByTitle(
      'Permission to move Credential to trashcan denied',
    );
    expect(deleteIcon).toBeInTheDocument();
    fireEvent.click(deleteIcon);
    expect(handleCredentialDeleteClick).not.toHaveBeenCalled();

    const exportIcon = screen.getByTitle('Export Credential as XML');
    expect(exportIcon).toBeInTheDocument();
    fireEvent.click(exportIcon);
    expect(handleCredentialDownloadClick).toHaveBeenCalledWith(credential);

    const downloadDebIcon = screen.getByTitle('Download Debian (.deb) Package');
    fireEvent.click(downloadDebIcon);
    expect(handleCredentialInstallerDownloadClick).toHaveBeenCalledWith(
      credential,
      'deb',
    );

    const downloadRpmIcon = screen.getByTitle('Download RPM (.rpm) Package');
    fireEvent.click(downloadRpmIcon);
    expect(handleCredentialInstallerDownloadClick).toHaveBeenCalledWith(
      credential,
      'rpm',
    );

    const downloadPublicKeyIcon = screen.getByTitle('Download Public Key');
    fireEvent.click(downloadPublicKeyIcon);
    expect(handleCredentialInstallerDownloadClick).toHaveBeenCalledWith(
      credential,
      'key',
    );
  });

  test('should (not) call click handlers for credential in use', () => {
    const credential = new Credential({
      id: '6575',
      name: 'Credential 1',
      credentialType: USERNAME_SSH_KEY_CREDENTIAL_TYPE,
      inUse: true,
      userCapabilities: new EverythingCapabilities(),
    });
    const gmp = {settings: {manualUrl}};
    const handleCredentialCloneClick = testing.fn();
    const handleCredentialDeleteClick = testing.fn();
    const handleCredentialDownloadClick = testing.fn();
    const handleCredentialEditClick = testing.fn();
    const handleCredentialCreateClick = testing.fn();
    const handleCredentialInstallerDownloadClick = testing.fn();
    const {render} = rendererWith({
      gmp,
      capabilities: true,
      router: true,
    });

    render(
      <CredentialDetailsPageToolBarIcons
        entity={credential}
        onCredentialCloneClick={handleCredentialCloneClick}
        onCredentialCreateClick={handleCredentialCreateClick}
        onCredentialDeleteClick={handleCredentialDeleteClick}
        onCredentialDownloadClick={handleCredentialDownloadClick}
        onCredentialEditClick={handleCredentialEditClick}
        onCredentialInstallerDownloadClick={
          handleCredentialInstallerDownloadClick
        }
      />,
    );
    const cloneIcon = screen.getByTitle('Clone Credential');
    fireEvent.click(cloneIcon);
    expect(handleCredentialCloneClick).toHaveBeenCalledWith(credential);

    const editIcon = screen.getByTitle('Edit Credential');
    fireEvent.click(editIcon);
    expect(handleCredentialEditClick).toHaveBeenCalled();

    const deleteIcon = screen.getByTitle('Credential is still in use');
    fireEvent.click(deleteIcon);
    expect(handleCredentialDeleteClick).not.toHaveBeenCalled();

    const exportIcon = screen.getByTitle('Export Credential as XML');
    fireEvent.click(exportIcon);
    expect(handleCredentialDownloadClick).toHaveBeenCalledWith(credential);

    const downloadDebIcon = screen.getByTitle('Download Debian (.deb) Package');
    fireEvent.click(downloadDebIcon);
    expect(handleCredentialInstallerDownloadClick).toHaveBeenCalledWith(
      credential,
      'deb',
    );

    const downloadRpmIcon = screen.getByTitle('Download RPM (.rpm) Package');
    fireEvent.click(downloadRpmIcon);
    expect(handleCredentialInstallerDownloadClick).toHaveBeenCalledWith(
      credential,
      'rpm',
    );

    const downloadPublicKeyIcon = screen.getByTitle('Download Public Key');
    fireEvent.click(downloadPublicKeyIcon);
    expect(handleCredentialInstallerDownloadClick).toHaveBeenCalledWith(
      credential,
      'key',
    );
  });
});
