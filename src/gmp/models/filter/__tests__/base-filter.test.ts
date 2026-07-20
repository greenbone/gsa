/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import BaseFilter, {UNKNOWN_FILTER_ID} from 'gmp/models/filter/base-filter';
import FilterTerm from 'gmp/models/filter/filter-term';

describe('BaseFilter tests', () => {
  describe('BaseFilter constructor', () => {
    test('should create a filter with id and name', () => {
      const filter = new BaseFilter({id: '123', name: 'Test Filter'});
      expect(filter.id).toBe('123');
      expect(filter.name).toBe('Test Filter');
    });

    test('should create a filter with id, name and terms', () => {
      const filter = new BaseFilter({
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
      const filter = new BaseFilter();
      expect(filter.id).toBeUndefined();
      expect(filter.name).toBeUndefined();
    });
  });

  describe('BaseFilter fromString', () => {
    test('should parse terms from string', () => {
      const filter = BaseFilter.fromString('foo=bar lorem~ipsum');
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
      let filter = BaseFilter.fromString('foo=bar and lorem~ipsum');
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
      filter = BaseFilter.fromString('foo=bar or lorem~ipsum');
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
      filter = BaseFilter.fromString('not foo=bar');
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
      const filter = BaseFilter.fromString(
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
      const filter = BaseFilter.fromString('="foo bar" ~"lorem ipsum"');
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
      const filter = BaseFilter.fromString(
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
      const filter = BaseFilter.fromString('~abc');
      expect(filter.toFilterString()).toEqual('~abc');
    });

    test('should parse approx relation without relation and column', () => {
      const filter = BaseFilter.fromString('abc');
      expect(filter.toFilterString()).toEqual('abc');
    });

    test('should parse equal relation without column', () => {
      const filter = BaseFilter.fromString('=abc');
      expect(filter.toFilterString()).toEqual('=abc');
    });

    test('should parse equal relation without column and with quotes', () => {
      const filter = BaseFilter.fromString('="abc def"');
      expect(filter.toFilterString()).toEqual('="abc def"');
    });

    test('should parse equal relation without column and with special characters in quotes', () => {
      const filter = BaseFilter.fromString('="abc : def"');
      expect(filter.toFilterString()).toEqual('="abc : def"');
    });

    test('should parse above relation without column', () => {
      const filter = BaseFilter.fromString('>1.0');
      expect(filter.toFilterString()).toEqual('>1.0');
    });

    test('should parse below relation without column', () => {
      const filter = BaseFilter.fromString('<1.0');
      expect(filter.toFilterString()).toEqual('<1.0');
    });

    test('should parse below relation without column', () => {
      const filter = BaseFilter.fromString(':abc');
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
        expect(BaseFilter.fromString(fString).toFilterString()).toEqual(
          fString,
        );
      });
    });

    test('should convert first if less then 1', () => {
      let filter = BaseFilter.fromString('first=0');
      expect(filter.toFilterString()).toEqual('first=1');

      filter = BaseFilter.fromString('first=-1');
      expect(filter.toFilterString()).toEqual('first=1');

      filter = BaseFilter.fromString('first=-666');
      expect(filter.toFilterString()).toEqual('first=1');
    });

    test('should always use equal relation for first keyword', () => {
      let filter = BaseFilter.fromString('first>1');
      expect(filter.toFilterString()).toEqual('first=1');

      filter = BaseFilter.fromString('first<1');
      expect(filter.toFilterString()).toEqual('first=1');

      filter = BaseFilter.fromString('first>1');
      expect(filter.toFilterString()).toEqual('first=1');
    });

    test('should always use equal relation for rows keyword', () => {
      let filter = BaseFilter.fromString('rows>1');
      expect(filter.toFilterString()).toEqual('rows=1');

      filter = BaseFilter.fromString('rows<1');
      expect(filter.toFilterString()).toEqual('rows=1');

      filter = BaseFilter.fromString('rows>1');
      expect(filter.toFilterString()).toEqual('rows=1');
    });

    test('should ignore null as filter argument', () => {
      // @ts-expect-error
      const filter = BaseFilter.fromString('foo=1', null);
      expect(filter.toFilterString()).toEqual('foo=1');
    });

    test('should ignore filter terms starting with _', () => {
      let filter = BaseFilter.fromString('rows=100 _foo=bar');
      expect(filter.toFilterString()).toEqual('rows=100');

      filter = BaseFilter.fromString('_bar=foo rows=100');
      expect(filter.toFilterString()).toEqual('rows=100');

      filter = BaseFilter.fromString('_foo rows=100');
      expect(filter.toFilterString()).toEqual('rows=100');
    });
  });

  describe('BaseFilter fromResponseElement', () => {
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
      const filter = BaseFilter.fromResponseElement(elem);
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
      let filter = BaseFilter.fromResponseElement(elem);
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
      filter = BaseFilter.fromResponseElement(elem);
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

      const filter = BaseFilter.fromResponseElement(elem);
      const filterString =
        'severity>3.9 and severity<7 first=1 rows=10 sort=name';
      expect(filter.toFilterString()).toEqual(filterString);

      const filter2 = BaseFilter.fromString(filterString);
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
      const filter = BaseFilter.fromResponseElement(elem);
      expect(filter.toFilterString()).toEqual('_foo=abc');
    });

    test('should parse id', () => {
      const filter1 = BaseFilter.fromResponseElement();
      expect(filter1.id).toBeUndefined();

      const filter2 = BaseFilter.fromResponseElement({_id: '123'});
      expect(filter2.id).toBe('123');

      const filter3 = BaseFilter.fromResponseElement({
        _id: UNKNOWN_FILTER_ID,
      });
      expect(filter3.id).toBeUndefined();
    });

    test('should parse name', () => {
      const filter1 = BaseFilter.fromResponseElement();
      expect(filter1.name).toBeUndefined();

      const filter2 = BaseFilter.fromResponseElement({name: 'Test Filter'});
      expect(filter2.name).toBe('Test Filter');
    });

    test('should parse term string', () => {
      const filter = BaseFilter.fromResponseElement({
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

  describe('BaseFilter fromTerm', () => {
    test('should create filter from single term', () => {
      const filter = BaseFilter.fromTerm(FilterTerm.fromString('foo=1'));

      expect(filter.toFilterString()).toBe('foo=1');
      expect(filter.length).toBe(1);
    });

    test('should create filter from multiple terms', () => {
      const filter = BaseFilter.fromTerm(
        FilterTerm.fromString('foo=1'),
        FilterTerm.fromString('bar=2'),
      );

      expect(filter.toFilterString()).toBe('foo=1 bar=2');
      expect(filter.length).toBe(2);
    });
  });

  describe('BaseFilter set', () => {
    test('should return new filter and not mutate original', () => {
      const filter = new BaseFilter({
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

  describe('BaseFilter copy', () => {
    test('should keep id and create equal filter', () => {
      const filter = new BaseFilter({
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

  describe('BaseFilter delete', () => {
    test('should return same instance for unknown key', () => {
      const filter = BaseFilter.fromString('foo=1');
      const updated = filter.delete('bar');

      expect(updated).toBe(filter);
    });
  });

  describe('BaseFilter get/has terms api', () => {
    test('should delegate get, has, getTerm, getTerms and hasTerm', () => {
      const filter = BaseFilter.fromString('foo=1 foo=2 bar=3');

      expect(filter.has('foo')).toBe(true);
      expect(filter.get('foo')).toBe('1');
      expect(filter.get('missing', 'fallback')).toBe('fallback');
      expect(filter.getTerm('foo')?.value).toBe('1');
      expect(filter.getTerms('foo')).toHaveLength(2);
      expect(filter.hasTerm(FilterTerm.fromString('bar=3'))).toBe(true);
    });
  });

  describe('BaseFilter toFilterCriteriaString', () => {
    test('should split terms into criteria and extra strings', () => {
      const filter = BaseFilter.fromString('foo=1 rows=10 sort=name');

      expect(filter.toFilterCriteriaString()).toBe('foo=1');
      expect(filter.toFilterExtraString()).toBe('rows=10 sort=name');
      expect(filter.identifier()).toEqual('foo=1 rows=10 sort=name');
    });
  });

  describe('BaseFilter paging helpers', () => {
    test('next, previous, first and all should update paging terms', () => {
      const filter = BaseFilter.fromString('first=1 rows=10');

      expect(filter.next().toFilterString()).toBe('first=11 rows=10');
      expect(filter.next().previous().toFilterString()).toBe('first=1 rows=10');
      expect(filter.first(5).toFilterString()).toBe('first=5 rows=10');
      expect(filter.all().toFilterString()).toBe('first=1 rows=-1');
    });
  });

  describe('BaseFilter simple', () => {
    test('should remove paging and sorting terms', () => {
      const filter = BaseFilter.fromString('foo=1 first=1 rows=10 sort=name');

      expect(filter.simple().toFilterString()).toBe('foo=1');
    });
  });

  describe('BaseFilter sort helpers', () => {
    test('setSortOrder and setSortBy should delegate sort updates', () => {
      const filter = BaseFilter.fromString('sort=name');

      const reverse = filter.setSortOrder('sort-reverse');
      expect(reverse.getSortOrder()).toBe('sort-reverse');
      expect(reverse.getSortBy()).toBe('name');

      const updated = reverse.setSortBy('severity');
      expect(updated.getSortOrder()).toBe('sort-reverse');
      expect(updated.getSortBy()).toBe('severity');
    });
  });

  describe('BaseFilter merge/and/equals', () => {
    test('should delegate merge variants and and', () => {
      const filter = BaseFilter.fromString('foo=1 sort=name');

      expect(filter.merge(undefined)).toBe(filter);
      expect(
        filter.merge(BaseFilter.fromString('bar=2')).toFilterString(),
      ).toBe('foo=1 sort=name bar=2');
      expect(
        filter
          .mergeKeywords(BaseFilter.fromString('foo=2 severity>3'))
          .toFilterString(),
      ).toBe('foo=1 sort=name severity>3');
      expect(
        filter
          .mergeExtraKeywords(BaseFilter.fromString('bar=2 rows=50'))
          .toFilterString(),
      ).toBe('foo=1 sort=name rows=50');
      expect(filter.and(BaseFilter.fromString('bar=2')).toFilterString()).toBe(
        'foo=1 sort=name and bar=2',
      );
      expect(filter.and(undefined)).toBe(filter);
      expect(filter.equals(BaseFilter.fromString('sort=name foo=1'))).toBe(
        true,
      );
    });
  });
});
