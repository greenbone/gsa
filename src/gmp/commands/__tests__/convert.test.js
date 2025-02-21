/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import {convertBoolean} from 'gmp/commands/convert';

describe('convertBoolean tests', () => {
  test('should convert true', () => {
    expect(convertBoolean(true)).toEqual(1);
  });

  test('should convert false', () => {
    expect(convertBoolean(false)).toEqual(0);
  });

  test('should convert to undefined for other value', () => {
    expect(convertBoolean('true')).toBeUndefined();
    expect(convertBoolean('false')).toBeUndefined();
    expect(convertBoolean('1')).toBeUndefined();
    expect(convertBoolean('0')).toBeUndefined();
  });

  test('should convert to legacy 0 and 1 values', () => {
    expect(convertBoolean(1)).toEqual(1);
    expect(convertBoolean(0)).toEqual(0);
  });
});
