/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';

import styled from 'styled-components';

import {Droppable} from 'react-beautiful-dnd';

import PropTypes from 'web/utils/proptypes';
import {styledExcludeProps} from 'web/utils/styledConfig';

import Theme from 'web/utils/theme';

const EmptyGridRow = styledExcludeProps(styled.div, [
  'active',
  'isDraggingOver',
])`
  margin: 8px 0px;
  min-height: 50px;
  display: ${props => (props.active ? 'flex' : 'none')};
  border: 1px dashed ${Theme.lightGray};
  background: ${props => (props.isDraggingOver ? Theme.lightBlue : 'none')};
  height: ${props => props.height}px;
`;

const EmptyRow = ({children, active = false, height}) => (
  <Droppable droppableId="empty" direction="horizontal">
    {(provided, snapshot) => (
      <EmptyGridRow
        data-testid="empty-grid-row"
        active={active}
        height={height}
        ref={provided.innerRef}
        isDraggingOver={snapshot.isDraggingOver}
      >
        {children}
        {provided.placeholder}
      </EmptyGridRow>
    )}
  </Droppable>
);

EmptyRow.propTypes = {
  active: PropTypes.bool,
  height: PropTypes.number.isRequired,
};

export default EmptyRow;

// vim: set ts=2 sw=2 tw=80:
