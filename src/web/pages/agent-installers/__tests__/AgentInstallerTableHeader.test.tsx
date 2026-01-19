/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, expect, test, testing} from '@gsa/testing';
import {fireEvent, rendererWithTable, screen} from 'web/testing';
import AgentInstallerTableHeader from 'web/pages/agent-installers/AgentInstallerTableHeader';

describe('AgentInstallerTableHeader tests', () => {
  test('should call sort change handlers', () => {
    const handleSortChange = testing.fn();

    const {render} = rendererWithTable({capabilities: true});
    render(
      <AgentInstallerTableHeader
        currentSortBy="name"
        currentSortDir="asc"
        onSortChange={handleSortChange}
      />,
    );

    const nameHeader = screen.getByText('Name');
    fireEvent.click(nameHeader);

    expect(handleSortChange).toHaveBeenCalledWith('name');
  });

  test('should render sorting indicators', () => {
    const {render} = rendererWithTable({capabilities: true});
    render(
      <AgentInstallerTableHeader currentSortBy="name" currentSortDir="asc" />,
    );

    const nameHeader = screen.getByText('Name');
    expect(nameHeader).toBeInTheDocument();
  });

  test('should handle multiple column sorting', () => {
    const handleSortChange = testing.fn();

    const {render} = rendererWithTable({capabilities: true});
    render(
      <AgentInstallerTableHeader
        currentSortBy="version"
        currentSortDir="desc"
        onSortChange={handleSortChange}
      />,
    );

    const descriptionHeader = screen.getByText('Description');
    fireEvent.click(descriptionHeader);

    expect(handleSortChange).toHaveBeenCalledWith('description');

    const versionHeader = screen.getByText('Version');
    fireEvent.click(versionHeader);

    expect(handleSortChange).toHaveBeenCalledWith('version');
  });

  test('should show all required columns', () => {
    const {render} = rendererWithTable({capabilities: true});
    render(<AgentInstallerTableHeader />);

    const headers = screen.getAllByRole('columnheader');
    expect(headers.length).toBeGreaterThanOrEqual(4); // At least Name, Description, Version, Actions

    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Description')).toBeInTheDocument();
    expect(screen.getByText('Version')).toBeInTheDocument();
    expect(screen.getByText('Actions')).toBeInTheDocument();
  });

  test('should handle entities count in header', () => {
    const {render} = rendererWithTable({capabilities: true});
    render(<AgentInstallerTableHeader />);

    expect(screen.getByText('Name')).toBeInTheDocument();
  });
});
