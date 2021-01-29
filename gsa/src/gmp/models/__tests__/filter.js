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
import {isArray} from 'gmp/utils/identity';

import Filter, {UNKNOWN_FILTER_ID} from '../filter';
import FilterTerm from '../filter/filterterm';

describe('Filter parse filter terms from string', () => {
  test('should parse terms from string', () => {
    const filter = Filter.fromString('foo=bar lorem~ipsum');
    expect(filter.toFilterString()).toEqual('foo=bar lorem~ipsum');
    expect(filter.terms.length).toBe(2);
    expect(filter.terms[0]).toEqual({
      keyword: 'foo',
      relation: '=',
      value: 'bar',
    });
    expect(filter.terms[1]).toEqual({
      keyword: 'lorem',
      relation: '~',
      value: 'ipsum',
    });
  });

  test('should parse filter strings with compound statements', () => {
    // should parse filter strings with and
    let filter = Filter.fromString('foo=bar and lorem~ipsum');
    expect(filter.toFilterString()).toEqual('foo=bar and lorem~ipsum');
    expect(filter.terms.length).toBe(3);
    expect(filter.terms[0]).toEqual({
      keyword: 'foo',
      relation: '=',
      value: 'bar',
    });
    expect(filter.terms[1]).toEqual({
      keyword: undefined,
      relation: undefined,
      value: 'and',
    });
    expect(filter.terms[2]).toEqual({
      keyword: 'lorem',
      relation: '~',
      value: 'ipsum',
    });

    // should parse filter strings with or
    filter = Filter.fromString('foo=bar or lorem~ipsum');
    expect(filter.toFilterString()).toEqual('foo=bar or lorem~ipsum');
    expect(filter.terms.length).toBe(3);
    expect(filter.terms[0]).toEqual({
      keyword: 'foo',
      relation: '=',
      value: 'bar',
    });
    expect(filter.terms[1]).toEqual({
      keyword: undefined,
      relation: undefined,
      value: 'or',
    });
    expect(filter.terms[2]).toEqual({
      keyword: 'lorem',
      relation: '~',
      value: 'ipsum',
    });

    // should parse filter strings with not
    filter = Filter.fromString('not foo=bar');
    expect(filter.toFilterString()).toEqual('not foo=bar');
    expect(filter.terms.length).toBe(2);
    expect(filter.terms[0]).toEqual({
      keyword: undefined,
      relation: undefined,
      value: 'not',
    });
    expect(filter.terms[1]).toEqual({
      keyword: 'foo',
      relation: '=',
      value: 'bar',
    });
  });

  test('should parse strings with double quotes', () => {
    const filter = Filter.fromString('name="foo bar" comment~"lorem ipsum"');
    expect(filter.toFilterString()).toEqual(
      'name="foo bar" comment~"lorem ipsum"',
    );
    expect(filter.terms.length).toBe(2);
    expect(filter.terms[0]).toEqual({
      keyword: 'name',
      relation: '=',
      value: '"foo bar"',
    });
    expect(filter.terms.length).toBe(2);
    expect(filter.terms[1]).toEqual({
      keyword: 'comment',
      relation: '~',
      value: '"lorem ipsum"',
    });
  });

  test('should parse strings with double quotes and without columns', () => {
    const filter = Filter.fromString('="foo bar" ~"lorem ipsum"');
    expect(filter.toFilterString()).toEqual('="foo bar" ~"lorem ipsum"');
    expect(filter.terms.length).toBe(2);
    expect(filter.terms[0]).toEqual({
      keyword: undefined,
      relation: '=',
      value: '"foo bar"',
    });
    expect(filter.terms.length).toBe(2);
    expect(filter.terms[1]).toEqual({
      keyword: undefined,
      relation: '~',
      value: '"lorem ipsum"',
    });
  });

  test('should parse strings with double quotes and special characters', () => {
    const filter = Filter.fromString(
      'name="foo <= bar" ~"foo & bar" and comment="hello : world ?"',
    );
    expect(filter.toFilterString()).toEqual(
      'name="foo <= bar" ~"foo & bar" and comment="hello : world ?"',
    );
    expect(filter.terms.length).toBe(4);
    expect(filter.terms[0]).toEqual({
      keyword: 'name',
      relation: '=',
      value: '"foo <= bar"',
    });
    expect(filter.terms[1]).toEqual({
      keyword: undefined,
      relation: '~',
      value: '"foo & bar"',
    });
    expect(filter.terms[2]).toEqual({
      keyword: undefined,
      relation: undefined,
      value: 'and',
    });
    expect(filter.terms[3]).toEqual({
      keyword: 'comment',
      relation: '=',
      value: '"hello : world ?"',
    });
  });
});

describe('Filter parse from string tests', () => {
  test('should parse aprox relation without column', () => {
    const filter = Filter.fromString('~abc');
    expect(filter.toFilterString()).toEqual('~abc');
  });

  test('should parse approx relation without relation and column', () => {
    const filter = Filter.fromString('abc');
    expect(filter.toFilterString()).toEqual('abc');
  });

  test('should parse equal relation without column', () => {
    const filter = Filter.fromString('=abc');
    expect(filter.toFilterString()).toEqual('=abc');
  });

  test('should parse equal relation without column and with quotes', () => {
    const filter = Filter.fromString('="abc def"');
    expect(filter.toFilterString()).toEqual('="abc def"');
  });

  test('should parse equal relation without column and with special characters in quotes', () => {
    const filter = Filter.fromString('="abc : def"');
    expect(filter.toFilterString()).toEqual('="abc : def"');
  });

  test('should parse above relation without column', () => {
    const filter = Filter.fromString('>1.0');
    expect(filter.toFilterString()).toEqual('>1.0');
  });

  test('should parse below relation without column', () => {
    const filter = Filter.fromString('<1.0');
    expect(filter.toFilterString()).toEqual('<1.0');
  });

  test('should parse below relation without column', () => {
    const filter = Filter.fromString(':abc');
    expect(filter.toFilterString()).toEqual(':abc');
  });

  test('should parse and keep sequence order', () => {
    const fstrings = [
      'abc and not def',
      '~abc and not ~def',
      'abc and not def rows=10 first=1 sort=name',
      'family=FTP severity>4 and severity<9', // severity range
      'apply_overrides=0 min_qod=70 vulnerability~"Reporting" and ' +
        'vulnerability~"SSH" and severity>6.9 first=1 rows=10 sort=name',
    ];

    fstrings.forEach(fstring => {
      expect(Filter.fromString(fstring).toFilterString()).toEqual(fstring);
    });
  });

  test('should convert first if less then 1', () => {
    let filter = Filter.fromString('first=0');
    expect(filter.toFilterString()).toEqual('first=1');

    filter = Filter.fromString('first=-1');
    expect(filter.toFilterString()).toEqual('first=1');

    filter = Filter.fromString('first=-666');
    expect(filter.toFilterString()).toEqual('first=1');
  });

  test('should always use equal relation for first keyword', () => {
    let filter = Filter.fromString('first>1');
    expect(filter.toFilterString()).toEqual('first=1');

    filter = Filter.fromString('first<1');
    expect(filter.toFilterString()).toEqual('first=1');

    filter = Filter.fromString('first>1');
    expect(filter.toFilterString()).toEqual('first=1');
  });

  test('should always use equal relation for rows keyword', () => {
    let filter = Filter.fromString('rows>1');
    expect(filter.toFilterString()).toEqual('rows=1');

    filter = Filter.fromString('rows<1');
    expect(filter.toFilterString()).toEqual('rows=1');

    filter = Filter.fromString('rows>1');
    expect(filter.toFilterString()).toEqual('rows=1');
  });

  test('should ignore null as filter argument', () => {
    const filter = Filter.fromString('foo=1', null);
    expect(filter.toFilterString()).toEqual('foo=1');
  });

  test('should ignore filter terms starting with _', () => {
    let filter = Filter.fromString('rows=100 _foo=bar');
    expect(filter.toFilterString()).toEqual('rows=100');

    filter = Filter.fromString('_bar=foo rows=100');
    expect(filter.toFilterString()).toEqual('rows=100');

    filter = Filter.fromString('_foo rows=100');
    expect(filter.toFilterString()).toEqual('rows=100');
  });
});

describe('Filter parse from keywords', () => {
  test('should parse aprox relation without column', () => {
    const elem = {
      keywords: {
        keyword: [
          {
            column: '',
            relation: '~',
            value: 'abc',
          },
        ],
      },
    };
    const filter = Filter.fromElement(elem);
    expect(filter.toFilterString()).toEqual('~abc');
  });

  test('should parse and keep sequence order', () => {
    let elem = {
      keywords: {
        keyword: [
          {
            column: '',
            relation: '~',
            value: 'abc',
          },
          {
            column: '',
            relation: '~',
            value: 'and',
          },
          {
            column: '',
            relation: '~',
            value: 'not',
          },
          {
            column: '',
            relation: '~',
            value: 'def',
          },
        ],
      },
    };
    let filter = Filter.fromElement(elem);
    expect(filter.toFilterString()).toEqual('~abc and not ~def');

    elem = {
      keywords: {
        keyword: [
          {
            column: '',
            relation: '~',
            value: 'abc',
          },
          {
            column: '',
            relation: '~',
            value: 'and',
          },
          {
            column: '',
            relation: '~',
            value: 'not',
          },
          {
            column: '',
            relation: '~',
            value: 'def',
          },
          {
            column: 'rows',
            relation: '=',
            value: '10',
          },
          {
            column: 'first',
            relation: '=',
            value: '1',
          },
          {
            column: 'sort',
            relation: '=',
            value: 'name',
          },
        ],
      },
    };
    filter = Filter.fromElement(elem);
    expect(filter.toFilterString()).toEqual(
      '~abc and not ~def rows=10 first=1 sort=name',
    );
  });

  test('should parse keywords with severity range', () => {
    const elem = {
      keywords: {
        keyword: [
          {
            column: 'severity',
            relation: '>',
            value: '3.9',
          },
          {
            column: '',
            relation: '',
            value: 'and',
          },
          {
            column: 'severity',
            relation: '<',
            value: '7',
          },
          {
            column: 'first',
            relation: '=',
            value: '1',
          },
          {
            column: 'rows',
            relation: '=',
            value: '10',
          },
          {
            column: 'sort',
            relation: '=',
            value: 'name',
          },
        ],
      },
    };

    const filter = Filter.fromElement(elem);
    const filterstring =
      'severity>3.9 and severity<7 first=1 rows=10 sort=name';
    expect(filter.toFilterString()).toEqual(filterstring);

    const filter2 = Filter.fromString(filterstring);
    expect(filter.equals(filter2)).toEqual(true);
  });

  test('should parse columns with underscore', () => {
    const elem = {
      keywords: {
        keyword: [
          {
            column: '_foo',
            relation: '=',
            value: 'abc',
          },
        ],
      },
    };
    const filter = Filter.fromElement(elem);
    expect(filter.toFilterString()).toEqual('_foo=abc');
  });
});

describe('Filter set', () => {
  test('should allow to set a filter term', () => {
    const filter = Filter.fromElement();
    expect(filter.set('abc', '1', '=').toFilterString()).toEqual('abc=1');
  });

  test('should allow to change a filter term', () => {
    const filter = Filter.fromString('abc=1');
    expect(filter.set('abc', '2', '=').toFilterString()).toEqual('abc=2');
  });

  test('should remove sort-reverse when adding sort filter term', () => {
    const filter = Filter.fromElement();

    filter.set('sort-reverse', 'foo', '=');
    expect(filter.has('sort-reverse')).toEqual(true);
    expect(filter.has('sort')).toEqual(false);

    filter.set('sort', 'foo', '=');
    expect(filter.has('sort-reverse')).toEqual(false);
    expect(filter.has('sort')).toEqual(true);
  });

  test('should remove sort when adding sort-reverse filter term', () => {
    const filter = Filter.fromElement();

    filter.set('sort', 'foo', '=');
    expect(filter.has('sort')).toEqual(true);
    expect(filter.has('sort-reverse')).toEqual(false);

    filter.set('sort-reverse', 'foo', '=');
    expect(filter.has('sort')).toEqual(false);
    expect(filter.has('sort-reverse')).toEqual(true);
  });

  test('should convert 0 or negative values for first to 1', () => {
    const filter = Filter.fromElement();
    filter.set('first', '0');
    expect(filter.get('first')).toEqual(1);

    filter.set('first', '-666');
    expect(filter.get('first')).toEqual(1);
  });

  test('should reset filter id', () => {
    const filter = Filter.fromElement({_id: 'foo'});

    expect(filter.id).toEqual('foo');

    filter.set('first', '0');
    expect(filter.id).toBeUndefined();
  });

  test('should allow to set a filter term with underscore', () => {
    const filter = Filter.fromElement();
    expect(filter.set('_foo', '1', '=').toFilterString()).toEqual('_foo=1');
  });
});

describe('Filter has', () => {
  test('should have filter terms', () => {
    const filter = Filter.fromString('abc=1 def=1');
    expect(filter.has('abc')).toEqual(true);
    expect(filter.has('def')).toEqual(true);
  });

  test('should not have unknown filter term', () => {
    const filter = Filter.fromString('abc=1');
    expect(filter.has('def')).toEqual(false);
  });

  test('should not have filter terms without keyword', () => {
    const filter = Filter.fromString('abc=1 ~def');
    expect(filter.has('def')).toEqual(false);
    expect(filter.has('~def')).toEqual(false);
  });

  test('should return false for undefined key', () => {
    const filter = Filter.fromString('');
    expect(filter.has()).toEqual(false);
  });
});

describe('Filter delete', () => {
  test('should allow to delete a filter term', () => {
    const filter = Filter.fromString('abc=1 def=1');
    expect(filter.delete('abc').toFilterString()).toEqual('def=1');
  });

  test('should ignore unknown filter term to delete', () => {
    const filter = Filter.fromString('abc=1');
    expect(filter.delete('def').toFilterString()).toEqual('abc=1');
  });

  test('should not delete filter terms without keyword', () => {
    const filter = Filter.fromString('abc=1 ~def');
    expect(filter.delete('def').toFilterString()).toEqual('abc=1 ~def');
    expect(filter.delete('~def').toFilterString()).toEqual('abc=1 ~def');
  });

  test('should reset filter id', () => {
    const filter = Filter.fromString('abc=1');
    filter.id = 'foo';
    filter.delete('abc');

    expect(filter.id).toBeUndefined();
  });
});

describe('Filter equal', () => {
  test('should not equal undefined', () => {
    const filter = Filter.fromString('');
    expect(filter.equals()).toEqual(false);
  });

  test('should not equal null', () => {
    const filter = Filter.fromString('');
    expect(filter.equals(null)).toEqual(false);
  });

  test('empty filter should equal itself', () => {
    let filter = Filter.fromString('');
    expect(filter.equals(filter)).toEqual(true);
    filter = Filter.fromElement();
    expect(filter.equals(filter)).toEqual(true);
  });

  test('filter should equal itself', () => {
    const filter = Filter.fromString('abc=1 def=1');
    expect(filter.equals(filter)).toEqual(true);
  });

  test('filter with number of terms should not equal', () => {
    const filter1 = Filter.fromString('abc=1 def=1');
    const filter2 = Filter.fromString('abc=1 def=1 hij=1');
    expect(filter1.equals(filter2)).toEqual(false);
  });

  test('filter with same keywords in other order should equal', () => {
    const filter1 = Filter.fromString('abc=1 def=1');
    const filter2 = Filter.fromString('def=1 abc=1');
    expect(filter1.equals(filter2)).toEqual(true);
  });

  test('filter with different keywords should not equal', () => {
    const filter1 = Filter.fromString('abc=1');
    const filter2 = Filter.fromString('def=1');
    expect(filter1.equals(filter2)).toEqual(false);
  });

  test('filter with different relations should not equal', () => {
    const filter1 = Filter.fromString('abc=1');
    const filter2 = Filter.fromString('abc~1');
    expect(filter1.equals(filter2)).toEqual(false);
  });

  test('filter with different values should not equal', () => {
    const filter1 = Filter.fromString('abc=1');
    const filter2 = Filter.fromString('abc=2');
    expect(filter1.equals(filter2)).toEqual(false);
  });

  test('filter without keywords in other order should not equal', () => {
    // this is not completely correct but currently required for and, or, ...
    const filter1 = Filter.fromString('abc def');
    const filter2 = Filter.fromString('def abc');
    expect(filter1.equals(filter2)).toEqual(false);
  });

  test('filter with severity range should equal', () => {
    // this is not completely correct but currently required for and, or, ...
    const filter1 = Filter.fromString('severity>3.9 and severity<7');
    const filter2 = Filter.fromString('severity>3.9 and severity<7');
    expect(filter1.equals(filter2)).toEqual(true);
  });

  test('filter with severity range in different order should equal', () => {
    // this is not completely correct but currently required for and, or, ...
    const filter1 = Filter.fromString('severity<7 and severity>3.9');
    const filter2 = Filter.fromString('severity>3.9 and severity<7');
    expect(filter1.equals(filter2)).toEqual(true);
  });

  test('filter with an and term should not equal', () => {
    const filter1 = Filter.fromString(
      'min_qod=70 apply_overrides=1 rows=10 first=1 sort=name',
    );
    const filter2 = Filter.fromString(
      'min_qod=70 apply_overrides=1 rows=10 first=1 sort=name and',
    );
    expect(filter1.equals(filter2)).toEqual(false);
  });

  test('filter with different realistic terms should not equal', () => {
    const filter1 = Filter.fromString(
      'min_qod=70 apply_overrides=1 rows=10 first=1 sort=name',
    );
    const filter2 = Filter.fromString(
      'min_qod=70 apply_overrides=1 rows=10 first=1 sort=name ' +
        'and status="Stopped"',
    );
    expect(filter1.equals(filter2)).toEqual(false);
  });

  test('filter with realistic more complex term should equal', () => {
    const filter1 = Filter.fromString(
      'min_qod=70 apply_overrides=1 rows=10 first=1 sort=name ' +
        'and status="Stopped"',
    );
    const filter2 = Filter.fromString(
      'min_qod=70 apply_overrides=1 rows=10 first=1 sort=name ' +
        'and status="Stopped"',
    );
    expect(filter1.equals(filter2)).toEqual(true);
  });
});

