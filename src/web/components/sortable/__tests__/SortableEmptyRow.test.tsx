/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import {render, screen} from 'web/testing';
import {DragDropProvider} from '@dnd-kit/react';
import SortableEmptyRow from 'web/components/sortable/SortableEmptyRow';

const renderEmptyRow = (
  props: Partial<React.ComponentProps<typeof SortableEmptyRow>> = {},
) =>
  render(
    <DragDropProvider>
      <SortableEmptyRow height={200} {...props} />
    </DragDropProvider>,
  );

describe('SortableEmptyRow', () => {
  test('should render the empty row container', () => {
    renderEmptyRow();

    expect(screen.getByTestId('empty-grid-row')).toBeInTheDocument();
  });

  test('should render children when provided', () => {
    renderEmptyRow({children: <span data-testid="child">drop here</span>});

    expect(screen.getByTestId('child')).toBeInTheDocument();
  });
});
