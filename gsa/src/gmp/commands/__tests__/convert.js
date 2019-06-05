/* Copyright (C) 2019 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301 USA.
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
    expect(convertBoolean(1)).toBeUndefined();
    expect(convertBoolean(0)).toBeUndefined();
  });
});
