/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React, {useCallback, useRef} from 'react';
import {useDroppable} from '@dnd-kit/core';
import styled from 'styled-components';
import {isDefined} from 'gmp/utils/identity';
import Resizer from 'web/components/sortable/Resizer';
import Theme from 'web/utils/Theme';

interface RowProps {
  children: React.ReactNode;
  dropDisabled?: boolean;
  height: number | string;
  id: string;
  onResize?: (height: number) => void;
}

interface GridRowProps {
  $height: number | string;
  $isDraggingOver: boolean;
}

const MIN_HEIGHT = 175;

const GridRow = styled.div<GridRowProps>`
  display: flex;
  height: ${props => props.$height}px;
  min-height: ${MIN_HEIGHT}px;
  background: ${props =>
    props.$isDraggingOver ? Theme.lightGreen : 'transparent'};
  border: ${props =>
    props.$isDraggingOver
      ? `2px dashed ${Theme.green}`
      : '2px solid transparent'};
  border-radius: 4px;
  transition: all 0.2s ease;
`;

const Row = ({children, dropDisabled, id, height, onResize}: RowProps) => {
  const rowRef = useRef<HTMLDivElement | null>(null);

  const handleResize = useCallback(
    (diffY: number) => {
      if (isDefined(onResize) && rowRef.current) {
        const box = rowRef.current.getBoundingClientRect();
        const newHeight = box.height + diffY;

        if (newHeight > MIN_HEIGHT) {
          onResize(newHeight);
        }
      }
    },
    [onResize],
  );

  const {isOver, setNodeRef} = useDroppable({id, disabled: dropDisabled});

  return (
    <>
      <GridRow
        ref={ref => {
          rowRef.current = ref;
          setNodeRef(ref);
        }}
        $height={height}
        $isDraggingOver={isOver}
        data-testid="grid-row"
      >
        {children}
      </GridRow>
      <Resizer onResize={handleResize} />
    </>
  );
};

export default Row;
