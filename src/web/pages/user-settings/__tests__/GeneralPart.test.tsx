/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {render, screen} from 'web/testing';
import GeneralPart, {
  renderLanguageItems,
} from 'web/pages/user-settings/GeneralPart/GeneralPart';

describe('GeneralPart', () => {
  describe('renderLanguageItems', () => {
    test('should return language items with correct structure', () => {
      const items = renderLanguageItems();
      const result = [
        {value: 'de', label: 'German | Deutsch'},
        {value: 'en', label: 'English | English'},
        {value: 'zh_TW', label: 'Traditional Chinese | 繁體中文'},
        {value: 'Browser Language', label: 'Browser Language'},
      ];
      expect(items).toEqual(result);
    });
  });
});
