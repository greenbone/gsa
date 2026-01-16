/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, expect, test, testing} from '@gsa/testing';
import {fireEvent, rendererWith, screen} from 'web/testing';
import EverythingCapabilities from 'gmp/capabilities/everything';
import AgentGroup from 'gmp/models/agent-group';
import AgentGroupsTable from 'web/pages/agent-groups/AgentGroupsTable';

describe('AgentGroupsTable tests', () => {
  test('should render without crashing', () => {
    const groups = [
      new AgentGroup({id: '1', name: 'Group 1'}),
      new AgentGroup({id: '2', name: 'Group 2'}),
    ];

    const {render} = rendererWith({capabilities: true});
    render(<AgentGroupsTable entities={groups} />);
    expect(screen.getByTestId('entities-table')).toBeInTheDocument();
  });

  test('should render the empty title when no groups are available', () => {
    const {render} = rendererWith({capabilities: true});
    render(<AgentGroupsTable entities={[]} />);
    expect(screen.getByText('No agent groups available')).toBeInTheDocument();
    expect(screen.queryByTestId('entities-table')).not.toBeInTheDocument();
  });

  test("should not render anything if groups aren't provided", () => {
    const {render} = rendererWith({capabilities: true});
    render(<AgentGroupsTable />);
    expect(screen.queryByTestId('entities-table')).not.toBeInTheDocument();
  });

  test('should render groups and columns', () => {
    const groups = [
      new AgentGroup({
        id: '1',
        name: 'Group 1',
        scanner: {id: 's1', name: 'Scanner 1'},
        agents: [{id: 'a1'}],
      }),
      new AgentGroup({id: '2', name: 'Group 2'}),
    ];

    const {render} = rendererWith({capabilities: true});
    render(<AgentGroupsTable entities={groups} />);

    expect(screen.getByText('Group 1')).toBeInTheDocument();
    expect(screen.getByText('Group 2')).toBeInTheDocument();

    const rows = screen.queryAllByRole('row');
    expect(rows.length).toEqual(groups.length + 2); // header + footer
    const headers = screen.queryAllByRole('columnheader');
    expect(headers.length).toBeGreaterThan(0);
  });

  test('should call action handlers when provided', () => {
    const groups = [
      new AgentGroup({
        id: '1',
        name: 'Group 1',
        userCapabilities: new EverythingCapabilities(),
      }),
    ];

    const handleClone = testing.fn();
    const handleDelete = testing.fn();
    const handleEdit = testing.fn();

    const {render} = rendererWith({capabilities: true});
    render(
      <AgentGroupsTable
        entities={groups}
        onAgentGroupCloneClick={handleClone}
        onAgentGroupDeleteClick={handleDelete}
        onAgentGroupEditClick={handleEdit}
      />,
    );

    const cloneButton = screen.getByRole('button', {name: /clone/i});
    fireEvent.click(cloneButton);
    expect(handleClone).toHaveBeenCalledWith(groups[0]);

    const deleteButton = screen.getAllByRole('button', {name: /delete/i})[0];
    fireEvent.click(deleteButton);
    expect(handleDelete).toHaveBeenCalledWith(groups[0]);

    const editButton = screen.getByRole('button', {name: /edit/i});
    fireEvent.click(editButton);
    expect(handleEdit).toHaveBeenCalledWith(groups[0]);
  });
});
