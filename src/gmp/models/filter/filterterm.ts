/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import convert, {type FilterTermObject} from 'gmp/models/filter/convert';
import {isDefined} from 'gmp/utils/identity';

const RELATIONS = ['=', ':', '~', '>', '<'];

/**
 * Represents a filter term
 *
 * A filter term consists of a keyword, a value and a relation between both.
 * Additionally a filter term can have only a keyword or only keyword and
 * relation.
 *
 * A FilterTerm is expected to be immutable. A user MUST NOT change the keyword,
 * value or relation after creation. This can lead to unexpected behavior.
 */
class FilterTerm {
  keyword?: string;
  value?: string | number;
  relation?: string;

  /**
   * @param keyword  Filter keyword
   * @param value    Value of the filter term
   * @param relation Relation between keyword and filter, =,<,>,...
   */
  constructor({keyword, value, relation}: FilterTermObject) {
    this.keyword = isDefined(keyword) ? String(keyword).toLowerCase() : keyword;
    this.value = value;
    this.relation = relation;
  }

  /**
   * Checks if this FilterTerm has a keyword
   *
   * @returns True if this FilterTerm has a keyword
   */
  hasKeyword(): boolean {
    return isDefined(this.keyword);
  }

  /**
   * Checks if this FilterTerm has a relation
   *
   * @returns True if this FilterTerm has a relation
   */
  hasRelation(): boolean {
    return isDefined(this.relation);
  }

  /**
   * Checks if this FilterTerm has a value
   *
   * @returns True if this FilterTerm has a value
   */
  hasValue(): boolean {
    return isDefined(this.value);
  }

  /**
   * Return the filter term represented as a string
   *
   * The format is {keyword}{relation}{value}
   *
   * @return filter term as a String
   */
  toString(): string {
    const relation = this.hasRelation() ? this.relation : '';
    const value = this.hasValue() ? this.value : '';
    const keyword = this.hasKeyword() ? this.keyword : '';

    // @ts-expect-error
    return keyword + relation + value;
  }

  /**
   * Returns true if this term keyword, value and relation equal the other term
   *
   * @param {FilterTerm} term  other FilterTerm to compare to
   *
   * @return {boolean} true if this and the other term equal
   */
  equals(term: FilterTerm): boolean {
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
   * @param {string} termString  String to parse FilterTerm from
   * @return {FilterTerm} a new FilterTerm created from termString
   */
  static fromString(termString: string): FilterTerm {
    // use placeholder to ignore content in double quotes
    const modifiedTermString = termString.replace(/".+?"/g, '####');

    for (const rel of RELATIONS) {
      if (modifiedTermString.includes(rel)) {
        const index = termString.indexOf(rel);
        const key = termString.slice(0, index);
        const value = termString.slice(index + 1);
        const converted = convert(key, value, rel);
        return new FilterTerm(converted);
      }
    }
    const converted = convert(undefined, termString, undefined);
    return new FilterTerm(converted);
  }
}

export const AND = FilterTerm.fromString('and');
export const OR = FilterTerm.fromString('or');
export const NOT = FilterTerm.fromString('not');

export default FilterTerm;
