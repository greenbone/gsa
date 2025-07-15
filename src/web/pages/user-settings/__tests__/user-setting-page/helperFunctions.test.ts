/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import {getLangNameByCode} from 'web/pages/user-settings/user-setting-page/helperFunctions';

describe('getLangNameByCode', () => {
  test('returns the correct language name for a valid code', () => {
    const langCode = 'en';
    const expectedLangName = 'English';
    const result = getLangNameByCode(langCode);
    expect(result).toBe(expectedLangName);
  });

  test('returns "Unknown" for an invalid language code', () => {
    const langCode = 'xx';
    const result = getLangNameByCode(langCode);
    expect(result).toBeUndefined();
  });
});
