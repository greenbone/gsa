/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, expect, test, testing} from '@gsa/testing';
import {fireEvent, rendererWithTableBody, screen} from 'web/testing';
import dayjs from 'dayjs';
import EverythingCapabilities from 'gmp/capabilities/everything';
import AgentInstaller from 'gmp/models/agent-installer';
import AgentInstallerTableRow from 'web/pages/agent-installers/AgentInstallerTableRow';

describe('AgentInstallerTableRow tests', () => {
  test('renders name, description, version and actions', () => {
    const installer = new AgentInstaller({
      id: '1',
      name: 'Agent Installer 1',
      description: 'This is a test installer',
      version: '1.0.0',
      checksum: 'abc123def456',
    });

    const {render} = rendererWithTableBody({capabilities: true});
    render(<AgentInstallerTableRow entity={installer} />);

    expect(screen.getByText('Agent Installer 1')).toBeInTheDocument();
    expect(screen.getByText('This is a test installer')).toBeInTheDocument();
    expect(screen.getByText('1.0.0')).toBeInTheDocument();

    expect(screen.getByTestId('export-icon')).toBeInTheDocument();
    expect(screen.getByTestId('fingerprint-icon')).toBeInTheDocument();
  });

  test('renders empty fields as dash or None', () => {
    const installer = new AgentInstaller({
      id: '2',
      name: 'Agent Installer 2',
    });

    const {render} = rendererWithTableBody({capabilities: true});
    render(<AgentInstallerTableRow entity={installer} />);

    expect(screen.getByText('Agent Installer 2')).toBeInTheDocument();

    const cells = screen.getAllByRole('cell');
    expect(cells.length).toBeGreaterThanOrEqual(4);
  });

  test('action handlers are called', () => {
    const installer = new AgentInstaller({
      id: '3',
      name: 'Agent Installer 3',
      checksum: 'abc123',
      userCapabilities: new EverythingCapabilities(),
    });

    const handleDownload = testing.fn();
    const handleChecksum = testing.fn();

    const {render} = rendererWithTableBody({capabilities: true});
    render(
      <AgentInstallerTableRow
        entity={installer}
        onAgentInstallerChecksumClick={handleChecksum}
        onAgentInstallerDownloadClick={handleDownload}
      />,
    );

    const downloadButton = screen.getByTestId('export-icon');
    fireEvent.click(downloadButton);
    expect(handleDownload).toHaveBeenCalledWith(installer);

    const checksumButton = screen.getByTestId('fingerprint-icon');
    fireEvent.click(checksumButton);
    expect(handleChecksum).toHaveBeenCalledWith(installer);
  });

  test('checksum action is disabled when no checksum available', () => {
    const installer = new AgentInstaller({
      id: '4',
      name: 'Agent Installer 4',
      userCapabilities: new EverythingCapabilities(),
    });

    const {render} = rendererWithTableBody({capabilities: true});
    render(<AgentInstallerTableRow entity={installer} />);

    const checksumButton = screen.getByTestId('fingerprint-icon');
    expect(checksumButton).toBeDisabled();
  });

  test('renders modification time when present', () => {
    const installer = new AgentInstaller({
      id: '5',
      name: 'Agent Installer 5',
      modificationTime: dayjs('2020-01-01T00:00:00Z'),
    });

    const {render} = rendererWithTableBody({capabilities: true});
    render(<AgentInstallerTableRow entity={installer} />);

    expect(screen.getByText('Agent Installer 5')).toBeInTheDocument();
  });

  test('handles long names and descriptions', () => {
    const installer = new AgentInstaller({
      id: '6',
      name: 'Very Long Agent Installer Name That Should Be Handled Properly',
      description:
        'This is a very long description for an agent installer that contains a lot of text and should be handled properly by the table row component without breaking the layout',
      version: '1.2.3-beta.4',
    });

    const {render} = rendererWithTableBody({capabilities: true});
    render(<AgentInstallerTableRow entity={installer} />);

    expect(
      screen.getByText(
        'Very Long Agent Installer Name That Should Be Handled Properly',
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/This is a very long description/),
    ).toBeInTheDocument();
    expect(screen.getByText('1.2.3-beta.4')).toBeInTheDocument();
  });

  test('renders with selection capabilities', () => {
    const installer = new AgentInstaller({
      id: '7',
      name: 'Agent Installer 7',
      userCapabilities: new EverythingCapabilities(),
    });

    const handleEntitySelected = testing.fn();
    const handleEntityDeselected = testing.fn();

    const {render} = rendererWithTableBody({capabilities: true});
    render(
      <AgentInstallerTableRow
        entity={installer}
        onEntityDeselected={handleEntityDeselected}
        onEntitySelected={handleEntitySelected}
      />,
    );

    expect(screen.getByText('Agent Installer 7')).toBeInTheDocument();

    const row = screen.getByRole('row');
    expect(row).toBeInTheDocument();
  });
});
