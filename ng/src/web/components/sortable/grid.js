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

    const {droppableId: destrowId} = result.destination;
    const {droppableId: sourcerowId} = result.source;
    const {index: destIndex} = result.destination;
    const {index: sourceIndex} = result.source;

    const destrowIndex = findRowIndex(items, destrowId);
    const destRow = items[destrowIndex];
    const sourcerowIndex = findRowIndex(items, sourcerowId);
    const sourceRow = items[sourcerowIndex];
    // we are mutating the row => create copy
    const sourceRowItems = [...sourceRow.items];
    // remove from source row
    const [item] = sourceRowItems.splice(sourceIndex, 1);

    if (destrowId === 'empty') {
      // update row
      items[sourcerowIndex] = {
        id: sourcerowId,
        items: sourceRowItems,
      };

      // create new row with the removed item
      items = [...items, createRow([item])];
    }
    else if (destrowId === sourcerowId) {
      // add at position destindex
      sourceRowItems.splice(destIndex, 0, item);

      items[sourcerowIndex] = {
        id: sourcerowId,
        items: sourceRowItems,
      };
    }
    else {
      items[sourcerowIndex] = {
        id: sourcerowId,
        items: sourceRowItems,
      };

      // add to destination row
      const destrowItems = [...destRow.items];
      destrowItems.splice(destIndex, 0, item);

      items[destrowIndex] = {
        id: destrowId,
        items: destrowItems,
      };
    }

    // remove possible empty last row
    const lastRow = items[items.length - 1];
    if (lastRow.items.length === 0) {
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

