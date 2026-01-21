/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, expect, test, testing} from '@gsa/testing';
import {fireEvent, rendererWithTableRow, screen} from 'web/testing';
import EverythingCapabilities from 'gmp/capabilities/everything';
import AgentInstaller from 'gmp/models/agent-installer';
import AgentInstallerActions from 'web/pages/agent-installers/AgentInstallerActions';

const installer = new AgentInstaller({
  id: '1',
  name: 'Agent Installer 1',
  checksum: 'abc123',
  userCapabilities: new EverythingCapabilities(),
});

describe('AgentInstallerActions tests', () => {
  test('download icon calls onAgentInstallerDownloadClick', () => {
    const onDownload = testing.fn();

    const {render} = rendererWithTableRow({capabilities: true});
    render(
      <AgentInstallerActions
        entity={installer}
        onAgentInstallerDownloadClick={onDownload}
      />,
    );

    const download = screen.getByTestId('export-icon');
    fireEvent.click(download);
    expect(onDownload).toHaveBeenCalledWith(installer);
  });

  test('checksum icon calls onAgentInstallerChecksumClick', () => {
    const onChecksum = testing.fn();

    const {render} = rendererWithTableRow({capabilities: true});
    render(
      <AgentInstallerActions
        entity={installer}
        onAgentInstallerChecksumClick={onChecksum}
      />,
    );

    const checksum = screen.getByTestId('fingerprint-icon');
    fireEvent.click(checksum);
    expect(onChecksum).toHaveBeenCalledWith(installer);
  });

  test('checksum icon is disabled when checksum is not available', () => {
    const installerWithoutChecksum = new AgentInstaller({
      id: '2',
      name: 'Agent Installer 2',
      userCapabilities: new EverythingCapabilities(),
    });

    const {render} = rendererWithTableRow({capabilities: true});
    render(<AgentInstallerActions entity={installerWithoutChecksum} />);

    const checksum = screen.getByTestId('fingerprint-icon');
    expect(checksum).toBeDisabled();
  });

  test('should render actions correctly', () => {
    const {render} = rendererWithTableRow({capabilities: true});
    render(<AgentInstallerActions entity={installer} />);

    expect(screen.getByTestId('export-icon')).toBeInTheDocument();
    expect(screen.getByTestId('fingerprint-icon')).toBeInTheDocument();
  });
});
