/* Copyright (C) 2019-2021 Greenbone Networks GmbH
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

import {convertBoolean} from '../convert';

describe('convertBoolean tests', () => {
  test('should convert true', () => {
    expect(convertBoolean(true)).toEqual(1);
  });

  test('should convert false', () => {
    expect(convertBoolean(false)).toEqual(0);
  });

  test('should convert to undefined for other value', () => {
    expect(convertBoolean('true')).toBeUndefined();
    expect(convertBoolean('false')).toBeUndefined();
    expect(convertBoolean('1')).toBeUndefined();
    expect(convertBoolean('0')).toBeUndefined();
  });

  test('should convert to legacy 0 and 1 values', () => {
    expect(convertBoolean(1)).toEqual(1);
    expect(convertBoolean(0)).toEqual(0);
  });
});
