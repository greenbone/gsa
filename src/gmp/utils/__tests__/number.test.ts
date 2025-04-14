/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import {severityValue} from 'gmp/utils/number';

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
    expect(severityValue(undefined)).toBeUndefined();
    expect(severityValue('A')).toBeUndefined();
  });
});
