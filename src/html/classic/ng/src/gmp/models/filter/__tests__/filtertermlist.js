/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2017 Greenbone Networks GmbH
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
import FilterTermList from '../filtertermlist.js';

describe('FilterTermList constructor', () => {

  test('should accept undefined', () => {
    const termlist = new FilterTermList();
    expect(termlist.terms).toEqual([]);
    expect(termlist.toString()).toEqual('');
  });

  test('should accept single term', () => {
    const term = new FilterTerm({});
    const termlist = new FilterTermList(term);
    expect(termlist.terms.length).toBe(1);
    expect(termlist.toString()).toEqual('');
  });

  test('should accept term array', () => {
    const term1 = new FilterTerm({});
    const term2 = new FilterTerm({});
    const termlist = new FilterTermList([term1, term2]);
    expect(termlist.terms.length).toBe(2);
    expect(termlist.toString()).toEqual('');
  });
});

describe('FilterTermList hasKeyword', () => {

  test('should have a keyword', () => {
    const list = new FilterTermList([], 'abc');
    expect(list.hasKeyword()).toBe(true);
  });

  test('should not have a keyword', () => {
    const list = new FilterTermList([]);
    expect(list.hasKeyword()).toBe(false);
  });
});

describe('FilterTermList copy', () => {

  test('should contain same terms', () => {
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
    const list1 = new FilterTermList([term1, term2], 'abc');
    const list2 = list1.copy();

    expect(list1.length).toBe(list2.length);
    expect(list1.terms[0].equals(list2.terms[0])).toBe(true);
    expect(list1.terms[1].equals(list2.terms[1])).toBe(true);
  });

  test('should contain same keyword', () => {
    const list1 = new FilterTermList([], 'abc');
    const list2 = list1.copy();

    expect(list1.keyword).toBe(list2.keyword);
  });

  test('changing copy should not change origin', () => {
    const term1 = new FilterTerm({
      keyword: 'abc',
      relation: '=',
      value: '1',
    });
    const list1 = new FilterTermList(term1, 'abc');
    let list2 = list1.copy();

    list2.add(new FilterTerm({
      keyword: 'abc',
      value: '2',
      relation: '=',
    }));

    expect(list1.length).toBe(1);
    expect(list2.length).toBe(2);

    list2 = list1.copy();

    list2.set(new FilterTerm({
      keyword: 'abc',
      value: '2',
      relation: '=',
    }));

    expect(list1.get('abc').value).toBe('1');
    expect(list2.get('abc').value).toBe('2');
  });

});

// vim: set ts=2 sw=2 tw=80:
