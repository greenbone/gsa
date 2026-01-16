/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, expect, test, testing} from '@gsa/testing';
import {fireEvent, rendererWithTableRow, screen} from 'web/testing';
import EverythingCapabilities from 'gmp/capabilities/everything';
import AgentGroup from 'gmp/models/agent-group';
import AgentGroupsActions from 'web/pages/agent-groups/AgentGroupsActions';

const group = new AgentGroup({
  id: '1',
  name: 'Group 1',
  userCapabilities: new EverythingCapabilities(),
});

describe('AgentGroupsActions tests', () => {
  test('edit icon calls onAgentGroupEditClick', () => {
    const onEdit = testing.fn();

    const {render} = rendererWithTableRow({capabilities: true});
    render(
      <AgentGroupsActions entity={group} onAgentGroupEditClick={onEdit} />,
    );

    const edit = screen.getByTestId('edit-icon');
    fireEvent.click(edit);
    expect(onEdit).toHaveBeenCalledWith(group);
  });

  test('clone icon calls onAgentGroupCloneClick', () => {
    const onClone = testing.fn();

    const {render} = rendererWithTableRow({capabilities: true});
    render(
      <AgentGroupsActions entity={group} onAgentGroupCloneClick={onClone} />,
    );

    const clone = screen.getByTestId('clone-icon');
    fireEvent.click(clone);
    expect(onClone).toHaveBeenCalledWith(group);
  });

  test('trashcan icon calls onAgentGroupDeleteClick', () => {
    const onDelete = testing.fn();

    const {render} = rendererWithTableRow({capabilities: true});
    render(
      <AgentGroupsActions entity={group} onAgentGroupDeleteClick={onDelete} />,
    );

    const del = screen.getByTestId('trashcan-icon');
    fireEvent.click(del);
    expect(onDelete).toHaveBeenCalledWith(group);
  });
});
