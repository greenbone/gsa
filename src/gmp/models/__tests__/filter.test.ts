/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import Capabilities from 'gmp/capabilities/capabilities';
import date from 'gmp/models/date';
import Filter from 'gmp/models/filter';
import FilterTerm, {
  parseFilterTermsFromString,
} from 'gmp/models/filter/filter-term';
import type FilterType from 'gmp/models/filter/filter-type';
import Model from 'gmp/models/model';
import UserTag from 'gmp/models/user-tag';
import {YES_VALUE} from 'gmp/parser';
import {isArray} from 'gmp/utils/identity';

const createFilterWithTerms = (terms: string, id: string = 'foo'): Filter => {
  return new Filter({
    id,
    terms: parseFilterTermsFromString(terms),
  });
};

describe('Filter tests', () => {
  describe('Filter set', () => {
    test('should allow to set a filter term', () => {
      const filter = new Filter({id: 'foo'});
      expect(filter.set('abc', '1', '=').toFilterString()).toEqual('abc=1');
    });

    test('should not mutate the filter when setting a filter term', () => {
      const filter = new Filter({id: 'foo'});
      const newFilter = filter.set('abc', '1', '=');
      expect(filter).not.toBe(newFilter);
      expect(filter.toFilterString()).toEqual('');
      expect(newFilter.toFilterString()).toEqual('abc=1');
    });

    test('should allow to change a filter term', () => {
      const filter = createFilterWithTerms('abc=1');
      const newFilter = filter.set('abc', '2', '=');
      expect(newFilter.toFilterString()).toEqual('abc=2');
    });

    test('should remove sort-reverse when adding sort filter term', () => {
      const filter = new Filter({id: 'foo'});

      let newFilter = filter.set('sort-reverse', 'foo', '=');
      expect(newFilter.has('sort-reverse')).toEqual(true);
      expect(newFilter.has('sort')).toEqual(false);

      newFilter = filter.set('sort', 'foo', '=');
      expect(newFilter.has('sort-reverse')).toEqual(false);
      expect(newFilter.has('sort')).toEqual(true);
    });

    test('should remove sort when adding sort-reverse filter term', () => {
      const filter = new Filter({id: 'foo'});

      let newFilter = filter.set('sort', 'foo', '=');
      expect(newFilter.has('sort')).toEqual(true);
      expect(newFilter.has('sort-reverse')).toEqual(false);

      newFilter = filter.set('sort-reverse', 'foo', '=');
      expect(newFilter.has('sort')).toEqual(false);
      expect(newFilter.has('sort-reverse')).toEqual(true);
    });

    test('should allow to set first keyword', () => {
      const filter = new Filter({id: 'foo'});
      let newFilter = filter.set('first', 123);
      expect(newFilter.get('first')).toEqual(123);

      newFilter = filter.set('first', '0');
      expect(newFilter.get('first')).toEqual(1);

      newFilter = filter.set('first', '-666');
      expect(newFilter.get('first')).toEqual(1);
    });

    test('should allow to set name keyword', () => {
      const filter = new Filter({id: 'foo'});
      let newFilter = filter.set('name', 'Test Task');
      expect(newFilter.get('name')).toEqual('Test Task');

      newFilter = filter.set('name', '');
      expect(newFilter.get('name')).toBeUndefined();

      newFilter = filter.set('name', 123);
      expect(newFilter.get('name')).toEqual('123');
    });

    test('should reset filter id', () => {
      const filter = new Filter({id: 'foo'});
      expect(filter.id).toEqual('foo');

      const newFilter = filter.set('first', '0');
      expect(newFilter.id).toBeUndefined();
    });

    test('should allow to set a filter term with underscore', () => {
      const filter = new Filter({id: 'foo'});
      expect(filter.set('_foo', '1', '=').toFilterString()).toEqual('_foo=1');
    });
  });

  describe('Filter has', () => {
    test('should have filter terms', () => {
      const filter = createFilterWithTerms('abc=1 def=1');
      expect(filter.has('abc')).toEqual(true);
      expect(filter.has('def')).toEqual(true);
    });

    test('should not have unknown filter term', () => {
      const filter = createFilterWithTerms('abc=1');
      expect(filter.has('def')).toEqual(false);
    });

    test('should not have filter terms without keyword', () => {
      const filter = createFilterWithTerms('abc=1 ~def');
      expect(filter.has('def')).toEqual(false);
      expect(filter.has('~def')).toEqual(false);
    });

    test('should return false for undefined key', () => {
      const filter = createFilterWithTerms('');
      // @ts-expect-error
      expect(filter.has()).toEqual(false);
    });
  });

  describe('Filter delete', () => {
    test('should allow to delete a filter term', () => {
      const filter = createFilterWithTerms('abc=1 def=1');
      expect(filter.delete('abc').toFilterString()).toEqual('def=1');
    });

    test('should not mutate filter when deleting a term', () => {
      const filter = createFilterWithTerms('abc=1 def=1');
      const newFilter = filter.delete('abc');

      expect(newFilter).not.toBe(filter);
      expect(filter.toFilterString()).toEqual('abc=1 def=1');
      expect(newFilter.toFilterString()).toEqual('def=1');
    });

    test("should not create new filter if filter term doesn't exist", () => {
      const filter = createFilterWithTerms('abc=1 def=1');
      const newFilter = filter.delete('xyz');

      expect(newFilter).toBe(filter);
      expect(filter.toFilterString()).toEqual('abc=1 def=1');
    });

    test('should ignore unknown filter term to delete', () => {
      const filter = createFilterWithTerms('abc=1');
      expect(filter.delete('def').toFilterString()).toEqual('abc=1');
    });

    test('should not delete filter terms without keyword', () => {
      const filter = createFilterWithTerms('abc=1 ~def');
      expect(filter.delete('def').toFilterString()).toEqual('abc=1 ~def');
      expect(filter.delete('~def').toFilterString()).toEqual('abc=1 ~def');
    });

    test('should reset filter id', () => {
      const filter = createFilterWithTerms('abc=1');
      const newFilter = filter.delete('abc');

      expect(filter.id).toEqual('foo');
      expect(newFilter.id).toBeUndefined();
    });
  });

  describe('Filter equal', () => {
    test('should not equal undefined', () => {
      const filter = createFilterWithTerms('');
      // @ts-expect-error
      expect(filter.equals()).toEqual(false);
    });

    test('should not equal null', () => {
      const filter = createFilterWithTerms('');
      expect(filter.equals(null)).toEqual(false);
    });

    test('empty filter should equal itself', () => {
      let filter: FilterType = createFilterWithTerms('');
      expect(filter.equals(filter)).toEqual(true);
      filter = new Filter({id: 'foo'});
      expect(filter.equals(filter)).toEqual(true);
    });

    test('filter should equal itself', () => {
      const filter = createFilterWithTerms('abc=1 def=1');
      expect(filter.equals(filter)).toEqual(true);
    });

    test('filter with number of terms should not equal', () => {
      const filter1 = createFilterWithTerms('abc=1 def=1');
      const filter2 = createFilterWithTerms('abc=1 def=1 hij=1');
      expect(filter1.equals(filter2)).toEqual(false);
    });

    test('filter with same keywords in other order should equal', () => {
      const filter1 = createFilterWithTerms('abc=1 def=1');
      const filter2 = createFilterWithTerms('def=1 abc=1');
      expect(filter1.equals(filter2)).toEqual(true);
    });

    test('filter with different keywords should not equal', () => {
      const filter1 = createFilterWithTerms('abc=1');
      const filter2 = createFilterWithTerms('def=1');
      expect(filter1.equals(filter2)).toEqual(false);
    });

    test('filter with different relations should not equal', () => {
      const filter1 = createFilterWithTerms('abc=1');
      const filter2 = createFilterWithTerms('abc~1');
      expect(filter1.equals(filter2)).toEqual(false);
    });

    test('filter with different values should not equal', () => {
      const filter1 = createFilterWithTerms('abc=1');
      const filter2 = createFilterWithTerms('abc=2');
      expect(filter1.equals(filter2)).toEqual(false);
    });

    test('filter without keywords in other order should not equal', () => {
      // this is not completely correct but currently required for and, or, ...
      const filter1 = createFilterWithTerms('abc def');
      const filter2 = createFilterWithTerms('def abc');
      expect(filter1.equals(filter2)).toEqual(false);
    });

    test('filter with severity range should equal', () => {
      // this is not completely correct but currently required for and, or, ...
      const filter1 = createFilterWithTerms('severity>3.9 and severity<7');
      const filter2 = createFilterWithTerms('severity>3.9 and severity<7');
      expect(filter1.equals(filter2)).toEqual(true);
    });

    test('filter with severity range in different order should equal', () => {
      // this is not completely correct but currently required for and, or, ...
      const filter1 = createFilterWithTerms('severity<7 and severity>3.9');
      const filter2 = createFilterWithTerms('severity>3.9 and severity<7');
      expect(filter1.equals(filter2)).toEqual(true);
    });

    test('filter with an and term should not equal', () => {
      const filter1 = createFilterWithTerms(
        'min_qod=70 apply_overrides=1 rows=10 first=1 sort=name',
      );
      const filter2 = createFilterWithTerms(
        'min_qod=70 apply_overrides=1 rows=10 first=1 sort=name and',
      );
      expect(filter1.equals(filter2)).toEqual(false);
    });

    test('filter with different realistic terms should not equal', () => {
      const filter1 = createFilterWithTerms(
        'min_qod=70 apply_overrides=1 rows=10 first=1 sort=name',
      );
      const filter2 = createFilterWithTerms(
        'min_qod=70 apply_overrides=1 rows=10 first=1 sort=name ' +
          'and status="Stopped"',
      );
      expect(filter1.equals(filter2)).toEqual(false);
    });

    test('filter with realistic more complex term should equal', () => {
      const filter1 = createFilterWithTerms(
        'min_qod=70 apply_overrides=1 rows=10 first=1 sort=name ' +
          'and status="Stopped"',
      );
      const filter2 = createFilterWithTerms(
        'min_qod=70 apply_overrides=1 rows=10 first=1 sort=name ' +
          'and status="Stopped"',
      );
      expect(filter1.equals(filter2)).toEqual(true);
    });
  });

  describe('Filter get', () => {
    test('should get value', () => {
      let filter = createFilterWithTerms('abc=1');
      expect(filter.get('abc')).toEqual('1');

      filter = createFilterWithTerms('abc=1 def=2');
      expect(filter.get('abc')).toEqual('1');
      expect(filter.get('def')).toEqual('2');
    });

    test('should not get value', () => {
      const filter = createFilterWithTerms('abc=1');
      expect(filter.get('def')).toBeUndefined();
    });

    test('should not get value without keyword', () => {
      let filter = createFilterWithTerms('abc');
      expect(filter.get('abc')).toBeUndefined();

      filter = createFilterWithTerms('~abc');
      expect(filter.get('abc')).toBeUndefined();
      expect(filter.get('~abc')).toBeUndefined();
    });
  });

  describe('Filter getTerm', () => {
    test('should return undefined', () => {
      const filter = createFilterWithTerms('');
      // @ts-expect-error
      expect(filter.getTerm()).toBeUndefined();
    });

    test('should get term', () => {
      let filter = createFilterWithTerms('abc=1');
      expect(filter.getTerm('abc')).toBeDefined();

      filter = createFilterWithTerms('abc=1 def=2');
      expect(filter.getTerm('abc')).toBeDefined();
      expect(filter.getTerm('def')).toBeDefined();
    });

    test('should not get term', () => {
      const filter = createFilterWithTerms('abc=1');
      expect(filter.getTerm('def')).toBeUndefined();
    });

    test('should not get term without keyword', () => {
      let filter = createFilterWithTerms('abc');
      expect(filter.getTerm('abc')).toBeUndefined();

      filter = createFilterWithTerms('~abc');
      expect(filter.getTerm('abc')).toBeUndefined();
      expect(filter.getTerm('~abc')).toBeUndefined();
    });

    test('should match term', () => {
      let filter = createFilterWithTerms('abc=1');
      let term = filter.getTerm('abc');
      expect(term?.keyword).toBe('abc');
      expect(term?.relation).toBe('=');
      expect(term?.value).toBe('1');

      filter = createFilterWithTerms('abc<1 def~2');
      term = filter.getTerm('abc');
      expect(term?.keyword).toBe('abc');
      expect(term?.relation).toBe('<');
      expect(term?.value).toBe('1');

      term = filter.getTerm('def');
      expect(term?.keyword).toBe('def');
      expect(term?.relation).toBe('~');
      expect(term?.value).toBe('2');
    });
  });

  describe('Filter getTerms', () => {
    test('should return empty array for unknown keyword', () => {
      const filter = createFilterWithTerms('abc=1');
      const terms = filter.getTerms('def');

      expect(terms.length).toBe(0);
    });

    test('should return empty array for undefined keyword', () => {
      const filter = createFilterWithTerms('abc=1');
      const terms = filter.getTerms(undefined);

      expect(terms.length).toBe(0);
    });

    test('should return single term as array', () => {
      const filter = createFilterWithTerms('abc=1');
      const terms = filter.getTerms('abc');

      expect(terms.length).toBe(1);

      const [term] = terms;
      expect(term.keyword).toBe('abc');
    });

    test('should return all terms in an array', () => {
      const filter = createFilterWithTerms('abc=1 abc=2');
      const terms = filter.getTerms('abc');

      expect(terms.length).toBe(2);
    });

    test('should return only terms with same keyword', () => {
      const filter = createFilterWithTerms('abc=1 def=2 abc=3');
      const terms1 = filter.getTerms('abc');
      const terms2 = filter.getTerms('def');

      expect(terms1.length).toBe(2);
      expect(terms2.length).toBe(1);
    });
  });

  describe('Filter fromElement', () => {
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

      // @ts-expect-error
      expect(filter1.term).toBeUndefined();
    });

    test('should parse alerts', () => {
      const filter1 = Filter.fromElement({
        term: 'abc=1',
        alerts: {
          alert: [
            {
              _id: 'a1',
            },
            {
              _id: 'a2',
            },
          ],
        },
      });

      expect(isArray(filter1.alerts)).toEqual(true);
      expect(filter1.alerts).toHaveLength(2);
      expect(filter1.alerts[0].id).toEqual('a1');
      expect(filter1.alerts[1].id).toEqual('a2');
    });
  });

  describe('Filter copy', () => {
    test('should copy all values', () => {
      const filter1 = createFilterWithTerms('abc=1 def=2');
      const filter2 = filter1.copy();
      expect(filter1).not.toBe(filter2);
      expect(filter2.get('abc')).toBe('1');
      expect(filter2.get('def')).toBe('2');
      expect(filter1.toFilterString()).toBe('abc=1 def=2');
      expect(filter2.toFilterString()).toBe('abc=1 def=2');
    });

    test('should copy public properties', () => {
      const filter1 = new Filter({
        alerts: [new Model({id: 'a1'}), new Model({id: 'a2'})],
        comment: 'Test Filter',
        creationTime: date('2024-01-01T00:00:00Z'),
        filter_type: 'foo',
        id: '100',
        inUse: true,
        modificationTime: date('2024-01-02T00:00:00Z'),
        name: 'Test Filter',
        owner: {name: 'user1'},
        terms: [new FilterTerm({keyword: 'abc', value: '1', relation: '='})],
        userCapabilities: new Capabilities(['create_task', 'delete_task']),
        userTags: [
          new UserTag({id: 'tag1', name: 'tag1', value: 'value1'}),
          new UserTag({id: 'tag2', name: 'tag2', value: 'value2'}),
        ],
        writable: YES_VALUE,
      });
      const filter2 = filter1.copy();

      expect(filter2.get('abc')).toBe('1');
      expect(filter2.alerts).toHaveLength(2);
      expect(filter2.comment).toBe('Test Filter');
      expect(filter2.creationTime?.toISOString()).toBe(
        '2024-01-01T00:00:00.000Z',
      );
      expect(filter2.inUse).toBe(true);
      expect(filter2.modificationTime?.toISOString()).toBe(
        '2024-01-02T00:00:00.000Z',
      );
      expect(filter2.name).toBe('Test Filter');
      expect(filter2.owner?.name).toBe('user1');
      expect(filter2.userCapabilities?.mayCreate('task')).toBe(true);
      expect(filter2.userCapabilities?.mayDelete('task')).toBe(true);
      expect(filter2.userTags).toHaveLength(2);
      expect(filter2.userTags[0].id).toBe('tag1');
      expect(filter2.userTags[0].name).toBe('tag1');
      expect(filter2.userTags[0].value).toBe('value1');
      expect(filter2.userTags[1].id).toBe('tag2');
      expect(filter2.userTags[1].name).toBe('tag2');
      expect(filter2.userTags[1].value).toBe('value2');
      expect(filter2.writable).toBe(YES_VALUE);
      expect(filter2.toFilterString()).toBe('abc=1');
      expect(filter2.id).toBe('100');
      expect(filter2.filter_type).toBe('foo');
    });
  });

  describe('Filter next', () => {
    test('should return defaults', () => {
      let filter: FilterType = createFilterWithTerms('');

      expect(filter.get('first')).toBeUndefined();
      expect(filter.get('rows')).toBeUndefined();

      filter = filter.next();

      expect(filter.get('first')).toEqual(1);
      expect(filter.get('rows')).toEqual(10);
    });

    test('should not mutate original filter when calling next', () => {
      let filter: FilterType = createFilterWithTerms('first=1 rows=10');
      const copy = filter.next();

      expect(filter).not.toBe(copy);
      expect(filter.get('first')).toBe(1);
      expect(filter.get('rows')).toBe(10);
      expect(copy.get('first')).toBe(11);
      expect(copy.get('rows')).toBe(10);
    });

    test('should change first and rows', () => {
      let filter: FilterType = createFilterWithTerms('first=1 rows=10');
      expect(filter.get('first')).toBe(1);
      expect(filter.get('rows')).toBe(10);

      filter = filter.next();

      expect(filter.get('first')).toBe(11);
      expect(filter.get('rows')).toBe(10);
    });

    test('should reset filter id', () => {
      let filter: FilterType = createFilterWithTerms('first=1 rows=10');
      expect(filter.id).toEqual('foo');

      filter = filter.next();
      expect(filter.id).toBeUndefined();
    });
  });

  describe('Filter first', () => {
    test('should set first if undefined', () => {
      let filter: FilterType = createFilterWithTerms('');

      expect(filter.get('first')).toBeUndefined();

      filter = filter.first();

      expect(filter.get('first')).toEqual(1);
    });

    test('should not mutate original filter when calling first', () => {
      let filter = createFilterWithTerms('first=99');
      const copy = filter.first();

      expect(filter).not.toBe(copy);
      expect(filter.get('first')).toBe(99);
      expect(copy.get('first')).toBe(1);
    });

    test('should change first to 1', () => {
      let filter: FilterType = createFilterWithTerms('first=99');
      expect(filter.get('first')).toBe(99);

      filter = filter.first();

      expect(filter.get('first')).toBe(1);
    });

    test('should reset filter id', () => {
      let filter: FilterType = createFilterWithTerms('first=1 rows=10');
      expect(filter.id).toEqual('foo');

      filter = filter.first();
      expect(filter.id).toBeUndefined();
    });
  });

  describe('Filter previous', () => {
    test('should return defaults', () => {
      let filter: FilterType = createFilterWithTerms('');

      expect(filter.get('first')).toBeUndefined();
      expect(filter.get('rows')).toBeUndefined();

      filter = filter.previous();

      expect(filter.get('first')).toEqual(1);
      expect(filter.get('rows')).toEqual(10);
    });

    test('should not mutate original filter when calling previous', () => {
      let filter = createFilterWithTerms('first=11 rows=10');
      const copy = filter.previous();

      expect(filter).not.toBe(copy);
      expect(filter.get('first')).toBe(11);
      expect(filter.get('rows')).toBe(10);
      expect(copy.get('first')).toBe(1);
      expect(copy.get('rows')).toBe(10);
    });

    test('should change first and rows', () => {
      let filter: FilterType = createFilterWithTerms('first=11 rows=10');
      expect(filter.get('first')).toBe(11);
      expect(filter.get('rows')).toBe(10);

      filter = filter.previous();

      expect(filter.get('first')).toBe(1);
      expect(filter.get('rows')).toBe(10);
    });

    test('should reset filter id', () => {
      let filter: FilterType = createFilterWithTerms('first=1 rows=10');
      expect(filter.id).toEqual('foo');

      filter = filter.previous();
      expect(filter.id).toBeUndefined();
    });
  });

  describe('Filter all', () => {
    test('should set first and rows for all items', () => {
      const filter = createFilterWithTerms('first=3 rows=10');
      const updated = filter.all();

      expect(filter.get('first')).toBe(3);
      expect(filter.get('rows')).toBe(10);
      expect(updated.get('first')).toBe(1);
      expect(updated.get('rows')).toBe(-1);
    });
  });

  describe('Filter getSortOrder', () => {
    test('should return sort if not set', () => {
      const filter = createFilterWithTerms('');
      expect(filter.getSortOrder()).toEqual('sort');
    });

    test('should return sort if sort is set', () => {
      const filter = createFilterWithTerms('sort=foo');
      expect(filter.getSortOrder()).toEqual('sort');
    });

    test('should return sort-reverse if sort-reverse is set', () => {
      const filter = createFilterWithTerms('sort-reverse=foo');
      expect(filter.getSortOrder()).toEqual('sort-reverse');
    });
  });

  describe('Filter getSortBy', () => {
    test('should return undefined if not set', () => {
      const filter = createFilterWithTerms('');
      expect(filter.getSortBy()).toBeUndefined();
    });

    test('should return order from sort', () => {
      const filter = createFilterWithTerms('sort=foo');
      expect(filter.getSortBy()).toEqual('foo');
    });

    test('should return order from sort-reverse', () => {
      const filter = createFilterWithTerms('sort-reverse=foo');
      expect(filter.getSortBy()).toEqual('foo');
    });
  });

  describe('Filter setSortOrder', () => {
    test('should keep sort by if order changes to sort', () => {
      const filter = createFilterWithTerms('sort-reverse=foo');
      const newFilter = filter.setSortOrder('sort');

      expect(newFilter.has('sort-reverse')).toEqual(false);
      expect(newFilter.get('sort')).toEqual('foo');
    });

    test('should not mutate the filter when changing sort order', () => {
      const filter = createFilterWithTerms('sort-reverse=foo');
      const newFilter = filter.setSortOrder('sort');

      expect(filter).not.toBe(newFilter);

      expect(filter.has('sort-reverse')).toEqual(true);
      expect(filter.has('sort')).toEqual(false);

      expect(newFilter.has('sort-reverse')).toEqual(false);
      expect(newFilter.has('sort')).toEqual(true);
    });

    test('should keep sort by if order changes to sort-reverse', () => {
      const filter = createFilterWithTerms('sort=foo');
      const newFilter = filter.setSortOrder('sort-reverse');

      expect(newFilter.has('sort')).toEqual(false);
      expect(newFilter.get('sort-reverse')).toEqual('foo');
    });

    test('should set sort for unknown orders', () => {
      const filter = createFilterWithTerms('sort-reverse=foo');
      // @ts-expect-error
      const newFilter = filter.setSortOrder('foo');

      expect(newFilter.has('sort-reverse')).toEqual(false);
      expect(newFilter.get('sort')).toEqual('foo');
    });

    test('should reset filter id', () => {
      const filter = createFilterWithTerms('sort-reverse=foo');
      expect(filter.id).toEqual('foo');

      const newFilter = filter.setSortOrder('sort');
      expect(newFilter.id).toBeUndefined();
    });
  });

  describe('Filter setSortBy', () => {
    test('should set sort if not order is set', () => {
      const filter = createFilterWithTerms('');
      const newFilter = filter.setSortBy('foo');

      expect(newFilter.get('sort')).toEqual('foo');
    });

    test('should not mutate the filter when changing sort by if order is not set', () => {
      const filter = createFilterWithTerms('');
      const newFilter = filter.setSortBy('foo');

      expect(filter).not.toBe(newFilter);

      expect(filter.has('sort')).toEqual(false);
      expect(filter.has('sort-reverse')).toEqual(false);

      expect(newFilter.has('sort')).toEqual(true);
      expect(newFilter.get('sort')).toEqual('foo');
    });

    test('should change sort by if order is sort', () => {
      const filter = createFilterWithTerms('sort=bar');
      expect(filter.get('sort')).toEqual('bar');

      const newFilter = filter.setSortBy('foo');
      expect(newFilter.get('sort')).toEqual('foo');
    });

    test('should change sort by if order is sort-reverse', () => {
      const filter = createFilterWithTerms('sort-reverse=bar');
      expect(filter.get('sort-reverse')).toEqual('bar');

      const newFilter = filter.setSortBy('foo');
      expect(newFilter.get('sort-reverse')).toEqual('foo');
    });

    test('should reset filter id', () => {
      const filter = createFilterWithTerms('sort-reverse=bar');
      expect(filter.id).toEqual('foo');

      const newFilter = filter.setSortBy('foo');
      expect(newFilter.id).toBeUndefined();
    });
  });

  describe('Filter simple', () => {
    test('should return copy if first, rows and sort not set', () => {
      const filter = createFilterWithTerms('foo=bar');
      const simple = filter.simple();

      expect(filter).not.toBe(simple);
      expect(filter.equals(simple)).toBe(true);
    });

    test('should not mutate original filter when calling simple', () => {
      const filter = createFilterWithTerms('first=1 rows=10 sort=foo foo=bar');
      const simple = filter.simple();

      expect(filter).not.toBe(simple);
      expect(filter.has('first')).toEqual(true);
      expect(filter.has('rows')).toEqual(true);
      expect(filter.has('sort')).toEqual(true);

      expect(simple.has('first')).toEqual(false);
      expect(simple.has('rows')).toEqual(false);
      expect(simple.has('sort')).toEqual(false);
    });

    test('should remove first, rows and sort terms', () => {
      const filter = createFilterWithTerms('first=1 rows=10 sort=foo foo=bar');

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
      const filter = createFilterWithTerms('sort-reverse=foo foo=bar');

      expect(filter.has('sort-reverse')).toEqual(true);

      const simple = filter.simple();

      expect(filter).not.toBe(simple);
      expect(simple.has('sort-reverse')).toEqual(false);
    });

    test('should reset filter id', () => {
      const filter = createFilterWithTerms('sort-reverse=foo foo=bar');
      expect(filter.id).toEqual('foo');

      const simple = filter.simple();
      expect(simple.id).toBeUndefined();
    });
  });

  describe('Filter merge extra keywords', () => {
    test('should handle merging undefined filter', () => {
      const filter1 = createFilterWithTerms('abc=1');
      expect(filter1.id).toBe('foo');

      const filter2 = filter1.mergeExtraKeywords();
      expect(filter1).toBe(filter2);
    });

    test('should return a new filter', () => {
      const filter1 = createFilterWithTerms('abc=1');
      const filter2 = createFilterWithTerms('rows=1');

      const filter3 = filter1.mergeExtraKeywords(filter2);

      expect(filter1).not.toBe(filter3);
      expect(filter2).not.toBe(filter3);
      expect(filter3.get('abc')).toBe('1');
      expect(filter3.get('rows')).toBe(1);
    });

    test('should merge extra keywords', () => {
      const filter1 = createFilterWithTerms('abc=1');
      const filter2 = createFilterWithTerms(
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

    test('should not merge non extra keywords', () => {
      const filter1 = createFilterWithTerms('abc=1');
      const filter2 = createFilterWithTerms('apply_overrides=1 def=1');

      const filter3 = filter1.mergeExtraKeywords(filter2);

      expect(filter3.get('abc')).toBe('1');
      expect(filter3.get('apply_overrides')).toBe(1);
      expect(filter3.get('def')).toBeUndefined();
    });

    test('should return same filter if no extra keywords to merge', () => {
      const filter1 = createFilterWithTerms('abc=1');
      const filter2 = createFilterWithTerms('def=1');

      const filter3 = filter1.mergeExtraKeywords(filter2);

      expect(filter3).toBe(filter1);
    });

    test('should not merge existing extra keywords', () => {
      const filter1 = createFilterWithTerms('abc=1 min_qod=80');
      const filter2 = createFilterWithTerms('apply_overrides=1 min_qod=70');

      const filter3 = filter1.mergeExtraKeywords(filter2);

      expect(filter3.get('abc')).toBe('1');
      expect(filter3.get('apply_overrides')).toBe(1);
      expect(filter3.get('min_qod')).toBe(80);
    });

    test('should not merge sort or sort-reverse if already exists', () => {
      let filter1 = createFilterWithTerms('sort=foo');
      let filter2 = createFilterWithTerms('sort=bar');

      let filter3 = filter1.mergeExtraKeywords(filter2);

      expect(filter3.getSortOrder()).toEqual('sort');
      expect(filter3.getSortBy()).toEqual('foo');

      expect(filter3.toFilterString()).toEqual('sort=foo');

      filter1 = createFilterWithTerms('sort=foo');
      filter2 = createFilterWithTerms('sort-reverse=bar');

      filter3 = filter1.mergeExtraKeywords(filter2);

      expect(filter3.getSortOrder()).toEqual('sort');
      expect(filter3.getSortBy()).toEqual('foo');

      expect(filter3.toFilterString()).toEqual('sort=foo');

      filter1 = createFilterWithTerms('sort-reverse=foo');
      filter2 = createFilterWithTerms('sort-reverse=bar');

      filter3 = filter1.mergeExtraKeywords(filter2);

      expect(filter3.getSortOrder()).toEqual('sort-reverse');
      expect(filter3.getSortBy()).toEqual('foo');

      expect(filter3.toFilterString()).toEqual('sort-reverse=foo');

      filter1 = createFilterWithTerms('sort-reverse=foo');
      filter2 = createFilterWithTerms('sort=bar');

      filter3 = filter1.mergeExtraKeywords(filter2);

      expect(filter3.getSortOrder()).toEqual('sort-reverse');
      expect(filter3.getSortBy()).toEqual('foo');

      expect(filter3.toFilterString()).toEqual('sort-reverse=foo');
    });

    test('should reset filter id', () => {
      const filter1 = createFilterWithTerms('abc=1', 'f1');
      expect(filter1.id).toBe('f1');

      const filter2 = createFilterWithTerms(
        'apply_overrides=1 overrides=1 ' +
          'delta_states=1 first=1 levels=hml min_qod=70 notes=1 ' +
          'result_hosts_only=1 rows=10 sort=name timezone=CET',
        'f2',
      );
      expect(filter2.id).toBe('f2');

      const filter3 = filter1.mergeExtraKeywords(filter2);
      expect(filter3.id).toBeUndefined();
    });
  });

  describe('Filter mergeKeywords', () => {
    test('should merge keywords', () => {
      const filter1 = createFilterWithTerms('abc=1 trend=more');
      const filter2 = createFilterWithTerms(
        'delta_states=1 severity>3 sort=name',
      );

      const filter3 = filter2.mergeKeywords(filter1);

      expect(filter3.get('abc')).toBe('1');
      expect(filter3.get('delta_states')).toBe('1');
      expect(filter3.get('sort')).toBe('name');
      expect(filter3.get('severity')).toBe('3');
      expect(filter3.get('trend')).toBe('more');
    });

    test('should return new filter', () => {
      const filter1 = createFilterWithTerms('abc=1');
      const filter2 = createFilterWithTerms('def=1');

      const filter3 = filter2.mergeKeywords(filter1);

      expect(filter3).not.toBe(filter1);
      expect(filter3).not.toBe(filter2);

      expect(filter3.get('abc')).toBe('1');
      expect(filter3.get('def')).toBe('1');
    });

    test('should return same filter if no keywords to merge', () => {
      const filter1 = createFilterWithTerms('abc=1');
      const filter2 = createFilterWithTerms('abc=1');

      expect(filter1).not.toBe(filter2);

      const filter3 = filter1.mergeKeywords(filter2);

      expect(filter3).toBe(filter1);
    });

    test('should return same filter if no filter to merge', () => {
      const filter1 = createFilterWithTerms('abc=1');
      const filter2 = filter1.mergeKeywords();

      expect(filter2).toBe(filter1);
    });

    test('should reset filter id', () => {
      const filter1 = createFilterWithTerms('abc=1', 'f1');
      expect(filter1.id).toBe('f1');

      const filter2 = createFilterWithTerms('def=1', 'f2');
      expect(filter2.id).toBe('f2');

      const filter3 = filter2.mergeKeywords(filter1);
      expect(filter3.id).toBeUndefined();
    });
  });

  describe('Filter merge', () => {
    test('should merge undefined', () => {
      const filter1 = createFilterWithTerms('foo=bar');
      const filter2 = filter1.merge(undefined);

      expect(filter1).toBe(filter2);
      expect(filter2.get('foo')).toEqual('bar');
    });

    test('should not mutate filter while merging', () => {
      const filter1 = createFilterWithTerms('foo=bar');
      const filter2 = createFilterWithTerms('rows=10 first=1');

      expect(filter1).not.toBe(filter2);

      const filter3 = filter1.merge(filter2);

      expect(filter3).not.toBe(filter1);
      expect(filter3).not.toBe(filter2);
      expect(filter1.toFilterString()).toEqual('foo=bar');
      expect(filter2.toFilterString()).toEqual('rows=10 first=1');
      expect(filter3.toFilterString()).toEqual('foo=bar rows=10 first=1');
    });

    test('should return same filter when merging an empty filter', () => {
      const filter1 = createFilterWithTerms('foo=bar');
      const emptyFilter = new Filter({id: 'foo'});
      const merged = filter1.merge(emptyFilter);

      expect(merged).toBe(filter1);
      expect(merged.toFilterString()).toEqual('foo=bar');
      expect(filter1.toFilterString()).toEqual('foo=bar');
      expect(emptyFilter.toFilterString()).toEqual('');
    });

    test('should keep duplicate keywords and preserve term order while merging', () => {
      const filter1 = createFilterWithTerms('foo=bar');
      const filter2 = createFilterWithTerms('foo=baz rows=10');
      const merged = filter1.merge(filter2);

      expect(merged.toFilterString()).toEqual('foo=bar foo=baz rows=10');
      expect(merged.getTerms('foo')).toHaveLength(2);
    });

    test('should merge operator terms as-is', () => {
      const filter1 = createFilterWithTerms('name~ssh');
      const filter2 = createFilterWithTerms('and severity>7');
      const merged = filter1.merge(filter2);

      expect(merged.toFilterString()).toEqual('name~ssh and severity>7');
    });

    test('should merge duplicate terms', () => {
      const filter1 = createFilterWithTerms('foo=bar');
      const filter2 = createFilterWithTerms('foo=bar');
      const merged = filter1.merge(filter2);

      expect(merged.toFilterString()).toEqual('foo=bar foo=bar');
    });
  });

  describe('Filter and', () => {
    test('should ignore undefined', () => {
      const filter = createFilterWithTerms('foo=1');
      const newFilter = filter.and(undefined);
      expect(newFilter).toBe(filter);
      expect(newFilter.toFilterString()).toEqual('foo=1');
    });

    test('should ignore null', () => {
      const filter = createFilterWithTerms('foo=1');
      const newFilter = filter.and(null);
      expect(newFilter).toBe(filter);
      expect(newFilter.toFilterString()).toEqual('foo=1');
    });

    test("should not mutate filter when concatenating with 'and'", () => {
      const filter1 = createFilterWithTerms('foo=1');
      const filter2 = createFilterWithTerms('bar=2');
      const filter3 = filter1.and(filter2);

      expect(filter1).not.toBe(filter2);
      expect(filter3).not.toBe(filter1);
      expect(filter3).not.toBe(filter2);
      expect(filter1.toFilterString()).toBe('foo=1');
      expect(filter2.toFilterString()).toBe('bar=2');
      expect(filter3.toFilterString()).toBe('foo=1 and bar=2');
    });

    test('filters should be concatenated with and', () => {
      const filter1 = createFilterWithTerms('foo=1');
      const filter2 = createFilterWithTerms('bar=2');
      expect(filter1.and(filter2).toFilterString()).toBe('foo=1 and bar=2');
    });

    test('empty filters should be concatenated without and', () => {
      const filter1 = createFilterWithTerms('');
      const filter2 = createFilterWithTerms('bar=2');
      expect(filter1.and(filter2).toFilterString()).toBe('bar=2');
    });

    test('filters with only extra keywords should be concatenated without and', () => {
      const filter1 = createFilterWithTerms('apply_overrides=1 min_qod=70');
      const filter2 = createFilterWithTerms('bar=2');
      expect(filter1.and(filter2).toFilterString()).toBe(
        'apply_overrides=1 min_qod=70 bar=2',
      );
    });

    test('should reset filter id', () => {
      const filter1 = createFilterWithTerms('foo=1', 'f1');
      expect(filter1.id).toBe('f1');

      const filter2 = createFilterWithTerms('bar=2', 'f2');
      expect(filter2.id).toBe('f2');

      const filter3 = filter1.and(filter2);
      expect(filter3.id).toBeUndefined();
    });
  });

  describe('Filter hasTerm', () => {
    test('filter should include terms', () => {
      const filter = createFilterWithTerms(
        'apply_overrides=1 min_qod=70 severity>0',
      );

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
      const filter = createFilterWithTerms(
        'apply_overrides=1 min_qod=70 severity>0',
      );

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

    test('should return false for undefined term', () => {
      const filter = createFilterWithTerms(
        'apply_overrides=1 min_qod=70 severity>0',
      );
      expect(filter.hasTerm(undefined)).toBe(false);
    });
  });

  describe('Filter toFilterCriteriaString', () => {
    test('should return string representation', () => {
      const filter1 = createFilterWithTerms('foo=bar and lorem=ipsum');
      expect(filter1.toFilterCriteriaString()).toEqual(
        'foo=bar and lorem=ipsum',
      );
    });

    test('should ignore extra keywords', () => {
      const filter1 = createFilterWithTerms('foo=bar first=1 rows=66');
      expect(filter1.toFilterCriteriaString()).toEqual('foo=bar');
    });
  });

  describe('Filter toFilterExtraString', () => {
    test('should empty string if no extra keywords are present', () => {
      const filter1 = createFilterWithTerms('foo=bar and lorem=ipsum');
      expect(filter1.toFilterExtraString()).toEqual('');
    });

    test('should ignore non extra keywords', () => {
      const filter1 = createFilterWithTerms('foo=bar first=1 rows=66');
      expect(filter1.toFilterExtraString()).toEqual('first=1 rows=66');
    });
  });

  describe('should lower the case of capitalized keywords', () => {
    test('should lower the case of multiple keywords', () => {
      const filter = createFilterWithTerms(
        'sevErIty>3.9 and Qod_MIN=70 RoWs=14',
      );
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
      const filter = Filter.fromResponseElement(element);
      expect(filter.toFilterString()).toEqual(
        '~abc and not ~def rows=10 first=1 sort=name',
      );
    });

    test('a more wacky scenario', () => {
      const filter1 = createFilterWithTerms('~abc SorT=name');
      expect(filter1.toFilterString()).toEqual('~abc sort=name');
    });

    test('just a value', () => {
      const filter2 = createFilterWithTerms('~AbC');
      expect(filter2.toFilterString()).toEqual('~AbC');
    });
  });

  describe('Filter identifier', () => {
    test('should return identifier', () => {
      const filter = createFilterWithTerms('foo=bar');
      expect(filter.identifier()).toEqual('foo=bar');
    });

    test('should use filter terms for identifier', () => {
      const filter = createFilterWithTerms('foo=bar first=1 rows=10');
      expect(filter.identifier()).toEqual('foo=bar first=1 rows=10');
    });

    test('should use different identifiers for different filter term order', () => {
      const filter1 = createFilterWithTerms('foo=bar first=1 rows=10');
      const filter2 = createFilterWithTerms('rows=10 first=1 foo=bar');
      expect(filter1.identifier()).toEqual('foo=bar first=1 rows=10');
      expect(filter2.identifier()).toEqual('rows=10 first=1 foo=bar');
      expect(filter1.identifier()).not.toEqual(filter2.identifier());
    });
  });
});
