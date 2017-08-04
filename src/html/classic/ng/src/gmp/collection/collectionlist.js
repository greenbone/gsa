/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2016 - 2017 Greenbone Networks GmbH
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

import List from '../list.js';

class CollectionList extends List {

  constructor({entries = [], filter, counts, meta = {}}) {
    super(entries);

    this._filter = filter;
    this._counts = counts;
    this._meta = meta;
  }

  filter(func) {
    const f_entries = this._entries.filter(func);
    const counts = this.getCounts().clone({filtered: f_entries.length});
    return new CollectionList({
      entries: f_entries,
      filter: this.getFilter(),
      counts,
      meta: this.getMeta(),
    });
  }

  getCounts() {
    return this._counts;
  }

  getFilter() {
    return this._filter;
  }

  getMeta() {
    return this._meta;
  }

  get meta() {
    return this.getMeta();
  }
}

export default CollectionList;

// vim: set ts=2 sw=2 tw=80:
