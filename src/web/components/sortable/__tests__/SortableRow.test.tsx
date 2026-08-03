/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {render, screen} from 'web/testing';
import {DragDropProvider} from '@dnd-kit/react';
import SortableRow from 'web/components/sortable/SortableRow';

const renderRow = (
  props: Partial<React.ComponentProps<typeof SortableRow>> = {},
) =>
  render(
    <DragDropProvider>
      <SortableRow height={200} id="row-1" onResize={testing.fn()} {...props}>
        <div data-testid="child">content</div>
      </SortableRow>
    </DragDropProvider>,
  );

describe('SortableRow', () => {
  test('should render children inside the row container', () => {
    renderRow();

    expect(screen.getByTestId('grid-row')).toBeInTheDocument();
    expect(screen.getByTestId('child')).toBeInTheDocument();
  });

  test('should render the resizer', () => {
    renderRow();

    expect(screen.getByTestId('resizer')).toBeInTheDocument();
  });
});
