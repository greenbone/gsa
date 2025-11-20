/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, expect, test, testing} from '@gsa/testing';
import {rendererWithTable, screen, fireEvent} from 'web/testing';
import TargetTableHeader from 'web/pages/targets/TargetTableHeader';

describe('TargetTableHeader tests', () => {
  test('should render the table header', () => {
    const handleSortChange = testing.fn();
    const {render} = rendererWithTable();
    render(
      <TargetTableHeader
        currentSortBy="name"
        currentSortDir="asc"
        sort={true}
        onSortChange={handleSortChange}
      />,
    );
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Hosts')).toBeInTheDocument();
    expect(screen.getByText('IPs')).toBeInTheDocument();
    expect(screen.getByText('Port List')).toBeInTheDocument();
    expect(screen.getByText('Actions')).toBeInTheDocument();
  });

  test('should allow to render custom actions', () => {
    const actionsColumn = <th>Custom Actions</th>;
    const handleSortChange = testing.fn();
    const {render} = rendererWithTable();
    render(
      <TargetTableHeader
        actionsColumn={actionsColumn}
        currentSortBy="name"
        currentSortDir="asc"
        sort={true}
        onSortChange={handleSortChange}
      />,
    );
    expect(screen.getByText('Custom Actions')).toBeInTheDocument();
  });

  test('should call onSortChange when a sortable column is clicked', () => {
    const handleSortChange = testing.fn();
    const {render} = rendererWithTable();
    render(
      <TargetTableHeader
        currentSortBy="name"
        currentSortDir="asc"
        sort={true}
        onSortChange={handleSortChange}
      />,
    );
    const nameColumn = screen.getByText('Name');
    fireEvent.click(nameColumn);
    expect(handleSortChange).toHaveBeenCalledWith('name');
  });

  test('should allow to deactivate sorting functionality', () => {
    const handleSortChange = testing.fn();
    const {render} = rendererWithTable();
    render(
      <TargetTableHeader
        currentSortBy="name"
        currentSortDir="asc"
        sort={false}
        onSortChange={handleSortChange}
      />,
    );
    const nameColumn = screen.getByText('Name');
    fireEvent.click(nameColumn);
    expect(handleSortChange).not.toHaveBeenCalled();
  });
});
