/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, expect, test, testing} from '@gsa/testing';
import {rendererWithTableRow, screen, fireEvent} from 'web/testing';
import EverythingCapabilities from 'gmp/capabilities/everything';
import Credential, {
  USERNAME_SSH_KEY_CREDENTIAL_TYPE,
} from 'gmp/models/credential';
import CredentialActions from 'web/pages/credentials/CredentialActions';
import SelectionType from 'web/utils/SelectionType';

describe('CredentialActions tests', () => {
  test('should render all action icons', () => {
    const {render} = rendererWithTableRow({capabilities: true});
    const credential = new Credential({
      id: '1',
      name: 'Test Credential',
      credentialType: USERNAME_SSH_KEY_CREDENTIAL_TYPE,
      userCapabilities: new EverythingCapabilities(),
    });
    const handleClone = testing.fn();
    const handleDelete = testing.fn();
    const handleDownload = testing.fn();
    const handleEdit = testing.fn();
    const handleDownloadInstaller = testing.fn();

    render(
      <CredentialActions
        entity={credential}
        onCredentialCloneClick={handleClone}
        onCredentialDeleteClick={handleDelete}
        onCredentialDownloadClick={handleDownload}
        onCredentialEditClick={handleEdit}
        onCredentialInstallerDownloadClick={handleDownloadInstaller}
      />,
    );

    expect(screen.getByRole('button', {name: /delete/i})).toBeInTheDocument();
    expect(screen.getByRole('button', {name: /edit/i})).toBeInTheDocument();
    expect(screen.getByRole('button', {name: /clone/i})).toBeInTheDocument();
    expect(screen.getByRole('button', {name: /export/i})).toBeInTheDocument();
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

  test('should call onCredentialDeleteClick when delete icon is clicked', () => {
    const {render} = rendererWithTableRow({capabilities: true});
    const credential = new Credential({
      id: '1',
      name: 'Test Credential',
      userCapabilities: new EverythingCapabilities(),
    });
    const handleClone = testing.fn();
    const handleDelete = testing.fn();
    const handleDownload = testing.fn();
    const handleEdit = testing.fn();

    render(
      <CredentialActions
        entity={credential}
        onCredentialCloneClick={handleClone}
        onCredentialDeleteClick={handleDelete}
        onCredentialDownloadClick={handleDownload}
        onCredentialEditClick={handleEdit}
      />,
    );

    const deleteButton = screen.getByRole('button', {name: /delete/i});
    fireEvent.click(deleteButton);

    expect(handleDelete).toHaveBeenCalledWith(credential);
  });

  test('should call onCredentialEditClick when edit icon is clicked', () => {
    const {render} = rendererWithTableRow({capabilities: true});
    const credential = new Credential({
      id: '1',
      name: 'Test Credential',
      userCapabilities: new EverythingCapabilities(),
    });
    const handleClone = testing.fn();
    const handleDelete = testing.fn();
    const handleDownload = testing.fn();
    const handleEdit = testing.fn();

    render(
      <CredentialActions
        entity={credential}
        onCredentialCloneClick={handleClone}
        onCredentialDeleteClick={handleDelete}
        onCredentialDownloadClick={handleDownload}
        onCredentialEditClick={handleEdit}
      />,
    );

    const editButton = screen.getByRole('button', {name: /edit/i});
    fireEvent.click(editButton);

    expect(handleEdit).toHaveBeenCalledWith(credential);
  });

  test('should call onCredentialCloneClick when clone icon is clicked', () => {
    const {render} = rendererWithTableRow({capabilities: true});
    const credential = new Credential({
      id: '1',
      name: 'Test Credential',
      userCapabilities: new EverythingCapabilities(),
    });
    const handleClone = testing.fn();
    const handleDelete = testing.fn();
    const handleDownload = testing.fn();
    const handleEdit = testing.fn();

    render(
      <CredentialActions
        entity={credential}
        onCredentialCloneClick={handleClone}
        onCredentialDeleteClick={handleDelete}
        onCredentialDownloadClick={handleDownload}
        onCredentialEditClick={handleEdit}
      />,
    );

    const cloneButton = screen.getByRole('button', {name: /clone/i});
    fireEvent.click(cloneButton);

    expect(handleClone).toHaveBeenCalledWith(credential);
  });

  test('should call onCredentialDownloadClick when export icon is clicked', () => {
    const {render} = rendererWithTableRow({capabilities: true});
    const credential = new Credential({
      id: '1',
      name: 'Test Credential',
      userCapabilities: new EverythingCapabilities(),
    });
    const handleClone = testing.fn();
    const handleDelete = testing.fn();
    const handleDownload = testing.fn();
    const handleEdit = testing.fn();

    render(
      <CredentialActions
        entity={credential}
        onCredentialCloneClick={handleClone}
        onCredentialDeleteClick={handleDelete}
        onCredentialDownloadClick={handleDownload}
        onCredentialEditClick={handleEdit}
      />,
    );

    const exportButton = screen.getByRole('button', {name: /export/i});
    fireEvent.click(exportButton);

    expect(handleDownload).toHaveBeenCalledWith(credential);
  });

  test('should allow to download credential installer', () => {
    const {render} = rendererWithTableRow({capabilities: true});
    const credential = new Credential({
      id: '1',
      name: 'Test Credential',
      credentialType: USERNAME_SSH_KEY_CREDENTIAL_TYPE,
      userCapabilities: new EverythingCapabilities(),
    });
    const handleDownloadInstaller = testing.fn();

    render(
      <CredentialActions
        entity={credential}
        onCredentialInstallerDownloadClick={handleDownloadInstaller}
      />,
    );

    const rpmIcon = screen.getByRole('button', {
      name: /download rpm icon/i,
    });
    fireEvent.click(rpmIcon);
    expect(handleDownloadInstaller).toHaveBeenCalledWith(credential, 'rpm');

    const debIcon = screen.getByRole('button', {
      name: /download deb icon/i,
    });
    fireEvent.click(debIcon);
    expect(handleDownloadInstaller).toHaveBeenCalledWith(credential, 'deb');

    const keyIcon = screen.getByRole('button', {
      name: /download key icon/i,
    });
    fireEvent.click(keyIcon);
    expect(handleDownloadInstaller).toHaveBeenCalledWith(credential, 'key');
  });

  test('should render user selection', () => {
    const {render} = rendererWithTableRow({capabilities: true});
    const credential = new Credential({
      id: '1',
      name: 'Test Credential',
      userCapabilities: new EverythingCapabilities(),
    });
    const handleClone = testing.fn();
    const handleDelete = testing.fn();
    const handleDownload = testing.fn();
    const handleEdit = testing.fn();

    render(
      <CredentialActions
        entity={credential}
        selectionType={SelectionType.SELECTION_USER}
        onCredentialCloneClick={handleClone}
        onCredentialDeleteClick={handleDelete}
        onCredentialDownloadClick={handleDownload}
        onCredentialEditClick={handleEdit}
      />,
    );

    expect(screen.getByTestId('entity-selection-1')).toBeInTheDocument();
  });
});
