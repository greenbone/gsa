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

import Filter, {FilterTerm, FilterTermList} from '../filter.js';

describe('FilterTerm equals', () => {

  test('should not equal object', () => {
    let term = new FilterTerm({});
    expect(term.equals({})).toBe(false);
  });

  test('should equal self', () => {
    let term = new FilterTerm({});
    expect(term.equals(term)).toBe(true);
  });

  test('empty terms should be equal', () => {
    let term1 = new FilterTerm({});
    let term2 = new FilterTerm({});
    expect(term1.equals(term2)).toBe(true);
  });

  test('terms with different keywords should not be equal', () => {
    let term1 = new FilterTerm({keyword: 'abc', relation: '=', value: '1'});
    let term2 = new FilterTerm({keyword: 'def', relation: '=', value: '1'});
    expect(term1.equals(term2)).toBe(false);
  });

  test('terms with different relations should not be equal', () => {
    let term1 = new FilterTerm({keyword: 'abc', relation: '=', value: '1'});
    let term2 = new FilterTerm({keyword: 'abc', relation: '~', value: '1'});
    expect(term1.equals(term2)).toBe(false);
  });

  test('terms with different values should not be equal', () => {
    let term1 = new FilterTerm({keyword: 'abc', relation: '=', value: '1'});
    let term2 = new FilterTerm({keyword: 'abc', relation: '=', value: '2'});
    expect(term1.equals(term2)).toBe(false);
  });

  test('terms should be equal', () => {
    let term1 = new FilterTerm({keyword: 'abc', relation: '=', value: '1'});
    let term2 = new FilterTerm({keyword: 'abc', relation: '=', value: '1'});
    expect(term1.equals(term2)).toBe(true);
  });
});

describe('FilterTermList constructor', () => {

  test('should accept undefined', () => {
    let termlist = new FilterTermList();
    expect(termlist.terms).toEqual([]);
    expect(termlist.toString()).toEqual('');
  });

  test('should accept single term', () => {
    let term = new FilterTerm({});
    let termlist = new FilterTermList(term);
    expect(termlist.terms.length).toBe(1);
    expect(termlist.toString()).toEqual('');
  });

  test('should accept term array', () => {
    let term1 = new FilterTerm({});
    let term2 = new FilterTerm({});
    let termlist = new FilterTermList([term1, term2]);
    expect(termlist.terms.length).toBe(2);
    expect(termlist.toString()).toEqual('');
  });
});

describe('Filter parse from string tests', () => {

  test('should parse aprox relation without column', () => {
    let filter = Filter.fromString('~abc');
    expect(filter.toFilterString()).toEqual('~abc');
  });

  test('should parse approx relation without relation and column', () => {
    let filter = Filter.fromString('abc');
    expect(filter.toFilterString()).toEqual('abc');
  });

  test('should parse and keep sequence order', () => {
    let fstrings = [
      'abc and not def',
      '~abc and not ~def',
      'abc and not def rows=10 first=1 sort=name'
    ];

    fstrings.forEach(fstring => {
      expect(Filter.fromString(fstring).toFilterString()).toEqual(fstring);
    });
  });
});

describe('Filter parse from keywords', () => {
  test('should parse aprox relation without column', () => {
    let elem = {
      keywords: {
        keyword: [
          {
            column: '',
            relation: '~',
            value: 'abc'
          },
        ]
      }
    };
    let filter = new Filter(elem);
    expect(filter.toFilterString()).toEqual('~abc');
  });

  test('should parse and keep sequence order', () => {
    let elem = {
      keywords: {
        keyword: [
          {
            column: '',
            relation: '~',
            value: 'abc'
          },
          {
            column: '',
            relation: '~',
            value: 'and'
          },
          {
            column: '',
            relation: '~',
            value: 'not'
          },
          {
            column: '',
            relation: '~',
            value: 'def'
          },
        ]
      }
    };
    let filter = new Filter(elem);
    expect(filter.toFilterString()).toEqual('~abc and not ~def');

    elem = {
      keywords: {
        keyword: [
          {
            column: '',
            relation: '~',
            value: 'abc'
          },
          {
            column: '',
            relation: '~',
            value: 'and'
          },
          {
            column: '',
            relation: '~',
            value: 'not'
          },
          {
            column: '',
            relation: '~',
            value: 'def'
          },
          {
            column: 'rows',
            relation: '=',
            value: '10'
          },
          {
            column: 'first',
            relation: '=',
            value: '1'
          },
          {
            column: 'sort',
            relation: '=',
            value: 'name'
          }
        ]
      }
    };
    filter = new Filter(elem);
    expect(filter.toFilterString()).toEqual(
      '~abc and not ~def rows=10 first=1 sort=name');
  });
});

