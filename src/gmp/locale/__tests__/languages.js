/* Copyright (C) 2018-2021 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License
 * as published by the Free Software Foundation, either version 3
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */

import {isString} from 'gmp/utils/identity';

import Languages, {getLanguageCodes} from '../languages';

describe('Language tests', () => {
  test('should contain list of languagegs', () => {
    expect(Object.keys(Languages).length).toEqual(2);

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

    expect(codes.length).toEqual(2);

    let called = false;

    for (const code of codes) {
      called = true;
      expect(isString(code)).toEqual(true);
    }

    expect(called).toEqual(true);
  });
});

// vim: set ts=2 sw=2 tw=80:
