/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, expect, test, testing} from '@gsa/testing';
import {rendererWithTableHeader, screen, fireEvent} from 'web/testing';
import TicketsTableHeader from 'web/pages/tickets/TicketsTableHeader';
import SelectionType from 'web/utils/selection-type';

describe('TicketsTableHeader', () => {
  test('should render all ticket list columns with actions column', () => {
    const onSortChange = testing.fn();
    const {render} = rendererWithTableHeader();

    render(
      <TicketsTableHeader
        currentSortBy="name"
        currentSortDir="asc"
        selectionType={SelectionType.SELECTION_USER}
        onSortChange={onSortChange}
      />,
    );

    screen.getByTestId('table-header-sort-by-name');
    screen.getByTestId('table-header-sort-by-severity');
    screen.getByTestId('table-header-sort-by-host');
    screen.getByTestId('table-header-sort-by-solution_type');
    screen.getByTestId('table-header-sort-by-username');
    screen.getByTestId('table-header-sort-by-modified');
    screen.getByTestId('table-header-sort-by-status');
    screen.getByRole('columnheader', {name: 'Actions'});
  });

  test('should disable sorting when sort is false', () => {
    const {render} = rendererWithTableHeader();
    render(
      <TicketsTableHeader
        selectionType={SelectionType.SELECTION_USER}
        sort={false}
        onSortChange={testing.fn()}
      />,
    );

    expect(screen.queryByTestId('table-header-sort-by-name')).toBeNull();
    expect(screen.queryByTestId('table-header-sort-by-severity')).toBeNull();
  });

  test.each([
    {sortBy: 'name' as const},
    {sortBy: 'severity' as const},
    {sortBy: 'host' as const},
    {sortBy: 'solution_type' as const},
    {sortBy: 'username' as const},
    {sortBy: 'modified' as const},
    {sortBy: 'status' as const},
  ])(
    'should call onSortChange with $sortBy when clicking column',
    ({sortBy}) => {
      const onSortChange = testing.fn();
      const {render} = rendererWithTableHeader();
      render(
        <TicketsTableHeader
          currentSortBy="name"
          currentSortDir="asc"
          selectionType={SelectionType.SELECTION_USER}
          onSortChange={onSortChange}
        />,
      );

      fireEvent.click(screen.getByTestId(`table-header-sort-by-${sortBy}`));
      expect(onSortChange).toHaveBeenCalledWith(sortBy);
    },
  );

  test('should render ascending sort indicator for current sort column', () => {
    const {render} = rendererWithTableHeader();
    render(
      <TicketsTableHeader
        currentSortBy="name"
        currentSortDir="asc"
        selectionType={SelectionType.SELECTION_USER}
        onSortChange={testing.fn()}
      />,
    );

    expect(
      screen.getByTitle('Sorted In Ascending Order By Vulnerability'),
    ).toBeVisible();
    expect(screen.getByTestId('arrow-up-icon')).toBeVisible();
  });

  test('should render descending sort indicator for current sort column', () => {
    const {render} = rendererWithTableHeader();
    render(
      <TicketsTableHeader
        currentSortBy="severity"
        currentSortDir="desc"
        selectionType={SelectionType.SELECTION_USER}
        onSortChange={testing.fn()}
      />,
    );

    expect(
      screen.getByTitle('Sorted In Descending Order By Severity'),
    ).toBeVisible();
    expect(screen.getByTestId('arrow-down-icon')).toBeVisible();
  });

  test('should render not sorted indicator for non-active columns', () => {
    const {render} = rendererWithTableHeader();
    render(
      <TicketsTableHeader
        currentSortBy="name"
        currentSortDir="asc"
        selectionType={SelectionType.SELECTION_USER}
        onSortChange={testing.fn()}
      />,
    );

    const notSortedIcons = screen.getAllByTitle('Not Sorted');
    expect(notSortedIcons.length).toBeGreaterThanOrEqual(1);

    const arrowUpDownIcons = screen.getAllByTestId('arrow-up-down-icon');
    expect(arrowUpDownIcons.length).toBeGreaterThanOrEqual(1);
  });
});
