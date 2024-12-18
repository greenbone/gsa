/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import {severityValue, fixedValue} from 'gmp/utils/number';

describe('severityValue function tests', () => {
  test('should convert numbers to severity', () => {
    expect(severityValue(0)).toEqual('0.0');
    expect(severityValue(1)).toEqual('1.0');
    expect(severityValue(1.0)).toEqual('1.0');
    expect(severityValue(1.1)).toEqual('1.1');
    expect(severityValue(1.1)).toEqual('1.1');
    expect(severityValue(1.15)).toEqual('1.1');
    expect(severityValue(1.16)).toEqual('1.2');
    expect(severityValue(1.19)).toEqual('1.2');
  });
});

describe('fixedValue function tests', () => {
  test('should convert numbers to fixed values', () => {
    const num = 12345.6789;

    expect(fixedValue(num)).toEqual('12345.6789');
    expect(fixedValue(num, 1)).toEqual('12345.7');
    expect(fixedValue(num, 6)).toEqual('12345.678900');

    expect(fixedValue(2.34, 1)).toEqual('2.3');
    expect(fixedValue(2.35, 1)).toEqual('2.4');
    expect(fixedValue(2.55, 1)).toEqual('2.5');
  });
});
