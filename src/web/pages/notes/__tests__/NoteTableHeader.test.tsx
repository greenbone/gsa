/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, expect, test, testing} from '@gsa/testing';
import {rendererWithTable, screen, fireEvent} from 'web/testing';
import NoteTableHeader from 'web/pages/notes/NoteTableHeader';

describe('NoteTableHeader tests', () => {
  test('should render the table header', () => {
    const handleSortChange = testing.fn();
    const {render} = rendererWithTable();
    render(
      <NoteTableHeader
        currentSortBy="text"
        currentSortDir="asc"
        sort={true}
        onSortChange={handleSortChange}
      />,
    );

    expect(screen.getByText('Text')).toBeInTheDocument();
    expect(screen.getByText('NVT')).toBeInTheDocument();
    expect(screen.getByText('Hosts')).toBeInTheDocument();
    expect(screen.getByText('Location')).toBeInTheDocument();
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  test('should allow to render custom actions', () => {
    const actionsColumn = <th>Custom Actions</th>;
    const handleSortChange = testing.fn();
    const {render} = rendererWithTable();
    render(
      <NoteTableHeader
        actionsColumn={actionsColumn}
        currentSortBy="text"
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
      <NoteTableHeader
        currentSortBy="text"
        currentSortDir="asc"
        sort={true}
        onSortChange={handleSortChange}
      />,
    );

    const textColumn = screen.getByText('Text');
    fireEvent.click(textColumn);
    expect(handleSortChange).toHaveBeenCalledWith('text');
  });

  test('should allow to deactivate sorting functionality', () => {
    const handleSortChange = testing.fn();
    const {render} = rendererWithTable();
    render(
      <NoteTableHeader
        currentSortBy="text"
        currentSortDir="asc"
        sort={false}
        onSortChange={handleSortChange}
      />,
    );

    const textColumn = screen.getByText('Text');
    fireEvent.click(textColumn);
    expect(handleSortChange).not.toHaveBeenCalled();
  });
});
