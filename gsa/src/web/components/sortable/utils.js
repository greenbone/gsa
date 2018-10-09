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
import uuid from 'uuid/v4';

import {createRow} from 'gmp/commands/dashboards';

export const createItem = (props, uuidFunc = uuid) => {
  const id = uuidFunc();

  return {
    id,
    ...props,
  };
};

export const removeItem = (rows, itemId) => rows.map(row => ({
  ...row,
  items: row.items.filter(item => item.id !== itemId),
})).filter(row => row.items.length > 0);

export const updateRow = (row, data) => ({
  ...row,
  ...data,
});

export const convertDefaultContent = (defaultContent = [], uuidFunc = uuid) => {
  return {
    rows: defaultContent.map(row => createRow(
      row.map(item => createItem({name: item}, uuidFunc)), undefined, uuidFunc
    )),
  };
};

// vim: set ts=2 sw=2 tw=80:
