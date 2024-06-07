/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */


import {isDefined} from '../../utils/identity';

import convert from './convert.js';

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
    this.keyword = isDefined(keyword) ? String(keyword).toLowerCase() : keyword;
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
