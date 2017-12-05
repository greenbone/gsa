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

import {
  for_each,
  is_defined,
  is_string,
  includes,
  map,
} from '../utils.js';

import Model from '../model.js';

import convert from './filter/convert.js';
import FilterTerm from './filter/filterterm.js';
import {EXTRA_KEYWORDS} from './filter/keywords.js';

/**
 * Represents a filter
 *
 * @extends Model
 */
class Filter extends Model {

  static entity_type = 'filter';

  get length() {
    return this.terms.length;
  }

  /**
   * Init the Filter
   *
   * Creates the internal data structure.
   */
  init() {
    this.terms = [];
  }

  /**
   * Parse properties from the passed element object for being set in this
   * Filter model.
   *
   * @param {Object} elem  Element object to parse properties from.
   *
   * @return {Object} An object with properties for the new Filter model
   */
  parseProperties(elem) {
    const ret = super.parseProperties(elem);

    ret.filter_type = ret._type;

    if (is_defined(ret.keywords)) {
      for_each(ret.keywords.keyword, keyword => {

        const {relation, value, column: key} = keyword;

        const converted = convert(key, value, relation);

        this._addTerm(new FilterTerm(converted));
      });
      delete ret.keywords;
    }
    else if (is_defined(ret.term)) {
      this.parseString(ret.term);

      // ret.term should not be part of the public api
      // but it's helpful for debug purposes
      ret._term = ret.term;
      delete ret.term;
    }

    if (is_defined(ret.alerts)) {
      ret.alerts = map(ret.alerts.alert, alert => new Model(alert, 'alert'));
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

    if (!is_defined(keyword) || !this.has(keyword)) {
      this._addTerm(term);
    }
    else {
      const index = this._getIndex(keyword);
      this.terms[index] = term;
    }
    return this;
  }

  /**
   * Add a FilterTerm to this Filter
   *
   * Adds the passed FilterTerm to the list of filtertems in this Filter.
   *
   * @private
   *
   * @param {FilterTerm} term  FilterTerm to add.
   *
   * @return {Filter} This filter
   */
  _addTerm(term) {
    this.terms.push(term);
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
  _merge(filter) {
    if (is_defined(filter)) {
      filter.forEach(term => {
        const {keyword: key} = term;
        if (is_defined(key) && includes(EXTRA_KEYWORDS, key) &&
          !this.has(key)) {
          this._addTerm(term);
        }
      });
    }
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
      if (!is_defined(key) || !includes(EXTRA_KEYWORDS, key)) {
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
      if (is_defined(key) && includes(EXTRA_KEYWORDS, key)) {
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
    if (!is_defined(key)) {
      return undefined;
    }
    return this.terms.find(term => key === term.keyword);
  }

  /**
   * Get all FilterTerms
   *
   * @returns {FilterTerm} Returns the array of all FilterTerms in this filter
   */
  getTerms() {
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
    if (is_defined(term)) {
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
     this._setTerm(new FilterTerm({
       keyword,
       value,
       relation,
     }));
     return this;
   }

  /**
   * Check wether this Filter contains a FilterTerm with the passed keyword
   *
   * @param {String} key  Keyword to search for
   *
   * @return {bool} Returns true if a FilterTerm with this keyword exists in
   *                this Filter.
   */
  has(key) {
    if (!is_defined(key)) {
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
    if (!is_defined(filter)) {
      return false;
    }

    if (this.length !== filter.length) {
      return false;
    }

    const ours = this.getTerms();
    const others = filter.getTerms();

    for (let i = 0; i < ours.length; i++) {
      const our = ours[i];
      const other = our.hasKeyword() ? filter.getTerm(our.keyword) : others[i];

      if (!our.equals(other)) {
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

    f._setTerms([...this.getTerms()]);
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

    if (!is_defined(rows)) {
      rows = 10;
    }

    if (is_defined(first)) {
      first += rows;
    }
    else {
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

    if (!is_defined(rows)) {
      rows = 10;
    }

    if (is_defined(first)) {
      first -= rows;
    }
    else {
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
    return f._merge(filter);
  }

  /**
   * Parses FilterTerms from filterstring and adds them to this Filter
   *
   * @param {String} filterstring  Filter representation as a string
   *
   * @return {Filter} This filter.
   */
  parseString(filterstring) {
    if (is_string(filterstring)) {
      const fterms = filterstring.split(' ');
      for (let fterm of fterms) {
        // strip whitespace
        fterm = fterm.trim();
        if (fterm.length > 0) {
          this._addTerm(FilterTerm.fromString(fterm));
        }
      }
    }
    return this;
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

    f.parseString(filterstring);
    f._merge(filter);

    return f;
  }

}

export const ALL_FILTER = new Filter().all();
export const AGENTS_FILTER_FILTER = Filter.fromString('type=agent');
export const ALERTS_FILTER_FILTER = Filter.fromString('type=alert');
export const ASSETS_FILTER_FILTER = Filter.fromString('type=asset');
export const CREDENTIALS_FILTER_FILTER = Filter.fromString('type=credential');
export const GROUPS_FILTER_FILTER = Filter.fromString('type=group');
export const FILTERS_FILTER_FILTER = Filter.fromString('type=filter');
export const NOTES_FILTER_FILTER = Filter.fromString('type=note');
export const OVERRIDES_FILTER_FILTER = Filter.fromString('type=override');
export const PORTLISTS_FILTER_FILTER = Filter.fromString('type=port_list');
export const REPORTS_FILTER_FILTER = Filter.fromString('type=report');
export const RESULTS_FILTER_FILTER = Filter.fromString('type=result');
export const ROLES_FILTER_FILTER = Filter.fromString('type=role');
export const SCANNERS_FILTER_FILTER = Filter.fromString('type=scanner');
export const TARGETS_FILTER_FILTER = Filter.fromString('type=target');
export const TASKS_FILTER_FILTER = Filter.fromString('type=task');
export const VULNS_FILTER_FILTER = Filter.fromString('type=vuln');
export const USERS_FILTER_FILTER = Filter.fromString('type=user');
export const REPORT_FORMATS_FILTER_FILTER = Filter.fromString(
  'type=report_format');
export const SCHEDULES_FILTER_FILTER = Filter.fromString('type=schedule');
export const TAGS_FILTER_FILTER = Filter.fromString('type=tag');

export default Filter;

// vim: set ts=2 sw=2 tw=80:
