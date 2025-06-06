/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import Languages, {getLanguageCodes} from 'gmp/locale/languages';
import {isString} from 'gmp/utils/identity';

describe('Language tests', () => {
  test('should contain list of languages', () => {
    expect(Object.keys(Languages).length).toEqual(3);

    let called = false;

    for (const lang of Object.values(Languages)) {
      called = true;

      expect(isString(lang.name)).toEqual(true);
      expect(isString(lang.native_name)).toEqual(true);
    }

    expect(called).toEqual(true);
  });
});

describe('getLanguageCodes test', () => {
  test('should return list of language codes', () => {
    const codes = getLanguageCodes();

    expect(codes.length).toEqual(3);

    let called = false;

    for (const code of codes) {
      called = true;
      expect(isString(code)).toEqual(true);
    }

    expect(called).toEqual(true);
  });
});