describe('Filter get', () => {
  test('should get value', () => {
    let filter = Filter.fromString('abc=1');
    expect(filter.get('abc')).toEqual('1');

    filter = Filter.fromString('abc=1 def=2');
    expect(filter.get('abc')).toEqual('1');
    expect(filter.get('def')).toEqual('2');
  });

  test('should not get value', () => {
    const filter = Filter.fromString('abc=1');
    expect(filter.get('def')).toBeUndefined();
  });

  test('should not get value without keyword', () => {
    let filter = Filter.fromString('abc');
    expect(filter.get('abc')).toBeUndefined();

    filter = Filter.fromString('~abc');
    expect(filter.get('abc')).toBeUndefined();
    expect(filter.get('~abc')).toBeUndefined();
  });
});

describe('Filter getTerm', () => {
  test('should return undefined', () => {
    const filter = Filter.fromString('');
    expect(filter.getTerm()).toBeUndefined();
  });

  test('should get term', () => {
    let filter = Filter.fromString('abc=1');
    expect(filter.getTerm('abc')).toBeDefined();

    filter = Filter.fromString('abc=1 def=2');
    expect(filter.getTerm('abc')).toBeDefined();
    expect(filter.getTerm('def')).toBeDefined();
  });

  test('should not get term', () => {
    const filter = Filter.fromString('abc=1');
    expect(filter.getTerm('def')).toBeUndefined();
  });

  test('should not get term without keyword', () => {
    let filter = Filter.fromString('abc');
    expect(filter.getTerm('abc')).toBeUndefined();

    filter = Filter.fromString('~abc');
    expect(filter.getTerm('abc')).toBeUndefined();
    expect(filter.getTerm('~abc')).toBeUndefined();
  });

  test('should match term', () => {
    let filter = Filter.fromString('abc=1');
    let term = filter.getTerm('abc');
    expect(term.keyword).toBe('abc');
    expect(term.relation).toBe('=');
    expect(term.value).toBe('1');

    filter = Filter.fromString('abc<1 def~2');
    term = filter.getTerm('abc');
    expect(term.keyword).toBe('abc');
    expect(term.relation).toBe('<');
    expect(term.value).toBe('1');

    term = filter.getTerm('def');
    expect(term.keyword).toBe('def');
    expect(term.relation).toBe('~');
    expect(term.value).toBe('2');
  });
});

describe('Filter getTerms', () => {
  test('should return empty array for unknown keyword', () => {
    const filter = Filter.fromString('abc=1');
    const terms = filter.getTerms('def');

    expect(terms.length).toBe(0);
  });

  test('should return empty array for undefined keyword', () => {
    const filter = Filter.fromString('abc=1');
    const terms = filter.getTerms();

    expect(terms.length).toBe(0);
  });

  test('should return single term as array', () => {
    const filter = Filter.fromString('abc=1');
    const terms = filter.getTerms('abc');

    expect(terms.length).toBe(1);

    const [term] = terms;
    expect(term.keyword).toBe('abc');
  });

  test('should return all terms in an array', () => {
    const filter = Filter.fromString('abc=1 abc=2');
    const terms = filter.getTerms('abc');

    expect(terms.length).toBe(2);
  });

  test('should return only terms with same keyword', () => {
    const filter = Filter.fromString('abc=1 def=2 abc=3');
    const terms1 = filter.getTerms('abc');
    const terms2 = filter.getTerms('def');

    expect(terms1.length).toBe(2);
    expect(terms2.length).toBe(1);
  });
});

describe('Filter parse elem', () => {
  test('Should parse public properties', () => {
    const filter1 = Filter.fromElement({
      _id: '100',
      type: 'foo',
    });

    expect(filter1.id).toBe('100');
    expect(filter1.filter_type).toBe('foo');
  });

  test('Should not parse term as public property', () => {
    const filter1 = Filter.fromElement({
      term: 'abc=1',
    });

    expect(filter1.term).toBeUndefined();
  });

  test('should parse alerts', () => {
    const filter1 = Filter.fromElement({
      term: 'abc=1',
      alerts: {
        alert: [
          {
            id: 'a1',
          },
          {
            id: 'a2',
          },
        ],
      },
    });

    expect(isArray(filter1.alerts)).toEqual(true);
    expect(filter1.alerts).toHaveLength(2);
  });

  test('should parse id of zero as undefined id', () => {
    const filter = Filter.fromElement({_id: UNKNOWN_FILTER_ID});
    expect(filter.id).toBeUndefined();
  });
});

describe('Filter copy', () => {
  test('should copy all values', () => {
    const filter1 = Filter.fromString('abc=1 def=2');
    const filter2 = filter1.copy();
    expect(filter1).not.toBe(filter2);
    expect(filter2.get('abc')).toBe('1');
    expect(filter2.get('def')).toBe('2');
  });

  test('should copy public properties', () => {
    const filter1 = Filter.fromElement({
      term: 'abc=1',
      _id: '100',
      type: 'foo',
    });
    const filter2 = filter1.copy();

    expect(filter2.get('abc')).toBe('1');
    expect(filter2.id).toBe('100');
    expect(filter2.filter_type).toBe('foo');
  });

  test('should shallow copy terms', () => {
    const filter1 = Filter.fromString('abc=1 def=2');
    const filter2 = filter1.copy();

    expect(filter1).not.toBe(filter2);
    expect(filter1.equals(filter2)).toBe(true);

    filter2.set('foo', 'bar', '=');
    expect(filter1.equals(filter2)).toBe(false);
    expect(filter1.toFilterString()).toBe('abc=1 def=2');
    expect(filter2.toFilterString()).toBe('abc=1 def=2 foo=bar');
  });
});

describe('Filter next', () => {
  test('should return defaults', () => {
    let filter = Filter.fromString('');

    expect(filter.get('first')).toBeUndefined();
    expect(filter.get('rows')).toBeUndefined();

    filter = filter.next();

    expect(filter.get('first')).toEqual(1);
    expect(filter.get('rows')).toEqual(10);
  });

  test('should change first and rows', () => {
    let filter = Filter.fromString('first=1 rows=10');
    expect(filter.get('first')).toBe(1);
    expect(filter.get('rows')).toBe(10);

    filter = filter.next();

    expect(filter.get('first')).toBe(11);
    expect(filter.get('rows')).toBe(10);
  });

  test('should reset filter id', () => {
    let filter = Filter.fromString('first=1 rows=10');
    filter.id = 'foo';

    expect(filter.id).toEqual('foo');

    filter = filter.next();
    expect(filter.id).toBeUndefined();
  });
});

describe('Filter first', () => {
  test('should set first if undefined', () => {
    let filter = Filter.fromString('');

    expect(filter.get('first')).toBeUndefined();

    filter = filter.first();

    expect(filter.get('first')).toEqual(1);
  });

  test('should change first to 1', () => {
    let filter = Filter.fromString('first=99');
    expect(filter.get('first')).toBe(99);

    filter = filter.first();

    expect(filter.get('first')).toBe(1);
  });

  test('should reset filter id', () => {
    let filter = Filter.fromString('first=1 rows=10');
    filter.id = 'foo';

    expect(filter.id).toEqual('foo');

    filter = filter.first();
    expect(filter.id).toBeUndefined();
  });
});

describe('Filter previous', () => {
  test('should return defaults', () => {
    let filter = Filter.fromString('');

    expect(filter.get('first')).toBeUndefined();
    expect(filter.get('rows')).toBeUndefined();

    filter = filter.previous();

    expect(filter.get('first')).toEqual(1);
    expect(filter.get('rows')).toEqual(10);
  });

  test('should change first and rows', () => {
    let filter = Filter.fromString('first=11 rows=10');
    expect(filter.get('first')).toBe(11);
    expect(filter.get('rows')).toBe(10);

    filter = filter.previous();

    expect(filter.get('first')).toBe(1);
    expect(filter.get('rows')).toBe(10);
  });

  test('should reset filter id', () => {
    let filter = Filter.fromString('first=1 rows=10');
    filter.id = 'foo';

    expect(filter.id).toEqual('foo');

    filter = filter.previous();
    expect(filter.id).toBeUndefined();
  });
});

describe('Filter getSortOrder', () => {
  test('should return sort if not set', () => {
    const filter = Filter.fromString('');
    expect(filter.getSortOrder()).toEqual('sort');
  });

  test('should return sort if sort is set', () => {
    const filter = Filter.fromString('sort=foo');
    expect(filter.getSortOrder()).toEqual('sort');
  });

  test('should return sort-reverse if sort-reverse is set', () => {
    const filter = Filter.fromString('sort-reverse=foo');
    expect(filter.getSortOrder()).toEqual('sort-reverse');
  });
});

describe('Filter getSortBy', () => {
  test('should return undefined if not set', () => {
    const filter = Filter.fromString('');
    expect(filter.getSortBy()).toBeUndefined();
  });

  test('should return order from sort', () => {
    const filter = Filter.fromString('sort=foo');
    expect(filter.getSortBy()).toEqual('foo');
  });

  test('should return order from sort-reverse', () => {
    const filter = Filter.fromString('sort-reverse=foo');
    expect(filter.getSortBy()).toEqual('foo');
  });
});

describe('Filter setSortOrder', () => {
  test('should keep sort by if order changes to sort', () => {
    const filter = Filter.fromString('sort-reverse=foo');
    filter.setSortOrder('sort');

    expect(filter.has('sort-reverse')).toEqual(false);
    expect(filter.get('sort')).toEqual('foo');
  });

  test('should keep sort by if order changes to sort-reverse', () => {
    const filter = Filter.fromString('sort=foo');
    filter.setSortOrder('sort-reverse');

    expect(filter.has('sort')).toEqual(false);
    expect(filter.get('sort-reverse')).toEqual('foo');
  });

  test('should set sort for unknown orders', () => {
    const filter = Filter.fromString('sort-reverse=foo');
    filter.setSortOrder('foo');

    expect(filter.has('sort-reverse')).toEqual(false);
    expect(filter.get('sort')).toEqual('foo');
  });

  test('should reset filter id', () => {
    const filter = Filter.fromString('sort-reverse=foo');
    filter.id = 'foo';

    expect(filter.id).toEqual('foo');

    filter.setSortOrder('foo');
    expect(filter.id).toBeUndefined();
  });
});

describe('Filter setSortBy', () => {
  test('should set sort if not order is set', () => {
    const filter = Filter.fromString('');
    filter.setSortBy('foo');

    expect(filter.get('sort')).toEqual('foo');
  });

  test('should change sort by if order is sort', () => {
    const filter = Filter.fromString('sort=bar');
    expect(filter.get('sort')).toEqual('bar');

    filter.setSortBy('foo');

    expect(filter.get('sort')).toEqual('foo');
  });

  test('should change sort by if order is sort-reverse', () => {
    const filter = Filter.fromString('sort-reverse=bar');
    expect(filter.get('sort-reverse')).toEqual('bar');

    filter.setSortBy('foo');

    expect(filter.get('sort-reverse')).toEqual('foo');
  });

  test('should reset filter id', () => {
    const filter = Filter.fromString('sort-reverse=bar');
    filter.id = 'foo';

    expect(filter.id).toEqual('foo');

    filter.setSortBy('foo');
    expect(filter.id).toBeUndefined();
  });
});

describe('Filter simple', () => {
  test('should return copy if first, rows and sort not set', () => {
    const filter = Filter.fromString('foo=bar');
    const simple = filter.simple();

    expect(filter).not.toBe(simple);
    expect(filter.equals(simple)).toBe(true);
  });

  test('should remove first, rows and sort terms', () => {
    const filter = Filter.fromString('first=1 rows=10 sort=foo foo=bar');

    expect(filter.has('first')).toEqual(true);
    expect(filter.has('rows')).toEqual(true);
    expect(filter.has('sort')).toEqual(true);

    const simple = filter.simple();

    expect(filter).not.toBe(simple);
    expect(simple.has('first')).toEqual(false);
    expect(simple.has('rows')).toEqual(false);
    expect(simple.has('sort')).toEqual(false);
  });

  test('should remove sort-reverse term', () => {
    const filter = Filter.fromString('sort-reverse=foo foo=bar');

    expect(filter.has('sort-reverse')).toEqual(true);

    const simple = filter.simple();

    expect(filter).not.toBe(simple);
    expect(simple.has('sort-reverse')).toEqual(false);
  });

  test('should reset filter id', () => {
    const filter = Filter.fromString('sort-reverse=foo foo=bar');
    filter.id = 'foo';

    expect(filter.id).toEqual('foo');

    const simple = filter.simple();
    expect(simple.id).toBeUndefined();
  });
});

describe('Filter withoutView', () => {
  test('should return copy if first, rows and sort not set', () => {
    const filter = Filter.fromString('foo=bar');
    const simple = filter.withoutView();

    expect(filter).not.toBe(simple);
    expect(filter.equals(simple)).toBe(true);
  });

  test('should remove first and rows term', () => {
    const filter = Filter.fromString('first=1 rows=10 sort=foo foo=bar');

    expect(filter.has('first')).toEqual(true);
    expect(filter.has('rows')).toEqual(true);
    expect(filter.has('sort')).toEqual(true);

    const simple = filter.withoutView();

    expect(filter).not.toBe(simple);
    expect(simple.has('first')).toEqual(false);
    expect(simple.has('rows')).toEqual(false);
    expect(simple.has('sort')).toEqual(true);
  });

  test('should reset filter id', () => {
    const filter = Filter.fromString('first=1 rows=10 foo=bar');
    filter.id = 'foo';

    expect(filter.id).toEqual('foo');

    const simple = filter.withoutView();
    expect(simple.id).toBeUndefined();
  });
});

describe('Filter merge extra keywords', () => {
  test('should handle merging undefined filter', () => {
    const filter1 = Filter.fromString('abc=1');
    filter1.id = 'f1';
    const filter2 = filter1.mergeExtraKeywords();

    expect(filter1).not.toBe(filter2);
    expect(filter2.get('abc')).toEqual('1');
    expect(filter2.id).toBeUndefined();
  });

  test('should handle merging null filter', () => {
    const filter1 = Filter.fromString('abc=1');
    filter1.id = 'f1';
    const filter2 = filter1.mergeExtraKeywords(null);

    expect(filter1).not.toBe(filter2);
    expect(filter2.get('abc')).toEqual('1');
    expect(filter2.id).toBeUndefined();
  });

  test('should merge extra keywords', () => {
    const filter1 = Filter.fromString('abc=1');
    const filter2 = Filter.fromString(
      'apply_overrides=1 overrides=1 ' +
        'delta_states=1 first=1 levels=hml min_qod=70 notes=1 ' +
        'result_hosts_only=1 rows=10 sort=name timezone=CET',
    );

    const filter3 = filter1.mergeExtraKeywords(filter2);

    expect(filter3.get('abc')).toBe('1');
    expect(filter3.get('apply_overrides')).toBe(1);
    expect(filter3.get('overrides')).toBe(1);
    expect(filter3.get('delta_states')).toBe('1');
    expect(filter3.get('first')).toBe(1);
    expect(filter3.get('levels')).toBe('hml');
    expect(filter3.get('min_qod')).toBe(70);
    expect(filter3.get('notes')).toBe(1);
    expect(filter3.get('result_hosts_only')).toBe(1);
    expect(filter3.get('rows')).toBe(10);
    expect(filter3.get('sort')).toBe('name');
    expect(filter3.get('timezone')).toBe('CET');
  });

  test('should merge new keywords', () => {
    const filter1 = Filter.fromString('abc=1 trend=more');
    const filter2 = Filter.fromString('delta_states=1 severity>3 sort=name');

    const filter3 = filter2.mergeKeywords(filter1);

    expect(filter3.get('abc')).toBe('1');
    expect(filter3.get('delta_states')).toBe('1');
    expect(filter3.get('sort')).toBe('name');
    expect(filter3.get('severity')).toBe('3');
    expect(filter3.get('trend')).toBe('more');
  });

  test('should not merge non extra keywords', () => {
    const filter1 = Filter.fromString('abc=1');
    const filter2 = Filter.fromString('apply_overrides=1 def=1');

    const filter3 = filter1.mergeExtraKeywords(filter2);

    expect(filter3.get('abc')).toBe('1');
    expect(filter3.get('apply_overrides')).toBe(1);
    expect(filter3.get('def')).toBeUndefined();
  });

  test('should not merge existing extra keywords', () => {
    const filter1 = Filter.fromString('abc=1 min_qod=80');
    const filter2 = Filter.fromString('apply_overrides=1 min_qod=70');

    const filter3 = filter1.mergeExtraKeywords(filter2);

    expect(filter3.get('abc')).toBe('1');
    expect(filter3.get('apply_overrides')).toBe(1);
    expect(filter3.get('min_qod')).toBe(80);
  });

  test('should not merge sort or sort-reverse if already exis', () => {
    let filter1 = Filter.fromString('sort=foo');
    let filter2 = Filter.fromString('sort=bar');

    let filter3 = filter1.mergeExtraKeywords(filter2);

    expect(filter3.getSortOrder()).toEqual('sort');
    expect(filter3.getSortBy()).toEqual('foo');

    expect(filter3.toFilterString()).toEqual('sort=foo');

    filter1 = Filter.fromString('sort=foo');
    filter2 = Filter.fromString('sort-reverse=bar');

    filter3 = filter1.mergeExtraKeywords(filter2);

    expect(filter3.getSortOrder()).toEqual('sort');
    expect(filter3.getSortBy()).toEqual('foo');

    expect(filter3.toFilterString()).toEqual('sort=foo');

    filter1 = Filter.fromString('sort-reverse=foo');
    filter2 = Filter.fromString('sort-reverse=bar');

    filter3 = filter1.mergeExtraKeywords(filter2);

    expect(filter3.getSortOrder()).toEqual('sort-reverse');
    expect(filter3.getSortBy()).toEqual('foo');

    expect(filter3.toFilterString()).toEqual('sort-reverse=foo');

    filter1 = Filter.fromString('sort-reverse=foo');
    filter2 = Filter.fromString('sort=bar');

    filter3 = filter1.mergeExtraKeywords(filter2);

    expect(filter3.getSortOrder()).toEqual('sort-reverse');
    expect(filter3.getSortBy()).toEqual('foo');

    expect(filter3.toFilterString()).toEqual('sort-reverse=foo');
  });

  test('should reset filter id', () => {
    const filter1 = Filter.fromString('abc=1');
    filter1.id = 'f1';
    const filter2 = Filter.fromString(
      'apply_overrides=1 overrides=1 ' +
        'delta_states=1 first=1 levels=hml min_qod=70 notes=1 ' +
        'result_hosts_only=1 rows=10 sort=name timezone=CET',
    );
    filter2.id = 'f2';

    const filter3 = filter1.mergeExtraKeywords(filter2);
    expect(filter3.id).toBeUndefined();
  });
});

describe('filter and', () => {
  test('should ignore undefined', () => {
    const filter = Filter.fromString('foo=1');
    expect(filter.and().toFilterString()).toEqual('foo=1');
  });

  test('should ignore null', () => {
    const filter = Filter.fromString('foo=1');
    expect(filter.and(null).toFilterString()).toEqual('foo=1');
  });

  test('filters should be concatenated with and', () => {
    const filter1 = Filter.fromString('foo=1');
    const filter2 = Filter.fromString('bar=2');
    expect(filter1.and(filter2).toFilterString()).toBe('foo=1 and bar=2');
  });

  test('empty filters should be concatenated without and', () => {
    const filter1 = Filter.fromString('');
    const filter2 = Filter.fromString('bar=2');
    expect(filter1.and(filter2).toFilterString()).toBe('bar=2');
  });

  test('filters with only extra keywords should be concatenated without and', () => {
    const filter1 = Filter.fromString('apply_overrides=1 min_qod=70');
    const filter2 = Filter.fromString('bar=2');
    expect(filter1.and(filter2).toFilterString()).toBe(
      'apply_overrides=1 min_qod=70 bar=2',
    );
  });

  test('should reset filter id', () => {
    const filter1 = Filter.fromString('foo=1');
    filter1.id = 'f1';
    const filter2 = Filter.fromString('bar=2');
    filter2.id = 'f2';
    const filter3 = filter1.and(filter2);

    expect(filter3.id).toBeUndefined();
  });
});

describe('filter hasTerm', () => {
  test('filter should include terms', () => {
    const filter = Filter.fromString('apply_overrides=1 min_qod=70 severity>0');

    const term1 = FilterTerm.fromString('apply_overrides=1');
    const term2 = FilterTerm.fromString('min_qod=70');
    const term3 = FilterTerm.fromString('severity>0');
    const term4 = FilterTerm.fromString('apply_overrides=666'); // special keyword

    expect(filter.hasTerm(term1)).toBe(true);
    expect(filter.hasTerm(term2)).toBe(true);
    expect(filter.hasTerm(term3)).toBe(true);
    expect(filter.hasTerm(term4)).toBe(true);
  });

  test('filter should not include terms', () => {
    const filter = Filter.fromString('apply_overrides=1 min_qod=70 severity>0');

    const term1 = FilterTerm.fromString('apply_overrides>1'); // special keyword
    const term2 = FilterTerm.fromString('min_qod=78');
    const term3 = FilterTerm.fromString('severity>1');
    const term4 = FilterTerm.fromString('abc=70');
    const term5 = FilterTerm.fromString('severity<0');

    expect(filter.hasTerm(term1)).toBe(false);
    expect(filter.hasTerm(term2)).toBe(false);
    expect(filter.hasTerm(term3)).toBe(false);
    expect(filter.hasTerm(term4)).toBe(false);
    expect(filter.hasTerm(term5)).toBe(false);
  });
});

describe('Filter fromTerm', () => {
  test('should add FilterTerm to the Filter.fromElement', () => {
    const term = new FilterTerm({
      keyword: 'abc',
      relation: '=',
      value: 1,
    });
    const filter = Filter.fromTerm(term);

    expect(filter.toFilterString()).toEqual('abc=1');
  });

  test('should add several FilterTerms to the Filter.fromElement', () => {
    const term1 = new FilterTerm({
      keyword: 'abc',
      relation: '=',
      value: 1,
    });
    const term2 = new FilterTerm({
      keyword: 'def',
      relation: '>',
      value: 666,
    });
    const filter = Filter.fromTerm(term1, term2);

    expect(filter.toFilterString()).toEqual('abc=1 def>666');
  });
});

describe('Filter toFilterCriteriaString', () => {
  test('should return string representaion', () => {
    const filter1 = Filter.fromString('foo=bar and lorem=ipsum');
    expect(filter1.toFilterCriteriaString()).toEqual('foo=bar and lorem=ipsum');
  });

  test('should ignore extra keywords', () => {
    const filter1 = Filter.fromString('foo=bar first=1 rows=66');
    expect(filter1.toFilterCriteriaString()).toEqual('foo=bar');
  });
});

describe('Filter toFilterExtraString', () => {
  test('should empty string if no extra keywords are present', () => {
    const filter1 = Filter.fromString('foo=bar and lorem=ipsum');
    expect(filter1.toFilterExtraString()).toEqual('');
  });

  test('should ignore non extra keywords', () => {
    const filter1 = Filter.fromString('foo=bar first=1 rows=66');
    expect(filter1.toFilterExtraString()).toEqual('first=1 rows=66');
  });
});

describe('should lower the case of capitalized keywords', () => {
  test('should lower the case of multiple keywords', () => {
    const filter = Filter.fromString('sevErIty>3.9 and Qod_MIN=70 RoWs=14');
    expect(filter.toFilterString()).toEqual(
      'severity>3.9 and qod_min=70 rows=14',
    );
  });
  test('should do the same for filters from arrays', () => {
    const element = {
      keywords: {
        keyword: [
          {
            column: '',
            relation: '~',
            value: 'abc',
          },
          {
            column: '',
            relation: '~',
            value: 'and',
          },
          {
            column: '',
            relation: '~',
            value: 'not',
          },
          {
            column: '',
            relation: '~',
            value: 'def',
          },
          {
            column: 'ROWS',
            relation: '=',
            value: '10',
          },
          {
            column: 'fiRsT',
            relation: '=',
            value: '1',
          },
          {
            column: 'sORt',
            relation: '=',
            value: 'name',
          },
        ],
      },
    };
    const filter = Filter.fromElement(element);
    expect(filter.toFilterString()).toEqual(
      '~abc and not ~def rows=10 first=1 sort=name',
    );
  });
  test('a more wacky scenario', () => {
    const filter1 = Filter.fromString('~abc SorT=name');
    expect(filter1.toFilterString()).toEqual('~abc sort=name');
  });
  test('just a value', () => {
    const filter2 = Filter.fromString('~AbC');
    expect(filter2.toFilterString()).toEqual('~AbC');
  });
});

describe('Filter merge', () => {
  test('should merge undefined', () => {
    const filter1 = Filter.fromString('foo=bar');
    const filter2 = filter1.merge();

    expect(filter1).toBe(filter2);
    expect(filter2.get('foo')).toEqual('bar');
  });

  test('should merge null', () => {
    const filter1 = Filter.fromString('foo=bar');
    const filter2 = filter1.merge(null);

    expect(filter1).toBe(filter2);
    expect(filter2.get('foo')).toEqual('bar');
  });

  test('should merge filter', () => {
    const filter1 = Filter.fromString('foo=bar');
    const filter2 = Filter.fromString('rows=10 first=1');
    const filter3 = filter1.merge(filter2);

    expect(filter1).toBe(filter3);
    expect(filter3.toFilterString()).toEqual('foo=bar rows=10 first=1');
  });
});

// vim: set ts=2 sw=2 tw=80:
