/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import convert from 'gmp/models/filter/convert';
import FilterTerm, {
  parseFilterTermsFromString,
} from 'gmp/models/filter/filter-term';
import FilterTerms from 'gmp/models/filter/filter-terms';
import {
  type default as FilterType,
  type FilterSortOrder,
} from 'gmp/models/filter/filter-type';
import {map} from 'gmp/utils/array';
import {isDefined} from 'gmp/utils/identity';
import {isEmpty} from 'gmp/utils/string';

export interface FilterKeyword {
  column?: string;
  relation?: string;
  value?: string;
}

/**
 * XML Structure of a filter response element
 * as returned by all `<get_xyz>` queries, for example `<get_tasks>`.
 *
 * Example XML Structure:
 * ```xml
 * <get_tasks_response>
 *   <task>
 *     ...
 *   </task>
 *   <filters id="">
 *     <term>apply_overrides=0 min_qod=70 sort=name first=1 rows=1</term>
 *     <keywords>
 *       <keyword>
 *         <column>apply_overrides</column>
 *         <relation>=</relation>
 *         <value>0</value>
 *       </keyword>
 *       <keyword>
 *         <column>min_qod</column>
 *         <relation>=</relation>
 *         <value>70</value>
 *       </keyword>
 *       <keyword>
 *         <column>sort</column>
 *         <relation>=</relation>
 *         <value>name</value>
 *       </keyword>
 *       <keyword>
 *         <column>first</column>
 *         <relation>=</relation>
 *         <value>1</value>
 *       </keyword>
 *       <keyword>
 *         <column>rows</column>
 *         <relation>=</relation>
 *         <value>1</value>
 *       </keyword>
 *     </keywords>
 *   </filters>
 * </get_tasks_response>
 * ```
 */
export interface FilterResponseElement {
  _id?: string;
  name?: string;
  keywords?: {
    keyword?: FilterKeyword | FilterKeyword[];
  };
  term?: string;
}

interface BaseFilterParams {
  id?: string;
  name?: string;
  terms?: FilterTerm[];
}

export const UNKNOWN_FILTER_ID = '0';

class BaseFilter implements FilterType {
  public readonly id?: string;
  public readonly name?: string;
  private readonly filterTerms: FilterTerms;

  constructor({id, name, terms = []}: BaseFilterParams = {}) {
    this.id = id;
    this.name = name;
    this.filterTerms = new FilterTerms({terms});
  }

  get length() {
    return this.filterTerms.length;
  }

  /**
   * Create a new Filter from the passed FilterTerms if they are different from the current ones.
   *
   * @param terms The FilterTerms to use for creating the new Filter.
   * @param keepId Whether to keep the current Filter's ID.
   *
   * @returns A new Filter if the FilterTerms are different, otherwise the current Filter.
   */
  private _delegate(terms: FilterTerms, keepId = false) {
    return terms === this.filterTerms
      ? this
      : new BaseFilter({
          id: keepId ? this.id : undefined,
          name: this.name,
          terms: [...terms.getAllTerms()],
        });
  }

  /**
   * Create a new Filter from the passed response element.
   *
   * @param element Response element to parse properties from.
   *
   * @returns A new Filter model instance.
   */
  static fromResponseElement(element: FilterResponseElement = {}) {
    const id =
      !isEmpty(element._id) && element._id !== UNKNOWN_FILTER_ID
        ? element._id
        : undefined;

    const name = !isEmpty(element.name) ? element.name : undefined;

    let terms: FilterTerm[] = [];
    if (isDefined(element.keywords)) {
      terms = map(
        element.keywords.keyword,
        ({relation, value, column: key}: FilterKeyword) =>
          new FilterTerm(convert(key, value, relation)),
      );
    } else if (isDefined(element.term)) {
      terms = parseFilterTermsFromString(element.term);
    }

    return new BaseFilter({id, name, terms});
  }

  /**
   * Creates a new Filter from filterString
   *
   * @param filterString String to parse FilterTerms from.
   * @param filter Use extra terms from filter if not already
   *               parsed from filterString.
   *
   * @returns New Filter with FilterTerms parsed from filterString.
   */
  static fromString(filterString?: string, filter?: FilterType) {
    const filterTerms = new FilterTerms({
      terms: parseFilterTermsFromString(filterString),
    }).mergeExtraKeywords(filter) as FilterTerms;

    return new BaseFilter({
      terms: [...filterTerms.getAllTerms()],
    });
  }

  /**
   * Creates a new Filter from FilterTerms
   *
   * @param term FilterTerms to set for the new Filter
   *
   * @returns The new Filter
   */
  static fromTerm(...term: FilterTerm[]) {
    return new BaseFilter({
      terms: [...term],
    });
  }

  toFilterString(): string {
    return this.filterTerms.toFilterString();
  }

  toFilterCriteriaString(): string {
    return this.filterTerms.toFilterCriteriaString();
  }

  toFilterExtraString(): string {
    return this.filterTerms.toFilterExtraString();
  }

  getTerm(key: string | undefined): FilterTerm | undefined {
    return this.filterTerms.getTerm(key);
  }

  hasTerm(term: FilterTerm | undefined): boolean {
    return this.filterTerms.hasTerm(term);
  }

  getTerms(key: string | undefined): FilterTerm[] {
    return this.filterTerms.getTerms(key);
  }

  getAllTerms(): readonly FilterTerm[] {
    return this.filterTerms.getAllTerms();
  }

  get(
    key: string,
    def: string | number | undefined = undefined,
  ): string | number | undefined {
    return this.filterTerms.get(key, def);
  }

  set(
    keyword: string,
    value?: string | number | boolean,
    relation: string = '=',
  ) {
    return this._delegate(this.filterTerms.set(keyword, value, relation));
  }

  has(key: string): boolean {
    return this.filterTerms.has(key);
  }

  delete(key: string) {
    return this._delegate(this.filterTerms.delete(key));
  }

  identifier() {
    return this.filterTerms.identifier();
  }

  equals(filter: FilterType | undefined | null): boolean {
    return this.filterTerms.equals(filter);
  }

  copy() {
    return this._delegate(this.filterTerms.copy(), true);
  }

  next() {
    return this._delegate(this.filterTerms.next());
  }

  previous() {
    return this._delegate(this.filterTerms.previous());
  }

  first(first: number = 1) {
    return this._delegate(this.filterTerms.first(first));
  }

  all() {
    return this._delegate(this.filterTerms.all());
  }

  simple() {
    return this._delegate(this.filterTerms.simple());
  }

  and(filter: FilterType | undefined | null) {
    return this._delegate(this.filterTerms.and(filter));
  }

  getSortOrder(): FilterSortOrder {
    return this.filterTerms.getSortOrder();
  }

  getSortBy(): string | undefined {
    return this.filterTerms.getSortBy();
  }

  setSortOrder(value: FilterSortOrder) {
    return this._delegate(this.filterTerms.setSortOrder(value));
  }

  setSortBy(value: string) {
    return this._delegate(this.filterTerms.setSortBy(value));
  }

  merge(filter?: FilterType) {
    return this._delegate(this.filterTerms.merge(filter));
  }

  mergeKeywords(filter?: FilterType) {
    return this._delegate(this.filterTerms.mergeKeywords(filter));
  }

  mergeExtraKeywords(filter?: FilterType) {
    return this._delegate(this.filterTerms.mergeExtraKeywords(filter));
  }
}

export default BaseFilter;
