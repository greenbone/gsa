/* Copyright (C) 2016-2021 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License
 * as published by the Free Software Foundation, either version 3
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
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
