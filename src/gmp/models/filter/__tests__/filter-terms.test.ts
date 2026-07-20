/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import FilterTerm from 'gmp/models/filter/filter-term';
import FilterTerms from 'gmp/models/filter/filter-terms';

const fromTerms = (...terms: string[]) =>
  new FilterTerms({terms: terms.map(term => FilterTerm.fromString(term))});

describe('FilterTerms tests', () => {
  describe('FilterTerms copy', () => {
    test('should copy all values', () => {
      const filterTerms = fromTerms('abc=1', 'def=2');
      const copy = filterTerms.copy();

      expect(copy).not.toBe(filterTerms);
      expect(copy.get('abc')).toBe('1');
      expect(copy.get('def')).toBe('2');
      expect(copy.toFilterString()).toBe('abc=1 def=2');
    });
  });

  describe('FilterTerms set', () => {
    test('set should return new instance and not mutate original', () => {
      const filterTerms = fromTerms('foo=1');
      const updated = filterTerms.set('bar', '2');

      expect(updated).not.toBe(filterTerms);
      expect(filterTerms.has('bar')).toBe(false);
      expect(updated.get('bar')).toBe('2');
    });

    test('set should keep only one sort keyword', () => {
      const filterTerms = fromTerms('sort=name');
      const updated = filterTerms.set('sort-reverse', 'severity');

      expect(updated.has('sort')).toBe(false);
      expect(updated.get('sort-reverse')).toBe('severity');
    });
  });

  describe('FilterTerms delete', () => {
    test('delete should return same instance if key does not exist', () => {
      const filterTerms = fromTerms('foo=1');
      const updated = filterTerms.delete('bar');

      expect(updated).toBe(filterTerms);
    });

    test('delete should return new instance if key exists', () => {
      const filterTerms = fromTerms('foo=1', 'bar=2');
      const updated = filterTerms.delete('foo');

      expect(updated).not.toBe(filterTerms);
      expect(updated.has('foo')).toBe(false);
      expect(updated.get('bar')).toBe('2');
      expect(filterTerms.has('foo')).toBe(true);
    });
  });

  describe('FilterTerms getTerm', () => {
    test('should return undefined for undefined key', () => {
      const filterTerms = fromTerms('foo=1');
      expect(filterTerms.getTerm(undefined)).toBeUndefined();
    });

    test('should return first matching term', () => {
      const filterTerms = fromTerms('foo=1', 'foo=2');
      expect(filterTerms.getTerm('foo')?.value).toBe('1');
    });
  });

  describe('FilterTerms getTerms', () => {
    test('should return empty array for undefined key', () => {
      const filterTerms = fromTerms('foo=1');
      expect(filterTerms.getTerms(undefined)).toEqual([]);
    });

    test('should return all matching terms', () => {
      const filterTerms = fromTerms('foo=1', 'foo=2', 'bar=1');
      expect(filterTerms.getTerms('foo')).toHaveLength(2);
    });
  });

  describe('FilterTerms getAllTerms', () => {
    test('should return all terms in original order', () => {
      const filterTerms = fromTerms('foo=1', 'bar=2');
      expect(filterTerms.getAllTerms().map(term => term.toString())).toEqual([
        'foo=1',
        'bar=2',
      ]);
    });
  });

  describe('FilterTerms get', () => {
    test('should return default value for missing key', () => {
      const filterTerms = fromTerms('foo=1');
      expect(filterTerms.get('bar', 'fallback')).toBe('fallback');
    });
  });

  describe('FilterTerms has', () => {
    test('should return false for unknown key', () => {
      const filterTerms = fromTerms('foo=1');
      expect(filterTerms.has('bar')).toBe(false);
    });
  });

  describe('FilterTerms next', () => {
    test('next should use defaults', () => {
      const updated = new FilterTerms().next();

      expect(updated.get('first')).toBe(1);
      expect(updated.get('rows')).toBe(10);
    });

    test('next should advance first by rows', () => {
      const filterTerms = fromTerms('first=1', 'rows=10');
      const updated = filterTerms.next();

      expect(updated.get('first')).toBe(11);
      expect(updated.get('rows')).toBe(10);
      expect(filterTerms.get('first')).toBe(1);
    });

    test('should keep other keywords when moving to next page', () => {
      const filterTerms = fromTerms('first=1', 'rows=10', 'sort=name');
      const updated = filterTerms.next();

      expect(updated.get('first')).toBe(11);
      expect(updated.get('rows')).toBe(10);
      expect(updated.get('sort')).toBe('name');
    });
  });

  describe('FilterTerms previous', () => {
    test('previous should clamp first at 1', () => {
      const filterTerms = fromTerms('first=5', 'rows=10');
      const updated = filterTerms.previous();

      expect(updated.get('first')).toBe(1);
      expect(updated.get('rows')).toBe(10);
    });

    test('should keep other keywords when moving to previous page', () => {
      const filterTerms = fromTerms('first=15', 'rows=10', 'sort=name');
      const updated = filterTerms.previous();

      expect(updated.get('first')).toBe(5);
      expect(updated.get('rows')).toBe(10);
      expect(updated.get('sort')).toBe('name');
    });
  });

  describe('FilterTerms first', () => {
    test('should set first', () => {
      const filterTerms = fromTerms('first=9');
      const updated = filterTerms.first();

      expect(updated.get('first')).toBe(1);
      expect(filterTerms.get('first')).toBe(9);
    });

    test('should set first to provided value', () => {
      const filterTerms = fromTerms('first=9');
      const updated = filterTerms.first(3);
      expect(updated.get('first')).toBe(3);
      expect(filterTerms.get('first')).toBe(9);
    });

    test('should keep other keywords when setting first', () => {
      const filterTerms = fromTerms('first=9', 'rows=10', 'sort=name');
      const updated = filterTerms.first(1);

      expect(updated.get('first')).toBe(1);
      expect(updated.get('rows')).toBe(10);
      expect(updated.get('sort')).toBe('name');
    });

    test('should set first to 1 when provided value is less than 1', () => {
      const filterTerms = fromTerms('first=9');
      const updated = filterTerms.first(0);
      expect(updated.get('first')).toBe(1);
    });
  });

  describe('FilterTerms all', () => {
    test('should set first and rows for all items', () => {
      const filterTerms = fromTerms('first=3', 'rows=10');
      const updated = filterTerms.all();
      expect(updated.get('first')).toBe(1);
      expect(updated.get('rows')).toBe(-1);
    });
  });

  describe('FilterTerms simple', () => {
    test('simple should remove first rows and current sort order keyword', () => {
      const filterTerms = fromTerms('first=1', 'rows=10', 'sort=name', 'foo=1');
      const simple = filterTerms.simple();

      expect(simple.has('first')).toBe(false);
      expect(simple.has('rows')).toBe(false);
      expect(simple.has('sort')).toBe(false);
      expect(simple.get('foo')).toBe('1');
    });
  });

  describe('FilterTerms toFilterCriteriaString', () => {
    test('should omit extra keywords', () => {
      const filterTerms = fromTerms('foo=1', 'rows=10', 'sort=name');
      expect(filterTerms.toFilterCriteriaString()).toBe('foo=1');
    });
  });

  describe('FilterTerms toFilterExtraString', () => {
    test('should include only extra keywords', () => {
      const filterTerms = fromTerms('foo=1', 'rows=10', 'sort=name');
      expect(filterTerms.toFilterExtraString()).toBe('rows=10 sort=name');
    });
  });

  describe('FilterTerms identifier', () => {
    test('should equal toFilterString result', () => {
      const filterTerms = fromTerms('foo=1', 'bar=2');
      expect(filterTerms.identifier()).toBe(filterTerms.toFilterString());
    });
  });

  describe('FilterTerms getSortOrder', () => {
    test('should return sort when empty', () => {
      const filterTerms = new FilterTerms();

      expect(filterTerms.getSortOrder()).toBe('sort');
    });

    test('getSortOrder and getSortBy should follow sort-reverse when present', () => {
      const filterTerms = fromTerms('sort-reverse=severity');

      expect(filterTerms.getSortOrder()).toBe('sort-reverse');
    });
  });

  describe('FilterTerms getSortBy', () => {
    test('should return undefined when no sort is set', () => {
      const filterTerms = new FilterTerms();

      expect(filterTerms.getSortBy()).toBeUndefined();
    });

    test('should return sort-reverse value when present', () => {
      const filterTerms = fromTerms('sort-reverse=severity');

      expect(filterTerms.getSortBy()).toBe('severity');
    });
  });

  describe('FilterTerms setSortOrder', () => {
    test('setSortOrder should preserve sort field', () => {
      const filterTerms = fromTerms('sort=name');
      const updated = filterTerms.setSortOrder('sort-reverse');

      expect(updated.getSortOrder()).toBe('sort-reverse');
      expect(updated.getSortBy()).toBe('name');
    });

    test('should fallback to sort for invalid order', () => {
      const filterTerms = fromTerms('sort-reverse=name');
      const updated = filterTerms.setSortOrder(
        'invalid-order' as unknown as 'sort',
      );

      expect(updated.getSortOrder()).toBe('sort');
      expect(updated.get('sort')).toBe('name');
    });
  });

  describe('FilterTerms setSortBy', () => {
    test('setSortBy should set current order field', () => {
      const filterTerms = fromTerms('sort-reverse=old');
      const updated = filterTerms.setSortBy('new');

      expect(updated.get('sort-reverse')).toBe('new');
      expect(updated.has('sort')).toBe(false);
    });

    test('should set sort when no order exists', () => {
      const filterTerms = new FilterTerms();
      const updated = filterTerms.setSortBy('name');

      expect(updated.getSortOrder()).toBe('sort');
      expect(updated.get('sort')).toBe('name');
    });
  });

  describe('FilterTerms merge', () => {
    test('merge should append terms and keep duplicates', () => {
      const filterTerms = fromTerms('foo=bar');
      const merged = filterTerms.merge(fromTerms('foo=baz', 'rows=10'));

      expect(merged.toFilterString()).toBe('foo=bar foo=baz rows=10');
      expect(merged.getTerms('foo')).toHaveLength(2);
    });

    test('should return same instance for undefined filter', () => {
      const filterTerms = fromTerms('foo=bar');
      expect(filterTerms.merge(undefined)).toBe(filterTerms);
    });

    test('should return same instance for empty filter', () => {
      const filterTerms = fromTerms('foo=bar');
      expect(filterTerms.merge(new FilterTerms())).toBe(filterTerms);
    });
  });

  describe('FilterTerms mergeKeywords', () => {
    test('mergeKeywords should only append new keywords', () => {
      const filterTerms = fromTerms('abc=1', 'sort=name');
      const merged = filterTerms.mergeKeywords(
        fromTerms('abc=2', 'severity>3', 'trend=more'),
      );

      expect(merged.get('abc')).toBe('1');
      expect(merged.get('sort')).toBe('name');
      expect(merged.get('severity')).toBe('3');
      expect(merged.get('trend')).toBe('more');
    });

    test('should return same instance for undefined filter', () => {
      const filterTerms = fromTerms('abc=1');
      expect(filterTerms.mergeKeywords(undefined)).toBe(filterTerms);
    });

    test('should return same instance when no new keywords exist', () => {
      const filterTerms = fromTerms('abc=1');
      expect(filterTerms.mergeKeywords(fromTerms('abc=2'))).toBe(filterTerms);
    });
  });

  describe('FilterTerms mergeExtraKeywords', () => {
    test('mergeExtraKeywords should only append extra keywords', () => {
      const filterTerms = fromTerms('abc=1');
      const merged = filterTerms.mergeExtraKeywords(
        fromTerms('def=1', 'apply_overrides=1', 'rows=10', 'sort=name'),
      );

      expect(merged.get('abc')).toBe('1');
      expect(merged.get('def')).toBeUndefined();
      expect(merged.get('apply_overrides')).toBe(1);
      expect(merged.get('rows')).toBe(10);
      expect(merged.get('sort')).toBe('name');
    });

    test('mergeExtraKeywords should not overwrite existing sort/sort-reverse', () => {
      const filterTerms = fromTerms('sort-reverse=foo');
      const merged = filterTerms.mergeExtraKeywords(fromTerms('sort=bar'));

      expect(merged.getSortOrder()).toBe('sort-reverse');
      expect(merged.getSortBy()).toBe('foo');
    });

    test('should return same instance when no extra keywords exist', () => {
      const filterTerms = fromTerms('foo=1');
      expect(filterTerms.mergeExtraKeywords(fromTerms('bar=2'))).toBe(
        filterTerms,
      );
    });
  });

  describe('FilterTerms and', () => {
    test('and should concatenate with operator when non-extra terms exist', () => {
      const filterTerms = fromTerms('foo=1');
      const concatenated = filterTerms.and(fromTerms('bar=2'));

      expect(concatenated.toFilterString()).toBe('foo=1 and bar=2');
    });

    test('and should not add operator when only extra keywords exist', () => {
      const filterTerms = fromTerms('apply_overrides=1', 'min_qod=70');
      const concatenated = filterTerms.and(fromTerms('bar=2'));

      expect(concatenated.toFilterString()).toBe(
        'apply_overrides=1 min_qod=70 bar=2',
      );
    });

    test('should return same instance for undefined filter', () => {
      const filterTerms = fromTerms('foo=1');
      expect(filterTerms.and(undefined)).toBe(filterTerms);
    });

    test('should return same instance for null filter', () => {
      const filterTerms = fromTerms('foo=1');
      expect(filterTerms.and(null)).toBe(filterTerms);
    });
  });

  describe('FilterTerms equals', () => {
    test('equals should compare equal terms independent of order for same keyword', () => {
      const left = fromTerms('foo=1', 'foo=2', 'bar=1');
      const right = fromTerms('foo=2', 'bar=1', 'foo=1');

      expect(left.equals(right)).toBe(true);
    });

    test('should return false for different lengths', () => {
      const left = fromTerms('foo=1');
      const right = fromTerms('foo=1', 'bar=1');
      expect(left.equals(right)).toBe(false);
    });

    test('should return false for different values', () => {
      const left = fromTerms('foo=1');
      const right = fromTerms('foo=2');
      expect(left.equals(right)).toBe(false);
    });
  });

  describe('FilterTerms hasTerm', () => {
    test('hasTerm should support converted special keyword values', () => {
      const filterTerms = fromTerms('apply_overrides=999');

      expect(
        filterTerms.hasTerm(FilterTerm.fromString('apply_overrides=1')),
      ).toBe(true);
    });

    test('should return false for undefined term', () => {
      const filterTerms = fromTerms('foo=1');
      expect(filterTerms.hasTerm(undefined)).toBe(false);
    });

    test('should return false for non-matching relation/value', () => {
      const filterTerms = fromTerms('severity>7');
      expect(filterTerms.hasTerm(FilterTerm.fromString('severity<7'))).toBe(
        false,
      );
    });
  });
});
