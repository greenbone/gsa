/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import FilterTerm from 'gmp/models/filter/filter-term';
import QueryFilter, {UNKNOWN_FILTER_ID} from 'gmp/models/filter/query-filter';

describe('QueryFilter tests', () => {
  describe('QueryFilter constructor', () => {
    test('should create a filter with id and name', () => {
      const filter = new QueryFilter({id: '123', name: 'Test Filter'});
      expect(filter.id).toBe('123');
      expect(filter.name).toBe('Test Filter');
    });

    test('should create a filter with id, name and terms', () => {
      const filter = new QueryFilter({
        id: '123',
        name: 'Test Filter',
        terms: [
          new FilterTerm({keyword: 'foo', relation: '=', value: 'bar'}),
          new FilterTerm({keyword: 'lorem', relation: '~', value: 'ipsum'}),
        ],
      });
      expect(filter.id).toBe('123');
      expect(filter.name).toBe('Test Filter');
      expect(filter.length).toBe(2);
      const terms = filter.getAllTerms();
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

    test('should create a filter with no id and name', () => {
      const filter = new QueryFilter();
      expect(filter.id).toBeUndefined();
      expect(filter.name).toBeUndefined();
    });
  });

  describe('QueryFilter fromString', () => {
    test('should parse empty string', () => {
      const filter = QueryFilter.fromString('');
      expect(filter.toFilterString()).toEqual('');
      expect(filter.length).toBe(0);
    });

    test('should parse undefined string', () => {
      const filter = QueryFilter.fromString();
      expect(filter.toFilterString()).toEqual('');
      expect(filter.length).toBe(0);
    });

    test('should parse terms from string', () => {
      const filter = QueryFilter.fromString('foo=bar lorem~ipsum');
      expect(filter.toFilterString()).toEqual('foo=bar lorem~ipsum');
      expect(filter.length).toBe(2);
      const terms = filter.getAllTerms();
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
      let filter = QueryFilter.fromString('foo=bar and lorem~ipsum');
      expect(filter.toFilterString()).toEqual('foo=bar and lorem~ipsum');
      expect(filter.length).toBe(3);
      let terms = filter.getAllTerms();
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
      filter = QueryFilter.fromString('foo=bar or lorem~ipsum');
      expect(filter.toFilterString()).toEqual('foo=bar or lorem~ipsum');
      expect(filter.length).toBe(3);
      terms = filter.getAllTerms();
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
      filter = QueryFilter.fromString('not foo=bar');
      expect(filter.toFilterString()).toEqual('not foo=bar');
      expect(filter.length).toBe(2);
      terms = filter.getAllTerms();
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
      const filter = QueryFilter.fromString(
        'name="foo bar" comment~"lorem ipsum"',
      );
      expect(filter.toFilterString()).toEqual(
        'name="foo bar" comment~"lorem ipsum"',
      );
      expect(filter.length).toBe(2);
      const terms = filter.getAllTerms();
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
      const filter = QueryFilter.fromString('="foo bar" ~"lorem ipsum"');
      expect(filter.toFilterString()).toEqual('="foo bar" ~"lorem ipsum"');
      expect(filter.length).toBe(2);
      const terms = filter.getAllTerms();
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
      const filter = QueryFilter.fromString(
        'name="foo <= bar" ~"foo & bar" and comment="hello : world ?"',
      );
      expect(filter.toFilterString()).toEqual(
        'name="foo <= bar" ~"foo & bar" and comment="hello : world ?"',
      );
      expect(filter.length).toBe(4);
      const terms = filter.getAllTerms();
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

    test('should parse approx relation without column', () => {
      const filter = QueryFilter.fromString('~abc');
      expect(filter.toFilterString()).toEqual('~abc');
    });

    test('should parse approx relation without relation and column', () => {
      const filter = QueryFilter.fromString('abc');
      expect(filter.toFilterString()).toEqual('abc');
    });

    test('should parse equal relation without column', () => {
      const filter = QueryFilter.fromString('=abc');
      expect(filter.toFilterString()).toEqual('=abc');
    });

    test('should parse equal relation without column and with quotes', () => {
      const filter = QueryFilter.fromString('="abc def"');
      expect(filter.toFilterString()).toEqual('="abc def"');
    });

    test('should parse equal relation without column and with special characters in quotes', () => {
      const filter = QueryFilter.fromString('="abc : def"');
      expect(filter.toFilterString()).toEqual('="abc : def"');
    });

    test('should parse above relation without column', () => {
      const filter = QueryFilter.fromString('>1.0');
      expect(filter.toFilterString()).toEqual('>1.0');
    });

    test('should parse below relation without column', () => {
      const filter = QueryFilter.fromString('<1.0');
      expect(filter.toFilterString()).toEqual('<1.0');
    });

    test('should parse below relation without column', () => {
      const filter = QueryFilter.fromString(':abc');
      expect(filter.toFilterString()).toEqual(':abc');
    });

    test('should parse and keep sequence order', () => {
      const fStrings = [
        'abc and not def',
        '~abc and not ~def',
        'abc and not def rows=10 first=1 sort=name',
        'family=FTP severity>4 and severity<9', // severity range
        'apply_overrides=0 min_qod=70 vulnerability~"Reporting" and ' +
          'vulnerability~"SSH" and severity>6.9 first=1 rows=10 sort=name',
      ];

      fStrings.forEach(fString => {
        expect(QueryFilter.fromString(fString).toFilterString()).toEqual(
          fString,
        );
      });
    });

    test('should convert first if less then 1', () => {
      let filter = QueryFilter.fromString('first=0');
      expect(filter.toFilterString()).toEqual('first=1');

      filter = QueryFilter.fromString('first=-1');
      expect(filter.toFilterString()).toEqual('first=1');

      filter = QueryFilter.fromString('first=-666');
      expect(filter.toFilterString()).toEqual('first=1');
    });

    test('should always use equal relation for first keyword', () => {
      let filter = QueryFilter.fromString('first>1');
      expect(filter.toFilterString()).toEqual('first=1');

      filter = QueryFilter.fromString('first<1');
      expect(filter.toFilterString()).toEqual('first=1');

      filter = QueryFilter.fromString('first>1');
      expect(filter.toFilterString()).toEqual('first=1');
    });

    test('should always use equal relation for rows keyword', () => {
      let filter = QueryFilter.fromString('rows>1');
      expect(filter.toFilterString()).toEqual('rows=1');

      filter = QueryFilter.fromString('rows<1');
      expect(filter.toFilterString()).toEqual('rows=1');

      filter = QueryFilter.fromString('rows>1');
      expect(filter.toFilterString()).toEqual('rows=1');
    });

    test('should ignore null as filter argument', () => {
      // @ts-expect-error
      const filter = QueryFilter.fromString('foo=1', null);
      expect(filter.toFilterString()).toEqual('foo=1');
    });

    test('should ignore filter terms starting with _', () => {
      let filter = QueryFilter.fromString('rows=100 _foo=bar');
      expect(filter.toFilterString()).toEqual('rows=100');

      filter = QueryFilter.fromString('_bar=foo rows=100');
      expect(filter.toFilterString()).toEqual('rows=100');

      filter = QueryFilter.fromString('_foo rows=100');
      expect(filter.toFilterString()).toEqual('rows=100');
    });
  });

  describe('QueryFilter fromResponseElement', () => {
    test('should parse approx relation without column', () => {
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
      const filter = QueryFilter.fromResponseElement(elem);
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
      let filter = QueryFilter.fromResponseElement(elem);
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
      filter = QueryFilter.fromResponseElement(elem);
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

      const filter = QueryFilter.fromResponseElement(elem);
      const filterString =
        'severity>3.9 and severity<7 first=1 rows=10 sort=name';
      expect(filter.toFilterString()).toEqual(filterString);

      const filter2 = QueryFilter.fromString(filterString);
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
      const filter = QueryFilter.fromResponseElement(elem);
      expect(filter.toFilterString()).toEqual('_foo=abc');
    });

    test('should parse id', () => {
      const filter1 = QueryFilter.fromResponseElement();
      expect(filter1.id).toBeUndefined();

      const filter2 = QueryFilter.fromResponseElement({_id: '123'});
      expect(filter2.id).toBe('123');

      const filter3 = QueryFilter.fromResponseElement({
        _id: UNKNOWN_FILTER_ID,
      });
      expect(filter3.id).toBeUndefined();
    });

    test('should parse name', () => {
      const filter1 = QueryFilter.fromResponseElement();
      expect(filter1.name).toBeUndefined();

      const filter2 = QueryFilter.fromResponseElement({name: 'Test Filter'});
      expect(filter2.name).toBe('Test Filter');
    });

    test('should parse term string', () => {
      const filter = QueryFilter.fromResponseElement({
        term: 'foo=bar and lorem~ipsum',
      });
      expect(filter.toFilterString()).toEqual('foo=bar and lorem~ipsum');
      expect(filter.length).toBe(3);
      const terms = filter.getAllTerms();
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
    });
  });

  describe('QueryFilter fromTerm', () => {
    test('should create filter from single term', () => {
      const filter = QueryFilter.fromTerm(FilterTerm.fromString('foo=1'));

      expect(filter.toFilterString()).toBe('foo=1');
      expect(filter.length).toBe(1);
    });

    test('should create filter from multiple terms', () => {
      const filter = QueryFilter.fromTerm(
        FilterTerm.fromString('foo=1'),
        FilterTerm.fromString('bar=2'),
      );

      expect(filter.toFilterString()).toBe('foo=1 bar=2');
      expect(filter.length).toBe(2);
    });
  });

  describe('QueryFilter set', () => {
    test('should return new filter and not mutate original', () => {
      const filter = new QueryFilter({
        id: '123',
        name: 'Test Filter',
        terms: [FilterTerm.fromString('foo=1')],
      });

      const updated = filter.set('bar', '2');

      expect(filter.toFilterString()).toBe('foo=1');
      expect(filter.id).toBe('123');
      expect(updated).not.toBe(filter);
      expect(updated.toFilterString()).toBe('foo=1 bar=2');
      expect(updated.id).toBeUndefined();
      expect(updated.name).toBe('Test Filter');
    });
  });

  describe('QueryFilter copy', () => {
    test('should keep id and create equal filter', () => {
      const filter = new QueryFilter({
        id: '123',
        name: 'Test Filter',
        terms: [FilterTerm.fromString('foo=1')],
      });

      const copied = filter.copy();

      expect(filter.id).toBe('123');
      expect(filter.name).toBe('Test Filter');
      expect(copied).not.toBe(filter);
      expect(copied.equals(filter)).toBe(true);
      expect(copied.id).toBe('123');
      expect(copied.name).toBe('Test Filter');
    });
  });

  describe('QueryFilter delete', () => {
    test('should return same instance for unknown key', () => {
      const filter = QueryFilter.fromString('foo=1');
      const updated = filter.delete('bar');

      expect(updated).toBe(filter);
    });
  });

  describe('QueryFilter get/has terms api', () => {
    test('should delegate get, has, getTerm, getTerms and hasTerm', () => {
      const filter = QueryFilter.fromString('foo=1 foo=2 bar=3');

      expect(filter.has('foo')).toBe(true);
      expect(filter.get('foo')).toBe('1');
      expect(filter.get('missing', 'fallback')).toBe('fallback');
      expect(filter.getTerm('foo')?.value).toBe('1');
      expect(filter.getTerms('foo')).toHaveLength(2);
      expect(filter.hasTerm(FilterTerm.fromString('bar=3'))).toBe(true);
    });
  });

  describe('QueryFilter toFilterCriteriaString', () => {
    test('should split terms into criteria and extra strings', () => {
      const filter = QueryFilter.fromString('foo=1 rows=10 sort=name');

      expect(filter.toFilterCriteriaString()).toBe('foo=1');
      expect(filter.toFilterExtraString()).toBe('rows=10 sort=name');
      expect(filter.identifier()).toEqual('foo=1 rows=10 sort=name');
    });
  });

  describe('QueryFilter paging helpers', () => {
    test('next, previous, first and all should update paging terms', () => {
      const filter = QueryFilter.fromString('first=1 rows=10');

      expect(filter.next().toFilterString()).toBe('first=11 rows=10');
      expect(filter.next().previous().toFilterString()).toBe('first=1 rows=10');
      expect(filter.first(5).toFilterString()).toBe('first=5 rows=10');
      expect(filter.all().toFilterString()).toBe('first=1 rows=-1');
    });
  });

  describe('QueryFilter simple', () => {
    test('should remove paging and sorting terms', () => {
      const filter = QueryFilter.fromString('foo=1 first=1 rows=10 sort=name');

      expect(filter.simple().toFilterString()).toBe('foo=1');
    });
  });

  describe('QueryFilter sort helpers', () => {
    test('setSortOrder and setSortBy should delegate sort updates', () => {
      const filter = QueryFilter.fromString('sort=name');

      const reverse = filter.setSortOrder('sort-reverse');
      expect(reverse.getSortOrder()).toBe('sort-reverse');
      expect(reverse.getSortBy()).toBe('name');

      const updated = reverse.setSortBy('severity');
      expect(updated.getSortOrder()).toBe('sort-reverse');
      expect(updated.getSortBy()).toBe('severity');
    });
  });

  describe('QueryFilter merge/and/equals', () => {
    test('should delegate merge variants and and', () => {
      const filter = QueryFilter.fromString('foo=1 sort=name');

      expect(filter.merge(undefined)).toBe(filter);
      expect(
        filter.merge(QueryFilter.fromString('bar=2')).toFilterString(),
      ).toBe('foo=1 sort=name bar=2');
      expect(
        filter
          .mergeKeywords(QueryFilter.fromString('foo=2 severity>3'))
          .toFilterString(),
      ).toBe('foo=1 sort=name severity>3');
      expect(
        filter
          .mergeExtraKeywords(QueryFilter.fromString('bar=2 rows=50'))
          .toFilterString(),
      ).toBe('foo=1 sort=name rows=50');
      expect(filter.and(QueryFilter.fromString('bar=2')).toFilterString()).toBe(
        'foo=1 sort=name and bar=2',
      );
      expect(filter.and(undefined)).toBe(filter);
      expect(filter.equals(QueryFilter.fromString('sort=name foo=1'))).toBe(
        true,
      );
    });
  });
});
