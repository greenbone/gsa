/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import {getLangNameByCode} from 'web/pages/user-settings/helperFunctions';
import {BROWSER_LANGUAGE} from 'web/utils/Languages';

describe('getLangNameByCode', () => {
  test('returns the correct language name for a valid code', () => {
    const langCode = 'en';
    const expectedLangName = 'English';
    const result = getLangNameByCode(langCode);
    expect(result).toBe(expectedLangName);
  });

  test('returns undefined for an invalid language code', () => {
    const langCode = 'xx';
    const result = getLangNameByCode(langCode);
    expect(result).toBeUndefined();
  });

  test('returns correct name for browser language', () => {
    const result = getLangNameByCode(BROWSER_LANGUAGE);
    expect(result).toBe('Browser Language');
  });
});
