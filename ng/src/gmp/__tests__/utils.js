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

// vim: set ts=2 sw=2 tw=80:
