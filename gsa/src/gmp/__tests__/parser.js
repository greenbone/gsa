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
  parseProgressElement,
  parseTextElement,
  parseSeverity,
  parseYesNo,
  YES_VALUE,
  NO_VALUE,
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

describe('parseTextElement tests', () => {

  test('should convert text elements', () => {
    expect(parseTextElement({
      __text: 'foo',
      __excerpt: '1',
    })).toEqual({
      text: 'foo',
      text_excerpt: '1',
    });
  });

  test('should convert plain text elements', () => {
    expect(parseTextElement('foo')).toEqual({
      text: 'foo',
      text_excerpt: '0',
    });
  });

});

describe('parseProgressElement tests', () => {

  test('should parse progress as float', () => {
    expect(parseProgressElement('0')).toEqual(0);
    expect(parseProgressElement('1')).toEqual(1);
    expect(parseProgressElement('5')).toEqual(5);
    expect(parseProgressElement('0.0')).toEqual(0);
    expect(parseProgressElement('1.1')).toEqual(1.1);
    expect(parseProgressElement('5.4')).toEqual(5.4);
    expect(parseProgressElement(0)).toEqual(0);
    expect(parseProgressElement(1)).toEqual(1);
    expect(parseProgressElement(5)).toEqual(5);
    expect(parseProgressElement(1.1)).toEqual(1.1);
    expect(parseProgressElement(5.4)).toEqual(5.4);
  });

  test('should parse invalid progress values as zero', () => {
    expect(parseProgressElement()).toEqual(0);
    expect(parseProgressElement('')).toEqual(0);
    expect(parseProgressElement(' ')).toEqual(0);
    expect(parseProgressElement('foo')).toEqual(0);
    expect(parseProgressElement('1a')).toEqual(0);
  });

  test('should parse __text as progress', () => {
    expect(parseProgressElement({__text: '0'})).toEqual(0);
    expect(parseProgressElement({__text: '1'})).toEqual(1);
    expect(parseProgressElement({__text: '5'})).toEqual(5);
    expect(parseProgressElement({__text: '0.0'})).toEqual(0);
    expect(parseProgressElement({__text: '1.1'})).toEqual(1.1);
    expect(parseProgressElement({__text: '5.4'})).toEqual(5.4);
    expect(parseProgressElement({__text: 0})).toEqual(0);
    expect(parseProgressElement({__text: 1})).toEqual(1);
    expect(parseProgressElement({__text: 5})).toEqual(5);
    expect(parseProgressElement({__text: 1.1})).toEqual(1.1);
    expect(parseProgressElement({__text: 5.4})).toEqual(5.4);
  });

});

describe('parseYesNo tests', () => {

  test('should parse yes values', () => {
    expect(parseYesNo('1')).toEqual(YES_VALUE);
    expect(parseYesNo(1)).toEqual(YES_VALUE);
    expect(parseYesNo(YES_VALUE)).toEqual(YES_VALUE);
  });

  test('should parse other values as no value', () => {
    expect(parseYesNo()).toEqual(NO_VALUE);
    expect(parseYesNo('')).toEqual(NO_VALUE);
    expect(parseYesNo('foo')).toEqual(NO_VALUE);
    expect(parseYesNo('0')).toEqual(NO_VALUE);
    expect(parseYesNo(0)).toEqual(NO_VALUE);
    expect(parseYesNo(NO_VALUE)).toEqual(NO_VALUE);
  });

});

// vim: set ts=2 sw=2 tw=80:
