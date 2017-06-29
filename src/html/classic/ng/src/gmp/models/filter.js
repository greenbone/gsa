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
  is_array,
  is_defined,
  is_empty,
  is_string,
  parse_int,
  includes,
} from '../utils.js';

import Model from '../model.js';

function convert_boolean_int(keyword, value, relation) {
  return {keyword, value: parse_int(value) >= 1 ? 1 : 0, relation};
}

function convert_int(keyword, value, relation) {
  return {keyword, value: parse_int(value), relation};
}

function convert_no_relation(keyword, value, relation) {
  return {keyword, value, relation: ''};
}

const KEYWORD_CONVERTERS = {
  min_qod: convert_int,
  apply_overrides: convert_boolean_int,
  rows: convert_int,
  first: convert_int,
  autofp: convert_int,
};

const VALUE_CONVERTERS = {
  and: convert_no_relation,
  or: convert_no_relation,
  not: convert_no_relation,
  re: convert_no_relation,
  regexp: convert_no_relation,
  '': convert_no_relation,
};

function convert(keyword, value, relation) {
  let converter = KEYWORD_CONVERTERS[keyword];
  if (is_defined(converter)) {
    return converter(keyword, value, relation);
  }

  converter = VALUE_CONVERTERS[value];
  if (is_defined(converter)) {
    return converter(keyword, value, relation);
  }

  if (is_empty(keyword)) {
    return {value, relation};
  }

  return {value, keyword, relation};
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
export class FilterTerm {

  /**
   * @param {String} keyword  Filter keyword
   * @param {String} value    Value of the filter term
   * @param {String} relation Relation between keyword and filter, =,<,>,...
   */
  constructor({keyword, value, relation}) {
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
    let relation = is_defined(this.relation) ? this.relation : '';
    let value = is_defined(this.value) ? this.value : '';
    let keyword = is_defined(this.keyword) ? this.keyword : '';

    return keyword + relation + value;
  }

  /**
   * Returns true if this term keyword, value and relation equal the other term
   *
   * @param {FilterTerm} term  other FilterTerm to compare to
   *
   * @return {bool} true if this and the other term equal
   */
  equals(term) {
    return term instanceof FilterTerm &&
      is_defined(term) &&
      this.keyword === term.keyword &&
      this.value === term.value &&
      this.relation === term.relation;
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
        let key = termstring.slice(0, index);
        let value = termstring.slice(index + 1);
        let converted = convert(key, value, rel);
        return new FilterTerm(converted);
      }
    }
    let converted = convert(undefined, termstring, undefined);
    return new FilterTerm(converted);
  }
}

/**
 * Represents a list of filter terms
 */
export class FilterTermList {

  /**
   * Create a new FilterTermList
   *
   * If the passed array of FilterTerms is undefined, an empty array is created.
   *
   * @param {Array}  terms    A list of FilterTerms or undefined
   * @param {String} keyword  Key for all FilterTerms
   */
  constructor(terms, keyword) {
    if (is_array(terms)) {
      this.terms = terms;
    }
    else if (is_defined(terms)) {
      this.terms = [terms];
    }
    else {
      this.terms = [];
    }
    this.keyword = keyword;
  }

  /**
   * Checks if this FilterTermList has a keyword
   *
   * @return {Boolean} true if this list has a keyword
   */
  hasKeyword() {
    return this.keyword !== undefined;
  }

