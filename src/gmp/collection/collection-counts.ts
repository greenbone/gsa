/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {parseInt} from 'gmp/parser';
import {isDefined} from 'gmp/utils/identity';

export interface CollectionCountsOptions {
  first?: number | string;
  all?: number | string;
  filtered?: number | string;
  length?: number | string;
  rows?: number | string;
}

class CollectionCounts {
  first: number;
  all: number;
  filtered: number;
  length: number;
  rows: number;
  last: number;

  /**
   * Create new CollectionCounts
   *
   * @param first    - Index of the first item in the collection
   * @param all      - Count of all available items (max number)
   * @param filtered - Count of filtered items (always <= all)
   * @param length   - Current number of items in the collection
   * @param rows     - Count of max. requested items
   */
  constructor({
    first = 0,
    all = 0,
    filtered = 0,
    length = 0,
    rows = 0,
  }: CollectionCountsOptions = {}) {
    this.first = parseInt(first) ?? 0;
    this.all = parseInt(all) ?? 0;
    this.filtered = parseInt(filtered) ?? 0;
    this.length = parseInt(length) ?? 0;
    this.rows = parseInt(rows) ?? 0;
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

  clone({first, all, filtered, length, rows}: CollectionCountsOptions) {
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
