/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import {
  userSettingsRules,
  VALID_ROWS_PER_PAGE_ERROR_MESSAGE,
} from 'web/pages/user-settings/validationRules';

describe('User Settings Validation Rules', () => {
  describe('rowsPerPage validation', () => {
    test.each([
      [1, 'minimum valid value (1)'],
      [5, 'standard positive value (5)'],
      [100, 'large positive value (100)'],
    ])('should return undefined for %s (%s)', value => {
      expect(userSettingsRules.rowsPerPage(value)).toBeUndefined();
    });

    test.each([
      [0, 'zero (0)'],
      [-100, 'large negative value (-100)'],
    ])('should return error for %s (%s)', value => {
      expect(userSettingsRules.rowsPerPage(value)).toEqual(
        VALID_ROWS_PER_PAGE_ERROR_MESSAGE,
      );
    });
  });
});
