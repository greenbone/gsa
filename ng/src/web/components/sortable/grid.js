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

import {is_defined} from 'gmp/utils/identity';

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

export const removeItem = (rows, itemId) => rows.map(row => ({
  ...row,
  items: row.items.filter(item => item.id !== itemId),
})).filter(row => row.items.length > 0);

const updateRow = (row, data) => {
  return {
    ...row,
    ...data,
  };
};

class Grid extends React.Component {

  static propTypes = {
    items: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.object)),
    maxItemsPerRow: PropTypes.numberOrNumberString,
    onChange: PropTypes.func,
  }

  constructor(props) {
    super(props);

    this.state = {
      isDragging: false,
    };

    this.handleDragEnd = this.handleDragEnd.bind(this);
    this.handleDragStart = this.handleDragStart.bind(this);
    this.handleRowResize = this.handleRowResize.bind(this);
  }

  notifyChange(items) {
    const {onChange} = this.props;

    if (is_defined(onChange)) {
      onChange(items);
    }
  }

  handleRowResize(row, height) {
    let {items} = this.props;
    items = [...items];

    const rowIndex = findRowIndex(items, row.id);
    items[rowIndex] = updateRow(row, {height});

    this.notifyChange(items);
  }

  handleDragStart(drag) {
    const {droppableId: rowId} = drag.source;

    this.setState({
      isDragging: true,
      dragSourceRowId: rowId,
    });
  }

  handleDragEnd(result) {
    this.setState({
      isDragging: false,
      dragSourceRowId: undefined,
    });

    // dropped outside the list or at same position
    if (!result.destination) {
      return;
    }

    let {items = []} = this.props;
    // we are mutating the items => create copy
    items = [...items];

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
      items[sourcerowIndex] = updateRow(sourceRow,
        {id: sourcerowId, items: sourceRowItems});

      // create new row with the removed item
      items = [...items, createRow([item])];
    }
    else if (destrowId === sourcerowId) {
      // add at position destindex
      sourceRowItems.splice(destIndex, 0, item);

      items[sourcerowIndex] = updateRow(sourceRow,
        {id: sourcerowId, items: sourceRowItems});
    }
    else {
      items[sourcerowIndex] = updateRow(sourceRow,
        {id: sourcerowId, items: sourceRowItems});

      // add to destination row
      const destrowItems = [...destRow.items];
      destrowItems.splice(destIndex, 0, item);

      items[destrowIndex] = updateRow(destRow,
        {id: destrowId, items: destrowItems});
    }

    // remove empty rows
    items = items.filter(row => row.items.length > 0);

    this.notifyChange(items);
  }

  render() {
    const {isDragging, dragSourceRowId} = this.state;
    const {maxItemsPerRow, items} = this.props;
    return (
      <DragDropContext
        onDragEnd={this.handleDragEnd}
        onDragStart={this.handleDragStart}
      >
        <Layout flex="column">
          {items.map((row, i) => {
            const rowFull = is_defined(maxItemsPerRow) &&
              maxItemsPerRow <= row.items.length;
            const disabled = rowFull && dragSourceRowId !== row.id;
            return (
              <Row
                key={row.id}
                id={row.id}
                dropDisabled={disabled}
                height={row.height}
                onResize={height => this.handleRowResize(row, height)}
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
            );
          })}
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

