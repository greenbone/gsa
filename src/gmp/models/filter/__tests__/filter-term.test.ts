/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import FilterTerm, {
  parseFilterTermsFromString,
} from 'gmp/models/filter/filter-term';

describe('FilterTerm tests', () => {
  describe('FilterTerm equals', () => {
    test('should not equal object', () => {
      const term = new FilterTerm({});
      // @ts-expect-error
      expect(term.equals({})).toBe(false);
    });

    test('should equal self', () => {
      const term = new FilterTerm({});
      expect(term.equals(term)).toBe(true);
    });

    test('empty terms should be equal', () => {
      const term1 = new FilterTerm({});
      const term2 = new FilterTerm({});
      expect(term1.equals(term2)).toBe(true);
    });

    test('terms with different keywords should not be equal', () => {
      const term1 = new FilterTerm({
        keyword: 'abc',
        relation: '=',
        value: '1',
      });
      const term2 = new FilterTerm({
        keyword: 'def',
        relation: '=',
        value: '1',
      });
      expect(term1.equals(term2)).toBe(false);
    });

    test('terms with different relations should not be equal', () => {
      const term1 = new FilterTerm({
        keyword: 'abc',
        relation: '=',
        value: '1',
      });
      const term2 = new FilterTerm({
        keyword: 'abc',
        relation: '~',
        value: '1',
      });
      expect(term1.equals(term2)).toBe(false);
    });

    test('terms with different values should not be equal', () => {
      const term1 = new FilterTerm({
        keyword: 'abc',
        relation: '=',
        value: '1',
      });
      const term2 = new FilterTerm({
        keyword: 'abc',
        relation: '=',
        value: '2',
      });
      expect(term1.equals(term2)).toBe(false);
    });

    test('terms should be equal', () => {
      const term1 = new FilterTerm({
        keyword: 'abc',
        relation: '=',
        value: '1',
      });
      const term2 = new FilterTerm({
        keyword: 'abc',
        relation: '=',
        value: '1',
      });
      expect(term1.equals(term2)).toBe(true);
    });
  });

  describe('FilterTerm fromString', () => {
    test('should parse single value', () => {
      const term = FilterTerm.fromString('abc');

      expect(term.keyword).toBeUndefined();
      expect(term.value).toEqual('abc');
      expect(term.relation).toBeUndefined();
    });

    test('should parse term with relation', () => {
      const term = FilterTerm.fromString('abc=22');

      expect(term.keyword).toEqual('abc');
      expect(term.value).toEqual('22');
      expect(term.relation).toEqual('=');
    });

    test('should parse special keywords', () => {
      const term1 = FilterTerm.fromString('apply_overrides=22');

      expect(term1.keyword).toEqual('apply_overrides');
      expect(term1.value).toEqual(1);
      expect(term1.relation).toEqual('=');

      const term2 = FilterTerm.fromString('notes>4');

      expect(term2.keyword).toEqual('notes');
      expect(term2.value).toEqual(1);
      expect(term2.relation).toEqual('>');
    });

    test('should parse value with double quotes', () => {
      const term = FilterTerm.fromString('foo="abc def"');

      expect(term.keyword).toEqual('foo');
      expect(term.value).toEqual('"abc def"');
      expect(term.relation).toEqual('=');
    });

    test('should parse value with double quotes and special characters', () => {
      const term = FilterTerm.fromString('foo="abc : def"');

      expect(term.keyword).toEqual('foo');
      expect(term.value).toEqual('"abc : def"');
      expect(term.relation).toEqual('=');
    });

    test('should parse correct relation with double quotes and special characters', () => {
      const term = FilterTerm.fromString('foo~"abc = def"');

      expect(term.keyword).toEqual('foo');
      expect(term.value).toEqual('"abc = def"');
      expect(term.relation).toEqual('~');
    });
  });

  describe('Compound statement parsing', () => {
    test('should parse and', () => {
      const term = FilterTerm.fromString('and');

      expect(term.keyword).toBeUndefined();
      expect(term.value).toBe('and');
      expect(term.relation).toBeUndefined();
    });

    test('should parse or', () => {
      const term = FilterTerm.fromString('or');

      expect(term.keyword).toBeUndefined();
      expect(term.value).toBe('or');
      expect(term.relation).toBeUndefined();
    });

    test('should parse not', () => {
      const term = FilterTerm.fromString('not');

      expect(term.keyword).toBeUndefined();
      expect(term.value).toBe('not');
      expect(term.relation).toBeUndefined();
    });
  });

  describe('FilterTerm toString tests', () => {
    test('should combine keyword, relation and value', () => {
      const term = FilterTerm.fromString('apply_overrides=22');

      expect(term.keyword).toBeDefined();
      expect(term.value).toBeDefined();
      expect(term.relation).toBeDefined();

      expect(term.toString()).toEqual('apply_overrides=1');
    });

    test('should print value', () => {
      const term = FilterTerm.fromString('not');

      expect(term.keyword).toBeUndefined();
      expect(term.value).toBeDefined();
      expect(term.relation).toBeUndefined();

      expect(term.toString()).toEqual('not');
    });
  });

  describe('FilterTerm keywords should be lowercase', () => {
    test('should lower keyword case from string', () => {
      const term = FilterTerm.fromString('timEZOne=CET');

      expect(term.keyword).toBe('timezone');
      expect(term.value).toBe('CET');
      expect(term.relation).toBe('=');
    });
  });
});

describe('parseFilterTermsFromString tests', () => {
  test('should parse terms from string', () => {
    const terms = parseFilterTermsFromString('foo=bar lorem~ipsum');
    expect(terms.length).toBe(2);
    expect(terms[0]).toEqual({
      keyword: 'foo',
      relation: '=',
      value: 'bar',
    });
    expect(terms[1]).toEqual({
      keyword: 'lorem',
      relation: '~',
      value: 'ipsum',
    });
  });

  test('should parse filter strings with compound statements', () => {
    // should parse filter strings with and
    let terms = parseFilterTermsFromString('foo=bar and lorem~ipsum');
    expect(terms.length).toBe(3);
    expect(terms[0]).toEqual({
      keyword: 'foo',
      relation: '=',
      value: 'bar',
    });
    expect(terms[1]).toEqual({
      keyword: undefined,
      relation: undefined,
      value: 'and',
    });
    expect(terms[2]).toEqual({
      keyword: 'lorem',
      relation: '~',
      value: 'ipsum',
    });

    // should parse filter strings with or
    terms = parseFilterTermsFromString('foo=bar or lorem~ipsum');
    expect(terms.length).toBe(3);
    expect(terms[0]).toEqual({
      keyword: 'foo',
      relation: '=',
      value: 'bar',
    });
    expect(terms[1]).toEqual({
      keyword: undefined,
      relation: undefined,
      value: 'or',
    });
    expect(terms[2]).toEqual({
      keyword: 'lorem',
      relation: '~',
      value: 'ipsum',
    });

    // should parse filter strings with not
    terms = parseFilterTermsFromString('not foo=bar');
    expect(terms.length).toBe(2);
    expect(terms[0]).toEqual({
      keyword: undefined,
      relation: undefined,
      value: 'not',
    });
    expect(terms[1]).toEqual({
      keyword: 'foo',
      relation: '=',
      value: 'bar',
    });
  });

  test('should parse strings with double quotes', () => {
    const terms = parseFilterTermsFromString(
      'name="foo bar" comment~"lorem ipsum"',
    );
    expect(terms.length).toBe(2);
    expect(terms[0]).toEqual({
      keyword: 'name',
      relation: '=',
      value: '"foo bar"',
    });
    expect(terms.length).toBe(2);
    expect(terms[1]).toEqual({
      keyword: 'comment',
      relation: '~',
      value: '"lorem ipsum"',
    });
  });

  test('should parse strings with double quotes and without columns', () => {
    const terms = parseFilterTermsFromString('="foo bar" ~"lorem ipsum"');
    expect(terms.length).toBe(2);
    expect(terms[0]).toEqual({
      keyword: undefined,
      relation: '=',
      value: '"foo bar"',
    });
    expect(terms.length).toBe(2);
    expect(terms[1]).toEqual({
      keyword: undefined,
      relation: '~',
      value: '"lorem ipsum"',
    });
  });

  test('should parse strings with double quotes and special characters', () => {
    const terms = parseFilterTermsFromString(
      'name="foo <= bar" ~"foo & bar" and comment="hello : world ?"',
    );
    expect(terms.length).toBe(4);
    expect(terms[0]).toEqual({
      keyword: 'name',
      relation: '=',
      value: '"foo <= bar"',
    });
    expect(terms[1]).toEqual({
      keyword: undefined,
      relation: '~',
      value: '"foo & bar"',
    });
    expect(terms[2]).toEqual({
      keyword: undefined,
      relation: undefined,
      value: 'and',
    });
    expect(terms[3]).toEqual({
      keyword: 'comment',
      relation: '=',
      value: '"hello : world ?"',
    });
  });
});
