/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, expect, test, testing} from '@gsa/testing';
import {fireEvent, rendererWith, screen} from 'web/testing';
import dayjs from 'dayjs';
import EverythingCapabilities from 'gmp/capabilities/everything';
import Agent from 'gmp/models/agent';
import AgentTableRow from 'web/pages/agents/AgentTableRow';

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

    const lastUpdateCell = screen.getByTitle('Never');
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
});
