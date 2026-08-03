/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React, {useCallback, useRef} from 'react';
import {useDroppable} from '@dnd-kit/react';
import styled from 'styled-components';
import {isDefined} from 'gmp/utils/identity';
import SortableResizer from 'web/components/sortable/SortableResizer';
import Theme from 'web/utils/theme';

interface SortableRowProps {
  children: React.ReactNode;
  dropDisabled?: boolean;
  height: number | string;
  id: string;
  onResize?: (height: number) => void;
}

interface StyledRowProps {
  $height: number | string;
  $isDropTarget: boolean;
}

const MIN_HEIGHT = 175;

const StyledRow = styled.div<StyledRowProps>`
  display: flex;
  height: ${props => props.$height}px;
  min-height: ${MIN_HEIGHT}px;
  background: ${props =>
    props.$isDropTarget ? Theme.lightGreen : 'transparent'};
  border: ${props =>
    props.$isDropTarget
      ? `2px dashed ${Theme.green}`
      : '2px solid transparent'};
  border-radius: 4px;
  transition: all 0.2s ease;
`;

const SortableRow = ({
  children,
  dropDisabled,
  id,
  height,
  onResize,
}: SortableRowProps) => {
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

  const {isDropTarget, ref} = useDroppable({
    id,
    disabled: dropDisabled,
  });

  return (
    <>
      <StyledRow
        ref={element => {
          rowRef.current = element;
          ref(element);
        }}
        $height={height}
        $isDropTarget={isDropTarget}
        data-testid="grid-row"
      >
        {children}
      </StyledRow>
      <SortableResizer onResize={handleResize} />
    </>
  );
};

export default SortableRow;