  /**
   * Compare this FilterTermList to another list
   *
   * Returns true if all FilterTerms in this list are equal to the terms in the
   * other list and boths lists have the same length.
   *
   * @param {FilterTermList} list  A FilterTermList to compare
   *
   * @return {bool} True if both lists are equal
   */
  equals(list) {
    if (!is_defined(list) || !(list instanceof FilterTermList) ||
        this.length !== list.length || this.keyword !== list.keyword) {
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
    if (this.terms.length === 0 || !includes(EXTRA_KEYWORDS, term.keyword)) {
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
    return this.terms.map(term => term.toString()).join(' ').trim();
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
    return new FilterTermList(this.terms.slice(), this.keyword);
  }
}

/**
 * Represents a filter
 *
 * @extends Model
 */
export class Filter extends Model {

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
        let relation = keyword.relation;
        let value = keyword.value;

        let converted = convert(key, value, relation);

        this._addTerm(new FilterTerm(converted));
      });
      delete elem.keywords;
    }
    else if (is_defined(elem.term)) {
      this.parseString(elem.term);
    }

    return elem;
  }

  /**
   * Get the the first FilterTerm for a keyword
   *
   * @private
   *
   * @param {String} key  FilterTerm keyword to seach for
   *
   * @return {String} Returns the first FilterTerm for the passed keyword
   *                  or undefined of not FilterTerm for the keyword exists in
   *                  this Filter.
   */
  _getTerm(key) {
    let tlist = this.terms.find(list => key === list.keyword);
    return is_defined(tlist) ? tlist.get() : undefined;
  }

  /**
   * @private
   *
   * @param {FilterTerm} term  FilterTerm to set
   *
   * @return {Filter} This filter
   */
  _setTerm(term) {
    let key = term.keyword;

    // special handling of sort. should be put into a more generic solution in
    // future
    if (key === 'sort' && this.has('sort-reverse')) {
      this.delete('sort-reverse');
    }
    if (key === 'sort-reverse' && this.has('sort')) {
      this.delete('sort');
    }

    if (!is_defined(key) || !this.has(key)) {
      this._addTermList(new FilterTermList(term, key));
      return this;
    }

    this._getTermList(key).set(term);

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
    let key = term.keyword;

    if (!is_defined(key) || !this.has(key)) {
      this._addTermList(new FilterTermList(term, key));
      return this;
    }

    this._getTermList(key).add(term);

    return this;
  }

  /**
   * Add a FilterTermList to this Filter
   *
   * @private
   *
   * @param {FilterTermList} list  The FilterTermList
   *
   * @return {Filter} This filter
   */
  _addTermList(list) {
    this.terms.push(list);
    return this;
  }

  /**
   * Returns the FilterTermList for a FilterTerm keyword
   *
   * @private
   *
   * @param {String} key  FilterTerm keyword to seach for
   *
   * @return {FilterTermList} The FilterTermList for the passed keyword or
   *                          undefined.
   */
  _getTermList(key) {
    return this.terms.find(list => key === list.keyword);
  }

  _getTermLists() {
    let withKeywords = [];
    let withoutKeywords = [];

    this.forEach(list => {
      let keywordlist = list.hasKeyword() ? withKeywords : withoutKeywords;
      keywordlist.push(list);
    });

    return {
      withKeywords,
      withoutKeywords,
    };
  }

  /**
   * Calls passed function for each FilterTermList in this Filter
   *
   * @param {function} func  Function to call for each FilterTermList.
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
    this.forEach(list => {
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
    this.forEach(list => {
      const key = list.keyword;
      if (!is_defined(key) || !includes(EXTRA_KEYWORDS, key)) {
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
    this.forEach(list => {
      const key = list.keyword;
      if (is_defined(key) && includes(EXTRA_KEYWORDS, key)) {
        fstring += list.toString() + ' ';
      }
    });
    return fstring.trim();
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
    let term = this._getTerm(key);
    if (is_defined(term)) {
      return term.value;
    }
    return undefined;
  }

  /**
   * Creates a new FilterTerm from key, value and relation
   *
   * Creates a new FilterTerm from key, value and relation and sets it as the
   * only item in the corresponding FilterTermList for the key.
   *
   * @param {String} keyword   FilterTerm keyword
   * @param {String} value     FilterTerm value
   * @param {String} relation  FilterTerm relation (Default: '=').
   *
   * @return {Filter} This filter
   */
   set(keyword, value, relation = '=') {
     this._setTerm(new FilterTerm({keyword, value, relation}));
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
    let index = this.terms.findIndex(term => term.keyword === key);
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
    let index = this.terms.findIndex(term => term.keyword === key);
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

    const our = this._getTermLists();
    const other = filter._getTermLists();

    if (our.withKeywords.length !== other.withKeywords.length ||
      our.withoutKeywords.length !== other.withoutKeywords.length) {
      return false;
    }

    const match = our.withoutKeywords.every((list, index) => {
      // list without keywords must have same order
      // this isn't completely correct but required for and, or, ... currently
      // "abc and def" is the same as "def and abc" but "abc and def" won't be
      // the same as "and abc def"
      let otherlist = other.withoutKeywords[index];
      return list.equals(otherlist);
    });

    if (!match) {
      return false;
    }

    for (let list of our.withKeywords) {
      // lists with keywords may occur in different order
      let otherlist = filter._getTermList(list.keyword);
      if (!list.equals(otherlist)) {
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
    this.forEach(list => {
      f._addTermList(list.copy());
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
   * Returns a simplified filter without first, rows and sort/sort-reverse terms
   *
   * @return {Filter} Copy of this filter but without first, rows and
   *                  sort/sort-reverse terms.
   */
  simple() {
    let filter = this.copy();

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
    if (is_string(filterstring)) {
      let fterms = filterstring.split(' ');
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
   * @param {Filter} filter        Use extra params from filter if not already
   *                               parsed from filterstring.
   *
   * @return {Filter} New Filter with FilterTerms parsed from filterstring.
   */
  static fromString(filterstring, filter) {
    let f = new Filter();
    f.parseString(filterstring);

    if (is_defined(filter)) {
      filter.forEach(list => {
        let key = list.keyword;
        if (is_defined(key) && includes(EXTRA_KEYWORDS, key) && !f.has(key)) {
          f._addTermList(list.copy());
        }
      });
    }

    return f;
  }

}

export const ALL_FILTER = new Filter().all();
export const ASSETS_FILTER_FILTER = Filter.fromString('type=asset');
export const GROUPS_FILTER_FILTER = Filter.fromString('type=group');
export const NOTES_FILTER_FILTER = Filter.fromString('type=note');
export const OVERRIDES_FILTER_FILTER = Filter.fromString('type=override');
export const PORTLISTS_FILTER_FILTER = Filter.fromString('type=port_list');
export const REPORTS_FILTER_FILTER = Filter.fromString('type=report');
export const RESULTS_FILTER_FILTER = Filter.fromString('type=result');
export const ROLES_FILTER_FILTER = Filter.fromString('type=role');
export const TARGETS_FILTER_FILTER = Filter.fromString('type=target');
export const TASKS_FILTER_FILTER = Filter.fromString('type=task');
export const VULNS_FILTER_FILTER = Filter.fromString('type=vuln');
export const USERS_FILTER_FILTER = Filter.fromString('type=user');

export default Filter;

// vim: set ts=2 sw=2 tw=80:
