/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
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

const GridItem = glamorous.div({
  display: 'flex',
  flexGrow: 1,
  userSelect: 'none',
  margin: '5px',
});

const Item = ({
  children,
  index,
  id,
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
          {...provided.dragHandleProps}
          isDragging={snapshot.isDragging}
          style={provided.draggableProps.style}
        >
          {children}
        </GridItem>
        {provided.placeholder}
      </React.Fragment>
    )}
  </Draggable>
);

Item.propTypes = {
  id: PropTypes.string.isRequired,
  index: PropTypes.number.isRequired,
};

export default Item;

// vim: set ts=2 sw=2 tw=80:
