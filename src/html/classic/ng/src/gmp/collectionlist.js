/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2016 Greenbone Networks GmbH
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

export class CollectionList {

  constructor({entries = [], filter, counts}) {
    this._entries = entries;
    this._filter = filter;
    this._counts = counts;
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
    return this._entries.filter(func);
  }

  find(func) {
    return this._entries.find(func);
  }

  push(filter) {
    this._entries.push(filter);
    return this;
  }

  values() {
    return this._entries.values();
  }

  get length() {
    return this._entries.length;
  }

  getCounts() {
    return this._counts;
  }

  getFilter() {
    return this._filter;
  }

}

export default CollectionList;

// vim: set ts=2 sw=2 tw=80:
