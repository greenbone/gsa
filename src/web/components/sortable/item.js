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

import {Draggable} from 'react-beautiful-dnd';

import PropTypes from 'web/utils/proptypes';

export const GRID_ITEM_MARGIN = {
  top: 5,
  bottom: 5,
  left: 8,
  right: 8,
};

const GridItem = styled.div`
  display: flex;
  flex-grow: 1;
  flex-shrink: 1;
  flex-basis: 0;
  user-select: none;
  margin-top: ${GRID_ITEM_MARGIN.top}px;
  margin-bottom: ${GRID_ITEM_MARGIN.bottom}px;
  margin-left: ${GRID_ITEM_MARGIN.left}px;
  margin-right: ${GRID_ITEM_MARGIN.right}px;
`;

const Item = ({children, index, id, ...props}) => (
  <Draggable draggableId={id} index={index}>
    {(
      provided,
      snapshot, // eslint-disable-line no-shadow
    ) => (
      <GridItem
        data-testid="grid-item"
        ref={provided.innerRef}
        {...provided.draggableProps}
        isDragging={snapshot.isDragging}
        style={provided.draggableProps.style}
      >
        {children({
          ...props,
          id,
          dragHandleProps: provided.dragHandleProps,
        })}
      </GridItem>
    )}
  </Draggable>
);

Item.propTypes = {
  children: PropTypes.func.isRequired,
  id: PropTypes.string.isRequired,
  index: PropTypes.number.isRequired,
};

export default Item;

// vim: set ts=2 sw=2 tw=80:
