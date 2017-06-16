/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2017 Greenbone Networks GmbH
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

export class List {

  constructor(entries = []) {
    this._entries = entries;
  }

  [Symbol.iterator]() {
    return this._entries.values();
  }

  forEach(func) {
    return this._entries.forEach(func);
  }

  map(func) {
    return this._entries.map(func);
  }

  filter(func) {
    const f_entries = this._entries.filter(func);
    return new List(f_entries);
  }

  find(func) {
    return this._entries.find(func);
  }

  sort(func) {
    return this._entries.sort(func);
  }

  push(entry) {
    this._entries.push(entry);
    return this;
  }

  values() {
    return this._entries.values();
  }

  get length() {
    return this._entries.length;
  }

  getEntries() {
    return this._entries;
  }
}

export default List;

// vim: set ts=2 sw=2 tw=80:
