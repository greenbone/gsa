/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useState} from 'react';
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {v4 as uuid} from 'uuid';
import {DEFAULT_ROW_HEIGHT} from 'gmp/commands/dashboards';
import {isDefined} from 'gmp/utils/identity';
import AutoSize from 'web/components/layout/AutoSize';
import Layout from 'web/components/layout/Layout';
import EmptyRow from 'web/components/sortable/EmptyRow';
import Item, {GRID_ITEM_MARGIN} from 'web/components/sortable/Item';
import Row from 'web/components/sortable/Row';
import PropTypes from 'web/utils/PropTypes';

const createNewRow = item => ({
  id: uuid(),
  height: DEFAULT_ROW_HEIGHT,
  items: [item],
});

const findRowIndex = (rows, rowid) => rows.findIndex(row => row.id === rowid);

const Grid = props => {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Require 8px of movement before dragging starts
      },
    }),
    useSensor(KeyboardSensor),
  );
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

  const handleDragStart = ({active}) => {
    setIsDragging(true);
    setIsInteracting(true);
    const {items = []} = props;
    const srcRow = items.find(r => (r.items || []).includes(active.id));
    setDragSourceRowId(srcRow ? srcRow.id : undefined);
  };

  const handleDragEnd = ({active, over}) => {
    setIsDragging(false);
    setDragSourceRowId(undefined);

    setTimeout(() => {
      setIsInteracting(false);
    }, 200);

    if (!over) {
      return;
    }

    let {items = []} = props;
    items = [...items];

    // Find source row/index from active id
    const sourceRowIndex = items.findIndex(r =>
      (r.items || []).includes(active.id),
    );
    if (sourceRowIndex < 0) {
      return;
    }
    const sourceRow = items[sourceRowIndex];
    const sourceIndex = (sourceRow.items || []).indexOf(active.id);

    // Remove from source
    const sourceRowItems = [...sourceRow.items];
    const [item] = sourceRowItems.splice(sourceIndex, 1);

    // Determine destination row + index
    let destinationRowId;
    let destinationIndex;

    if (over.id === 'empty') {
      destinationRowId = 'empty';
    } else if (typeof over.id === 'string' && over.id.includes('--')) {
      // over id encoded as `${rowId}--${index}` from Item droppable
      const [rid, idxStr] = over.id.split('--');
      destinationRowId = rid;
      destinationIndex = Number.parseInt(idxStr, 10);
    } else {
      // over a row: append to end
      destinationRowId = String(over.id);
      const destRowTmp = items[findRowIndex(items, destinationRowId)];
      destinationIndex = destRowTmp?.items?.length ?? 0;
    }

    if (destinationRowId === 'empty') {
      items = [...items, createNewRow(item)];
    } else if (destinationRowId === sourceRow.id) {
      sourceRowItems.splice(destinationIndex, 0, item);
    } else {
      const destinationRowIndex = findRowIndex(items, destinationRowId);
      if (destinationRowIndex < 0) {
        return;
      }
      const destRow = items[destinationRowIndex];
      const destinationRowItems = [...destRow.items];
      destinationRowItems.splice(destinationIndex, 0, item);
      items[destinationRowIndex] = {
        ...destRow,
        id: destinationRowId,
        items: destinationRowItems,
      };
    }

    items[sourceRowIndex] = {
      ...sourceRow,
      id: sourceRow.id,
      items: sourceRowItems,
    };

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
    <DndContext
      sensors={sensors}
      onDragEnd={handleDragEnd}
      onDragStart={handleDragStart}
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
                  dropDisabled={disabled}
                  height={height}
                  id={rowId}
                  onResize={h => handleRowResize(rowId, h)}
                >
                  {rowItems.map((id, index) => (
                    <Item
                      key={id}
                      height={itemHeight}
                      id={id}
                      index={index}
                      rowId={rowId}
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
    </DndContext>
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
