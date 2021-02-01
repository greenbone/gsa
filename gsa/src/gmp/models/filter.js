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

import Model, {parseModelFromElement} from 'gmp/model';

import {setProperties} from 'gmp/parser';

import {isDefined, isString, isArray, hasValue} from 'gmp/utils/identity';
import {forEach, map} from 'gmp/utils/array';

import convert from './filter/convert';
import FilterTerm, {AND} from './filter/filterterm';
import {EXTRA_KEYWORDS} from './filter/keywords';

export const UNKNOWN_FILTER_ID = '0';

/**
 * Parses FilterTerms from filterstring
 *
 * @param {String} filterString  Filter representation as a string
 *
 * @return {Array} Array of parsed FilterTerms
 */
const parseFilterTermsFromString = filterString => {
  const terms = [];
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

  constructor() {
    super();

    this.terms = [];
  }

  get length() {
    return this.terms.length;
  }

  setProperties({id, ...properties}) {
    // override setProperties to allow changing the id
    setProperties(properties, this);
    this.id = id;
  }

  /**
   * Parse properties from the passed element object
   *
   * @param {Object} element  Element object to parse properties from.
   *
   * @return {Object} An object with properties for the new Filter model
   */
  static parseElement(element) {
    const ret = super.parseElement(element);

    ret.filter_type = ret._type;

    if (ret.id === UNKNOWN_FILTER_ID) {
      ret.id = undefined;
    }
    ret.terms = [];

    if (isDefined(ret.keywords)) {
      forEach(ret.keywords.keyword, keyword => {
        const {relation, value, column: key} = keyword;

        const converted = convert(key, value, relation);

        ret.terms.push(new FilterTerm(converted));
      });
      delete ret.keywords;
    } else if (isDefined(ret.term)) {
      ret.terms = parseFilterTermsFromString(ret.term);

      // ret.term should not be part of the public api
      // but it's helpful for debug purposes
      ret._term = ret.term;
      delete ret.term;
    }

    if (isDefined(ret.alerts)) {
      ret.alerts = map(ret.alerts.alert, alert =>
        parseModelFromElement(alert, 'alert'),
      );
    }

    return ret;
  }

  /**
   * @private
   *
   * @param {FilterTerm} term  FilterTerm to set
   *
   * @return {Filter} This filter
   */
  _setTerm(term) {
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
   * Adds the passed FilterTerm to the list of filtertems in this Filter.
   *
   * @private
   *
   * @param {FilterTerm} term  FilterTerm to add.
   *
   * @return {Filter} This filter
   */
  _addTerm(...terms) {
    this.terms.push(...terms);
    return this;
  }

  /**
   * Set the FilterTerm array of this Filter
   *
   * @private
   *
   * @param {Array} terms  Array of FilterTerms to set.
   *
   * @return {Filter} This filter
   */
  _setTerms(terms) {
    this.terms = terms;
    return this;
  }

  /**
   * Get the first index of the FilterTerm with key as keyword
   *
   * @param {String} key FilterTerm keyword to search for
   *
   * @returns {Integer} Index of the key in the FilterTerms array
   */
  _getIndex(key) {
    return this.terms.findIndex(term => term.keyword === key);
  }

  /**
   * Merges additional EXTRA KEYWORD terms from filter into this Filter
   *
   * Only extra keywords not included in this filter will be merged.
   *
   * @private
   *
   * @param {Filter} filter  Use extra params terms filter to be merged.
   *
   * @return {Filter} This filter with merged terms.
   */

  _mergeExtraKeywords(filter) {
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
   * @param {Filter} filter  Use extra params terms filter to be merged.
   *
   * @return {Filter} This filter with merged terms.
   */
  _mergeNewKeywords(filter) {
    if (hasValue(filter)) {
      filter.forEach(term => {
        const {keyword: key} = term;
        if (isDefined(key)) {
          !this.has(key) && this._addTerm(term);
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
   * @return {Filter} This filter.
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
  forEach(func) {
    this.terms.forEach(func);
  }

  /**
   * Returns a full string representation of this Filter
   *
   * @return {String} String which represents this filter.
   */
  toFilterString() {
    let fstring = '';
    this.forEach(term => {
      fstring += term.toString() + ' ';
    });
    return fstring.trim();
  }

  /**
   * Returns the filter criteria as a string
   *
   * Converts each non extra keyword FilterTerm to a string representation.
   *
   * @return {String} The filter criteria terms as string
   */
  toFilterCriteriaString() {
    let fstring = '';
    this.forEach(term => {
      const key = term.keyword;
      if (!isDefined(key) || !EXTRA_KEYWORDS.includes(key)) {
        fstring += term.toString() + ' ';
      }
    });
    return fstring.trim();
  }

  /**
   * Returns the filter extra keyword FilterTerms as a string
   *
   * Converts each extra keyword FilterTerm to a string representation.
   *
   * @return {String} The filter extra keyword terms as a string
   */
  toFilterExtraString() {
    let fstring = '';
    this.forEach(term => {
      const key = term.keyword;
      if (isDefined(key) && EXTRA_KEYWORDS.includes(key)) {
        fstring += term.toString() + ' ';
      }
    });
    return fstring.trim();
  }

  /**
   * Get the first FilterTerm for a keyword
   *
   * @param {String} key  FilterTerm keyword to search for
   *
   * @return {String} Returns the first FilterTerm for the passed keyword
   *                  or undefined of not FilterTerm for the keyword exists in
   *                  this Filter.
   */
  getTerm(key) {
    if (!isDefined(key)) {
      return undefined;
    }
    return this.terms.find(term => key === term.keyword);
  }

  /**
   * Check if a filter term is included in this filter
   *
   * @param {FilterTerm} term  FilterTerm to find in the filter
   *
   * @return {Boolean}
   */
  hasTerm(term) {
    const terms = this.getTerms(term.keyword);
    return terms.findIndex(cterm => cterm.equals(term)) !== -1;
  }

  /**
   * Get all FilterTerms for a keyword
   *
   * @param {String} key FilterTerm keyword to search for
   *
   * @returns {Array} Returns all FilterTerms in an Array found for
   *                  the passed keyword or an empty Array if not FilterTerm
   *                  has been found.
   */
  getTerms(key) {
    if (!isDefined(key)) {
      return [];
    }

    return this.terms.reduce((terms, term) => {
      if (term.keyword === key) {
        terms.push(term);
      }
      return terms;
    }, []);
  }

  /**
   * Get all FilterTerms
   *
   * @returns {Array} Returns the array of all FilterTerms in this filter
   */
  getAllTerms() {
    return this.terms;
  }

  /**
   * Get the value of a FilterTerm
   *
   * @param {String} key  FilterTerm keyword to search for
   * @param {String} def  Value returned if no FilterTerm for key could be
   *                      found. Defaults to undefined.
   *
   * @return {String} Returns the first FilterTerm value for the passed keyword
   *                  or def if no FilterTerm for the keyword exists in this
   *                  Filter.
   */
  get(key, def = undefined) {
    const term = this.getTerm(key);
    if (isDefined(term)) {
      return term.value;
    }
    return def;
  }

  /**
   * Creates a new FilterTerm from key, value and relation
   *
   * Creates a new FilterTerm from key, value and relation.
   *
   * @param {String} keyword   FilterTerm keyword
   * @param {String} value     FilterTerm value
   * @param {String} relation  FilterTerm relation (Default: '=').
   *
   * @return {Filter} This filter
   */
  set(keyword, value, relation = '=') {
    this._resetFilterId(); // reset id because the filter has changed
    const converted = convert(keyword, value, relation);
    this._setTerm(new FilterTerm(converted));
    return this;
  }

  /**
   * Check whether this Filter contains a FilterTerm with the passed keyword
   *
   * @param {String} key  Keyword to search for
   *
   * @return {bool} Returns true if a FilterTerm with this keyword exists in
   *                this Filter.
   */
  has(key) {
    if (!isDefined(key)) {
      return false;
    }
    const index = this._getIndex(key);
    return index !== -1;
  }

  /**
   * Remove all FilterTerms with this key
   *
   * @param {String} key Filter term key to remove
   *
   * @return {Filter} This filter
   */
  delete(key) {
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
   * @param {Filter} filter  Other filter to compare to.
   *
   * @return {bool} Returns true if this filter equals to the other filter
   */
  equals(filter) {
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
        const otherterms = filter.getTerms(our.keyword);
        const ourterms = this.getTerms(our.keyword);

        if (otherterms.length !== ourterms.length) {
          return false;
        }

        const equals = otherterms.reduce(
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
   * @return {Filter} A shallow copy of this filter.
   */
  copy() {
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
   * @return {Filter} Copy of this filter but pointing to the next items.
   */
  next() {
    const filter = this.copy();
    let first = filter.get('first');
    let rows = filter.get('rows');

    if (!isDefined(rows)) {
      rows = 10;
    }

    if (isDefined(first)) {
      first += rows;
    } else {
      first = 1;
    }

    filter.set('first', first, '=');
    filter.set('rows', rows, '=');

    return filter;
  }

  /**
   * Returns a new filter pointing to the previous items
   *
   * @return {Filter} Copy of this filter but pointing to the previous items.
   */
  previous() {
    const filter = this.copy();
    let first = filter.get('first');
    let rows = filter.get('rows');

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

    filter.set('first', first, '=');
    filter.set('rows', rows, '=');

    return filter;
  }

  /**
   * Returns a new filter pointing to the first items
   *
   * @param {Number} first  Number of the first item to receive with this filter
   *                        applied. Is 1 per default.
   *
   * @return {Filter} Copy of this filter but pointing to the first items.
   */
  first(first = 1) {
    const filter = this.copy();

    filter.set('first', first, '=');

    return filter;
  }

  /**
   * Returns a new filter to return all items
   *
   * Removes a filter restriction from the copy of this filter.
   *
   * @return {Filter} Copy of this filter but removing the item count (rows)
   *                  restriction.
   */
  all() {
    const filter = this.copy();

    filter.set('first', 1, '=');
    filter.set('rows', -1, '=');

    return filter;
  }

  /**
   * Returns a simplified filter without first, rows and sort/sort-reverse terms
   *
   * @return {Filter} Copy of this filter but without first, rows and
   *                  sort/sort-reverse terms.
   */
  simple() {
    const filter = this.copy();

    filter.delete('first');
    filter.delete('rows');
    filter.delete(filter.getSortOrder());

    return filter;
  }

  /**
   * Returns a new filter without first and rows terms
   *
   * @return {Filter} Copy of this filter but without first and rows terms.
   */
  withoutView() {
    const filter = this.copy();

    filter.delete('first');
    filter.delete('rows');

    return filter;
  }

  /**
   * Merge other filter with an and operation
   *
   * @param {Filter} filter  Filter to be merged with and operation
   *
   * @return {Filter} This filter
   */
  and(filter) {
    if (!hasValue(filter)) {
      return this;
    }

    const nonExtraTerms = this.getAllTerms().filter(
      term => !EXTRA_KEYWORDS.includes(term.keyword),
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
   * @return {String} The sort order. 'sort' or 'sort-reverse'.
   */
  getSortOrder() {
    return this.has('sort-reverse') ? 'sort-reverse' : 'sort';
  }

  /**
   * Returns the sort by field name of the current filter
   *
   * @return {String} The sort order. 'sort' or 'sort-reverse'.
   */
  getSortBy() {
    const order = this.getSortOrder();
    return this.get(order);
  }

  /**
   * Set the current sort order
   *
   * @param {String} value  New sort order. 'sort' or 'sort-reverse'.
   *
   * @return {Filter} This filter.
   */
  setSortOrder(value) {
    const sortby = this.getSortBy();
    value = value === 'sort-reverse' ? 'sort-reverse' : 'sort';
    this.set(value, sortby);
    return this;
  }

  /**
   * Set the current sort field
   *
   * @param {String} value  New sort field
   *
   * @return {Filter} This filter.
   */
  setSortBy(value) {
    const order = this.getSortOrder();
    this.set(order, value);
    return this;
  }

  /**
   * Merges all terms from filter into this Filter
   *
   * @param {Filter} filter  Terms from filter to be merged.
   *
   * @return {Filter} This filter with merged terms.
   */
  merge(filter) {
    if (hasValue(filter)) {
      this._addTerm(...filter.getAllTerms());
    }
    return this;
  }

  /**
   * Merges all new terms from filter into Filter
   *
   * @param {Filter} filter  Terms from filter to be merged.
   *
   * @return {Filter} This filter with merged terms.
   */

  mergeKeywords(filter) {
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
   * @param {Filter} filter  Use extra params terms filter to be merged.
   *
   * @return {Filter} A new filter with merged terms.
   */
  mergeExtraKeywords(filter) {
    const f = this.copy();
    f._resetFilterId();
    return f._mergeExtraKeywords(filter);
  }

  /**
   * Creates a new Filter from filterstring
   *
   * @param {String} filterstring  String to parse FilterTerms from.
   * @param {Filter} filter        Use extra terms from filter if not already
   *                               parsed from filterstring.
   *
   * @return {Filter} New Filter with FilterTerms parsed from filterstring.
   */
  static fromString(filterstring, filter) {
    const f = new Filter();

    f._setTerms(parseFilterTermsFromString(filterstring));
    f._mergeExtraKeywords(filter);

    return f;
  }

  /**
   * Creates a new Filter from FilterTerms
   *
   * @param {FilterTerm} term  FilterTerms to set for the new Filter
   *
   * @returns {Filter} The new Filter
   */
  static fromTerm(...term) {
    const f = new Filter();
    return f._addTerm(...term);
  }
}

export const ALL_FILTER = new Filter().all();
export const ALERTS_FILTER_FILTER = Filter.fromString('type=alert');
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
export const OVALDEFS_FILTER_FILTER = Filter.fromString('type=info');
export const OVERRIDES_FILTER_FILTER = Filter.fromString('type=override');
export const PORTLISTS_FILTER_FILTER = Filter.fromString('type=port_list');
export const PERMISSIONS_FILTER_FILTER = Filter.fromString('type=permission');
export const REPORT_FORMATS_FILTER_FILTER = Filter.fromString(
  'type=report_format',
);
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

// vim: set ts=2 sw=2 tw=80:
