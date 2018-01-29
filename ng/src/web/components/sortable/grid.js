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

import {DragDropContext, Droppable, Draggable} from 'react-beautiful-dnd';

import {is_defined} from 'gmp/utils.js';

import PropTypes from '../../utils/proptypes.js';

const GridRow = glamorous.div({
  display: 'flex',
  flex: 'column',
  margin: '8px',
  minHeight: '50px',
}, ({isDraggingOver}) => ({
  background: isDraggingOver ? 'lightblue' : 'lightgrey',
}));

const Row = ({
  children,
  dropDisabled,
  id,
}) => (
  <Droppable
    isDropDisabled={dropDisabled}
    droppableId={'row-' + id}
    direction="horizontal"
  >
    {(provided, snapshot) => (
      <GridRow
        innerRef={provided.innerRef}
        isDraggingOver={snapshot.isDraggingOver}
      >
        {children}
        {provided.placeholder}
      </GridRow>
    )}
  </Droppable>
);

Row.propTypes = {
  dropDisabled: PropTypes.bool,
  id: PropTypes.string.isRequired,
};

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
  index: PropTypes.number.isRequired,
  id: PropTypes.string.isRequired,
};

const reorder = (list, startIndex, endIndex) => {
  const result = [...list];
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
};

class Grid extends React.Component {

  static propTypes = {
    items: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.object)),
    maxItemsPerRow: PropTypes.numberOrNumberString,
  }

  constructor(props) {
    super(props);

    const {items} = this.props;

    this.rowIndex = items.reduce((all, item, i) => {
      all[`row-${i}`] = i;
      return all;
    }, {});

    this.state = {
      items,
    };

    this.onDragEnd = this.onDragEnd.bind(this);
  }

  onDragEnd(result) {
    // dropped outside the list
    if (!result.destination) {
      return;
    }

    const {items} = this.state;
    const {droppableId: destrowid} = result.destination;
    const {droppableId: sourcerowid} = result.source;
    const destrowindex = this.rowIndex[destrowid];
    let destrow = items[destrowindex];
    const destindex = result.destination.index;
    const sourceindex = result.source.index;

    if (destrowid === sourcerowid) {
      destrow = reorder(
        destrow,
        sourceindex,
        destindex,
      );
    }
    else {
      // remove from source row
      const sourcerowindex = this.rowIndex[sourcerowid];
      const sourcerow = [...items[sourcerowindex]];

      const [item] = sourcerow.splice(sourceindex, 1);

      items[sourcerowindex] = sourcerow;

      // add to destination row
      destrow = [...items[destrowindex]];

      destrow.splice(destindex, 0, item);
    }

    items[destrowindex] = destrow;

    this.setState({
      items,
    });
  }

  render() {
    const {items} = this.state;
    const {maxItemsPerRow} = this.props;
    return (
      <DragDropContext onDragEnd={this.onDragEnd}>
        {items.map((row, i) => (
          <Row
            key={i}
            id={i}
            dropDisabled={is_defined(maxItemsPerRow) &&
              maxItemsPerRow <= row.length}
          >
            {row.map((item, index) => (
              <Item
                key={item.id}
                id={item.id}
                index={index}
              >
                {item.content}
              </Item>
            ))}
          </Row>
        ))}
      </DragDropContext>
    );
  }
}

export default Grid;

// vim: set ts=2 sw=2 tw=80:

