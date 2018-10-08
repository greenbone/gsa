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
import 'core-js/shim';
import 'core-js/library/fn/array/find-index';
import 'core-js/library/fn/array/find';

import React from 'react';

import {DragDropContext} from 'react-beautiful-dnd';

import {
  DEFAULT_ROW_HEIGHT,
  createRow,
} from 'gmp/commands/dashboards';

import {isDefined} from 'gmp/utils/identity';

import AutoSize from 'web/components/layout/autosize';
import Layout from 'web/components/layout/layout';

import PropTypes from 'web/utils/proptypes';

import EmptyRow from './emptyrow';
import Item, {GRID_ITEM_MARGIN} from './item';
import Row from './row';
import {
  updateRow,
  removeItem,
} from './utils';

const findRowIndex = (rows, rowid) => rows.findIndex(row => row.id === rowid);

const itemPropType = PropTypes.shape({
  id: PropTypes.string.isRequired,
});

const rowPropType = PropTypes.shape({
  id: PropTypes.string.isRequired,
  items: PropTypes.arrayOf(itemPropType).isRequired,
  height: PropTypes.number,
});

export const itemsPropType = PropTypes.arrayOf(rowPropType);

class Grid extends React.Component {

  static propTypes = {
    children: PropTypes.func.isRequired,
    items: itemsPropType,
    maxItemsPerRow: PropTypes.number,
    maxRows: PropTypes.number,
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

    if (isDefined(onChange)) {
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

  handleUpdateItem(row, item, props) {
    item = {
      ...item,
      ...props,
    };

    const rowItems = [
      ...row.items,
    ];
    const index = rowItems.findIndex(i => i.id === item.id);
    rowItems[index] = item;

    const {items} = this.props;
    const rows = [...items];

    const rowIndex = findRowIndex(rows, row.id);
    rows[rowIndex] = updateRow(row, {items: rowItems});

    this.notifyChange(rows);
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
    const {maxItemsPerRow, maxRows, items = [], children} = this.props;
    const showEmptyRow = !isDefined(maxRows) || items.length < maxRows;

    let emptyRowHeight = DEFAULT_ROW_HEIGHT;
    if (isDragging) {
      const dragRow = items.find(row => row.id === dragSourceRowId);
      const {height = DEFAULT_ROW_HEIGHT} = dragRow;
      emptyRowHeight = height;
    }
    return (
      <DragDropContext
        onDragEnd={this.handleDragEnd}
        onDragStart={this.handleDragStart}
      >
        <AutoSize>
          {({width: fullWidth}) => (
            <Layout flex="column" grow="1">
              {items.map((row, i) => {
                const {items: rowItems = [], height = DEFAULT_ROW_HEIGHT} = row;
                const {length: itemCount} = rowItems;

                const isRowFull = isDefined(maxItemsPerRow) &&
                  maxItemsPerRow <= itemCount;
                const disabled = isRowFull && dragSourceRowId !== row.id;

                const itemHeight = height - GRID_ITEM_MARGIN.top -
                  GRID_ITEM_MARGIN.bottom;
                const itemWidth = fullWidth / itemCount -
                  (GRID_ITEM_MARGIN.left + GRID_ITEM_MARGIN.right);
                return (
                  <Row
                    key={row.id}
                    id={row.id}
                    dropDisabled={disabled}
                    height={height}
                    onResize={h => this.handleRowResize(row, h)}
                  >
                    {rowItems.map((item, index) => {
                      const {id, ...props} = item;
                      return (
                        <Item
                          key={id}
                          id={id}
                          index={index}
                          props={props}
                          height={itemHeight}
                          width={itemWidth}
                          remove={() => this.handleRemoveItem(id)}
                          update={(...args) => this.handleUpdateItem(
                            row, item, ...args)}
                        >
                          {children}
                        </Item>
                      );
                    })}
                  </Row>
                );
              })}
              {showEmptyRow &&
                <EmptyRow
                  active={isDragging}
                  height={emptyRowHeight}
                />
              }
            </Layout>
          )}

        </AutoSize>
      </DragDropContext>
    );
  }
}

export default Grid;

// vim: set ts=2 sw=2 tw=80:
