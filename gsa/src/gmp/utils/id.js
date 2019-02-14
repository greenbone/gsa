/* Copyright (C) 2016-2019 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
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
import {first} from './array';
import {isDefined, isString} from './identity';

export const hasId = model =>
  isDefined(model) && isString(model.id) && model.id.length > 0;

export const includesId = (list, id) => {
  for (const value of list) {
    if (value.id === id) {
      return true;
    }
  }
  return false;
};

export const selectSaveId = (list, id, empty_default) => {
  if (!isDefined(id) || !includesId(list, id)) {
    if (!isDefined(empty_default)) {
      return first(list).id;
    }
    return empty_default;
  }
  return id;
};

// vim: set ts=2 sw=2 tw=80:
