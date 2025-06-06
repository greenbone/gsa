/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {v4 as uuid} from 'uuid';
import {createDisplay, createRow} from 'gmp/commands/dashboards';
import {isDefined, isArray} from 'gmp/utils/identity';

export const getPermittedDisplayIds = (settings = {}) =>
  settings.permittedDisplays;

export const getRows = ({rows} = {}, defaultRows) =>
  isDefined(rows) ? rows : defaultRows;

export const convertDefaultDisplays = (
  defaultDisplays = [],
  uuidFunc = uuid,
) => {
  return {
    rows: defaultDisplays.map(row =>
      createRow(
        row.map(displayId => createDisplay(displayId, undefined, uuidFunc)),
        undefined,
        uuidFunc,
      ),
    ),
  };
};

export const removeDisplay = (rows = [], id) =>
  rows
    .map(row => ({
      ...row,
      items: row.items.filter(item => item.id !== id),
    }))
    .filter(row => row.items.length > 0);

export const filterDisplays = (rows = [], isAllowed = () => true) =>
  rows.map(row => {
    const {items: rowItems = []} = row;
    return {
      ...row,
      items: rowItems.filter(({id}) => isAllowed(id)),
    };
  });

export const getDisplaysById = (rows = []) => {
  const displaysById = {};
  rows.forEach(row =>
    row.items.forEach(setting => {
      displaysById[setting.id] = setting;
    }),
  );
  return displaysById;
};

export const convertDisplaysToGridItems = (items = []) =>
  items.map(({id, items: rowItems, height}) => ({
    height,
    id,
    items: rowItems.map(display => display.id),
  }));

export const convertGridItemsToDisplays = (gridItems = [], displaysById = {}) =>
  gridItems.map(({id, height, items}) => ({
    id,
    height,
    items: items.map(dId => displaysById[dId]).filter(isDefined),
  }));

export const canAddDisplay = ({rows, maxItemsPerRow, maxRows} = {}) => {
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

export const addDisplayToSettings = (settings, displayId, uuidFunc) => {
  const {rows: currentRows = [], maxItemsPerRow} = settings || {};

  const lastRow =
    isArray(currentRows) && currentRows.length > 0
      ? currentRows[currentRows.length - 1]
      : {items: []};

  const rows = isArray(currentRows) ? [...currentRows] : [];
  const display = createDisplay(displayId, undefined, uuidFunc);

  let newRow;
  if (isDefined(maxItemsPerRow) && lastRow.items.length >= maxItemsPerRow) {
    // create new row
    newRow = createRow([display], undefined, uuidFunc);
  } else {
    // add new display to last row
    newRow = {
      ...lastRow,
      items: [...lastRow.items, display],
    };

    rows.pop();
  }

  rows.push(newRow);

  return {
    ...settings,
    rows,
  };
};
