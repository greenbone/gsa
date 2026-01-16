/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, expect, test, testing} from '@gsa/testing';
import {fireEvent, rendererWithTableBody, screen} from 'web/testing';
import dayjs from 'dayjs';
import EverythingCapabilities from 'gmp/capabilities/everything';
import AgentGroup from 'gmp/models/agent-group';
import AgentGroupsTableRow from 'web/pages/agent-groups/AgentGroupsTableRow';

describe('AgentGroupsTableRow tests', () => {
  test('renders name, scanner (or None), agent count and Never for empty modification', () => {
    const group = new AgentGroup({
      id: '1',
      name: 'Group 1',
      agents: [{id: 'a1'}, {id: 'a2'}],
    });

    const {render} = rendererWithTableBody({capabilities: true});
    render(<AgentGroupsTableRow entity={group} />);

    expect(screen.getByText('Group 1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('Never')).toBeInTheDocument();

    // when scanner missing we expect 'None' rendered as italic
    expect(screen.getByText('None')).toBeInTheDocument();
  });

  test('renders scanner name and modification time when present', () => {
    const group = new AgentGroup({
      id: '2',
      name: 'Group 2',
      scanner: {id: 's1', name: 'Scanner 1'},
      agents: [{id: 'a1'}],
      modificationTime: dayjs('2020-01-01T00:00:00Z'),
    });

    const {render} = rendererWithTableBody({capabilities: true});
    render(<AgentGroupsTableRow entity={group} />);

    expect(screen.getByText('Scanner 1')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.queryByText('Never')).not.toBeInTheDocument();
  });

  test('action handlers are called', () => {
    const group = new AgentGroup({
      id: '3',
      name: 'Group 3',
      userCapabilities: new EverythingCapabilities(),
    });

    const onEdit = testing.fn();
    const onClone = testing.fn();
    const onDelete = testing.fn();

    const {render} = rendererWithTableBody({capabilities: true});
    render(
      <AgentGroupsTableRow
        entity={group}
        onAgentGroupCloneClick={onClone}
        onAgentGroupDeleteClick={onDelete}
        onAgentGroupEditClick={onEdit}
      />,
    );

    const edit = screen.getByTestId('edit-icon');
    fireEvent.click(edit);
    expect(onEdit).toHaveBeenCalledWith(group);

    const clone = screen.getByTestId('clone-icon');
    fireEvent.click(clone);
    expect(onClone).toHaveBeenCalledWith(group);

    const del = screen.getByTestId('trashcan-icon');
    fireEvent.click(del);
    expect(onDelete).toHaveBeenCalledWith(group);
  });
});
