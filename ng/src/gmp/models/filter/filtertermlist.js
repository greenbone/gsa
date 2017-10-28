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

import {is_array, is_defined, includes} from '../../utils.js';

import {EXTRA_KEYWORDS} from './keywords.js';

/**
 * Represents a list of filter terms
 */
class FilterTermList {

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

    for (const term of this.terms) {
      let found = false;
      for (const oterm of list.terms) {
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

export default FilterTermList;

// vim: set ts=2 sw=2 tw=80:
