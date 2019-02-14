/* Copyright (C) 2017-2019 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
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

import FilterTerm from '../filterterm.js';

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

// vim: set ts=2 sw=2 tw=80:
