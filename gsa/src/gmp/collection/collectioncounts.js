/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
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

import {is_defined} from '../utils/identity';

import {parse_int} from '../parser.js';

class CollectionCounts {

  /**
   * Create new CollectionCounts
   *
   * @param {number} first    - Index of the first item in the collection
   * @param {number} all      - Count of all available items (max number)
   * @param {number} filtered - Count of filtered items (always <= all)
   * @param {number} length   - Current number of items in the collection
   * @param {number} rows     - Count of max. requested items
   */
  constructor({first = 0, all = 0, filtered = 0, length = 0, rows = 0} = {}) {
    this.first = parse_int(first);
    this.all = parse_int(all);
    this.filtered = parse_int(filtered);
    this.length = parse_int(length);
    this.rows = parse_int(rows);
    this.last = this.first > 0 && this.length > 0 ?
      this.first + this.length - 1 : 0;
  }

  isFirst() {
    return this.first === 1;
  }

  hasPrevious() {
    return this.first > this.rows && this.rows > 0;
  }

  isLast() {
    return this.last >= this.filtered;
  }

  hasNext() {
    return this.last < this.filtered;
  }

  clone({first, all, filtered, length, rows}) {
    return new CollectionCounts({
      first: is_defined(first) ? first : this.first,
      all: is_defined(all) ? all : this.all,
      filtered: is_defined(filtered) ? filtered : this.filtered,
      length: is_defined(length) ? length : this.length,
      rows: is_defined(rows) ? rows : this.rows,
    });
  }
}

export default CollectionCounts;

// vim: set ts=2 sw=2 tw=80:
