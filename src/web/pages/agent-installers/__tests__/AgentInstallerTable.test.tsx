/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, expect, test, testing} from '@gsa/testing';
import {fireEvent, rendererWith, screen} from 'web/testing';
import EverythingCapabilities from 'gmp/capabilities/everything';
import AgentInstaller from 'gmp/models/agent-installer';
import AgentInstallerTable from 'web/pages/agent-installers/AgentInstallerTable';

describe('AgentInstallerTable tests', () => {
  test('should render without crashing', () => {
    const installers = [
      new AgentInstaller({id: '1', name: 'Agent Installer 1'}),
      new AgentInstaller({id: '2', name: 'Agent Installer 2'}),
    ];

    const {render} = rendererWith({capabilities: true});
    render(<AgentInstallerTable entities={installers} />);
    expect(screen.getByTestId('entities-table')).toBeInTheDocument();
  });

  test('should render the empty title when no installers are available', () => {
    const {render} = rendererWith({capabilities: true});
    render(<AgentInstallerTable entities={[]} />);
    expect(
      screen.getByText('No agent installers available'),
    ).toBeInTheDocument();
    expect(screen.queryByTestId('entities-table')).not.toBeInTheDocument();
  });

  test("should not render anything if installers aren't provided", () => {
    const {render} = rendererWith({capabilities: true});
    render(<AgentInstallerTable />);
    expect(screen.queryByTestId('entities-table')).not.toBeInTheDocument();
  });

  test('should render installers and columns', () => {
    const installers = [
      new AgentInstaller({
        id: '1',
        name: 'Agent Installer 1',
        description: 'Description 1',
        version: '1.0.0',
        checksum: 'abc123',
      }),
      new AgentInstaller({
        id: '2',
        name: 'Agent Installer 2',
        description: 'Description 2',
        version: '2.0.0',
      }),
    ];

    const {render} = rendererWith({capabilities: true});
    render(<AgentInstallerTable entities={installers} />);

    expect(screen.getByText('Agent Installer 1')).toBeInTheDocument();
    expect(screen.getByText('Agent Installer 2')).toBeInTheDocument();
    expect(screen.getByText('Description 1')).toBeInTheDocument();
    expect(screen.getByText('Description 2')).toBeInTheDocument();

    const rows = screen.queryAllByRole('row');
    expect(rows.length).toEqual(installers.length + 2); // header + footer
    const headers = screen.queryAllByRole('columnheader');
    expect(headers.length).toBeGreaterThan(0);
  });

  test('should call action handlers when provided', () => {
    const installers = [
      new AgentInstaller({
        id: '1',
        name: 'Agent Installer 1',
        checksum: 'abc123def456',
        userCapabilities: new EverythingCapabilities(),
      }),
    ];

    const handleDownload = testing.fn();
    const handleChecksum = testing.fn();

    const {render} = rendererWith({capabilities: true});
    render(
      <AgentInstallerTable
        entities={installers}
        onAgentInstallerChecksumClick={handleChecksum}
        onAgentInstallerDownloadClick={handleDownload}
      />,
    );

    const downloadButton = screen.getByTestId('export-icon');
    fireEvent.click(downloadButton);
    expect(handleDownload).toHaveBeenCalledWith(installers[0]);

    const checksumButton = screen.getByTestId('fingerprint-icon');
    fireEvent.click(checksumButton);
    expect(handleChecksum).toHaveBeenCalledWith(installers[0]);
  });

  test('should render table headers correctly', () => {
    const installers = [
      new AgentInstaller({
        id: '1',
        name: 'Agent Installer 1',
      }),
    ];

    const {render} = rendererWith({capabilities: true});
    render(<AgentInstallerTable entities={installers} />);

    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Description')).toBeInTheDocument();
    expect(screen.getByText('Version')).toBeInTheDocument();
    expect(screen.getByText('Actions')).toBeInTheDocument();
  });

  test('should handle sorting', () => {
    const installers = [
      new AgentInstaller({
        id: '1',
        name: 'Agent Installer B',
      }),
      new AgentInstaller({
        id: '2',
        name: 'Agent Installer A',
      }),
    ];

    const handleSortChange = testing.fn();

    const {render} = rendererWith({capabilities: true});
    render(
      <AgentInstallerTable
        entities={installers}
        onSortChange={handleSortChange}
      />,
    );

    const nameHeader = screen.getByText('Name');
    fireEvent.click(nameHeader);

    expect(handleSortChange).toHaveBeenCalled();
  });
});
