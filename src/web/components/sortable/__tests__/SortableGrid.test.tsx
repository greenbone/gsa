/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {render, screen} from 'web/testing';
import SortableGrid, {
  type SortableGridRow,
} from 'web/components/sortable/SortableGrid';

const onChangeMock = testing.fn();
const onRowResizeMock = testing.fn();

const rows: SortableGridRow[] = [
  {id: 'row-1', items: ['item-1', 'item-2'], height: 200},
  {id: 'row-2', items: ['item-3'], height: 200},
];

const renderGrid = (
  props: Partial<React.ComponentProps<typeof SortableGrid>> = {},
) =>
  render(
    <SortableGrid
      items={[]}
      onChange={onChangeMock}
      onRowResize={onRowResizeMock}
      {...props}
    >
      {({id}) => <div data-testid={`item-${id}`}>{id}</div>}
    </SortableGrid>,
  );

describe('Grid', () => {
  test('should render the grid container', () => {
    renderGrid();

    expect(screen.getByTestId('grid')).toBeInTheDocument();
  });

  test('should render an empty row when no items are given', () => {
    renderGrid();

    expect(screen.getByTestId('empty-grid-row')).toBeInTheDocument();
  });

  test('should render a row for each item row', () => {
    renderGrid({items: rows});

    expect(screen.getAllByTestId('grid-row')).toHaveLength(2);
  });

  test('should render item content via the children render prop', () => {
    renderGrid({items: rows});

    expect(screen.getByTestId('item-item-1')).toBeInTheDocument();
    expect(screen.getByTestId('item-item-2')).toBeInTheDocument();
    expect(screen.getByTestId('item-item-3')).toBeInTheDocument();
  });

  test('should not show the empty row when maxRows is reached', () => {
    renderGrid({items: rows, maxRows: 2});

    expect(screen.queryByTestId('empty-grid-row')).not.toBeInTheDocument();
  });

  test('should show the empty row when maxRows is not yet reached', () => {
    renderGrid({items: rows, maxRows: 3});

    expect(screen.getByTestId('empty-grid-row')).toBeInTheDocument();
  });
});
