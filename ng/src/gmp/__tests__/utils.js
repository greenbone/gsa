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
  avg,
  sum,
  is_defined,
  has_value,
  is_object,
  is_string,
  is_array,
  is_number,
  is_function,
  is_empty,
  is_date,
  is_model_element,
  exclude,
  exclude_object_props,
  map,
  for_each,
  filter,
  split,
  first,
  includes_id,
  select_save_id,
  capitalize_first_letter,
  pluralize_type,
  shorten,
  debounce,
  throttleAnimation,
} from '../utils.js';

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

describe('sum function tests', () => {

  test('should calculate the array sum', () => {
    expect(sum([1, 2, 3])).toBe(6);
  });

  test('should calculate sum from object props', () => {
    const array = [
      {value: 1},
      {value: 2},
      {value: 3},
    ];
    expect(sum(array, entry => entry.value)).toBe(6);
  });

  test('should expect zero for undefined values', () => {
    expect(sum([1, 2, undefined, 3])).toBe(6);

    const array = [
      {value: 1},
      {},
      {value: 2},
      {value: 3},
    ];
    expect(sum(array, entry => entry.value)).toBe(6);
  });

  test('should sum empty and undefined to zero', () => {
    expect(sum()).toBe(0);
    expect(sum([])).toBe(0);
  });
});

describe('avg function tests', () => {

  test('should calculate the array average', () => {
    expect(avg([3, 3, 3])).toBe(3);
  });

  test('should calculate average from object props', () => {
    const array = [
      {value: 3},
      {value: 3},
      {value: 3},
    ];
    expect(avg(array, entry => entry.value)).toBe(3);
  });

  test('should expect zero for undefined values', () => {
    expect(avg([5, undefined, 4])).toBe(3);

    const array = [
      {value: 5},
      {},
      {value: 4},
    ];
    expect(avg(array, entry => entry.value)).toBe(3);
  });

  test('should return 0 for empty array', () => {
    expect(avg([])).toBe(0);
    expect(avg([], item => item.value)).toBe(0);
    expect(avg()).toBe(0);
    expect(avg(undefined, item => item.value)).toBe(0);
  });
});

describe('is_defined function test', () => {
  test('should return false for undefined let variable', () => {
    let x;
    expect(is_defined(x)).toBe(false);
  });

  test('should return true for defined let variable', () => {
    let x = 1; // eslint-disable-line prefer-const
    expect(is_defined(x)).toBe(true);
  });
});

describe('has_value function test', () => {
  test('should return false for undefined let variable', () => {
    let x;
    expect(has_value(x)).toBe(false);
  });

  test('should return true for defined let variable', () => {
    let x = 1; // eslint-disable-line prefer-const
    expect(has_value(x)).toBe(true);
  });

  test('should return false for null let variable', () => {
    let x = null; // eslint-disable-line prefer-const
    expect(has_value(x)).toBe(false);
  });
});

describe('is_object function test', () => {
  test('should return false for undefined variable', () => {
    let x;
    expect(is_object(x)).toBe(false);
  });

  test('should return false for number variable', () => {
    const x = 1;
    expect(is_object(x)).toBe(false);
  });

  test('should return false for null variable', () => {
    const x = null;
    expect(is_object(x)).toBe(false);
  });

  test('should return false for a string', () => {
    const x = 'foo';
    expect(is_object(x)).toBe(false);
  });

  test('should return true for an array', () => {
    const x = [];
    expect(is_object(x)).toBe(true);
  });

  test('should return true for empty object', () => {
    const x = {};
    expect(is_object(x)).toBe(true);
  });
});

describe('is_string function test', () => {
  test('should return false for undefined variable', () => {
    let x;
    expect(is_string(x)).toBe(false);
  });

  test('should return false for number variable', () => {
    const x = 1;
    expect(is_string(x)).toBe(false);
  });

  test('should return false for null variable', () => {
    const x = null;
    expect(is_string(x)).toBe(false);
  });

  test('should return false for an array', () => {
    const x = [];
    expect(is_string(x)).toBe(false);
  });

  test('should return false for empty object', () => {
    const x = {};
    expect(is_string(x)).toBe(false);
  });

  test('should return true for an empty string', () => {
    const x = '';
    expect(is_string(x)).toBe(true);
  });

  test('should return true for a string', () => {
    const x = 'foo';
    expect(is_string(x)).toBe(true);
  });
});

describe('is_array function test', () => {
  test('should return false for undefined variable', () => {
    let x;
    expect(is_array(x)).toBe(false);
  });

  test('should return false for number variable', () => {
    const x = 1;
    expect(is_array(x)).toBe(false);
  });

  test('should return false for null variable', () => {
    const x = null;
    expect(is_array(x)).toBe(false);
  });

  test('should return false for empty object', () => {
    const x = {};
    expect(is_array(x)).toBe(false);
  });

  test('should return false for a string', () => {
    const x = 'foo';
    expect(is_array(x)).toBe(false);
  });

  test('should return true for an array', () => {
    const x = [];
    expect(is_array(x)).toBe(true);
  });
});

describe('is_number function test', () => {
  test('should return false for undefined variable', () => {
    let x;
    expect(is_number(x)).toBe(false);
  });

  test('should return false for null variable', () => {
    const x = null;
    expect(is_number(x)).toBe(false);
  });

  test('should return false for empty object', () => {
    const x = {};
    expect(is_number(x)).toBe(false);
  });

  test('should return false for a string', () => {
    const x = 'foo';
    expect(is_number(x)).toBe(false);
  });

  test('should return false for an array', () => {
    const x = [];
    expect(is_number(x)).toBe(false);
  });

  test('should return true for int number variable', () => {
    const x = 1;
    expect(is_number(x)).toBe(true);
  });

  test('should return true for float number variable', () => {
    const x = 1.23456;
    expect(is_number(x)).toBe(true);
  });
});

describe('is_function function test', () => {
  test('should return false for undefined variable', () => {
    let x;
    expect(is_function(x)).toBe(false);
  });

  test('should return false for number variable', () => {
    const x = 1;
    expect(is_function(x)).toBe(false);
  });

  test('should return false for null variable', () => {
    const x = null;
    expect(is_function(x)).toBe(false);
  });

  test('should return false for empty object', () => {
    const x = {};
    expect(is_function(x)).toBe(false);
  });

  test('should return false for a string', () => {
    const x = 'foo';
    expect(is_function(x)).toBe(false);
  });

  test('should return false for an array', () => {
    const x = [];
    expect(is_function(x)).toBe(false);
  });

  test('should return false for a function', () => {
    function x() {};
    expect(is_function(x)).toBe(true);
  });

  test('should return false for an arrow function', () => {
    const x = () => {};
    expect(is_function(x)).toBe(true);
  });
});

describe('is_empty function test', () => {
  test('should return true for undefined variable', () => {
    let x;
    expect(is_empty(x)).toBe(true);
  });

  test('should return false for number variable', () => {
    const x = 1;
    expect(is_empty(x)).toBe(false);
  });

  test('should return true for null variable', () => {
    const x = null;
    expect(is_empty(x)).toBe(true);
  });

  test('should return false for empty object', () => {
    const x = {};
    expect(is_empty(x)).toBe(false);
  });

  test('should return true for an empty string', () => {
    const x = '';
    expect(is_empty(x)).toBe(true);

    const y = '                 ';
    expect(is_empty(y)).toBe(true);
  });

  test('should return false for a string', () => {
    const x = 'foo';
    expect(is_empty(x)).toBe(false);
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

describe('is_date function test', () => {
  test('should return false for undefined variable', () => {
    let x;
    expect(is_date(x)).toBe(false);
  });

  test('should return false for number variable', () => {
    const x = 1;
    expect(is_date(x)).toBe(false);
  });

  test('should return false for null variable', () => {
    const x = null;
    expect(is_date(x)).toBe(false);
  });

  test('should return false for empty object', () => {
    const x = {};
    expect(is_date(x)).toBe(false);
  });


  test('should return false for a string', () => {
    const x = 'foo';
    expect(is_date(x)).toBe(false);
  });

  test('should return false for an array', () => {
    const x = [];
    expect(is_date(x)).toBe(false);
  });

  test('should return true for a date', () => {
    const x = new Date();
    expect(is_date(x)).toBe(true);
  });
});

describe('is_model_element function test', () => {

  test('should return false for undefined variable', () => {
    let x;
    expect(is_model_element(x)).toBe(false);
  });

  test('should throw for null variable', () => {
    const x = null;
    expect(() => is_model_element(x)).toThrow(TypeError);
  });

  test('should return false for an empty object', () => {
    const x = {};
    expect(is_model_element(x)).toBe(false);
  });

  test('should return false for an object without _id', () => {
    const x = {foo: 'bar'};
    expect(is_model_element(x)).toBe(false);
  });

  test('should return true for an object with _id', () => {
    const x = {_id: 1};
    expect(is_model_element(x)).toBe(true);
  });
});

describe('exclude function test', () => {
  test('exclude object property', () => {
    const obj = {
      foo: 1,
      bar: 2,
    };
    const result = exclude(obj, prop => prop === 'foo');

    expect(result.foo).toBeUndefined();
    expect(result.bar).toBe(2);
  });
});

describe('exclude_object_props function test', () => {
  test('exclude object properties', () => {
    const obj = {
      foo: 1,
      bar: 2,
      abc: 3,
    };
    const result = exclude_object_props(obj, ['foo', 'bar']);

    expect(result.foo).toBeUndefined();
    expect(result.bar).toBeUndefined();
    expect(result.abc).toBe(3);
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

describe('split function tests', () => {
  test('should split a string', () => {
    expect(split('abc_def_hij', '_')).toEqual(['abc', 'def', 'hij']);
    expect(split('abc.def.hij', '.')).toEqual(['abc', 'def', 'hij']);
  });

  test('should split only once', () => {
    expect(split('abc_def_hij', '_', 1)).toEqual(['abc', 'def_hij']);
    expect(split('abc.def.hij', '.', 1)).toEqual(['abc', 'def.hij']);
  });

  test('should return array if separator is not in string', () => {
    expect(split('foo_bar', '-')).toEqual(['foo_bar']);
  });

  test('should return array if limit is 0 or less', () => {
    expect(split('foo_bar', '_', 0)).toEqual(['foo_bar']);
    expect(split('foo_bar', '_', -1)).toEqual(['foo_bar']);
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

describe('includes_id function tests', () => {
  test('should return true for found id', () => {
    const list = [{id: 1}, {id: 2}, {id: 3}];

    expect(includes_id(list, 1)).toBe(true);
    expect(includes_id(list, 2)).toBe(true);
    expect(includes_id(list, 3)).toBe(true);
  });

  test('should return false for unkown id', () => {
    const list = [{id: 1}, {id: 2}, {id: 3}];

    expect(includes_id(list, 4)).toBe(false);
  });

  test('should return false for different type of id', () => {
    const list = [{id: 1}, {id: 2}, {id: 3}];

    expect(includes_id(list, '2')).toBe(false);
  });
});

describe('select_save_id function tests', () => {
  test('should return id if id is in list', () => {
    const list = [{id: 1}, {id: 2}, {id: 3}];

    expect(select_save_id(list, 1)).toEqual(1);
    expect(select_save_id(list, 2)).toEqual(2);
    expect(select_save_id(list, 3)).toEqual(3);
  });

  test('should return first id if id is not in list', () => {
    const list = [{id: 1}, {id: 2}, {id: 3}];

    expect(select_save_id(list, 4)).toBe(1);
    expect(select_save_id(list, '2')).toBe(1);
  });

  test('should return default if id is not in list', () => {
    const list = [{id: 1}, {id: 2}, {id: 3}];

    expect(select_save_id(list, 4, 42)).toBe(42);
    expect(select_save_id(list, '2', 42)).toBe(42);
  });
});

describe('capatalize_first_letter function tests', () => {
  test('should capitalize first letter', () => {
    expect(capitalize_first_letter('foo')).toEqual('Foo');
    expect(capitalize_first_letter('Foo')).toEqual('Foo');
    expect(capitalize_first_letter('bAR')).toEqual('BAR');
  });
});

describe('pluralize_type function test', () => {
  test('info should not be pluralized', () => {
    expect(pluralize_type('info')).toEqual('info');
  });

  test('version should not be pluralized', () => {
    expect(pluralize_type('version')).toEqual('version');
  });

  test('already pluralized term should not be pluralized', () => {
    expect(pluralize_type('foos')).toEqual('foos');
    expect(pluralize_type('tasks')).toEqual('tasks');
  });

  test('term should be pluralized', () => {
    expect(pluralize_type('foo')).toEqual('foos');
    expect(pluralize_type('task')).toEqual('tasks');
  });
});

describe('shorten function tests', () => {
  test('should shorten string', () => {
    expect(shorten('foo bar', 4)).toEqual('foo ...');
  });

  test('should return empty string for undefined', () => {
    expect(shorten()).toEqual('');
  });

  test('should not shorten string before limit', () => {
    expect(shorten('foo bar', 10)).toEqual('foo bar');
  });
});

describe('debounce function tests', () => {

  jest.useFakeTimers();

  test('should debounce function', () => {
    const callback = jest.fn();
    const func = debounce(callback);

    func(1);
    func(2);
    func(3);

    jest.runAllTimers();

    expect(callback).toBeCalled();
    expect(callback.mock.calls.length).toBe(1);
    expect(callback.mock.calls[0][0]).toBe(3);
  });

  test('should run callback immediately', () => {
    const callback = jest.fn();
    const func = debounce(callback, 10000, true);

    func(1);
    func(2);
    func(3);

    expect(callback).toBeCalled();
    expect(callback.mock.calls.length).toBe(1);
    expect(callback.mock.calls[0][0]).toBe(1);

    jest.runAllTimers();

    expect(callback.mock.calls.length).toBe(2);
    expect(callback.mock.calls[1][0]).toBe(3);
  });
});

describe('throttleAnimation function tests', () => {

  jest.useFakeTimers();

  test('should throttle running callback', () => {
    const callback = jest.fn();
    const func = throttleAnimation(callback);

    func(1);
    func(2);
    func(3);

    jest.runAllTimers();

    expect(callback).toBeCalled();
    expect(callback.mock.calls.length).toBe(1);
    expect(callback.mock.calls[0][0]).toBe(1);
  });
});

// vim: set ts=2 sw=2 tw=80:
