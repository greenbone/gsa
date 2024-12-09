/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {v4 as uuid} from 'uuid';

import {useState} from 'react';

import {DragDropContext} from '@atlaskit/pragmatic-drag-and-drop-react-beautiful-dnd-migration';

import {DEFAULT_ROW_HEIGHT} from 'gmp/commands/dashboards';

import {isDefined} from 'gmp/utils/identity';

import AutoSize from 'web/components/layout/autosize';
import Layout from 'web/components/layout/layout';

import PropTypes from 'web/utils/proptypes';

import EmptyRow from './emptyrow';
import Item, {GRID_ITEM_MARGIN} from './item';
import Row from './row';

const createNewRow = item => ({
  id: uuid(),
  height: DEFAULT_ROW_HEIGHT,
  items: [item],
});

const findRowIndex = (rows, rowid) => rows.findIndex(row => row.id === rowid);

const Grid = props => {
  const [isDragging, setIsDragging] = useState(false);
  const [isInteracting, setIsInteracting] = useState(false);
  const [dragSourceRowId, setDragSourceRowId] = useState(undefined);

  const notifyChange = items => {
    const {onChange} = props;
    if (isDefined(onChange)) {
      onChange(items);
    }
  };

  const handleRowResize = (rowId, height) => {
    const {onRowResize} = props;
    if (isDefined(onRowResize)) {
      onRowResize(rowId, height);
    }
  };

  const handleOnBeforeCapture = () => {
    setIsInteracting(true);
  };

  const handleDragStart = drag => {
    const {droppableId: rowId} = drag.source;
    setIsDragging(true);
    setDragSourceRowId(rowId);
  };

  const handleDragEnd = result => {
    setIsDragging(false);
    setDragSourceRowId(undefined);
    setIsInteracting(false);

    // dropped outside the list or at same position
    if (!result.destination) {
      return;
    }

    let {items = []} = props;
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
    // remove from source row. removed item is returned in an array
    const [item] = sourceRowItems.splice(sourceIndex, 1);

    if (destrowId === 'empty') {
      // create new row with the removed item
      items = [...items, createNewRow(item)];
    } else if (destrowId === sourcerowId) {
      // add at position destindex
      sourceRowItems.splice(destIndex, 0, item);
    } else {
      // add to destination row
      const destrowItems = [...destRow.items];
      destrowItems.splice(destIndex, 0, item);

      items[destrowIndex] = {
        ...destRow,
        id: destrowId,
        items: destrowItems,
      };
    }

    // update source row to actually remove the element
    items[sourcerowIndex] = {
      ...sourceRow,
      id: sourcerowId,
      items: sourceRowItems,
    };

    // remove empty rows
    items = items.filter(row => row.items.length > 0);

    notifyChange(items);
  };

  const {maxItemsPerRow, maxRows, items = [], children} = props;
  const showEmptyRow = !isDefined(maxRows) || items.length < maxRows;

  let emptyRowHeight = DEFAULT_ROW_HEIGHT;
  if (isDragging) {
    const dragRow = items.find(row => row.id === dragSourceRowId);
    const {height = DEFAULT_ROW_HEIGHT} = dragRow;
    emptyRowHeight = height;
  }
  const getRowHeight = row => row.height;
  const getRowItems = row => row.items;
  return (
    <DragDropContext
      onDragEnd={handleDragEnd}
      onDragStart={handleDragStart}
      onBeforeCapture={handleOnBeforeCapture}
    >
      <AutoSize>
        {({width: fullWidth}) => (
          <Layout data-testid="grid" flex="column" grow="1">
            {items.map(row => {
              let height = getRowHeight(row);
              if (!isDefined(height)) {
                height = DEFAULT_ROW_HEIGHT;
              }
              let rowItems = getRowItems(row);
              if (!isDefined(rowItems)) {
                rowItems = [];
              }

              const {length: itemCount} = rowItems;

              const isRowFull =
                isDefined(maxItemsPerRow) && maxItemsPerRow <= itemCount;
              const disabled = isRowFull && dragSourceRowId !== row.id;

              const itemHeight =
                height - GRID_ITEM_MARGIN.top - GRID_ITEM_MARGIN.bottom;
              const itemWidth =
                fullWidth / itemCount -
                (GRID_ITEM_MARGIN.left + GRID_ITEM_MARGIN.right);

              const {id: rowId} = row;
              return (
                <Row
                  key={rowId}
                  id={rowId}
                  dropDisabled={disabled}
                  height={height}
                  onResize={h => handleRowResize(rowId, h)}
                >
                  {rowItems.map((id, index) => (
                    <Item
                      key={id}
                      id={id}
                      index={index}
                      height={itemHeight}
                      width={itemWidth}
                    >
                      {children}
                    </Item>
                  ))}
                </Row>
              );
            })}
            {showEmptyRow && (
              <EmptyRow active={isInteracting} height={emptyRowHeight} />
            )}
          </Layout>
        )}
      </AutoSize>
    </DragDropContext>
  );
};

const rowPropType = PropTypes.shape({
  id: PropTypes.string.isRequired,
  items: PropTypes.arrayOf(PropTypes.string).isRequired,
  height: PropTypes.number,
});

Grid.propTypes = {
  children: PropTypes.func.isRequired,
  items: PropTypes.arrayOf(rowPropType),
  maxItemsPerRow: PropTypes.number,
  maxRows: PropTypes.number,
  onChange: PropTypes.func.isRequired,
  onRowResize: PropTypes.func.isRequired,
};

export default Grid;
