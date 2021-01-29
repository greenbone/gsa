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

import {parseInt} from 'gmp/parser';

import {isDefined} from 'gmp/utils/identity';

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
    this.first = parseInt(first);
    this.all = parseInt(all);
    this.filtered = parseInt(filtered);
    this.length = parseInt(length);
    this.rows = parseInt(rows);
    this.last =
      this.first > 0 && this.length > 0 ? this.first + this.length - 1 : 0;
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
      first: isDefined(first) ? first : this.first,
      all: isDefined(all) ? all : this.all,
      filtered: isDefined(filtered) ? filtered : this.filtered,
      length: isDefined(length) ? length : this.length,
      rows: isDefined(rows) ? rows : this.rows,
    });
  }
}

export default CollectionCounts;

// vim: set ts=2 sw=2 tw=80:
