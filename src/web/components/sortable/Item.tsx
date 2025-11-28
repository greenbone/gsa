/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import {useDraggable, useDroppable} from '@dnd-kit/core';
import styled from 'styled-components';
import Theme from 'web/utils/Theme';

interface DropZoneProps {
  $isOver: boolean;
}

interface GridItemProps {
  $isDragging: boolean;
}

export interface ItemRenderProps {
  id: string;
  height: number;
  width: number;
  dragHandleProps: {
    onPointerDown?: React.PointerEventHandler;
    onKeyDown?: React.KeyboardEventHandler;
    style?: React.CSSProperties;
    [key: string]: unknown;
  };
}

interface ItemProps {
  children: (props: ItemRenderProps) => React.ReactNode;
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

const DropZone = styled.div<DropZoneProps>`
  position: relative;

  &::after {
    content: '';
    position: absolute;
    top: -2px;
    left: 0;
    right: 0;
    bottom: -2px;
    border: ${props =>
      props.$isOver ? `2px dashed ${Theme.green}` : '2px dashed transparent'};
    border-radius: 4px;
    transition: border-color 0.2s ease;
    pointer-events: none;
  }
`;

const GridItem = styled.div<GridItemProps>`
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

const Item = ({children, index, id, rowId, ...props}: ItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef: setDragRef,
    transform,
    isDragging,
  } = useDraggable({
    id,
    data: {
      type: 'Item',
      index,
      rowId,
    },
  });

  const {setNodeRef: setDropRef, isOver} = useDroppable({
    id: `${rowId}--${index}`,
    data: {
      type: 'Position',
      index,
      rowId,
    },
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  return (
    <DropZone ref={setDropRef} $isOver={isOver}>
      <GridItem
        ref={setDragRef}
        $isDragging={isDragging}
        data-testid="grid-item"
        style={style}
      >
        {children({
          ...props,
          id,
          dragHandleProps: {
            ...listeners,
            ...attributes,
            style: {
              cursor: isDragging ? 'grabbing' : 'grab',
            },
          },
        })}
      </GridItem>
    </DropZone>
  );
};

export default Item;
