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

import 'core-js/library/fn/array/find-index';

import React from 'react';

import uuid from 'uuid/v4';

import {DragDropContext} from 'react-beautiful-dnd';

import {is_defined} from 'gmp/utils.js';

import PropTypes from '../../utils/proptypes.js';

import Layout from '../layout/layout';

import EmptyRow from './emptyrow';
import Item from './item';
import Row from './row';

const findRowIndex = (rows, rowid) => rows.findIndex(row => row.id === rowid);

export const createRow = items => ({id: uuid(), items});
export const createItem = callback => {
  const id = uuid();

  return {
    id,
    content: callback(id),
  };
};

class Grid extends React.Component {

  static propTypes = {
    items: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.object)),
    maxItemsPerRow: PropTypes.numberOrNumberString,
  }

  constructor(props) {
    super(props);

    this.state = {
      items: this.props.items,
    };

    this.handleDragEnd = this.handleDragEnd.bind(this);
    this.handleDragStart = this.handleDragStart.bind(this);
  }

  handleDragStart() {
    this.setState({isDragging: true});
  }

  handleDragEnd(result) {
    this.setState({isDragging: false});

    // dropped outside the list or at same position
    if (!result.destination) {
      return;
    }

    // we are mutating the items => create copy
    let items = [...this.state.items];

    const {droppableId: destrowid} = result.destination;
    const {droppableId: sourcerowid} = result.source;
    const {index: destindex} = result.destination;
    const {index: sourceindex} = result.source;

    const destrowindex = findRowIndex(items, destrowid);
    const destrow = items[destrowindex];
    const sourcerowindex = findRowIndex(items, sourcerowid);
    const sourcerow = items[sourcerowindex];
    // we are mutating the row => create copy
    const sourcerowitems = [...sourcerow.items];
    // remove from source row
    const [item] = sourcerowitems.splice(sourceindex, 1);

    if (destrowid === 'empty') {
      // update row
      items[sourcerowindex] = {
        id: sourcerowid,
        items: sourcerowitems,
      };

      // create new row with the removed item
      items = [...items, createRow([item])];
    }
    else if (destrowid === sourcerowid) {
      // add at position destindex
      sourcerowitems.splice(destindex, 0, item);

      items[sourcerowindex] = {
        id: sourcerowid,
        items: sourcerowitems,
      };
    }
    else {
      items[sourcerowindex] = {
        id: sourcerowid,
        items: sourcerowitems,
      };

      // add to destination row
      const destrowitems = [...destrow.items];
      destrowitems.splice(destindex, 0, item);

      items[destrowindex] = {
        id: destrowid,
        items: destrowitems,
      };
    }

    // remove possible empty last row
    const lastrow = items[items.length - 1];
    if (lastrow.items.length === 0) {
      items.pop();
    }

    this.setState({
      items,
    });
  }

  render() {
    const {items, isDragging} = this.state;
    const {maxItemsPerRow} = this.props;
    return (
      <DragDropContext
        onDragEnd={this.handleDragEnd}
        onDragStart={this.handleDragStart}
      >
        <Layout flex="column">
          {items.map((row, i) => (
            <Row
              key={row.id}
              id={row.id}
              dropDisabled={is_defined(maxItemsPerRow) &&
                maxItemsPerRow <= row.items.length}
            >
              {row.items.map((item, index) => (
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
          <EmptyRow
            active={isDragging}
          />
        </Layout>
      </DragDropContext>
    );
  }
}

export default Grid;

// vim: set ts=2 sw=2 tw=80:

