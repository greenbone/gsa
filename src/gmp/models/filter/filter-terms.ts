/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import convert from 'gmp/models/filter/convert';
import {
  type default as FilterType,
  type FilterSortOrder,
  SORT_ORDER_ASC,
  SORT_ORDER_DESC,
} from 'gmp/models/filter/filter-type';
import FilterTerm, {AND} from 'gmp/models/filter/filterterm';
import {EXTRA_KEYWORDS} from 'gmp/models/filter/keywords';
import {parseInt} from 'gmp/parser';
import {hasValue, isDefined} from 'gmp/utils/identity';

class FilterTerms implements FilterType {
  private terms: FilterTerm[];

  constructor({
    terms = [],
  }: {
    terms?: FilterTerm[];
  } = {}) {
    this.terms = terms;
  }

  get length() {
    return this.terms.length;
  }

  /**
   * Creates a shallow copy of this filter terms container.
   */
  private _copy(): FilterTerms {
    return new FilterTerms({
      terms: [...this.terms],
    });
  }

  /**
   * Add FilterTerm to this filter
   *
   * Adds the passed FilterTerm to the list of filter terms in this filter.
   *
   * @param terms FilterTerms to add.
   * @returns This filter
   */
  private _addTerm(...terms: FilterTerm[]) {
    this.terms.push(...terms);
  }

  /**
   * Set FilterTerm in this filter
   *
   * @param term  FilterTerm to set
   */
  private _setTerm(term: FilterTerm) {
    const key = term.keyword;

    // special handling of sort. should be put into a more generic solution in
    // future
    if (key === 'sort' && this.has('sort-reverse')) {
      this._delete('sort-reverse');
    }
    if (key === 'sort-reverse' && this.has('sort')) {
      this._delete('sort');
    }

    const {keyword} = term;

    if (!isDefined(keyword) || !this.has(keyword)) {
      this._addTerm(term);
    } else {
      const index = this._getIndex(keyword);
      this.terms[index] = term;
    }
  }

  /**
   * Remove all FilterTerms with this key
   *
   * @param key Filter term key to remove
   *
   * @returns True if a FilterTerm with this key has been removed from this filter.
   */
  private _delete(key: string) {
    const index = this._getIndex(key);
    const hasKey = index !== -1;
    if (hasKey) {
      this.terms = this.terms.filter((_, i) => i !== index);
    }
    return hasKey;
  }

  /**
   * Get the first index of the FilterTerm with key as keyword
   *
   * @param key FilterTerm keyword to search for
   *
   * @returns Index of the key in the FilterTerms array
   */
  private _getIndex(key: string): number {
    return this.terms.findIndex(term => term.keyword === key);
  }

  /**
   * Returns extra keywords filter terms from the given filter that are not included in this filter
   *
   * @param filter Filter to get extra keywords from
   * @returns Array of FilterTerms with extra keywords from filter that are not included in this filter
   */
  private _getExtraKeywords(filter: FilterType | undefined | null) {
    if (!hasValue(filter)) {
      return [];
    }
    const terms = filter.getAllTerms();
    return terms.filter(term => {
      const {keyword: key} = term;
      return (
        isDefined(key) &&
        EXTRA_KEYWORDS.includes(key) &&
        !this.has(key) &&
        !(key === 'sort' && this.has('sort-reverse')) &&
        !(key === 'sort-reverse' && this.has('sort'))
      );
    });
  }

  /**
   * Mutating internal variant of set used by immutable public methods.
   */
  private _set(
    keyword: string,
    value?: string | number | boolean,
    relation: string = '=',
  ) {
    const converted = convert(keyword, value, relation);
    this._setTerm(new FilterTerm(converted));
    return this;
  }

  /**
   * Returns new keywords filter terms from the given filter that are not included in this filter
   *
   * @param filter Filter to get new keywords from
   * @returns Array of FilterTerms with new keywords from filter that are not included in this filter
   */
  private _getNewKeywords(filter?: FilterType) {
    if (!hasValue(filter)) {
      return [];
    }
    const terms = filter.getAllTerms();
    return terms.filter(term => {
      const {keyword: key} = term;
      return isDefined(key) && !this.has(key);
    });
  }

  /**
   * Get the first FilterTerm for a keyword
   *
   * @param key  FilterTerm keyword to search for
   *
   * @returns Returns the first FilterTerm for the passed keyword
   *         or undefined of not FilterTerm for the keyword exists in
   *         this filter.
   */
  getTerm(key: string | undefined): FilterTerm | undefined {
    if (!isDefined(key)) {
      return undefined;
    }
    return this.terms.find(term => key === term.keyword);
  }

  /**
   * Check if a filter term is included in this filter
   *
   * @param term FilterTerm to find in the filter
   *
   * @returns True if the filter term is included in this filter
   */
  hasTerm(term: FilterTerm | undefined): boolean {
    if (!isDefined(term)) {
      return false;
    }
    const terms = this.getTerms(term.keyword);
    return terms.findIndex(currentTerm => currentTerm.equals(term)) !== -1;
  }

  /**
   * Get all FilterTerms for a keyword
   *
   * @param key FilterTerm keyword to search for
   *
   * @returns Returns all FilterTerms with the passed keyword or an empty Array
   *          if no FilterTerm has been found.
   */
  getTerms(key: string | undefined): FilterTerm[] {
    if (!isDefined(key)) {
      return [];
    }

    return this.terms.filter(term => term.keyword === key);
  }

  /**
   * Get all FilterTerms in this filter
   *
   * @returns An array of all FilterTerms in this filter
   */
  getAllTerms(): readonly FilterTerm[] {
    return this.terms;
  }

  /**
   * Get the value of a FilterTerm
   *
   * @param key  FilterTerm keyword to search for
   * @param def  Value returned if no FilterTerm for key could be
   *             found. Defaults to undefined.
   *
   * @returns Returns the first FilterTerm value for the passed keyword
   *         or def if no FilterTerm for the keyword exists in this filter.
   */
  get(
    key: string,
    def: string | number | undefined = undefined,
  ): string | number | undefined {
    const term = this.getTerm(key);
    return isDefined(term) ? term.value : def;
  }

  /**
   * Creates a new filter with passed keyword, value and relation set
   *
   * @param keyword   FilterTerm keyword
   * @param value     FilterTerm value
   * @param relation  FilterTerm relation (Default: '=').
   *
   * @returns A new filter
   */
  set(
    keyword: string,
    value?: string | number | boolean,
    relation: string = '=',
  ) {
    const newFilterTerms = this._copy();
    newFilterTerms._set(keyword, value, relation);
    return newFilterTerms;
  }

  /**
   * Check whether this filter contains a FilterTerm with the passed keyword
   *
   * @param key  Keyword to search for
   *
   * @returns Returns true if a FilterTerm with this keyword exists in this filter.
   */
  has(key: string): boolean {
    if (!isDefined(key)) {
      return false;
    }
    return this._getIndex(key) !== -1;
  }

  /**
   * Remove all FilterTerms with this key
   *
   * @param key Filter term key to remove
   *
   * @returns New filter with the FilterTerm removed or this filter if no FilterTerm with this key exists.
   */
  delete(key: string) {
    if (this.has(key)) {
      const newFilterTerms = this._copy();
      newFilterTerms._delete(key);
      return newFilterTerms;
    }
    return this;
  }

  /**
   * Returns a full string representation of this filter.
   *
   * @returns String which represents this filter.
   */
  toFilterString(): string {
    return this.terms.map(term => term.toString()).join(' ');
  }

  /**
   * Returns the filter criteria as a string.
   *
   * Converts each non extra keyword FilterTerm to a string representation.
   *
   * @returns The filter criteria terms as string.
   */
  toFilterCriteriaString(): string {
    let filterString = '';
    this.terms.forEach(term => {
      const key = term.keyword;
      if (!isDefined(key) || !EXTRA_KEYWORDS.includes(key)) {
        filterString += term.toString() + ' ';
      }
    });
    return filterString.trim();
  }

  /**
   * Returns the filter extra keyword FilterTerms as a string.
   *
   * Converts each extra keyword FilterTerm to a string representation.
   *
   * @returns The filter extra keyword terms as a string.
   */
  toFilterExtraString(): string {
    let filterString = '';
    this.terms.forEach(term => {
      const key = term.keyword;
      if (isDefined(key) && EXTRA_KEYWORDS.includes(key)) {
        filterString += term.toString() + ' ';
      }
    });
    return filterString.trim();
  }

  /**
   * Provides a unique identifier string for the filter.
   *
   * @returns A string representation of this filter to be used as an identifier.
   */
  identifier() {
    return this.toFilterString();
  }

  /**
   * Compare this filter with another filter.
   *
   * @param filter Other filter to compare to.
   *
   * @returns Returns true if this filter equals the other filter.
   */
  equals(filter: FilterType | undefined | null): boolean {
    if (!hasValue(filter)) {
      return false;
    }

    if (this.length !== filter.length) {
      return false;
    }

    const ours = this.getAllTerms();
    const others = filter.getAllTerms();

    for (let i = 0; i < ours.length; i++) {
      const our = ours[i];
      if (our.hasKeyword()) {
        const otherTerms = filter.getTerms(our.keyword as string);
        const ourTerms = this.getTerms(our.keyword as string);

        if (otherTerms.length !== ourTerms.length) {
          return false;
        }

        const equals = otherTerms.reduce(
          (prev, term) => prev || term.equals(our),
          false,
        );

        if (!equals) {
          // same term isn't in other terms
          return false;
        }
      } else if (!our.equals(others[i])) {
        return false;
      }
    }

    return true;
  }

  /**
   * Creates a copy of this filter.
   *
   * @returns A shallow copy of this filter.
   */
  copy() {
    return this._copy();
  }

  /**
   * Returns a new filter pointing to the next items.
   *
   * @returns Copy of this filter but pointing to the next items.
   */
  next() {
    const filter = this._copy();
    let first = parseInt(filter.get('first'));
    let rows = parseInt(filter.get('rows'));

    if (!isDefined(rows)) {
      rows = 10;
    }

    if (isDefined(first)) {
      first += rows;
    } else {
      first = 1;
    }

    filter._set('first', String(first), '=');
    filter._set('rows', String(rows), '=');

    return filter;
  }

  /**
   * Returns a new filter pointing to the previous items.
   *
   * @returns Copy of this filter but pointing to the previous items.
   */
  previous() {
    const filter = this._copy();
    let first = parseInt(filter.get('first'));
    let rows = parseInt(filter.get('rows'));

    if (!isDefined(rows)) {
      rows = 10;
    }

    if (isDefined(first)) {
      first -= rows;
    } else {
      first = 1;
    }

    if (first <= 1) {
      first = 1;
    }

    filter._set('first', String(first), '=');
    filter._set('rows', String(rows), '=');

    return filter;
  }

  /**
   * Returns a new filter pointing to the first items.
   *
   * @param first Number of the first item to receive with this filter applied.
   *
   * @returns Copy of this filter but pointing to the first items.
   */
  first(first: number = 1) {
    return this.set('first', String(first), '=');
  }

  /**
   * Returns a new filter to return all items.
   *
   * Removes item count restrictions from the copy of this filter.
   *
   * @returns Copy of this filter but removing the item count restriction.
   */
  all() {
    const filter = this._copy();

    filter._set('first', '1', '=');
    filter._set('rows', '-1', '=');

    return filter;
  }

  /**
   * Returns a simplified filter without first, rows and sort/sort-reverse terms.
   *
   * @returns Copy of this filter but without first, rows and sort/sort-reverse terms.
   */
  simple() {
    const filter = this._copy();

    filter._delete('first');
    filter._delete('rows');
    filter._delete(filter.getSortOrder());

    return filter;
  }

  /**
   * Merge other filter with an and operation.
   *
   * @param filter Filter to be merged with and operation.
   *
   * @returns A new filter if filter is defined, otherwise this filter is returned.
   */
  and(filter: FilterType | undefined | null) {
    if (!hasValue(filter)) {
      return this;
    }

    const nonExtraTerms = this.getAllTerms().filter(
      term => isDefined(term.keyword) && !EXTRA_KEYWORDS.includes(term.keyword),
    );

    const copy = this._copy();
    if (nonExtraTerms.length > 0) {
      copy._addTerm(AND);
    }
    copy._addTerm(...filter.getAllTerms());
    return copy;
  }

  /**
   * Returns the sort order of the current filter.
   *
   * @returns The sort order: 'sort' or 'sort-reverse'.
   */
  getSortOrder(): FilterSortOrder {
    return this.has(SORT_ORDER_DESC) ? SORT_ORDER_DESC : SORT_ORDER_ASC;
  }

  /**
   * Returns the sort by field name of the current filter.
   *
   * @returns The sort field name or undefined if no sort field is set.
   */
  getSortBy(): string | undefined {
    const order = this.getSortOrder();
    return this.get(order) as string | undefined;
  }

  /**
   * Create a new filter with the current sort order.
   *
   * @param value New sort order: 'sort' or 'sort-reverse'.
   *
   * @returns A new filter with the current sort order.
   */
  setSortOrder(value: FilterSortOrder) {
    const sortby = this.getSortBy();
    value = value === SORT_ORDER_DESC ? SORT_ORDER_DESC : SORT_ORDER_ASC;
    return this.set(value, sortby);
  }

  /**
   * Create a new filter with the current sort field.
   *
   * @param value New sort field.
   *
   * @returns A new filter with the current sort field.
   */
  setSortBy(value: string) {
    const order = this.getSortOrder();
    return this.set(order, value);
  }

  /**
   * Merges all terms from filter into a filter.
   *
   * @param filter Terms from filter to be merged.
   *
   * @returns A new filter with merged terms if the filter has changed.
   */
  merge(filter?: FilterType) {
    if (!hasValue(filter) || filter.length === 0) {
      return this;
    }
    const copy = this._copy();
    // currently this method also adds duplicate terms. this may change in future.
    copy._addTerm(...filter.getAllTerms());
    return copy;
  }

  /**
   * Merges all new terms from filter into filter.
   *
   * @param filter Terms from filter to be merged.
   *
   * @returns A new filter with merged terms if the filter has changed.
   */
  mergeKeywords(filter?: FilterType) {
    if (!hasValue(filter)) {
      return this;
    }
    const newKeywords = this._getNewKeywords(filter);
    if (newKeywords.length === 0) {
      return this;
    }
    const copy = this._copy();
    copy._addTerm(...newKeywords);
    return copy;
  }

  /**
   * Merges additional EXTRA KEYWORD terms from filter into a filter.
   *
   * @param filter Use extra params terms filter to be merged.
   *
   * @returns A new filter with merged terms if changed.
   */
  mergeExtraKeywords(filter?: FilterType) {
    if (!isDefined(filter)) {
      return this;
    }
    const extraKeywords = this._getExtraKeywords(filter);
    if (extraKeywords.length === 0) {
      return this;
    }
    const copy = this._copy();
    copy._addTerm(...extraKeywords);
    return copy;
  }
}

export default FilterTerms;
