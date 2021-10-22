/* Copyright (C) 2018-2021 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License
 * as published by the Free Software Foundation, either version 3
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */
import React from 'react';

import styled from 'styled-components';

import {Droppable} from 'react-beautiful-dnd';

import PropTypes from 'web/utils/proptypes';

import Theme from 'web/utils/theme';

const EmptyGridRow = styled.div`
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
