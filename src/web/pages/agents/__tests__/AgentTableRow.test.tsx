/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, expect, test, testing} from '@gsa/testing';
import {fireEvent, rendererWith, screen} from 'web/testing';
import dayjs from 'dayjs';
import EverythingCapabilities from 'gmp/capabilities/everything';
import Agent, {OperatingSystemStatus} from 'gmp/models/agent';
import AgentTableRow from 'web/pages/agents/AgentTableRow';
import Theme from 'web/utils/theme';

describe('AgentTableRow tests', () => {
  test('should render authorized agent correctly', () => {
    const authorizedAgent = new Agent({
      id: '1',
      name: 'Authorized Agent',
      authorized: true,
      scanner: {id: 'scanner-1', name: 'OpenVAS Scanner'},
      agentVersion: '22.4.0',
      lastUpdate: dayjs('2026-01-01T10:00:00.000Z'),
      userCapabilities: new EverythingCapabilities(),
    });

    const {render} = rendererWith({capabilities: true});

    render(<AgentTableRow entity={authorizedAgent} />);
    expect(screen.getByText('Authorized Agent')).toBeInTheDocument();
    expect(screen.getByText('Yes')).toBeInTheDocument();

    expect(screen.getByText('OpenVAS Scanner')).toBeInTheDocument();
    expect(screen.getByText('22.4.0')).toBeInTheDocument();
    expect(screen.getByTitle(/Thu.*Jan.*2026/)).toBeInTheDocument();
  });

  test('should show the OS name, support status, and CPE title', () => {
    const cpe = 'cpe:2.3:o:debian:debian:11:-:-:-:-:-:x86_64:-';
    const agent = new Agent({
      id: 'agent-1',
      osCpe: cpe,
      osStatus: OperatingSystemStatus.supported,
    });

    const {render} = rendererWith({capabilities: true});
    render(<AgentTableRow entity={agent} />);

    const osName = screen.getByText('debian');
    expect(osName).toBeInTheDocument();
    expect(
      screen.getByRole('img', {
        name: 'Operating system support status: supported',
      }),
    ).toHaveStyle({backgroundColor: '#11ab51'});

    expect(osName).toHaveAttribute('title', cpe);
  });

  test.each([OperatingSystemStatus.unsupported, OperatingSystemStatus.unknown])(
    'should show warning support status for %s operating systems',
    status => {
      const agent = new Agent({id: 'agent-1', osStatus: status});
      const {render} = rendererWith({capabilities: true});
      render(<AgentTableRow entity={agent} />);

      expect(
        screen.getByRole('img', {
          name: `Operating system support status: ${status}`,
        }),
      ).toHaveStyle({backgroundColor: Theme.severityWarnYellow});
    },
  );

  test.each([
    [
      'cpe:2.3:o:canonical:ubuntu_linux:24.04:-:-:-:-:-:x86_64:-',
      'ubuntu linux',
    ],
    ['cpe:2.3:o:almalinux:almalinux:9:-:-:-:-:-:x86_64:-', 'almalinux'],
    ['cpe:2.3:o:somevendor:someproduct:37:-:-:-:-:-:x86_64:-', 'someproduct'],
  ])('should display the distribution name for %s', (osCpe, name) => {
    const {render} = rendererWith({capabilities: true});
    render(
      <AgentTableRow
        entity={new Agent({id: 'agent-1', operatingSystem: 'linux', osCpe})}
      />,
    );

    expect(screen.getByText(name)).toBeInTheDocument();
    expect(screen.queryByText('linux')).not.toBeInTheDocument();
  });

  test.each([
    undefined,
    'not a CPE',
    'cpe:2.3:o:vendor:*:1:-:-:-:-:-:x86_64:-',
  ])('should fall back to the backend OS name for %s', osCpe => {
    const {render} = rendererWith({capabilities: true});
    render(
      <AgentTableRow
        entity={
          new Agent({
            id: 'agent-1',
            operatingSystem: 'Backend OS name',
            osCpe,
          })
        }
      />,
    );

    expect(screen.getByText('Backend OS name')).toBeInTheDocument();
  });

  test.each([
    {operatingSystem: 'linux', name: 'linux'},
    {operatingSystem: undefined, name: 'Unknown'},
  ])('should explain missing OS CPE for $name', ({operatingSystem, name}) => {
    const {render} = rendererWith({capabilities: true});
    render(
      <AgentTableRow
        entity={new Agent({id: 'agent-1', operatingSystem, osCpe: ''})}
      />,
    );

    const status = screen.getByRole('img', {
      name: 'Operating system support status: unknown',
    });
    const osName = screen.getByText(name, {selector: 'span[title]'});
    expect(osName).toBeInTheDocument();
    expect(osName).toHaveAttribute(
      'title',
      'No OS CPE was reported.\nOperating system support status is unknown.',
    );
    expect(status).toHaveStyle({backgroundColor: Theme.severityWarnYellow});
  });

  test('should retain the CPE when explaining unknown support status', () => {
    const osCpe = 'cpe:2.3:o:debian:debian:11:-:-:-:-:-:x86_64:-';
    const {render} = rendererWith({capabilities: true});
    render(
      <AgentTableRow
        entity={
          new Agent({
            id: 'agent-1',
            osCpe,
            osStatus: OperatingSystemStatus.unknown,
          })
        }
      />,
    );

    expect(screen.getByText('debian')).toHaveAttribute(
      'title',
      `${osCpe}\nOperating system support status is unknown.`,
    );
  });

  test('should call action handlers when icons are clicked', () => {
    const agent = new Agent({
      id: '1',
      name: 'Agent 1',
      authorized: true,
      userCapabilities: new EverythingCapabilities(),
    });

    const onEdit = testing.fn();
    const onDelete = testing.fn();
    const onAuthorize = testing.fn();

    const {render} = rendererWith({capabilities: true});
    render(
      <AgentTableRow
        entity={agent}
        onAgentAuthorizeClick={onAuthorize}
        onAgentDeleteClick={onDelete}
        onAgentEditClick={onEdit}
      />,
    );

    const editIcon = screen.getByTestId('edit-icon');
    const deleteIcon = screen.getByTestId('delete-icon');
    const revokeIcon = screen.getByTestId('circle-minus-icon');

    fireEvent.click(editIcon);
    expect(onEdit).toHaveBeenCalledWith(agent);

    fireEvent.click(deleteIcon);
    expect(onDelete).toHaveBeenCalledWith(agent);

    fireEvent.click(revokeIcon);
    expect(onAuthorize).toHaveBeenCalledWith(agent);
  });

  test('should display "Never" when last update is not available', () => {
    const agent = new Agent({
      id: '1',
      name: 'Agent 1',
      authorized: true,
      userCapabilities: new EverythingCapabilities(),
    });

    const {render} = rendererWith({capabilities: true});
    render(<AgentTableRow entity={agent} />);

    const lastUpdateCell = screen.getByTitle('Last Contact: Never');
    expect(lastUpdateCell).toBeInTheDocument();
  });

  test('should render agent version and updater version with Divider', () => {
    const agent = new Agent({
      id: '1',
      name: 'Agent 1',
      authorized: true,
      agentVersion: '22.4.0',
      latestAgentVersion: '22.4.1',
      userCapabilities: new EverythingCapabilities(),
    });

    const {render} = rendererWith({capabilities: true});
    render(<AgentTableRow entity={agent} />);

    expect(screen.getByText('22.4.0')).toBeInTheDocument();
    expect(screen.getByText(/Update available to:/)).toBeInTheDocument();
    expect(screen.getByText(/22\.4\.1/)).toBeInTheDocument();
  });

  test('should call download support bundle handler', () => {
    const agent = new Agent({
      id: '1',
      name: 'Agent 1',
      authorized: true,
      userCapabilities: new EverythingCapabilities(),
    });

    const onDownloadSupportBundle = testing.fn();

    const {render} = rendererWith({capabilities: true});
    render(
      <AgentTableRow
        entity={agent}
        onAgentDownloadSupportBundleClick={onDownloadSupportBundle}
      />,
    );

    fireEvent.click(screen.getByTestId('export-icon'));

    expect(onDownloadSupportBundle).toHaveBeenCalledWith(agent);
  });

  test('should include IP addresses in the name cell title when available', () => {
    const agent = new Agent({
      id: '1',
      name: 'Agent 1',
      authorized: true,
      ipAddresses: ['192.168.0.1', '10.0.0.2'],
      userCapabilities: new EverythingCapabilities(),
    });

    const {render} = rendererWith({capabilities: true});
    render(<AgentTableRow entity={agent} />);

    screen.getByTitle(/IP Addresses: 192.168.0.1, 10.0.0.2/);
  });

  test('should display "None" when ipAddresses is not provided', () => {
    const agent = new Agent({
      id: '1',
      name: 'Agent 1',
      authorized: true,
      userCapabilities: new EverythingCapabilities(),
    });

    const {render} = rendererWith({capabilities: true});
    render(<AgentTableRow entity={agent} />);

    screen.getByTitle('IP Addresses: None');
  });
});
