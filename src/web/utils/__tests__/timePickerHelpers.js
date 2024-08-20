/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {formatSplitTime, formatTimeForTimePicker} from '../timePickerHelpers';
import {describe, test, expect} from '@gsa/testing';

describe('timePickerHelpers', () => {
  describe('formatSplitTime', () => {
    test('formats single-digit hours and minutes correctly', () => {
      expect(formatSplitTime(1, 5)).toBe('01:05');
    });

    test('formats double-digit hours and minutes correctly', () => {
      expect(formatSplitTime(12, 30)).toBe('12:30');
    });

    test('handles hours and minutes at the edge of valid ranges', () => {
      expect(formatSplitTime(23, 59)).toBe('23:59');
    });

    test('returns a string in HH:MM format', () => {
      const result = formatSplitTime(9, 15);
      expect(result).toMatch(/^\d{2}:\d{2}$/);
    });
  });

  describe('formatTimeForTimePicker', () => {
    test('formats time correctly for a given date object', () => {
      // Mock date object with hours and minutes methods
      const mockDate = {
        hours: () => 9,
        minutes: () => 30,
      };
      const expected = '09:30';
      const result = formatTimeForTimePicker(mockDate);
      expect(result).toBe(expected);
    });

    test('pads single-digit hours and minutes with leading zeros', () => {
      const mockDate = {
        hours: () => 5,
        minutes: () => 4,
      };
      const expected = '05:04';
      const result = formatTimeForTimePicker(mockDate);
      expect(result).toBe(expected);
    });

    test('handles times at the edge of valid ranges', () => {
      const mockDate = {
        hours: () => 23,
        minutes: () => 59,
      };
      const expected = '23:59';
      const result = formatTimeForTimePicker(mockDate);
      expect(result).toBe(expected);
    });
  });
});
