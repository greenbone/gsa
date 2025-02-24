/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import {
  totalCount,
  percent,
  randomColor,
} from 'web/components/dashboard/display/utils';

describe('display utils', () => {
  describe('totalCount', () => {
    test('should return 0 if groups is empty', () => {
      expect(totalCount([])).toBe(0);
    });

    test('should return the sum of counts in groups', () => {
      const groups = [{count: '1'}, {count: '2'}, {count: '3'}];
      expect(totalCount(groups)).toBe(6);
    });
  });

  describe('percent', () => {
    test('should return the correct percentage', () => {
      expect(percent(50, 200)).toBe('25.0');
      expect(percent('50', 200)).toBe('25.0');
    });

    test('should handle zero sum', () => {
      expect(percent('50', 0)).toBe('Infinity');
    });
  });

  describe('randomColor', () => {
    test('should return a valid hex color', () => {
      const color = randomColor();
      expect(color).toMatch(/^#[0-9a-fA-F]{6}$/);
    });
  });
});
