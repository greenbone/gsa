/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, expect, test, testing} from '@gsa/testing';
import {fireEvent, rendererWithTableRow, screen} from 'web/testing';
import EverythingCapabilities from 'gmp/capabilities/everything';
import Agent from 'gmp/models/agent';
import AgentActions from 'web/pages/agents/AgentActions';

const agent = new Agent({
  id: '1',
  name: 'Agent 1',
  authorized: true,
  userCapabilities: new EverythingCapabilities(),
});

const unauthorizedAgent = new Agent({
  id: '2',
  name: 'Agent 2',
  authorized: false,
  userCapabilities: new EverythingCapabilities(),
});

describe('AgentActions tests', () => {
  test('edit icon calls onAgentEditClick', () => {
    const onEdit = testing.fn();

    const {render} = rendererWithTableRow({capabilities: true});
    render(<AgentActions entity={agent} onAgentEditClick={onEdit} />);

    const edit = screen.getByTestId('edit-icon');
    fireEvent.click(edit);
    expect(onEdit).toHaveBeenCalledWith(agent);
  });

  test('authorize icon calls onAgentAuthorizeClick for unauthorized agent', () => {
    const onAuthorize = testing.fn();

    const {render} = rendererWithTableRow({capabilities: true});
    render(
      <AgentActions
        entity={unauthorizedAgent}
        onAgentAuthorizeClick={onAuthorize}
      />,
    );

    const authorize = screen.getByTestId('circle-plus-icon');
    fireEvent.click(authorize);
    expect(onAuthorize).toHaveBeenCalledWith(unauthorizedAgent);
  });

  test('revoke icon calls onAgentAuthorizeClick for authorized agent', () => {
    const onAuthorize = testing.fn();

    const {render} = rendererWithTableRow({capabilities: true});
    render(<AgentActions entity={agent} onAgentAuthorizeClick={onAuthorize} />);

    const revoke = screen.getByTestId('circle-minus-icon');
    fireEvent.click(revoke);
    expect(onAuthorize).toHaveBeenCalledWith(agent);
  });

  test('delete icon calls onAgentDeleteClick', () => {
    const onDelete = testing.fn();

    const {render} = rendererWithTableRow({capabilities: true});
    render(<AgentActions entity={agent} onAgentDeleteClick={onDelete} />);

    const deleteIcon = screen.getByTestId('delete-icon');
    fireEvent.click(deleteIcon);
    expect(onDelete).toHaveBeenCalledWith(agent);
  });

  test('should not call actions if handlers are not provided', () => {
    const onEdit = testing.fn();
    const onAuthorize = testing.fn();
    const onDelete = testing.fn();

    const {render} = rendererWithTableRow({capabilities: true});
    render(<AgentActions entity={agent} />);

    const edit = screen.getByTestId('edit-icon');
    const authorize = screen.getByTestId('circle-minus-icon');
    const deleteIcon = screen.getByTestId('delete-icon');

    expect(() => {
      fireEvent.click(edit);
      fireEvent.click(authorize);
      fireEvent.click(deleteIcon);
    }).not.toThrow();

    expect(onEdit).not.toHaveBeenCalled();
    expect(onAuthorize).not.toHaveBeenCalled();
    expect(onDelete).not.toHaveBeenCalled();
  });
});
