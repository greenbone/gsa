/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import convert from 'gmp/models/filter/convert';
import FilterTerm, {AND} from 'gmp/models/filter/filterterm';
import {EXTRA_KEYWORDS} from 'gmp/models/filter/keywords';
import Model, {
  ModelElement,
  ModelProperties,
  parseModelFromElement,
} from 'gmp/models/model';
import {parseInt, setProperties} from 'gmp/parser';
import {map} from 'gmp/utils/array';
import {isDefined, isString, isArray, hasValue} from 'gmp/utils/identity';

export const UNKNOWN_FILTER_ID = '0';
const SORT_ORDER_ASC = 'sort';
const SORT_ORDER_DESC = 'sort-reverse';

interface FilterKeyword {
  column: string;
  relation: string;
  value: string;
}

interface FilterModelProperties extends ModelProperties {
  _term?: string;
  alerts?: Model[];
  filter_type?: string;
  terms: FilterTerm[];
}

interface FilterModelElement extends ModelElement {
  alerts?: {
    alert: ModelElement[];
  };
  filter_type?: string;
  keywords?: {
    keyword: FilterKeyword[];
  };
  term?: string;
}

type SortOrder = typeof SORT_ORDER_ASC | typeof SORT_ORDER_DESC;

type FilterForEachFunc = (
  value: FilterTerm,
  index: number,
  array: FilterTerm[],
) => void;

/**
 * Parses FilterTerms from filterString
 *
 * @param filterString  Filter representation as a string
 *
 * @return Array of parsed FilterTerms
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

/**
 * Represents a filter
 *
 * @extends Model
 */
class Filter extends Model {
  static entityType = 'filter';
  terms: FilterTerm[];
  filter_type!: string;
  alerts?: Model[];

  constructor() {
    super();

    this.terms = [];
  }

  get length() {
    return this.terms.length;
  }

  // @ts-expect-error
  setProperties({id, ...properties}: FilterModelProperties) {
    // override setProperties to allow changing the id
    setProperties(properties, this);
    this.id = id;
    return this;
  }

  /**
   * Parse properties from the passed element object
   *
   * @param element  Element object to parse properties from.
   *
   * @return An object with properties for the new Filter model
   */
  static parseElement(element: FilterModelElement = {}): FilterModelProperties {
    const ret = super.parseElement(element) as FilterModelProperties;

    ret.filter_type = ret._type;

    if (ret.id === UNKNOWN_FILTER_ID) {
      ret.id = undefined;
    }
    if (isDefined(element.keywords)) {
      ret.terms = map(
        element.keywords.keyword,
        ({relation, value, column: key}: FilterKeyword) =>
          new FilterTerm(convert(key, value, relation)),
      );
      // @ts-expect-error
      delete ret.keywords;
    } else if (isDefined(element.term)) {
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
        parseModelFromElement(alert, 'alert'),
      );
    }

    return ret;
  }

  /**
   * @private
   *
   * @param term  FilterTerm to set
   *
   * @return This filter
   */
  _setTerm(term: FilterTerm) {
    const key = term.keyword;

    // special handling of sort. should be put into a more generic solution in
    // future
    if (key === 'sort' && this.has('sort-reverse')) {
      this.delete('sort-reverse');
    }
    if (key === 'sort-reverse' && this.has('sort')) {
      this.delete('sort');
    }

    const {keyword} = term;

    if (!isDefined(keyword) || !this.has(keyword)) {
      this._addTerm(term);
    } else {
      const index = this._getIndex(keyword);
      this.terms[index] = term;
    }
    return this;
  }

  /**
   * Add FilterTerm to this Filter
   *
   * Adds the passed FilterTerm to the list of filter terms in this Filter.
   *
   * @private
   *
   * @param terms FilterTerm to add.
   *
   * @return This filter
   */
  _addTerm(...terms: FilterTerm[]) {
    this.terms.push(...terms);
    return this;
  }

  /**
   * Set the FilterTerm array of this Filter
   *
   * @private
   *
   * @param terms Array of FilterTerms to set.
   *
   * @return This filter
   */
  _setTerms(terms: FilterTerm[]) {
    this.terms = terms;
    return this;
  }

  /**
   * Get the first index of the FilterTerm with key as keyword
   *
   * @param key FilterTerm keyword to search for
   *
   * @returns Index of the key in the FilterTerms array
   */
  _getIndex(key: string): number {
    return this.terms.findIndex(term => term.keyword === key);
  }

  /**
   * Merges additional EXTRA KEYWORD terms from filter into this Filter
   *
   * Only extra keywords not included in this filter will be merged.
   *
   * @private
   *
   * @param filter Use extra params terms filter to be merged.
   *
   * @return This filter with merged terms.
   */

  _mergeExtraKeywords(filter: Filter | undefined | null) {
    if (hasValue(filter)) {
      filter.forEach(term => {
        const {keyword: key} = term;
        if (!isDefined(key) || !EXTRA_KEYWORDS.includes(key) || this.has(key)) {
          return;
        }
        if (
          (key === 'sort' && this.has('sort-reverse')) ||
          (key === 'sort-reverse' && this.has('sort'))
        ) {
          return;
        }
        this._addTerm(term);
      });
    }
    return this;
  }

  /**
   * Merges terms with new keywords from filter into this Filter
   *
   * @private
   *
   * @param filter  Use extra params terms filter to be merged.
   *
   * @return This filter with merged terms.
   */
  _mergeNewKeywords(filter: Filter | undefined) {
    if (hasValue(filter)) {
      filter.forEach(term => {
        const {keyword: key} = term;
        if (isDefined(key)) {
          if (!this.has(key)) {
            this._addTerm(term);
          }
        }
      });
    }
    return this;
  }

  /**
   * Reset filter id of the current filter
   *
   * @private
   *
   * @return This filter.
   */
  _resetFilterId() {
    this.id = undefined;
    return this;
  }

  /**
   * Calls passed function for each FilterTerm in this Filter
   *
   * @param {function} func  Function to call for each FilterTerm.
   */
  forEach(func: FilterForEachFunc) {
    this.terms.forEach(func);
  }

  /**
   * Returns a full string representation of this Filter
   *
   * @return String which represents this filter.
   */
  toFilterString(): string {
    return this.terms.map(term => term.toString()).join(' ');
  }

  /**
   * Returns the filter criteria as a string
   *
   * Converts each non extra keyword FilterTerm to a string representation.
   *
   * @return The filter criteria terms as string
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
   * Returns the filter extra keyword FilterTerms as a string
   *
   * Converts each extra keyword FilterTerm to a string representation.
   *
   * @return The filter extra keyword terms as a string
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
   * Get the first FilterTerm for a keyword
   *
   * @param key  FilterTerm keyword to search for
   *
   * @return Returns the first FilterTerm for the passed keyword
   *         or undefined of not FilterTerm for the keyword exists in
   *         this Filter.
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
   * @return True if the filter term is included in this filter
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
   * @returns Returns all FilterTerms in an Array found for
   *          the passed keyword or an empty Array if not FilterTerm
   *          has been found.
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
   * Get all FilterTerms
   *
   * @returns Returns the array of all FilterTerms in this filter
   */
  getAllTerms(): FilterTerm[] {
    return this.terms;
  }

  /**
   * Get the value of a FilterTerm
   *
   * @param key  FilterTerm keyword to search for
   * @param def  Value returned if no FilterTerm for key could be
   *             found. Defaults to undefined.
   *
   * @return Returns the first FilterTerm value for the passed keyword
   *         or def if no FilterTerm for the keyword exists in this Filter.
   */
  get(
    key: string,
    def: string | undefined = undefined,
  ): string | number | undefined {
    const term = this.getTerm(key);
    return isDefined(term) ? term.value : def;
  }

  /**
   * Creates a new FilterTerm from key, value and relation
   *
   * Creates a new FilterTerm from key, value and relation.
   *
   * @param keyword   FilterTerm keyword
   * @param value     FilterTerm value
   * @param relation  FilterTerm relation (Default: '=').
   *
   * @return This filter
   */
  set(keyword: string, value?: string, relation: string = '=') {
    this._resetFilterId(); // reset id because the filter has changed
    const converted = convert(keyword, value, relation);
    this._setTerm(new FilterTerm(converted));
    return this;
  }

  /**
   * Check whether this Filter contains a FilterTerm with the passed keyword
   *
   * @param key  Keyword to search for
   *
   * @return Returns true if a FilterTerm with this keyword exists in this Filter.
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
   * @return This filter
   */
  delete(key: string) {
    const index = this._getIndex(key);
    if (index !== -1) {
      this.terms.splice(index, 1);
      this._resetFilterId(); // filter has changed
    }
    return this;
  }

  /**
   * Compare this filter with another filter
   *
   * @param {Filter|undefined|null} filter  Other filter to compare to.
   *
   * @return {bool} Returns true if this filter equals to the other filter
   */
  equals(filter: Filter | undefined | null): boolean {
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
   * Creates a copy of this filter
   *
   * The returned copy is only a shallow copy of this filter.
   * FilterTerms are copied only by reference.
   *
   * @return A shallow copy of this filter.
   */
  copy(): Filter {
    const f = new Filter();

    // copy public properties
    f.id = this.id;
    f.filter_type = this.filter_type;

    f._setTerms([...this.getAllTerms()]);
    return f;
  }

  /**
   * Returns a new filter pointing to the next items
   *
   * @return Copy of this filter but pointing to the next items.
   */
  next(): Filter {
    const filter = this.copy();
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

    filter.set('first', String(first), '=');
    filter.set('rows', String(rows), '=');

    return filter;
  }

  /**
   * Returns a new filter pointing to the previous items
   *
   * @return Copy of this filter but pointing to the previous items.
   */
  previous(): Filter {
    const filter = this.copy();
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

    filter.set('first', String(first), '=');
    filter.set('rows', String(rows), '=');

    return filter;
  }

  /**
   * Returns a new filter pointing to the first items
   *
   * @param first  Number of the first item to receive with this filter
   *               applied. Is 1 per default.
   *
   * @return Copy of this filter but pointing to the first items.
   */
  first(first: number = 1): Filter {
    const filter = this.copy();

    filter.set('first', String(first), '=');

    return filter;
  }

  /**
   * Returns a new filter to return all items
   *
   * Removes a filter restriction from the copy of this filter.
   *
   * @return Copy of this filter but removing the item count (rows) restriction.
   */
  all(): Filter {
    const filter = this.copy();

    filter.set('first', '1', '=');
    filter.set('rows', '-1', '=');

    return filter;
  }

  /**
   * Returns a simplified filter without first, rows and sort/sort-reverse terms
   *
   * @return Copy of this filter but without first, rows and sort/sort-reverse terms.
   */
  simple(): Filter {
    const filter = this.copy();

    filter.delete('first');
    filter.delete('rows');
    filter.delete(filter.getSortOrder());

    return filter;
  }

  /**
   * Merge other filter with an and operation
   *
   * @param filter  Filter to be merged with and operation
   *
   * @return This filter
   */
  and(filter: Filter | undefined | null): Filter {
    if (!hasValue(filter)) {
      return this;
    }

    const nonExtraTerms = this.getAllTerms().filter(
      term => isDefined(term.keyword) && !EXTRA_KEYWORDS.includes(term.keyword),
    );

    if (nonExtraTerms.length > 0) {
      this._addTerm(AND);
    }

    this._resetFilterId(); // filter has changed
    return this.merge(filter);
  }

  /**
   * Returns the sort order of the current filter
   *
   * @return The sort order. 'sort' or 'sort-reverse'.
   */
  getSortOrder(): SortOrder {
    return this.has(SORT_ORDER_DESC) ? SORT_ORDER_DESC : SORT_ORDER_ASC;
  }

  /**
   * Returns the sort by field name of the current filter
   *
   * @return The sort field name or undefined if no sort field is set.
   */
  getSortBy(): string | undefined {
    const order = this.getSortOrder();
    return this.get(order) as string | undefined;
  }

  /**
   * Set the current sort order
   *
   * @param value  New sort order. 'sort' or 'sort-reverse'.
   *
   * @return This filter.
   */
  setSortOrder(value: SortOrder) {
    const sortby = this.getSortBy();
    value = value === SORT_ORDER_DESC ? SORT_ORDER_DESC : SORT_ORDER_ASC;
    this.set(value, sortby);
    return this;
  }

  /**
   * Set the current sort field
   *
   * @param value  New sort field
   *
   * @return This filter.
   */
  setSortBy(value: string) {
    const order = this.getSortOrder();
    this.set(order, value);
    return this;
  }

  /**
   * Merges all terms from filter into this Filter
   *
   * @param filter Terms from filter to be merged.
   *
   * @return This filter with merged terms.
   */
  merge(filter: Filter | undefined | null) {
    if (hasValue(filter)) {
      this._addTerm(...filter.getAllTerms());
    }
    return this;
  }

  /**
   * Merges all new terms from filter into Filter
   *
   * @param filter Terms from filter to be merged.
   *
   * @return This filter with merged terms.
   */

  mergeKeywords(filter: Filter | undefined | null) {
    if (hasValue(filter)) {
      this._resetFilterId();

      this._mergeNewKeywords(filter);
    }
    return this;
  }

  /**
   * Merges additional EXTRA KEYWORD terms from filter into this Filter
   *
   * This filter will not be changed. Instead a copy with merged terms will be
   * created and returned. Only extra keywords not included in this filter will
   * be merged.
   *
   * @param filter  Use extra params terms filter to be merged.
   *
   * @return A new filter with merged terms.
   */
  mergeExtraKeywords(filter: Filter): Filter {
    const f = this.copy();
    f._resetFilterId();
    return f._mergeExtraKeywords(filter);
  }

  /**
   * Creates a new Filter from filterString
   *
   * @param [filterString] String to parse FilterTerms from.
   * @param [filter]       Use extra terms from filter if not already
   *                       parsed from filterString.
   *
   * @return New Filter with FilterTerms parsed from filterString.
   */
  static fromString(filterString?: string, filter?: Filter): Filter {
    const f = new Filter();

    f._setTerms(parseFilterTermsFromString(filterString));
    f._mergeExtraKeywords(filter);

    return f;
  }

  /**
   * Creates a new Filter from FilterTerms
   *
   * @param term FilterTerms to set for the new Filter
   *
   * @returns The new Filter
   */
  static fromTerm(...term: FilterTerm[]): Filter {
    const f = new Filter();
    return f._addTerm(...term);
  }
}

export const ALL_FILTER = new Filter().all();
export const ALERTS_FILTER_FILTER = Filter.fromString('type=alert');
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
