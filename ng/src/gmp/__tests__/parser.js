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
  parse_int,
} from '../parser.js';

describe('parse_int tests', () => {
  test('int number string is parsed as int', () => {
    expect(parse_int('5')).toBe(5);
  });

  test('float number string is parsed as int', () => {
    expect(parse_int('5.0')).toBe(5);
  });

  test('float string should be cut', () => {
    expect(parse_int('5.9999')).toBe(5);
    expect(parse_int('5.1')).toBe(5);
  });

  test('float number should be cut', () => {
    expect(parse_int(5.9999)).toBe(5);
    expect(parse_int(5.1)).toBe(5);
  });

  test('empty string should be parsed as undefined', () => {
    expect(parse_int('')).toBeUndefined();
    expect(parse_int(' ')).toBeUndefined();
  });

  test('string without a number should be parsed as undefined', () => {
    expect(parse_int('abc')).toBeUndefined();
    expect(parse_int('5a')).toBeUndefined();
  });

  test('pase infintiy as undefined', () => {
    expect(parse_int(Infinity)).toBeUndefined();
    expect(parse_int('Infinity')).toBeUndefined();
  });
});

// vim: set ts=2 sw=2 tw=80:
