/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import {useDroppable} from '@dnd-kit/core';
import styled from 'styled-components';
import Theme from 'web/utils/Theme';

interface EmptyRowProps {
  children?: React.ReactNode;
  active?: boolean;
  height: number;
}

interface EmptyGridRowProps {
  $active: boolean;
  $isDraggingOver: boolean;
  height: number;
}

const EmptyGridRow = styled.div<EmptyGridRowProps>`
  margin: 8px 0px;
  min-height: 50px;
  display: ${props => (props.$active ? 'flex' : 'none')};
  border: 2px dashed
    ${props => (props.$isDraggingOver ? Theme.green : Theme.lightGray)};
  background: ${props =>
    props.$isDraggingOver ? Theme.lightGreen : 'transparent'};
  height: ${props => props.height}px;
  border-radius: 4px;
  transition: all 0.2s ease;
  align-items: center;
  justify-content: center;

  &::before {
    content: '${props =>
      props.$isDraggingOver ? 'Drop here' : 'Drop items here'}';
    color: ${props => (props.$isDraggingOver ? Theme.green : Theme.mediumGray)};
    font-size: 14px;
    opacity: ${props => (props.$active ? 0.7 : 0)};
    transition: opacity 0.2s ease;
  }
`;

const EmptyRow = ({children, active = false, height}: EmptyRowProps) => {
  const {isOver, setNodeRef} = useDroppable({id: 'empty'});
  return (
    <EmptyGridRow
      ref={setNodeRef}
      $active={active}
      $isDraggingOver={isOver}
      data-testid="empty-grid-row"
      height={height}
    >
      {children}
    </EmptyGridRow>
  );
};

export default EmptyRow;
