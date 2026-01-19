/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, expect, test, testing} from '@gsa/testing';
import {fireEvent, rendererWith, screen, within} from 'web/testing';
import dayjs from 'dayjs';
import EverythingCapabilities from 'gmp/capabilities/everything';
import Agent from 'gmp/models/agent';
import AgentTable from 'web/pages/agents/AgentTable';

describe('AgentTable tests', () => {
  test('should render without crashing', () => {
    const agents = [
      new Agent({id: '1', name: 'Agent 1', authorized: true}),
      new Agent({id: '2', name: 'Agent 2', authorized: false}),
    ];

    const {render} = rendererWith({capabilities: true});
    render(<AgentTable entities={agents} />);
    expect(screen.getByTestId('entities-table')).toBeInTheDocument();
  });

  test('should render the empty title when no agents are available', () => {
    const {render} = rendererWith({capabilities: true});
    render(<AgentTable entities={[]} />);
    expect(screen.getByText('No agents available')).toBeInTheDocument();
    expect(screen.queryByTestId('entities-table')).not.toBeInTheDocument();
  });

  test("should not render anything if agents aren't provided", () => {
    const {render} = rendererWith({capabilities: true});
    render(<AgentTable />);
    expect(screen.queryByTestId('entities-table')).not.toBeInTheDocument();
  });

  test('should render agents and columns', () => {
    const agents = [
      new Agent({
        id: '1',
        name: 'Agent 1',
        authorized: true,
        hostname: '192.168.1.1',
        lastUpdate: dayjs('2026-01-01T10:00:00.000Z'),
      }),
      new Agent({
        id: '2',
        name: 'Agent 2',
        authorized: false,
        hostname: '192.168.1.2',
      }),
    ];

    const {render} = rendererWith({capabilities: true});
    render(<AgentTable entities={agents} />);

    expect(screen.getByText('Agent 1')).toBeInTheDocument();
    expect(screen.getByText('Agent 2')).toBeInTheDocument();

    expect(screen.getByText('Agent')).toBeInTheDocument();
    expect(screen.getByText('Network')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('Last Contact')).toBeInTheDocument();
    expect(screen.getByText('Authorized')).toBeInTheDocument();
    expect(screen.getByText('Actions')).toBeInTheDocument();
  });

  test('should call onAgentEditClick when edit action is triggered', () => {
    const agents = [
      new Agent({
        id: '1',
        name: 'Agent 1',
        authorized: true,
        userCapabilities: new EverythingCapabilities(),
      }),
    ];
    const onEdit = testing.fn();

    const {render} = rendererWith({capabilities: true});
    render(<AgentTable entities={agents} onAgentEditClick={onEdit} />);

    const editIcon = screen.getByTestId('edit-icon');
    fireEvent.click(editIcon);

    expect(onEdit).toHaveBeenCalledWith(agents[0]);
  });

  test('should call onAgentDeleteClick when delete action is triggered', () => {
    const agents = [
      new Agent({
        id: '1',
        name: 'Agent 1',
        authorized: true,
        userCapabilities: new EverythingCapabilities(),
      }),
    ];
    const onDelete = testing.fn();

    const {render} = rendererWith({capabilities: true});
    render(<AgentTable entities={agents} onAgentDeleteClick={onDelete} />);

    const actionsCell = screen.getByTestId('entities-actions');
    const deleteIcon = within(actionsCell).getByTestId('delete-icon');
    fireEvent.click(deleteIcon);

    expect(onDelete).toHaveBeenCalledWith(agents[0]);
  });

  test('should call onAgentAuthorizeClick when authorize action is triggered', () => {
    const agents = [
      new Agent({
        id: '1',
        name: 'Agent 1',
        authorized: false,
        userCapabilities: new EverythingCapabilities(),
      }),
    ];
    const onAuthorize = testing.fn();

    const {render} = rendererWith({capabilities: true});
    render(
      <AgentTable entities={agents} onAgentAuthorizeClick={onAuthorize} />,
    );

    const actionsCell = screen.getByTestId('entities-actions');
    const authorizeIcon = within(actionsCell).getByTestId('circle-plus-icon');
    fireEvent.click(authorizeIcon);

    expect(onAuthorize).toHaveBeenCalledWith(agents[0]);
  });
});
