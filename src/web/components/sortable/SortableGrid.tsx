/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useState} from 'react';
import {PointerActivationConstraints} from '@dnd-kit/dom';
import {DragDropProvider, KeyboardSensor, PointerSensor} from '@dnd-kit/react';
import {v4 as uuid} from 'uuid';
import {DEFAULT_ROW_HEIGHT} from 'gmp/commands/dashboards';
import {isDefined} from 'gmp/utils/identity';
import AutoSize from 'web/components/layout/AutoSize';
import Layout from 'web/components/layout/Layout';
import SortableEmptyRow from 'web/components/sortable/SortableEmptyRow';
import SortableItem, {
  GRID_ITEM_MARGIN,
  type SortableItemRenderProps,
} from 'web/components/sortable/SortableItem';
import SortableRow from 'web/components/sortable/SortableRow';

export interface SortableGridRow {
  id: string;
  items: string[];
  height?: number;
}

interface GridProps {
  children: (props: SortableItemRenderProps) => React.ReactNode;
  items?: SortableGridRow[];
  maxItemsPerRow?: number;
  maxRows?: number;
  onChange: (items: SortableGridRow[]) => void;
  onRowResize: (rowId: string, height: number) => void;
}

const createNewRow = (item: string): SortableGridRow => ({
  id: uuid(),
  height: DEFAULT_ROW_HEIGHT,
  items: [item],
});

const findRowIndex = (rows: SortableGridRow[], rowid: string) =>
  rows.findIndex(row => row.id === rowid);

const sensors = [
  PointerSensor.configure({
    activationConstraints: [
      new PointerActivationConstraints.Distance({value: 8}),
    ],
  }),
  KeyboardSensor,
];

const SortableGrid = (props: GridProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isInteracting, setIsInteracting] = useState(false);
  const [dragSourceRowId, setDragSourceRowId] = useState<string | undefined>(
    undefined,
  );

  const notifyChange = (items: SortableGridRow[]) => {
    const {onChange} = props;
    if (isDefined(onChange)) {
      onChange(items);
    }
  };

  const handleRowResize = (rowId: string, height: number) => {
    const {onRowResize} = props;
    if (isDefined(onRowResize)) {
      onRowResize(rowId, height);
    }
  };

  const handleDragStart = ({operation}) => {
    setIsDragging(true);
    setIsInteracting(true);
    const {items = []} = props;
    const sourceId = operation.source?.id;
    const srcRow = items.find(row => (row.items || []).includes(sourceId));
    setDragSourceRowId(srcRow ? srcRow.id : undefined);
  };

  const handleDragEnd = ({operation}) => {
    setIsDragging(false);
    setDragSourceRowId(undefined);

    setTimeout(() => {
      setIsInteracting(false);
    }, 200);

    const activeId = operation.source?.id;
    const over = operation.target;

    if (!over) {
      return;
    }

    let {items = []} = props;
    items = [...items];

    // Find source row/index from active id
    const sourceRowIndex = items.findIndex(r =>
      (r.items || []).includes(activeId),
    );
    if (sourceRowIndex < 0) {
      return;
    }
    const sourceRow = items[sourceRowIndex];
    const sourceIndex = (sourceRow.items || []).indexOf(activeId);

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
    const {height = DEFAULT_ROW_HEIGHT} = dragRow ?? {};
    emptyRowHeight = height;
  }
  const getRowHeight = (row: SortableGridRow) => row.height;
  const getRowItems = (row: SortableGridRow) => row.items;
  return (
    <DragDropProvider
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
                <SortableRow
                  key={rowId}
                  dropDisabled={disabled}
                  height={height}
                  id={rowId}
                  onResize={h => handleRowResize(rowId, h)}
                >
                  {rowItems.map((id, index) => (
                    <SortableItem
                      key={id}
                      height={itemHeight}
                      id={id}
                      index={index}
                      rowId={rowId}
                      width={itemWidth}
                    >
                      {children}
                    </SortableItem>
                  ))}
                </SortableRow>
              );
            })}
            {showEmptyRow && (
              <SortableEmptyRow
                active={isInteracting}
                height={emptyRowHeight}
              />
            )}
          </Layout>
        )}
      </AutoSize>
    </DragDropProvider>
  );
};

export default SortableGrid;
