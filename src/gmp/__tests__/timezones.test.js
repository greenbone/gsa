/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, expectTypeOf} from '@gsa/testing';

import timezones from '../timezones';
import {isArray} from '../utils/identity';

describe('timezones tests', () => {
  test('should be a list of timezone objects', () => {
    expect(isArray(timezones)).toEqual(true);
  });

  test('should contain more then one timezone', () => {
    expect(timezones.length).toBeGreaterThan(1);
  });

  test('should contain timezones as strings', () => {
    for (const zone of timezones) {
      expectTypeOf(zone).toBeString();
    }
  });
});
