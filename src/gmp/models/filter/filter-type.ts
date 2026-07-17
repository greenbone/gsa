/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type FilterTerm from 'gmp/models/filter/filterterm';

export type FilterSortOrder = typeof SORT_ORDER_ASC | typeof SORT_ORDER_DESC;

interface FilterType {
  id?: string;
  length: number;
  name?: string;
  all(): FilterType;
  and(filter?: FilterType): FilterType;
  copy(): FilterType;
  delete(key: string): FilterType;
  equals(filter?: FilterType): boolean;
  first(first?: number): FilterType;
  getAllTerms(): readonly FilterTerm[];
  get(key: string, def?: string | number): string | number | undefined;
  getSortBy(): string | undefined;
  getSortOrder(): FilterSortOrder;
  getTerm(key?: string): FilterTerm | undefined;
  getTerms(key?: string): FilterTerm[];
  has(key: string): boolean;
  hasTerm(term?: FilterTerm): boolean;
  identifier(): string;
  merge(filter?: FilterType): FilterType;
  mergeExtraKeywords(filter?: FilterType): FilterType;
  mergeKeywords(filter?: FilterType): FilterType;
  next(): FilterType;
  previous(): FilterType;
  set(
    keyword: string,
    value?: string | number | boolean,
    relation?: string,
  ): FilterType;
  setSortBy(value: string): FilterType;
  setSortOrder(value: FilterSortOrder): FilterType;
  simple(): FilterType;
  toFilterCriteriaString(): string;
  toFilterExtraString(): string;
  toFilterString(): string;
}

export const SORT_ORDER_ASC = 'sort';
export const SORT_ORDER_DESC = 'sort-reverse';

export default FilterType;
