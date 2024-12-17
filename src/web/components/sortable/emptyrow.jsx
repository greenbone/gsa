/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {Droppable} from '@atlaskit/pragmatic-drag-and-drop-react-beautiful-dnd-migration';
import React from 'react';
import styled from 'styled-components';
import PropTypes from 'web/utils/proptypes';
import Theme from 'web/utils/theme';

const EmptyGridRow = styled.div`
  margin: 8px 0px;
  min-height: 50px;
  display: ${props => (props.$active ? 'flex' : 'none')};
  border: 1px dashed ${Theme.lightGray};
  background: ${props => (props.$isDraggingOver ? Theme.lightBlue : 'none')};
  height: ${props => props.height}px;
`;

const EmptyRow = ({children, active = false, height}) => (
  <Droppable direction="horizontal" droppableId="empty">
    {(provided, snapshot) => (
      <EmptyGridRow
        ref={provided.innerRef}
        $active={active}
        $isDraggingOver={snapshot.isDraggingOver}
        data-testid="empty-grid-row"
        height={height}
      >
        {children}
        {provided.placeholder}
      </EmptyGridRow>
    )}
  </Droppable>
);

EmptyRow.propTypes = {
  children: PropTypes.node,
  active: PropTypes.bool,
  height: PropTypes.number.isRequired,
};

export default EmptyRow;
