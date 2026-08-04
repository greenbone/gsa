/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {v4 as uuid} from 'uuid';
import {createDisplay, createRow} from 'gmp/commands/dashboards';
import {isDefined, isArray} from 'gmp/utils/identity';

export interface DashboardDisplay {
  displayId: string;
  id: string;
}

export interface DashboardRow {
  height?: number;
  id: string;
  items: DashboardDisplay[];
}

export interface GridItem {
  height: number;
  id: string;
  items: string[];
}

export interface DashboardSettings {
  maxItemsPerRow?: number;
  maxRows?: number;
  permittedDisplays?: string[];
  rows?: DashboardRow[];
  title?: string;
}

export const getPermittedDisplayIds = (settings: DashboardSettings = {}) =>
  settings.permittedDisplays;

export const getRows = (
  settings: DashboardSettings = {},
  defaultRows?: DashboardRow[],
) => (isDefined(settings.rows) ? settings.rows : defaultRows);

export const convertDefaultDisplays = (
  defaultDisplays: string[][] = [],
  uuidFunc: () => string = uuid,
) => ({
  rows: defaultDisplays.map(row =>
    createRow(
      row.map(displayId => createDisplay(displayId, undefined, uuidFunc)),
      undefined,
      uuidFunc,
    ),
  ),
});

export const removeDisplay = (rows: DashboardRow[] = [], id?: string) =>
  rows
    .map(row => ({...row, items: row.items.filter(item => item.id !== id)}))
    .filter(row => row.items.length > 0);

export const filterDisplays = (
  rows: DashboardRow[] = [],
  isAllowed: (id: string) => boolean = () => true,
) =>
  rows.map(row => ({
    ...row,
    items: row.items.filter(({id}) => isAllowed(id)),
  }));

export const getDisplaysById = (
  rows: DashboardRow[] = [],
): Record<string, DashboardDisplay> => {
  const displaysById: Record<string, DashboardDisplay> = {};
  rows.forEach(row =>
    row.items.forEach(setting => {
      displaysById[setting.id] = setting;
    }),
  );
  return displaysById;
};

export const convertDisplaysToGridItems = (items: DashboardRow[] = []) =>
  items.map(({id, items: rowItems, height}) => ({
    height,
    id,
    items: rowItems.map(display => display.id),
  }));

export const convertGridItemsToDisplays = (
  gridItems: GridItem[] = [],
  displaysById: Record<string, DashboardDisplay> = {},
) =>
  gridItems.map(({id, height, items}) => ({
    id,
    height,
    items: items.map(dId => displaysById[dId]).filter(isDefined),
  }));

export const canAddDisplay = ({
  rows,
  maxItemsPerRow,
  maxRows,
}: DashboardSettings = {}) => {
  if (
    isArray(rows) &&
    rows.length > 0 &&
    isDefined(maxItemsPerRow) &&
    isDefined(maxRows)
  ) {
    const lastRow = rows[rows.length - 1];
    return lastRow.items.length < maxItemsPerRow || rows.length < maxRows;
  }
  return true;
};

export const addDisplayToSettings = (
  settings: DashboardSettings | undefined,
  displayId: string,
  uuidFunc: () => string = uuid,
): DashboardSettings => {
  const {rows: currentRows = [], maxItemsPerRow, ...rest} = settings ?? {};

  const lastRow =
    isArray(currentRows) && currentRows.length > 0
      ? currentRows[currentRows.length - 1]
      : {items: [] as DashboardDisplay[]};

  const rows = isArray(currentRows) ? [...currentRows] : [];
  const display = createDisplay(displayId, undefined, uuidFunc);

  let newRow;
  if (isDefined(maxItemsPerRow) && lastRow.items.length >= maxItemsPerRow) {
    newRow = createRow([display], undefined, uuidFunc);
  } else {
    newRow = {...lastRow, items: [...lastRow.items, display]};
    rows.pop();
  }

  rows.push(newRow);

  return {...rest, ...(isDefined(maxItemsPerRow) && {maxItemsPerRow}), rows};
};
