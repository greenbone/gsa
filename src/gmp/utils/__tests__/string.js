/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';

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
