/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';

import {isArray} from '../utils/identity';

import timezones from '../timezones';

describe('timezones tests', () => {
  test('should be a list of timezone objects', () => {
    expect(isArray(timezones)).toEqual(true);
  });

  test('should contain objects with name properties', () => {
    expect(timezones.length).toBeGreaterThan(0);

    for (const zone of timezones) {
      expect(zone.name).toBeDefined();
    }
  });
});

// vim: set ts=2 sw=2 tw=80:
