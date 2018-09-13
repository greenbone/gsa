/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2017 - 2018 Greenbone Networks GmbH
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
  parseFloat,
  parseInt,
  parseSeverity,
} from '../parser.js';

describe('parseInt tests', () => {

  test('should parse int number string', () => {
    expect(parseInt('5')).toBe(5);
  });

  test('should parse float number strings', () => {
    expect(parseInt('5.0')).toBe(5);
  });

  test('should shut cut float strings', () => {
    expect(parseInt('5.9999')).toBe(5);
    expect(parseInt('5.1')).toBe(5);
  });

  test('should cut float numbers', () => {
    expect(parseInt(5.9999)).toBe(5);
    expect(parseInt(5.1)).toBe(5);
  });

  test('should parse empty string as undefined', () => {
    expect(parseInt('')).toBeUndefined();
    expect(parseInt(' ')).toBeUndefined();
  });

  test('should parse string without a number as undefined', () => {
    expect(parseInt('abc')).toBeUndefined();
    expect(parseInt('5a')).toBeUndefined();
  });

  test('should parse infintiy as undefined', () => {
    expect(parseInt(Infinity)).toBeUndefined();
    expect(parseInt('Infinity')).toBeUndefined();
  });

});

describe('parseSeverity tests', () => {

  test('should parse int number strings', () => {
    expect(parseSeverity('0')).toEqual(0);
    expect(parseSeverity('1')).toEqual(1);
    expect(parseSeverity('5')).toEqual(5);
  });

  test('should parse float number strings', () => {
    expect(parseSeverity('0.0')).toEqual(0);
    expect(parseSeverity('1.1')).toEqual(1.1);
    expect(parseSeverity('5.4')).toEqual(5.4);
  });

  test('should pass through numbers', () => {
    expect(parseSeverity(0)).toEqual(0);
    expect(parseSeverity(1)).toEqual(1);
    expect(parseSeverity(5)).toEqual(5);
    expect(parseSeverity(1.1)).toEqual(1.1);
    expect(parseSeverity(5.4)).toEqual(5.4);
  });

  test('should parse strings as undefined', () => {
    expect(parseSeverity('abc')).toBeUndefined();
    expect(parseSeverity('5a')).toBeUndefined();
  });

  test('should parse empty string as undefined', () => {
    expect(parseSeverity('')).toBeUndefined();
    expect(parseSeverity(' ')).toBeUndefined();
  });

});

describe('parseFloat tests', () => {

  test('should parse int number strings', () => {
    expect(parseFloat('0')).toEqual(0);
    expect(parseFloat('1')).toEqual(1);
    expect(parseFloat('5')).toEqual(5);
  });

  test('should parse float number strings', () => {
    expect(parseFloat('0.0')).toEqual(0);
    expect(parseFloat('1.1')).toEqual(1.1);
    expect(parseFloat('5.4')).toEqual(5.4);
  });

  test('should pass through numbers', () => {
    expect(parseFloat(0)).toEqual(0);
    expect(parseFloat(1)).toEqual(1);
    expect(parseFloat(5)).toEqual(5);
    expect(parseFloat(1.1)).toEqual(1.1);
    expect(parseFloat(5.4)).toEqual(5.4);
  });

  test('should parse strings as undefined', () => {
    expect(parseFloat('abc')).toBeUndefined();
    expect(parseFloat('5a')).toBeUndefined();
  });

  test('should parse empty string as undefined', () => {
    expect(parseFloat('')).toBeUndefined();
    expect(parseFloat(' ')).toBeUndefined();
  });

});

// vim: set ts=2 sw=2 tw=80:
