/* Copyright (C) 2017-2021 Greenbone Networks GmbH
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

import FilterTerm from '../filterterm';

describe('FilterTerm equals', () => {
  test('should not equal object', () => {
    const term = new FilterTerm({});
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

describe('keywords should be lowercase', () => {
  test('should lower keyword case from string', () => {
    const term = FilterTerm.fromString('timEZOne=CET');

    expect(term.keyword).toBe('timezone');
    expect(term.value).toBe('CET');
    expect(term.relation).toBe('=');
  });
});

// vim: set ts=2 sw=2 tw=80:
