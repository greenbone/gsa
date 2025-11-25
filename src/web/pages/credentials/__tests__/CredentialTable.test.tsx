/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {fireEvent, rendererWith, screen} from 'web/testing';
import EverythingCapabilities from 'gmp/capabilities/everything';
import Credential, {
  USERNAME_SSH_KEY_CREDENTIAL_TYPE,
} from 'gmp/models/credential';
import CredentialTable from 'web/pages/credentials/CredentialTable';

describe('CredentialTable tests', () => {
  test('should render without crashing', () => {
    const portLists = [
      new Credential({
        id: '1',
        name: 'Credential 1',
      }),
      new Credential({
        id: '2',
        name: 'Credential 2',
      }),
    ];
    const {render} = rendererWith({capabilities: true});
    render(<CredentialTable entities={portLists} />);
    expect(screen.getByTestId('entities-table')).toBeInTheDocument();
  });

  test('should render the empty title when no port lists are available', () => {
    const {render} = rendererWith({capabilities: true});
    render(<CredentialTable entities={[]} />);
    expect(screen.getByText('No credentials available')).toBeInTheDocument();
    expect(screen.queryByTestId('entities-table')).not.toBeInTheDocument();
  });

  test("should not render anything if port list aren't available", () => {
    const {render} = rendererWith({capabilities: true});
    const {container} = render(<CredentialTable />);
    expect(container).toBeEmptyDOMElement();
    expect(screen.queryByTestId('entities-table')).not.toBeInTheDocument();
  });

  test('should render the credentials', () => {
    const credentials = [
      new Credential({
        id: '1',
        name: 'Credential 1',
      }),
      new Credential({
        id: '2',
        name: 'Credential 2',
      }),
    ];
    const {render} = rendererWith({capabilities: true});
    render(<CredentialTable entities={credentials} />);
    expect(screen.getByText('Credential 1')).toBeInTheDocument();
    expect(screen.getByText('Credential 2')).toBeInTheDocument();
    const rows = screen.queryAllByRole('row');
    expect(rows).toHaveLength(credentials.length + 2); // +2 for one header row and one footer row
    const headers = screen.queryAllByRole('columnheader');
    expect(headers.length).toBeGreaterThan(0);
  });

  test('should allow to call action handlers', () => {
    const credential = new Credential({
      id: '1',
      name: 'Credential 1',
      credentialType: USERNAME_SSH_KEY_CREDENTIAL_TYPE,
      userCapabilities: new EverythingCapabilities(),
    });
    const handleClone = testing.fn();
    const handleDelete = testing.fn();
    const handleDownload = testing.fn();
    const handleEdit = testing.fn();
    const handleDownloadInstaller = testing.fn();
    const {render} = rendererWith({capabilities: true});
    render(
      <CredentialTable
        entities={[credential]}
        onCredentialCloneClick={handleClone}
        onCredentialDeleteClick={handleDelete}
        onCredentialDownloadClick={handleDownload}
        onCredentialEditClick={handleEdit}
        onCredentialInstallerDownloadClick={handleDownloadInstaller}
      />,
    );

    const cloneButton = screen.getByRole('button', {name: /clone/i});
    fireEvent.click(cloneButton);
    expect(handleClone).toHaveBeenCalledWith(credential);

    const deleteButton = screen.queryAllByRole('button', {name: /delete/i})[0];
    fireEvent.click(deleteButton);
    expect(handleDelete).toHaveBeenCalledWith(credential);

    const downloadButton = screen.getByRole('button', {name: /export/i});
    fireEvent.click(downloadButton);
    expect(handleDownload).toHaveBeenCalledWith(credential);

    const editButton = screen.getByRole('button', {name: /edit/i});
    fireEvent.click(editButton);
    expect(handleEdit).toHaveBeenCalledWith(credential);

    const downloadRpmButton = screen.getByRole('button', {
      name: /download rpm/i,
    });
    fireEvent.click(downloadRpmButton);
    expect(handleDownloadInstaller).toHaveBeenCalledWith(credential, 'rpm');
  });
});
