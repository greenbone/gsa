/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, expect, test, testing} from '@gsa/testing';
import {fireEvent, rendererWithTable, screen} from 'web/testing';
import AgentGroupsTableHeader from 'web/pages/agent-groups/AgentGroupsTableHeader';

describe('AgentGroupsTableHeader tests', () => {
  test('should render the table header', () => {
    const handleSortChange = testing.fn();
    const {render} = rendererWithTable();
    render(
      <AgentGroupsTableHeader
        currentSortBy="name"
        currentSortDir="asc"
        sort={true}
        onSortChange={handleSortChange}
      />,
    );

    expect(screen.getByText('Group Name')).toBeInTheDocument();
    expect(screen.getByText('Network (Controller Name)')).toBeInTheDocument();
    expect(screen.getByText('# of Agents')).toBeInTheDocument();
    expect(screen.getByText('Last Update')).toBeInTheDocument();
    expect(screen.getByText('Actions')).toBeInTheDocument();
  });

  test('should call onSortChange when a sortable column is clicked', () => {
    const handleSortChange = testing.fn();
    const {render} = rendererWithTable();
    render(
      <AgentGroupsTableHeader
        currentSortBy="name"
        currentSortDir="asc"
        sort={true}
        onSortChange={handleSortChange}
      />,
    );

    const nameColumn = screen.getByText('Group Name');
    fireEvent.click(nameColumn);
    expect(handleSortChange).toHaveBeenCalledWith('name');
  });

  test('should allow to deactivate sorting functionality', () => {
    const handleSortChange = testing.fn();
    const {render} = rendererWithTable();
    render(
      <AgentGroupsTableHeader
        currentSortBy="name"
        currentSortDir="asc"
        sort={false}
        onSortChange={handleSortChange}
      />,
    );

    const nameColumn = screen.getByText('Group Name');
    fireEvent.click(nameColumn);
    expect(handleSortChange).not.toHaveBeenCalled();
  });
});
