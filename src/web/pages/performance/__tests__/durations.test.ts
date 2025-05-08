/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import {
  getDurationInSeconds,
  DURATION_HOUR,
  DURATION_DAY,
  DURATION_WEEK,
  DURATION_MONTH,
  DURATION_YEAR,
} from 'web/pages/performance/durations';

describe('getDurationInSeconds', () => {
  test('should return the correct duration in seconds for "hour"', () => {
    expect(getDurationInSeconds('hour')).toBe(DURATION_HOUR);
  });

  test('should return the correct duration in seconds for "day"', () => {
    expect(getDurationInSeconds('day')).toBe(DURATION_DAY);
  });

  test('should return the correct duration in seconds for "week"', () => {
    expect(getDurationInSeconds('week')).toBe(DURATION_WEEK);
  });

  test('should return the correct duration in seconds for "month"', () => {
    expect(getDurationInSeconds('month')).toBe(DURATION_MONTH);
  });

  test('should return the correct duration in seconds for "year"', () => {
    expect(getDurationInSeconds('year')).toBe(DURATION_YEAR);
  });
});
