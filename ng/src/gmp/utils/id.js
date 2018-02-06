/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 * Steffen Waterkamp <steffen.waterkamp@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2016 - 2018 Greenbone Networks GmbH
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
import {is_defined} from './identity';

export function includes_id(list, id) {
  for (const value of list) {
    if (value.id === id) {
      return true;
    }
  }
  return false;
}

export function select_save_id(list, id, empty_default) {
  if (!is_defined(id) || !includes_id(list, id)) {
    if (!is_defined(empty_default)) {
      return first(list).id;
    }
    return empty_default;
  }
  return id;
}

// vim: set ts=2 sw=2 tw=80:

