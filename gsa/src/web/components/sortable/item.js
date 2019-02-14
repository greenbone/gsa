/* Copyright (C) 2018-2019 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301 USA.
 */
import React from 'react';

import styled from 'styled-components';

import {Draggable} from 'react-beautiful-dnd';

import PropTypes from '../../utils/proptypes.js';

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
        innerRef={provided.innerRef}
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
