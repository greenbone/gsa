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

import {isDefined} from 'gmp/utils/identity';

import convert from './convert';

const RELATIONS = ['=', ':', '~', '>', '<'];

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
    this.keyword = isDefined(keyword) ? keyword.toLowerCase() : keyword;
    this.value = value;
    this.relation = relation;
  }

  /**
   * Checks if this FilterTerm has a keyword
   *
   * @returns {bool} True if this FilterTerm has a keyword
   */
  hasKeyword() {
    return isDefined(this.keyword);
  }

  /**
   * Checks if this FilterTerm has a relation
   *
   * @returns {bool} True if this FilterTerm has a relation
   */
  hasRelation() {
    return isDefined(this.relation);
  }

  /**
   * Checks if this FilterTerm has a value
   *
   * @returns {bool} True if this FilterTerm has a value
   */
  hasValue() {
    return isDefined(this.value);
  }

  /**
   * Return the filter term represented as a string
   *
   * The format is {keyword}{relation}{value}
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
    return (
      term instanceof FilterTerm &&
      isDefined(term) &&
      this.keyword === term.keyword &&
      this.value === term.value &&
      this.relation === term.relation
    );
  }

  /**
   * Creates a new FilterTerm from a string representation
   *
   * @param {String} termstring  String to parse FilterTerm from
   * @return {String} a new FilterTerm created from termstring
   */
  static fromString(termstring) {
    // use placeholder to ignore content in double quotes
    const modifiedTermString = termstring.replace(/".+?"/g, '####');

    for (const rel of RELATIONS) {
      if (modifiedTermString.includes(rel)) {
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
