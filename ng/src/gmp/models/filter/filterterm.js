/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2016 - 2018 Greenbone Networks GmbH
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
import 'core-js/fn/string/includes';

import {is_defined} from '../../utils/identity';

import convert from './convert.js';

const RELATIONS = [
  '=', ':', '~', '>', '<',
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
  constructor({keyword, value, relation}) {
    this.keyword = keyword;
    this.value = value;
    this.relation = relation;
  }

  /**
   * Checks if this FilterTerm has a keyword
   *
   * @returns {bool} True if this FilterTerm has a keyword
   */
  hasKeyword() {
    return is_defined(this.keyword);
  }

  /**
   * Checks if this FilterTerm has a relation
   *
   * @returns {bool} True if this FilterTerm has a relation
   */
  hasRelation() {
    return is_defined(this.relation);
  }

  /**
   * Checks if this FilterTerm has a value
   *
   * @returns {bool} True if this FilterTerm has a value
   */
  hasValue() {
    return is_defined(this.value);
  }

  /**
   * Return the filter term represented as a string
   *
   * The fromat is {keyword}{relation}{value}
   *
   * @return {String} filter term as a String
   */
  toString() {
    const relation = this.hasRelation() ? this.relation : '';
    const value = this.hasValue() ? this.value : '';
    const keyword = this.hasKeyword() ? this.keyword : '';

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
    for (const rel of RELATIONS) {
      if (termstring.includes(rel)) {
        const index = termstring.indexOf(rel);
        const key = termstring.slice(0, index);
        const value = termstring.slice(index + 1);
        const converted = convert(key, value, rel);
        return new FilterTerm(converted);
      }
    }
    const converted = convert(undefined, termstring, undefined);
    return new FilterTerm(converted);
  }
}

export const AND = FilterTerm.fromString('and');
export const OR = FilterTerm.fromString('or');
export const NOT = FilterTerm.fromString('not');

export default FilterTerm;

// vim: set ts=2 sw=2 tw=80:
