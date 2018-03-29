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
import Item, {GRID_ITEM_MARGIN} from './item';
import Row from './row';
import AutoSize from '../layout/autosize.js';

const findRowIndex = (rows, rowid) => rows.findIndex(row => row.id === rowid);

const DEFAULT_ROW_HEIGHT = 250;

export const createRow = (items, height = DEFAULT_ROW_HEIGHT) => ({
  id: uuid(),
  height,
  items,
});

export const createItem = props => {
  const id = uuid();

  return {
    id,
    props,
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

const itemPropType = PropTypes.shape({
  id: PropTypes.string.isRequired,
  props: PropTypes.any.isRequired,
});

const rowPropType = PropTypes.shape({
  id: PropTypes.string.isRequired,
  items: PropTypes.arrayOf(itemPropType).isRequired,
  height: PropTypes.number,
});

class Grid extends React.Component {

  static propTypes = {
    children: PropTypes.func.isRequired,
    items: PropTypes.arrayOf(rowPropType),
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

  handleRemoveItem(itemId) {
    let {items} = this.props;

    items = removeItem(items, itemId);

    this.notifyChange(items);
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
    const {maxItemsPerRow, items = [], children} = this.props;
    return (
      <DragDropContext
        onDragEnd={this.handleDragEnd}
        onDragStart={this.handleDragStart}
      >
        <AutoSize>
          {({width: fullWidth}) => (
            <Layout flex="column" grow="1">
              {items.map((row, i) => {
                const isRowFull = is_defined(maxItemsPerRow) &&
                  maxItemsPerRow <= row.items.length;
                const disabled = isRowFull && dragSourceRowId !== row.id;

                const {items: rowItems = [], height = DEFAULT_ROW_HEIGHT} = row;
                const {length: itemCount} = rowItems;

                const itemHeight = height - GRID_ITEM_MARGIN.top -
                  GRID_ITEM_MARGIN.bottom;
                const itemWidth = fullWidth / itemCount -
                  rowItems.length *
                  (GRID_ITEM_MARGIN.left + GRID_ITEM_MARGIN.right);
                return (
                  <Row
                    key={row.id}
                    id={row.id}
                    dropDisabled={disabled}
                    height={height}
                    onResize={h => this.handleRowResize(row, h)}
                  >
                    {rowItems.map((item, index) => (
                      <Item
                        key={item.id}
                        id={item.id}
                        index={index}
                      >
                        {children({
                          id: item.id,
                          props: item.props,
                          height: itemHeight,
                          width: itemWidth,
                          remove: () => this.handleRemoveItem(item.id),
                        })}
                      </Item>
                    ))}
                  </Row>
                );
              })}
              <EmptyRow
                active={isDragging}
              />
            </Layout>
          )}

        </AutoSize>
      </DragDropContext>
    );
  }
}

export default Grid;

// vim: set ts=2 sw=2 tw=80:

