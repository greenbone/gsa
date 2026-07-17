/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import EntityModel, {parseEntityModelProperties} from 'gmp/models/entity-model';
import convert from 'gmp/models/filter/convert';
import FilterTerm, {AND} from 'gmp/models/filter/filterterm';
import {EXTRA_KEYWORDS} from 'gmp/models/filter/keywords';
import Model, {type ModelElement, type ModelProperties} from 'gmp/models/model';
import {parseInt} from 'gmp/parser';
import {map} from 'gmp/utils/array';
import {isDefined, isString, isArray, hasValue} from 'gmp/utils/identity';
import {isEmpty} from 'gmp/utils/string';

export interface FilterKeyword {
  column?: string;
  relation?: string;
  value?: string;
}

/**
 * XML Structure of a filter model element as returned by `<get_filters>`
 * queries.
 *
 * Example XML Structure:
 * ```xml
 * <get_filters_response status="200" status_text="OK">
 *   <filter id="0c239c16-d597-48a1-9f51-347627a23dac">
 *     ...
 *     <term>apply_overrides=0 min_qod=70 sort=name first=1 rows=1</term>
 *   </filter>
 * </get_filters_response>
 * ```
 */
export interface FilterModelElement extends ModelElement {
  alerts?: {
    alert: ModelElement[];
  };
  filter_type?: string;
  term?: string;
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

interface FilterModelProperties extends ModelProperties {
  _term?: string;
  alerts?: Model[];
  filter_type?: string;
  terms?: FilterTerm[];
}

export type FilterSortOrder = typeof SORT_ORDER_ASC | typeof SORT_ORDER_DESC;

type FilterForEachFunc = (
  value: FilterTerm,
  index: number,
  array: FilterTerm[],
) => void;

export interface FilterType {
  id?: string;
  length: number;
  name?: string;
  all(): FilterType;
  and(filter?: FilterType): FilterType;
  copy(): FilterType;
  delete(key: string): FilterType;
  equals(filter?: FilterType): boolean;
  first(first?: number): FilterType;
  forEach(func: FilterForEachFunc): void;
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

export const UNKNOWN_FILTER_ID = '0';
const SORT_ORDER_ASC = 'sort';
const SORT_ORDER_DESC = 'sort-reverse';

/**
 * Parses FilterTerms from filterString
 *
 * @param filterString  Filter representation as a string
 *
 * @returns Array of parsed FilterTerms
 */
const parseFilterTermsFromString = (
  filterString: string | undefined,
): FilterTerm[] => {
  const terms: FilterTerm[] = [];
  if (isString(filterString)) {
    // replace whitespace between double quotes with placeholders
    let modifiedFilterString = filterString;
    const quotes = filterString.match(/".+?"/g); // find all substrings between double quotes
    if (isArray(quotes)) {
      for (const quotedString of quotes) {
        const newQuotedString = quotedString.replace(/\s/g, '####'); // replace all " " with "####"
        modifiedFilterString = modifiedFilterString.replace(
          quotedString,
          newQuotedString,
        );
      }
    }

    // get filter terms by splitting at whitespace
    const filterTerms = modifiedFilterString.split(' ');

    for (let filterTerm of filterTerms) {
      // strip whitespace
      filterTerm = filterTerm.trim();

      // remove placeholders
      filterTerm = filterTerm.replace(/####/g, ' '); // replace all "####" with " "

      if (filterTerm.length > 0 && !filterTerm.startsWith('_')) {
        terms.push(FilterTerm.fromString(filterTerm));
      }
    }
  }
  return terms;
};

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

    return this.terms.reduce((terms: FilterTerm[], term: FilterTerm) => {
      if (term.keyword === key) {
        terms.push(term);
      }
      return terms;
    }, []);
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
   * Calls passed function for each FilterTerm in this filter.
   *
   * @param func Function to call for each FilterTerm.
   */
  forEach(func: FilterForEachFunc) {
    this.terms.forEach(func);
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
    this.forEach(term => {
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
    this.forEach(term => {
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
    if (!hasValue(filter)) {
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

/**
 * Represents a filter
 */
class Filter extends EntityModel implements FilterType {
  static readonly entityType = 'filter';

  readonly alerts: Model[];
  readonly filter_type?: string;
  private readonly filterTerms: FilterTerms;

  constructor({
    _type,
    alerts = [],
    comment,
    creationTime,
    // eslint-disable-next-line @typescript-eslint/naming-convention
    filter_type,
    id,
    inUse,
    modificationTime,
    name,
    owner,
    terms = [],
    userCapabilities,
    userTags = [],
    writable,
  }: FilterModelProperties = {}) {
    super({
      _type,
      comment,
      creationTime,
      id,
      inUse,
      modificationTime,
      name,
      owner,
      userCapabilities,
      userTags,
      writable,
    });

    this.alerts = alerts;
    this.filter_type = filter_type;
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
  private _delegate(terms: FilterTerms, keepId = false): Filter {
    return terms === this.filterTerms
      ? this
      : new Filter({
          id: keepId ? this.id : undefined,
          name: this.name,
          filter_type: this.filter_type,
          terms: [...terms.getAllTerms()],
          userCapabilities: this.userCapabilities,
          userTags: this.userTags,
        });
  }

  /**
   * Create new Filter from the passed element object
   *
   * @param element Element object to parse properties from.
   *
   * @returns An object with properties for the new Filter model
   */
  static fromElement(element: FilterModelElement = {}): Filter {
    const ret = parseEntityModelProperties(element) as FilterModelProperties;

    ret.filter_type = ret._type;

    if (ret.id === UNKNOWN_FILTER_ID) {
      ret.id = undefined;
    }
    if (isDefined(element.term)) {
      ret.terms = parseFilterTermsFromString(element.term);

      // ret.term should not be part of the public api
      // but it's helpful for debug purposes
      ret._term = element.term;
      // @ts-expect-error
      delete ret.term;
    } else {
      ret.terms = [];
    }

    if (isDefined(element.alerts?.alert)) {
      ret.alerts = map(element.alerts.alert, alert =>
        Model.fromElement(alert, 'alert'),
      );
    }

    return new Filter(ret);
  }

  /**
   * Create a new Filter from the passed response element.
   *
   * @param element Response element to parse properties from.
   *
   * @returns A new Filter model instance.
   */
  static fromResponseElement(element: FilterResponseElement = {}): Filter {
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

    return new Filter({id, name, terms});
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
  static fromString(filterString?: string, filter?: FilterType): Filter {
    const filterTerms = new FilterTerms({
      terms: parseFilterTermsFromString(filterString),
    }).mergeExtraKeywords(filter) as FilterTerms;

    return new Filter({
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
    return new Filter({
      terms: [...term],
    });
  }

  forEach(func: FilterForEachFunc): void {
    this.filterTerms.forEach(func);
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
  ): Filter {
    return this._delegate(this.filterTerms.set(keyword, value, relation));
  }

  has(key: string): boolean {
    return this.filterTerms.has(key);
  }

  delete(key: string): Filter {
    return this._delegate(this.filterTerms.delete(key));
  }

  identifier() {
    return this.filterTerms.identifier();
  }

  equals(filter: FilterType | undefined | null): boolean {
    return this.filterTerms.equals(filter);
  }

  copy(): Filter {
    return this._delegate(this.filterTerms.copy(), true);
  }

  next(): Filter {
    return this._delegate(this.filterTerms.next());
  }

  previous(): Filter {
    return this._delegate(this.filterTerms.previous());
  }

  first(first: number = 1): Filter {
    return this._delegate(this.filterTerms.first(first));
  }

  all(): Filter {
    return this._delegate(this.filterTerms.all());
  }

  simple(): Filter {
    return this._delegate(this.filterTerms.simple());
  }

  and(filter: FilterType | undefined | null): Filter {
    return this._delegate(this.filterTerms.and(filter));
  }

  getSortOrder(): FilterSortOrder {
    return this.filterTerms.getSortOrder();
  }

  getSortBy(): string | undefined {
    return this.filterTerms.getSortBy();
  }

  setSortOrder(value: FilterSortOrder): Filter {
    return this._delegate(this.filterTerms.setSortOrder(value));
  }

  setSortBy(value: string): Filter {
    return this._delegate(this.filterTerms.setSortBy(value));
  }

  merge(filter?: FilterType): Filter {
    return this._delegate(this.filterTerms.merge(filter));
  }

  mergeKeywords(filter?: FilterType): Filter {
    return this._delegate(this.filterTerms.mergeKeywords(filter));
  }

  mergeExtraKeywords(filter?: FilterType): Filter {
    return this._delegate(this.filterTerms.mergeExtraKeywords(filter));
  }
}

export const ALL_FILTER = new Filter().all();
export const AGENTS_FILTER_FILTER = Filter.fromString('type=agent');
export const AGENT_GROUPS_FILTER_FILTER = Filter.fromString('type=agent_group');
export const AGENT_INSTALLERS_FILTER_FILTER = Filter.fromString(
  'type=agent_installer',
);
export const ALERTS_FILTER_FILTER = Filter.fromString('type=alert');
export const AUDITS_FILTER_FILTER = Filter.fromString('type=task');
export const AUDIT_REPORTS_FILTER_FILTER =
  Filter.fromString('type=audit_report');
export const CERTBUND_FILTER_FILTER = Filter.fromString('type=info');
export const CPES_FILTER_FILTER = Filter.fromString('type=info');
export const CREDENTIALS_FILTER_FILTER = Filter.fromString('type=credential');
export const CVES_FILTER_FILTER = Filter.fromString('type=info');
export const DFNCERT_FILTER_FILTER = Filter.fromString('type=info');
export const FILTERS_FILTER_FILTER = Filter.fromString('type=filter');
export const GROUPS_FILTER_FILTER = Filter.fromString('type=group');
export const HOSTS_FILTER_FILTER = Filter.fromString('type=host');
export const NOTES_FILTER_FILTER = Filter.fromString('type=note');
export const NVTS_FILTER_FILTER = Filter.fromString('type=info');
export const OS_FILTER_FILTER = Filter.fromString('type=os');
export const OVERRIDES_FILTER_FILTER = Filter.fromString('type=override');
export const PORTLISTS_FILTER_FILTER = Filter.fromString('type=port_list');
export const POLICIES_FILTER_FILTER = Filter.fromString('type=config');
export const PERMISSIONS_FILTER_FILTER = Filter.fromString('type=permission');
export const REPORT_CONFIGS_FILTER_FILTER =
  Filter.fromString('type=report_config');
export const REPORT_FORMATS_FILTER_FILTER =
  Filter.fromString('type=report_format');
export const REPORTS_FILTER_FILTER = Filter.fromString('type=report');
export const RESULTS_FILTER_FILTER = Filter.fromString('type=result');
export const ROLES_FILTER_FILTER = Filter.fromString('type=role');
export const SCANCONFIGS_FILTER_FILTER = Filter.fromString('type=config');
export const SCANNERS_FILTER_FILTER = Filter.fromString('type=scanner');
export const SCHEDULES_FILTER_FILTER = Filter.fromString('type=schedule');
export const SECINFO_FILTER_FILTER = Filter.fromString('type=info');
export const TARGETS_FILTER_FILTER = Filter.fromString('type=target');
export const TASKS_FILTER_FILTER = Filter.fromString('type=task');
export const TAGS_FILTER_FILTER = Filter.fromString('type=tag');
export const TICKETS_FILTER_FILTER = Filter.fromString('type=ticket');
export const TLS_CERTIFICATES_FILTER_FILTER = Filter.fromString(
  'type=tls_certificate',
);
export const USERS_FILTER_FILTER = Filter.fromString('type=user');
export const VULNS_FILTER_FILTER = Filter.fromString('type=vuln');

export const DEFAULT_FALLBACK_FILTER = Filter.fromString('sort=name first=1');

export const RESET_FILTER = Filter.fromString('first=1');

export const DEFAULT_ROWS_PER_PAGE = 50;

export default Filter;