describe('Filter set', () => {

  test('should allow to set a filter term', () => {
    let filter = new Filter();
    expect(filter.set('abc', '1', '=').toFilterString()).toEqual('abc=1');
  });

  test('should allow to change a filter term', () => {
    let filter = Filter.fromString('abc=1');
    expect(filter.set('abc', '2', '=').toFilterString()).toEqual('abc=2');
  });

});

describe('Filter has', () => {

  test('should have filter terms', () => {
    let filter = Filter.fromString('abc=1 def=1');
    expect(filter.has('abc')).toEqual(true);
    expect(filter.has('def')).toEqual(true);
  });

  test('should not have unkown filter term', () => {
    let filter = Filter.fromString('abc=1');
    expect(filter.has('def')).toEqual(false);
  });

  test('should not have filter terms without keyword', () => {
    let filter = Filter.fromString('abc=1 ~def');
    expect(filter.has('def')).toEqual(false);
    expect(filter.has('~def')).toEqual(false);
  });

});

describe('Filter delete', () => {

  test('should allow to delete a filter term', () => {
    let filter = Filter.fromString('abc=1 def=1');
    expect(filter.delete('abc').toFilterString()).toEqual('def=1');
  });

  test('should ignore unkown filter term to delete', () => {
    let filter = Filter.fromString('abc=1');
    expect(filter.delete('def').toFilterString()).toEqual('abc=1');
  });

  test('should not delete filter terms without keyword', () => {
    let filter = Filter.fromString('abc=1 ~def');
    expect(filter.delete('def').toFilterString()).toEqual('abc=1 ~def');
    expect(filter.delete('~def').toFilterString()).toEqual('abc=1 ~def');
  });

});

describe('Filter equal', () => {

  test('empty filter should equal itself', () => {
    let filter = Filter.fromString('');
    expect(filter.equals(filter)).toEqual(true);
    filter = new Filter();
    expect(filter.equals(filter)).toEqual(true);
  });

  test('filter should equal itself', () => {
    let filter = Filter.fromString('abc=1 def=1');
    expect(filter.equals(filter)).toEqual(true);
  });

  test('filter with number of terms should not equal', () => {
    let filter1 = Filter.fromString('abc=1 def=1');
    let filter2 = Filter.fromString('abc=1 def=1 hij=1');
    expect(filter1.equals(filter2)).toEqual(false);
  });

  test('filter with same keywords in other order should equal', () => {
    let filter1 = Filter.fromString('abc=1 def=1');
    let filter2 = Filter.fromString('def=1 abc=1');
    expect(filter1.equals(filter2)).toEqual(true);
  });

  test('filter with different keywords should not equal', () => {
    let filter1 = Filter.fromString('abc=1');
    let filter2 = Filter.fromString('def=1');
    expect(filter1.equals(filter2)).toEqual(false);
  });

  test('filter with different relations should not equal', () => {
    let filter1 = Filter.fromString('abc=1');
    let filter2 = Filter.fromString('abc~1');
    expect(filter1.equals(filter2)).toEqual(false);
  });

  test('filter with different values should not equal', () => {
    let filter1 = Filter.fromString('abc=1');
    let filter2 = Filter.fromString('abc=2');
    expect(filter1.equals(filter2)).toEqual(false);
  });

  test('filter without keywords should equal', () => {
    let filter1 = Filter.fromString('abc def');
    let filter2 = Filter.fromString('abc def');
    expect(filter1.equals(filter2)).toEqual(true);

    filter1 = Filter.fromString('abc def=1');
    filter2 = Filter.fromString('abc def=1');
    expect(filter1.equals(filter2)).toEqual(true);

    filter1 = Filter.fromString('abc def=1');
    filter2 = Filter.fromString('def=1 abc');
    expect(filter1.equals(filter2)).toEqual(true);
  });

  test('filter without keywords in other order should not equal', () => {
    // this is not completely correct but currently required for and, or, ...
    let filter1 = Filter.fromString('abc def');
    let filter2 = Filter.fromString('def abc');
    expect(filter1.equals(filter2)).toEqual(false);
  });

});
// vim: set ts=2 sw=2 tw=80:
