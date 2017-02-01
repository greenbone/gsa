/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2016 Greenbone Networks GmbH
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

import {for_each, is_string, is_defined, parse_int} from '../../utils.js';

import Model from '../model.js';

function parse_boolean_int(value) {
  return parse_int(value) >= 1 ? 1 : 0;
}

const CONVERTERS = {
  min_qod: parse_int,
  apply_overrides: parse_boolean_int,
  rows: parse_int,
  first: parse_int,
  autofp: parse_int,
};

function convert(key, value) {
  let converter = CONVERTERS[key];
  if (is_defined(converter)) {
    let val = converter(value);
    return val;
  }
  return value;
}

const RELATIONS = [
  '=', ':', '~', '>', '<',
];

const EXTRA_KEYWORDS = [
  'apply_overrides', 'autofp', 'rows', 'first', 'sort', 'sort-reverse',
  'notes', 'overrides', 'timezone', 'result_hosts_only', 'levels', 'min_qod',
  'delta_states',
];

/**
 * Represents a filter term
 *
 * A filter term consists of a keyword, a value and a relation between both.
 * Additionally a filter term can have only a keyword or only keyword and
 * relation.
 *
 * A FilterTerm is expected to be immutable. A user MUST NOT change the keyword,
 * value or relation after creation. This can lead to unexpected behaviour.
 */
class FilterTerm {

  /**
   * @param {String} keyword  Filter keyword
   * @param {String} value    Value of the filter term
   * @param {String} relation Relation between keyword and filter, =,<,>,...
   */
  constructor(keyword, value, relation) {
    this.keyword = keyword;
    this.value = value;
    this.relation = relation;
  }

  /**
   * Return the filter term represented as a string
   *
   * The fromat is {keyword}{relation}{value}
   *
   * @return {String} filter term as a String
   */
  toString() {
    let relation;
    let value;

    if (is_defined(this.value)) {
      value = this.value;
    }
    else {
      value = '';
    }
    if (is_defined(this.relation)) {
      relation = this.relation;
    }
    else if (is_defined(this.value)) {
      relation = '=';
    }
    else {
      relation = '';
    }
    return '' + this.keyword + relation + value;
  }

  /**
   * Returns true if this term keyword, value and relation equal the other term
   *
   * @param {FilterTerm} term  other FilterTerm to compare to
   *
   * @return {bool} true if this and the other term equal
   */
  equals(term) {
    return is_defined(term) && this.keyword === term.keyword &&
      this.value === term.value && this.relation === term.relation;
  }

  /**
   * Creates a new FilterTerm from a string representation
   *
   * @param {String} termstring  String to parse FilterTerm from
   * @return {String} a new FilterTerm created from termstring
   */
  static fromString(termstring) {
    for (let rel of RELATIONS) {
      if (termstring.includes(rel)) {
        let index = termstring.indexOf(rel);
        let keyword = termstring.slice(0, index);
        let value = convert(keyword, termstring.slice(index + 1));
        return new FilterTerm(keyword, value, rel);
      }
    }
    return new FilterTerm(termstring);
  }
}

/**
 * Represents a list of filter terms
 */
class FilterTermList {

  /**
   * Create a new FilterTermList
   *
   * If the passed array of FilterTerms is undefined, an empty array is created.
   *
   * @param {Array} terms  A list of FilterTerms or undefined
   */
  constructor(terms) {
    this.terms = is_defined(terms) && is_defined(terms.length) ? terms : [];
  }

  /**
   * Comparse this FilterTermList to another list
   *
   * Returns true if all FilterTerms in this list are equal to the terms in the
   * other list and boths lists have the same length.
   *
   * @param {FilterTermList} list  A FilterTermList to compare
   *
   * @return {bool} True if both lists are equal
   */
  equals(list) {
    if (!is_defined(list) || this.length !== list.length) {
      return false;
    }

    for (let term of this.terms) {
      let found = false;
      for (let oterm of list.terms) {
        if (term.equals(oterm)) {
          found = true;
          break;
        }
      }
      if (!found) {
        return false;
      }
    }

    return true;
  }

  /**
   * Add a FilterTerm to this list
   *
   * The FilterTerm is only added if the current list is empty of the terms
   * keyword is not an extra keyword.
   *
   * @param {FilterTerm} term  A FilterTerm to add to this list
   *
   * @return {FilterTermList} Returns this
   */
  add(term) {
    if (this.terms.length === 0 || !EXTRA_KEYWORDS.includes(term.keyword)) {
      this.terms.push(term);
    }
    return this;
  }

  /**
   * Set the FilterTerm of this list.
   *
   * The FilterTerm is set as the only term in this list. The original list is
   * withdrawn.
   *
   * @param {FilterTerm} term  A FilterTerm to set in this list
   *
   * @return {FilterTermList} Returns this
   */
  set(term) {
    this.terms = [term];
    return this;
  }

  /**
   * Call func for each FilterTerm in this list
   *
   * @param {function} func  A function to call for every FilterTerm in this
   *                         list.
   */
  forEach(func) {
    this.terms.forEach(func);
  }

  /**
   * Get the first FilterTerm of this list
   *
   * @return {FilterTerm} Returns the first FilterTerm of this list or undefined
   *                      if the list is empty.
   */
  get() {
    return this.terms[0];
  }

  /**
   * Converts this FilterTermList to a string representation
   *
   * @return {String} The string representation if this FilterTermList
   */
  toString() {
    return this.terms.map(term => term.toString()).join(' ');
  }

  /**
   * Returns the length of this list
   *
   * @return {Number} The number of FilterTerms in this list
   */
  get length() {
    return this.terms.length;
  }

  /**
   * Creates a copy of this FilterTermList
   *
   * The copy is only a shallow copy. FilterTerms in this list are only copied
   * by reference.
   *
   * @return {FilterTermList} A copy of this list
   */
  copy() {
    return new FilterTermList(this.terms.slice());
  }
}

/**
 * Represents a filter
 *
 * @extends Model
 */
export class Filter extends Model {

  get length() {
    return this.terms.size;
  }

  /**
   * Init the Filter
   *
   * Creates the internal data structure.
   */
  init() {
    this.terms = new Map();
  }

  /**
   * Parse properties from the passed element object for beeing set in this
   * Filter model.
   *
   * @param {Object} elem  Element object to parse properties from.
   *
   * @return {Object} An object with properties for the new Filter model
   */
  parseProperties(elem) {
    elem = super.parseProperties(elem);

    if (is_defined(elem.keywords)) {
      for_each(elem.keywords.keyword, keyword => {

        let key = keyword.column;
        let value;

        if (is_string(key) && key.length === 0) {
          key = keyword.value;
          value = '';
        }
        else {
          value = convert(key, keyword.value);
        }

        if (is_string(key) && key.length > 0) {
          this.addTerm(new FilterTerm(key, value, keyword.relation));
        }
      });
      delete elem.keywords;
    }
    else if (is_defined(elem.term)) {
      this.parseString(elem.term);
    }

    return elem;
  }

  /**
   * Calls passed function for each FilterTermList in this Filter
   *
   * @param {function} func  Function to call for each FilterTermList. The
   *                         function is called with termlist, keyword
   *                         parameters.
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
    this.forEach((list, key) => {
      fstring += list.toString() + ' ';
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
    this.forEach((list, key) => {
      if (!EXTRA_KEYWORDS.includes(key)) {
        fstring += list.toString() + ' ';
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
    this.forEach((list, key) => {
      if (EXTRA_KEYWORDS.includes(key)) {
        fstring += list.toString() + ' ';
      }
    });
    return fstring.trim();
  }

  /**
   * Creates a new FilterTerm from key, value and relation
   *
   * Creates a new FilterTerm from key, value and relation and sets it as the
   * only item in the corresponding FilterTermList for the key.
   *
   * @param {String} key       FilterTerm keyword
   * @param {String} value     FilterTerm value
   * @param {String} relation  FilterTerm relation
   *
   */
  set(key, value, relation) {
    this.setTerm(new FilterTerm(key, value, relation));
  }

  /**
   * Get the value of a FilterTerm
   *
   * @param {String} key  FilterTerm keyword to seach for
   *
   * @return {String} Returns the first FilterTerm value for the passed keyword
   *                  or undefined of not FilterTerm for the keyword exists in
   *                  this Filter.
   */
  get(key) {
    let term = this.getTerm(key);
    if (is_defined(term)) {
      return term.value;
    }
    return undefined;
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
    return this.terms.has(key);
  }

  /**
   * Remove all FilterTerms with this key
   *
   * @param {String} key Filter term key to remove
   *
   * @return {Filter} This filter
   */
  delete(key) {
    this.terms.delete(key);
    return this;
  }

  /**
   * Get the the first FilterTerm for a keyword
   *
   * @param {String} key  FilterTerm keyword to seach for
   *
   * @return {String} Returns the first FilterTerm for the passed keyword
   *                  or undefined of not FilterTerm for the keyword exists in
   *                  this Filter.
   */
  getTerm(key) {
    if (!this.has(key)) {
      return undefined;
    }
    return this.terms.get(key).get();
  }

  /**
   * Sets the FilterTerm in this Filter
   *
   * Sets the passed FilterTerm as the only FilterTerm for its keyword in this
   * Filter.
   *
   * @param {FilterTerm} term  FilterTerm to set
   *
   * @return {Filter} This filter
   */
  setTerm(term) {
    let key = term.keyword;

    // special handling of sort. should be put into a more generic solution in
    // future
    if (key === 'sort' && this.has('sort-reverse')) {
      this.delete('sort-reverse');
    }
    if (key === 'sort-reverse' && this.has('sort')) {
      this.delete('sort');
    }

    if (!this.has(key)) {
      this.setTermList(key, new FilterTermList([term]));
      return this;
    }

    this.getTermList(key).set(term);

    return this;
  }

  /**
   * Add a FilterTerm to this Filter
   *
   * Adds the passed FilterTerm to the list of filtertems in this Filter.
   *
   * @param {FilterTerm} term  FilterTerm to add.
   *
   * @return {Filter} This filter
   */
  addTerm(term) {
    let key = term.keyword;

    if (!this.has(key)) {
      this.setTermList(key, new FilterTermList([term]));
      return this;
    }

    this.getTermList(key).add(term);

    return this;
  }

  /**
   * Returns the FilterTermList for a FilterTerm keyword
   *
   * @param {String} key  FilterTerm keyword to seach for
   *
   * @return {FilterTermList} The FilterTermList for the passed keyword or
   *                          undefined.
   */
  getTermList(key) {
    return this.terms.get(key);
  }

  /**
   * Set a FilterTermList for a keyword in this Filter
   *
   * @param {String} key           The FilterTerm keyword to set the list for
   * @param {FilterTermList} list  The FilterTermList to connect to the keyword
   *
   * @return {Filter} This filter
   */
  setTermList(key, list) {
    this.terms.set(key, list);
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

    for (let [key, list] of this.terms) {
      let flist = filter.getTermList(key);

      if (!list.equals(flist)) {
        return false;
      }
    }
    return true;
  }

  /**
   * Creates a copy of this filter
   *
   * The returned copy is only a shallow copy of this filter. Each
   * FilterTermList is copied but the containing FilterTerms are copied only by
   * reference. As a result the FilterTermLists of the copy may be changed
   * independently of the original one.
   *
   * @return {Filter} A shallow copy of this filter.
   */
  copy() {
    let f = new Filter();
    this.forEach((list, key) => {
      f.setTermList(key, list.copy());
    });
    return f;
  }

  /**
   * Returns a new filter pointing to the next items
   *
   * @return {Filter} Copy of this filter but pointing to the next items.
   */
  next() {
    let filter = this.copy();
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
    let filter = this.copy();
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
    let filter = this.copy();

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
    let filter = this.copy();

    filter.set('first', 1, '=');
    filter.set('rows', -1, '=');

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
    let order = this.getSortOrder();
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
    let sortby = this.getSortBy();
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
    let order = this.getSortOrder();
    this.set(order, value);
    return this;
  }

  /**
   * Parses FilterTerms from filterstring and adds them to this Filter
   *
   * @param {String} filterstring  Filter representation as a string
   *
   * @return {Filter} This filter.
   */
  parseString(filterstring) {
    let fterms = filterstring.split(' ');
    for (let fterm of fterms) {
      this.addTerm(FilterTerm.fromString(fterm));
    }
    return this;
  }

  /**
   * Creates a new Filter from filterstring
   *
   * @param {String} filterstring  String to parse FilterTerms from.
   * @param {Filter} filter        Use extra params from filter if not already
   *                               parsed from filterstring.
   *
   * @return {Filter} New Filter with FilterTerms parsed from filterstring.
   */
  static fromString(filterstring, filter) {
    let f = new Filter();
    f.parseString(filterstring);

    if (is_defined(filter)) {
      filter.forEach((list, key) => {
        if (EXTRA_KEYWORDS.includes(key) && !f.has(key)) {
          f.setTermList(key, list.copy());
        }
      });
    }

    return f;
  }

}

export default Filter;

// vim: set ts=2 sw=2 tw=80:
