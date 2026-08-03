/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import {useDraggable, useDroppable} from '@dnd-kit/react';
import styled from 'styled-components';
import Theme from 'web/utils/theme';

interface StyledDropZoneProps {
  $isDropTarget: boolean;
}

interface StyledItemProps {
  $isDragging: boolean;
}

export interface SortableItemRenderProps {
  id: string;
  height: number;
  width: number;
  dragHandleRef: (element: Element | null) => void;
}

interface SortableItemProps {
  children: (props: SortableItemRenderProps) => React.ReactNode;
  id: string;
  index: number;
  rowId: string;
  height: number;
  width: number;
}

export const GRID_ITEM_MARGIN = {
  top: 5,
  bottom: 5,
  left: 8,
  right: 8,
};

const StyledDropZone = styled.div<StyledDropZoneProps>`
  position: relative;

  &::after {
    content: '';
    position: absolute;
    top: -2px;
    left: 0;
    right: 0;
    bottom: -2px;
    border: ${props =>
      props.$isDropTarget
        ? `2px dashed ${Theme.green}`
        : '2px dashed transparent'};
    border-radius: 4px;
    transition: border-color 0.2s ease;
    pointer-events: none;
  }
`;

const StyledItem = styled.div<StyledItemProps>`
  display: flex;
  flex-grow: 1;
  flex-shrink: 1;
  flex-basis: 0;
  user-select: none;
  position: relative;
  margin-top: ${GRID_ITEM_MARGIN.top}px;
  margin-bottom: ${GRID_ITEM_MARGIN.bottom}px;
  margin-left: ${GRID_ITEM_MARGIN.left}px;
  margin-right: ${GRID_ITEM_MARGIN.right}px;
  background: ${props => (props.$isDragging ? Theme.white : 'inherit')};
  z-index: ${props => (props.$isDragging ? 1000 : 'auto')};
  box-shadow: ${props =>
    props.$isDragging ? `0 4px 12px ${Theme.black}` : 'none'};
  border-radius: 4px;
  transition: box-shadow 0.2s ease;
`;

const SortableItem = ({
  children,
  index,
  id,
  rowId,
  ...props
}: SortableItemProps) => {
  const {
    ref: setDragRef,
    handleRef,
    isDragging,
  } = useDraggable({
    id,
    data: {
      type: 'Item',
      index,
      rowId,
    },
  });

  const {ref, isDropTarget} = useDroppable({
    id: `${rowId}--${index}`,
    data: {
      type: 'Position',
      index,
      rowId,
    },
  });

  return (
    <StyledDropZone ref={ref} $isDropTarget={isDropTarget}>
      <StyledItem
        ref={setDragRef}
        $isDragging={isDragging}
        data-testid="grid-item"
      >
        {children({
          ...props,
          id,
          dragHandleRef: handleRef,
        })}
      </StyledItem>
    </StyledDropZone>
  );
};

export default SortableItem;
