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
  avg,
  sum,
  is_defined,
  has_value,
  is_object,
  is_string,
} from '../utils.js';

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

// vim: set ts=2 sw=2 tw=80:
