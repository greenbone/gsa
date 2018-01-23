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

// vim: set ts=2 sw=2 tw=80:
