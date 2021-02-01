/* Copyright (C) 2017-2021 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License
 * as published by the Free Software Foundation, either version 3
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */
import {split, capitalizeFirstLetter, shorten, isEmpty} from '../string';

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

describe('capatalizeFirstLetter function tests', () => {
  test('should capitalize first letter', () => {
    expect(capitalizeFirstLetter('foo')).toEqual('Foo');
    expect(capitalizeFirstLetter('Foo')).toEqual('Foo');
    expect(capitalizeFirstLetter('bAR')).toEqual('BAR');
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

  test('should shorten non string values', () => {
    expect(shorten(123, 2)).toEqual('12...');
  });
});

describe('isEmpty function test', () => {
  test('should return true for undefined', () => {
    expect(isEmpty()).toBe(true);
  });

  test('should return true for an empty string', () => {
    expect(isEmpty('')).toBe(true);
  });

  test('should return false for a string', () => {
    expect(isEmpty('abc')).toBe(false);
  });
});
// vim: set ts=2 sw=2 tw=80:
