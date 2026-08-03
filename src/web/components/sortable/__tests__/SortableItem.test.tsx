/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {render, screen} from 'web/testing';
import {DragDropProvider} from '@dnd-kit/react';
import SortableItem, {
  type SortableItemRenderProps,
} from 'web/components/sortable/SortableItem';

const defaultChildren = ({id, height, width}: SortableItemRenderProps) => (
  <div
    data-height={height}
    data-id={id}
    data-testid="item-content"
    data-width={width}
  />
);

const renderItem = (
  props: Partial<React.ComponentProps<typeof SortableItem>> = {},
  children: (
    props: SortableItemRenderProps,
  ) => React.ReactNode = defaultChildren,
) =>
  render(
    <DragDropProvider>
      <SortableItem
        height={200}
        id="item-1"
        index={0}
        rowId="row-1"
        width={300}
        {...props}
      >
        {children}
      </SortableItem>
    </DragDropProvider>,
  );

describe('SortableItem', () => {
  test('should render the item container', () => {
    renderItem();

    expect(screen.getByTestId('grid-item')).toBeInTheDocument();
  });

  test('should call the children render prop with id, height and width', () => {
    renderItem({id: 'item-42', height: 150, width: 250});

    const content = screen.getByTestId('item-content');
    expect(content).toHaveAttribute('data-id', 'item-42');
    expect(content).toHaveAttribute('data-height', '150');
    expect(content).toHaveAttribute('data-width', '250');
  });

  test('should call the children render prop with a dragHandleRef function', () => {
    const spy = testing.fn();
    const children = (props: SortableItemRenderProps) => spy(props);
    renderItem({}, children);

    expect(spy).toHaveBeenCalledWith(
      expect.objectContaining({dragHandleRef: expect.any(Function)}),
    );
  });
});
