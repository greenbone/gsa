/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 * Steffen Waterkamp <steffen.waterkamp@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2018 Greenbone Networks GmbH
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

import glamorous from 'glamorous';

import {Draggable} from 'react-beautiful-dnd';

import PropTypes from '../../utils/proptypes.js';

export const GRID_ITEM_MARGIN = {
  top: 5,
  bottom: 5,
  left: 8,
  right: 8,
};

const GridItem = glamorous.div('grid-item', {
  display: 'flex',
  flexGrow: 1,
  flexShrink: 1,
  flexBasis: 0,
  overflow: 'hidden',
  userSelect: 'none',
  marginTop: GRID_ITEM_MARGIN.top + 'px',
  marginBottom: GRID_ITEM_MARGIN.bottom + 'px',
  marginLeft: GRID_ITEM_MARGIN.left + 'px',
  marginRight: GRID_ITEM_MARGIN.right + 'px',
});

const Item = ({
  children,
  index,
  id,
  ...props
}) => (
  <Draggable
    draggableId={id}
    index={index}
  >
    {(provided, snapshot) => ( // eslint-disable-line no-shadow
      <React.Fragment>
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
        {provided.placeholder}
      </React.Fragment>
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
