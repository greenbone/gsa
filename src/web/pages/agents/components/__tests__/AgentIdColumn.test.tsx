/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {
  screen,
  rendererWith,
  rendererWithTableRow,
  fireEvent,
} from 'web/testing';
import Features from 'gmp/capabilities/features';
import {
  AgentIdTableHead,
  AgentIdTableData,
} from 'web/pages/agents/components/AgentIdColumn';

describe('AgentIdTableHead', () => {
  test('should render when ENABLE_AGENTS feature is enabled', () => {
    const {render} = rendererWithTableRow({
      features: new Features(['ENABLE_AGENTS']),
    });
    render(<AgentIdTableHead />);

    expect(screen.getByRole('columnheader')).toBeInTheDocument();
    expect(screen.getByText('Agent ID')).toBeInTheDocument();
  });

  test('should not render when ENABLE_AGENTS feature is disabled', () => {
    const {render} = rendererWith({});
    const {container} = render(<AgentIdTableHead />);

    expect(container.firstChild).toBeNull();
  });

  test('should render with sortable props when sort is enabled', () => {
    const {render} = rendererWithTableRow({
      features: new Features(['ENABLE_AGENTS']),
    });
    const handleSortChange = testing.fn();
    render(
      <AgentIdTableHead
        currentSortBy="agentId"
        currentSortDir="asc"
        sort={true}
        onSortChange={handleSortChange}
      />,
    );

    expect(screen.getByRole('columnheader')).toBeInTheDocument();
    expect(screen.getByText('Agent ID')).toBeInTheDocument();
    expect(screen.getByTestId('arrow-up-icon')).toBeVisible();
    expect(
      screen.getByTitle('Sorted In Ascending Order By Agent ID'),
    ).toBeVisible();

    const sortButton = screen.getByRole('button');
    fireEvent.click(sortButton);
    expect(handleSortChange).toHaveBeenCalledWith('agentId');
  });

  test('should not be sortable when sort is disabled', () => {
    const {render} = rendererWithTableRow({
      features: new Features(['ENABLE_AGENTS']),
    });
    const handleSortChange = testing.fn();
    render(<AgentIdTableHead sort={false} onSortChange={handleSortChange} />);

    expect(screen.getByRole('columnheader')).toBeInTheDocument();
    expect(
      screen.queryByTestId('table-header-sort-by-agentId'),
    ).not.toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});

describe('AgentIdTableData', () => {
  test('should render with agent ID when ENABLE_AGENTS feature is enabled', () => {
    const {render} = rendererWithTableRow({
      features: new Features(['ENABLE_AGENTS']),
    });
    render(<AgentIdTableData agentId="test-agent-123" />);

    expect(screen.getByRole('cell')).toBeInTheDocument();
    expect(screen.getByText('test-agent-123')).toBeInTheDocument();
  });

  test('should not render when ENABLE_AGENTS feature is disabled', () => {
    const {render} = rendererWith({});
    const {container} = render(<AgentIdTableData agentId="test-agent-123" />);

    expect(container.firstChild).toBeNull();
    expect(screen.queryByText('test-agent-123')).not.toBeInTheDocument();
  });

  test('should render empty cell when agentId is undefined', () => {
    const {render} = rendererWithTableRow({
      features: new Features(['ENABLE_AGENTS']),
    });
    render(<AgentIdTableData />);

    const cell = screen.getByRole('cell');
    expect(cell).toBeInTheDocument();
    expect(cell).toHaveTextContent('');
  });

  test('should render with empty string agentId', () => {
    const {render} = rendererWithTableRow({
      features: new Features(['ENABLE_AGENTS']),
    });
    render(<AgentIdTableData agentId="" />);

    const cell = screen.getByRole('cell');
    expect(cell).toBeInTheDocument();
    expect(cell).toHaveTextContent('');
  });
});
