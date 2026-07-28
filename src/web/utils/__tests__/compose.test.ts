/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import compose from 'web/utils/compose';

describe('compose tests', () => {
  test('should return identity function when no functions are provided', () => {
    const value = {foo: 'bar'};
    const identity = compose();

    expect(identity(value)).toBe(value);
  });

  test('should return the same function when one function is provided', () => {
    const addOne = (value: number) => value + 1;

    expect(compose(addOne)).toBe(addOne);
  });

  test('should compose functions from right to left', () => {
    const trim = (value: string) => value.trim();
    const toUpperCase = (value: string) => value.toUpperCase();
    const wrap = (value: string) => `[${value}]`;

    const composed = compose(wrap, toUpperCase, trim);

    expect(composed('  hello  ')).toBe('[HELLO]');
  });

  test('should pass all arguments to the innermost function', () => {
    const double = (value: number) => value * 2;
    const sum = (a: number, b: number) => a + b;

    const composed = compose(double, sum);

    expect(composed(2, 3)).toBe(10);
  });
});
