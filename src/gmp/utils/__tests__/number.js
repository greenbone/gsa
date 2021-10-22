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
import {severityValue, fixedValue} from 'gmp/utils/number';

describe('severityValue function tests', () => {
  test('should convert numbers to severity', () => {
    expect(severityValue(0)).toEqual('0.0');
    expect(severityValue(1)).toEqual('1.0');
    expect(severityValue(1.0)).toEqual('1.0');
    expect(severityValue(1.1)).toEqual('1.1');
    expect(severityValue(1.1)).toEqual('1.1');
    expect(severityValue(1.15)).toEqual('1.1');
    expect(severityValue(1.16)).toEqual('1.2');
    expect(severityValue(1.19)).toEqual('1.2');
  });
});

describe('fixedValue function tests', () => {
  test('should convert numbers to fixed values', () => {
    const num = 12345.6789;

    expect(fixedValue(num)).toEqual('12345.6789');
    expect(fixedValue(num, 1)).toEqual('12345.7');
    expect(fixedValue(num, 6)).toEqual('12345.678900');

    expect(fixedValue(2.34, 1)).toEqual('2.3');
    expect(fixedValue(2.35, 1)).toEqual('2.4');
    expect(fixedValue(2.55, 1)).toEqual('2.5');
  });
});

// vim: set ts=2 sw=2 tw=80:
