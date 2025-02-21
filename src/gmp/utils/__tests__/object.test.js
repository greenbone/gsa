/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import {exclude, excludeObjectProps} from 'gmp/utils/object';

describe('exclude function test', () => {
  test('exclude object property', () => {
    const obj = {
      foo: 1,
      bar: 2,
    };
    const result = exclude(obj, prop => prop === 'foo');

    expect(result.foo).toBeUndefined();
    expect(result.bar).toBe(2);
  });
});

describe('excludeObjectProps function test', () => {
  test('exclude object properties', () => {
    const obj = {
      foo: 1,
      bar: 2,
      abc: 3,
    };
    const result = excludeObjectProps(obj, ['foo', 'bar']);

    expect(result.foo).toBeUndefined();
    expect(result.bar).toBeUndefined();
    expect(result.abc).toBe(3);
  });
});
