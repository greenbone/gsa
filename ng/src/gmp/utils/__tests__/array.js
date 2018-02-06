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
import {
  arrays_equal,
  is_empty,
  map,
  for_each,
  filter,
  first,
} from '../array';

describe('array_equals function test', () => {

  test('should return true if arrays are equal', () => {
    const array1 = [1, 2, 3];
    const array2 = [1, 2, 3];
    expect(arrays_equal(array1, array2)).toBe(true);
  });

  test('should return false if arrays are different', () => {
    const array1 = [1, 2, 3];
    const array2 = [1, 2, 4];
    expect(arrays_equal(array1, array2)).toBe(false);
  });

  test('should return false if param is not an array', () => {
    const array1 = [2, 3, 4];
    const array2 = 'This is a string';
    expect(arrays_equal(array1, array2)).toBe(false);
  });

  test('should not deep compare Objects', () => {
    const obj1 = {a: 1};
    const obj2 = {a: 1};
    const array1 = [obj1];
    const array2 = [obj2];
    expect(arrays_equal(array1, array2)).toBe(false);
  });

  test('should return true for same Objects', () => {
    const obj1 = {a: 1};
    const array1 = [obj1];
    const array2 = [obj1];
    expect(arrays_equal(array1, array2)).toBe(true);
  });

  test('should return false if lengths of arrays differ', () => {
    const array1 = [1, 2, 3];
    const array2 = [1, 2, 3, 4];
    expect(arrays_equal(array1, array2)).toBe(false);
  });

  test('array should equals with itself', () => {
    const array1 = [1, 2, 3];
    expect(arrays_equal(array1, array1)).toBe(true);
  });
});

describe('map function tests', () => {
  test('should return empty array for undefined array', () => {
    let mapped = map(undefined, item => item);

    expect(mapped).toEqual([]);

    mapped = map(undefined, item => item, undefined);

    expect(mapped).toEqual([]);
  });

  test('should empty array for null', () => {
    const mapped = map(null, item => item);

    expect(mapped).toEqual([]);
  });

  test('should empty array if not map function is set', () => {
    const mapped = map([1, 2, 3]);

    expect(mapped).toEqual([]);
  });

  test('should return object for undefined array', () => {
    const mapped = map(undefined, item => item, {});

    expect(mapped).toEqual({});
  });

  test('should iterate over array', () => {
    const mapped = map([1, 2, 3], item => item * 2);

    expect(mapped).toEqual([2, 4, 6]);
  });

  test('should iterate over single item', () => {
    const mapped = map(2, item => item * 2);

    expect(mapped).toEqual([4]);
  });

  test('should iterate over Set', () => {
    const mapped = map(new Set([1, 2, 3]), item => item * 2);

    expect(mapped).toEqual([2, 4, 6]);
  });

  test('should return empty object for empty Set', () => {
    const mapped = map(new Set(), item => item * 2, {});

    expect(mapped).toEqual({});
  });
});

describe('for_each function tests', () => {
  test('should return undefined for undefined array', () => {
    const array = for_each(undefined, item => item);

    expect(array).toBeUndefined();
  });

  test('should return undefined for null array', () => {
    const array = for_each(null, item => item);

    expect(array).toBeUndefined();
  });

  test('should return undefined if no function is set', () => {
    const array = for_each([1, 2, 3]);

    expect(array).toBeUndefined();
  });

  test('should iterate over array', () => {
    const callback = jest.fn();
    for_each([1, 2, 3], callback);

    expect(callback).toBeCalled();
    expect(callback.mock.calls.length).toBe(3);
    expect(callback.mock.calls[0]).toEqual([1, 0, [1, 2, 3]]);
    expect(callback.mock.calls[1]).toEqual([2, 1, [1, 2, 3]]);
    expect(callback.mock.calls[2]).toEqual([3, 2, [1, 2, 3]]);
  });

  test('should iterate over single item', () => {
    const callback = jest.fn();
    for_each(2, callback);

    expect(callback).toBeCalled();
    expect(callback.mock.calls.length).toBe(1);
    expect(callback.mock.calls[0]).toEqual([2, 0, [2]]);
  });

  test('should iterate over Set', () => {
    const callback = jest.fn();
    for_each(new Set([1, 2, 3]), callback);

    expect(callback).toBeCalled();
    expect(callback.mock.calls.length).toBe(3);
    expect(callback.mock.calls[0]).toEqual([1, 1, new Set([1, 2, 3])]);
    expect(callback.mock.calls[1]).toEqual([2, 2, new Set([1, 2, 3])]);
    expect(callback.mock.calls[2]).toEqual([3, 3, new Set([1, 2, 3])]);
  });
});

describe('filter function tests', () => {
  test('should return emtpy array', () => {
    expect(filter(undefined, item => true)).toEqual([]);
    expect(filter(null, item => true)).toEqual([]);
    expect(filter([], item => true)).toEqual([]);
    expect(filter([1, 2, 3])).toEqual([]);
  });

  test('should return specified empty object', () => {
    const expected = {foo: 1};
    expect(filter(undefined, item => true, expected)).toEqual(expected);
    expect(filter(null, item => true, expected)).toEqual(expected);
    expect(filter([1, 2, 3], undefined, expected)).toEqual(expected);

  });

  test('should always return empty array for empty array', () => {
    const expected = {foo: 1};
    expect(filter([], item => true, expected)).toEqual([]);
  });

  test('should iterate over single object', () => {
    expect(filter(1, item => item === 1)).toEqual([1]);
  });

  test('should filter array', () => {
    expect(filter([1, 2, 3], i => i > 1)).toEqual([2, 3]);
  });
});

describe('first function tests', () => {
  test('should return first value from array', () => {
    expect(first(['foo', 'bar'])).toEqual('foo');
    expect(first([undefined])).toBeUndefined();
  });

  test('should return first value from Set', () => {
    expect(first(new Set(['foo', 'bar']))).toEqual('foo');
    expect(first(new Set([undefined]))).toBeUndefined();
  });

  test('should return default value if empty', () => {
    expect(first([])).toEqual({});
    expect(first(new Set())).toEqual({});
    expect(first([], {foo: 1})).toEqual({foo: 1});
  });

  test('should return default value for non iterables', () => {
    expect(first({foo: 1})).toEqual({});
    expect(first({foo: 1}, {bar: 2})).toEqual({bar: 2});
    expect(first('')).toEqual({});
  });

});

describe('is_empty function test', () => {
  test('should return true for undefined', () => {
    expect(is_empty()).toBe(true);
  });

  test('should return true for an empty array', () => {
    const x = [];
    expect(is_empty(x)).toBe(true);
  });

  test('should return false for an array', () => {
    const x = [1, 2];
    expect(is_empty(x)).toBe(false);
  });
});

// vim: set ts=2 sw=2 tw=80:
