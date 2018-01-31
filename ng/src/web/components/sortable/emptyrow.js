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

import {Droppable} from 'react-beautiful-dnd';

import PropTypes from '../../utils/proptypes.js';

const EmptyGridRow = glamorous.div({
  margin: '8px 0px',
  minHeight: '50px',
}, ({active, isDraggingOver}) => ({
  display: active ? 'flex' : 'none',
  border: '1px dashed lightgray',
  background: isDraggingOver ? 'lightblue' : 'none',
}));

const EmptyRow = ({
  children,
  active = false,
}) => (
  <Droppable
    droppableId="empty"
    direction="horizontal"
  >
    {(provided, snapshot) => (
      <EmptyGridRow
        active={active}
        innerRef={provided.innerRef}
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
};

export default EmptyRow;

// vim: set ts=2 sw=2 tw=80:
