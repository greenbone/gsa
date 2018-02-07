/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2018 Greenbone Networks GmbH
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
  is_defined,
  has_value,
  is_object,
  is_string,
  is_array,
  is_number,
  is_function,
  is_date,
  is_model_element,
} from '../identity';

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
    expect(is_model_element({_id: 1})).toBe(true);
    expect(is_model_element({_id: '1'})).toBe(true);
  });
});

// vim: set ts=2 sw=2 tw=80:
