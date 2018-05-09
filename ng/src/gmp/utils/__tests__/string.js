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
  split,
  capitalize_first_letter,
  pluralize_type,
  shorten,
  is_empty,
} from '../string';

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

describe('is_empty function test', () => {
  test('should return true for undefined', () => {
    expect(is_empty()).toBe(true);
  });

  test('should return true for an empty string', () => {
    expect(is_empty('')).toBe(true);
  });

  test('should return false for a string', () => {
    expect(is_empty('abc')).toBe(false);
  });
});
// vim: set ts=2 sw=2 tw=80:
