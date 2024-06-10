/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';

import {
  isDefined,
  hasValue,
  isObject,
  isString,
  isArray,
  isNull,
  isNumber,
  isFunction,
  isJsDate,
  isModelElement,
} from '../identity';

describe('isDefined function test', () => {
  test('should return false for undefined let variable', () => {
    let x;
    expect(isDefined(x)).toBe(false);
  });

  test('should return true for defined let variable', () => {
    let x = 1; // eslint-disable-line prefer-const
    expect(isDefined(x)).toBe(true);
  });
});

describe('hasValue function test', () => {
  test('should return false for undefined let variable', () => {
    let x;
    expect(hasValue(x)).toBe(false);
  });

  test('should return true for defined let variable', () => {
    let x = 1; // eslint-disable-line prefer-const
    expect(hasValue(x)).toBe(true);
  });

  test('should return false for null let variable', () => {
    let x = null; // eslint-disable-line prefer-const
    expect(hasValue(x)).toBe(false);
  });
});

describe('isObject function test', () => {
  test('should return false for undefined variable', () => {
    let x;
    expect(isObject(x)).toBe(false);
  });

  test('should return false for number variable', () => {
    const x = 1;
    expect(isObject(x)).toBe(false);
  });

  test('should return false for null variable', () => {
    const x = null;
    expect(isObject(x)).toBe(false);
  });

  test('should return false for a string', () => {
    const x = 'foo';
    expect(isObject(x)).toBe(false);
  });

  test('should return true for an array', () => {
    const x = [];
    expect(isObject(x)).toBe(true);
  });

  test('should return true for empty object', () => {
    const x = {};
    expect(isObject(x)).toBe(true);
  });
});

describe('isString function test', () => {
  test('should return false for undefined variable', () => {
    let x;
    expect(isString(x)).toBe(false);
  });

  test('should return false for number variable', () => {
    const x = 1;
    expect(isString(x)).toBe(false);
  });

  test('should return false for null variable', () => {
    const x = null;
    expect(isString(x)).toBe(false);
  });

  test('should return false for an array', () => {
    const x = [];
    expect(isString(x)).toBe(false);
  });

  test('should return false for empty object', () => {
    const x = {};
    expect(isString(x)).toBe(false);
  });

  test('should return true for an empty string', () => {
    const x = '';
    expect(isString(x)).toBe(true);
  });

  test('should return true for a string', () => {
    const x = 'foo';
    expect(isString(x)).toBe(true);
  });
});

describe('isArray function test', () => {
  test('should return false for undefined variable', () => {
    let x;
    expect(isArray(x)).toBe(false);
  });

  test('should return false for number variable', () => {
    const x = 1;
    expect(isArray(x)).toBe(false);
  });

  test('should return false for null variable', () => {
    const x = null;
    expect(isArray(x)).toBe(false);
  });

  test('should return false for empty object', () => {
    const x = {};
    expect(isArray(x)).toBe(false);
  });

  test('should return false for a string', () => {
    const x = 'foo';
    expect(isArray(x)).toBe(false);
  });

  test('should return true for an array', () => {
    const x = [];
    expect(isArray(x)).toBe(true);
  });
});

describe('isNull function tests', () => {
  test('should return true for null variable', () => {
    const x = null;
    expect(isNull(x)).toEqual(true);
  });
  test('should return false for undefined variable', () => {
    let x;
    expect(isNull(x)).toEqual(false);
  });
  test('should return false for empty object variable', () => {
    const x = {};
    expect(isNull(x)).toEqual(false);
  });
  test('should return false for empty array variable', () => {
    const x = [];
    expect(isNull(x)).toEqual(false);
  });
  test('should return false for number variable', () => {
    const x = 42;
    expect(isNull(x)).toEqual(false);
  });
  test('should return false for string variable', () => {
    const x = 'foo';
    expect(isNull(x)).toEqual(false);
  });
  test('should return false for function variable', () => {
    const x = () => {};
    expect(isNull(x)).toEqual(false);
  });
});

describe('isNumber function test', () => {
  test('should return false for undefined variable', () => {
    let x;
    expect(isNumber(x)).toBe(false);
  });

  test('should return false for null variable', () => {
    const x = null;
    expect(isNumber(x)).toBe(false);
  });

  test('should return false for empty object', () => {
    const x = {};
    expect(isNumber(x)).toBe(false);
  });

  test('should return false for a string', () => {
    const x = 'foo';
    expect(isNumber(x)).toBe(false);
  });

  test('should return false for an array', () => {
    const x = [];
    expect(isNumber(x)).toBe(false);
  });

  test('should return true for int number variable', () => {
    const x = 1;
    expect(isNumber(x)).toBe(true);
  });

  test('should return true for float number variable', () => {
    const x = 1.23456;
    expect(isNumber(x)).toBe(true);
  });
});

describe('isFunction function test', () => {
  test('should return false for undefined variable', () => {
    let x;
    expect(isFunction(x)).toBe(false);
  });

  test('should return false for number variable', () => {
    const x = 1;
    expect(isFunction(x)).toBe(false);
  });

  test('should return false for null variable', () => {
    const x = null;
    expect(isFunction(x)).toBe(false);
  });

  test('should return false for empty object', () => {
    const x = {};
    expect(isFunction(x)).toBe(false);
  });

  test('should return false for a string', () => {
    const x = 'foo';
    expect(isFunction(x)).toBe(false);
  });

  test('should return false for an array', () => {
    const x = [];
    expect(isFunction(x)).toBe(false);
  });

  test('should return false for a function', () => {
    function x() {}
    expect(isFunction(x)).toBe(true);
  });

  test('should return false for an arrow function', () => {
    const x = () => {};
    expect(isFunction(x)).toBe(true);
  });
});

describe('isJsDate function test', () => {
  test('should return false for undefined variable', () => {
    let x;
    expect(isJsDate(x)).toBe(false);
  });

  test('should return false for number variable', () => {
    const x = 1;
    expect(isJsDate(x)).toBe(false);
  });

  test('should return false for null variable', () => {
    const x = null;
    expect(isJsDate(x)).toBe(false);
  });

  test('should return false for empty object', () => {
    const x = {};
    expect(isJsDate(x)).toBe(false);
  });

  test('should return false for a string', () => {
    const x = 'foo';
    expect(isJsDate(x)).toBe(false);
  });

  test('should return false for an array', () => {
    const x = [];
    expect(isJsDate(x)).toBe(false);
  });

  test('should return true for a date', () => {
    const x = new Date();
    expect(isJsDate(x)).toBe(true);
  });
});

describe('isModelElement function test', () => {
  test('should return false for undefined variable', () => {
    let x;
    expect(isModelElement(x)).toBe(false);
  });

  test('should throw for null variable', () => {
    const x = null;
    expect(() => isModelElement(x)).toThrow(TypeError);
  });

  test('should return false for an empty object', () => {
    const x = {};
    expect(isModelElement(x)).toBe(false);
  });

  test('should return false for an object without _id', () => {
    const x = {foo: 'bar'};
    expect(isModelElement(x)).toBe(false);
  });

  test('should return false for empty id', () => {
    expect(isModelElement({_id: ''})).toBe(false);
  });

  test('should return true for an object with _id', () => {
    expect(isModelElement({_id: '1'})).toBe(true);
  });
});

// vim: set ts=2 sw=2 tw=80:
