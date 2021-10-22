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
import {exclude, excludeObjectProps} from '../object';

describe('exclude function test', () => {
  test('exclude object property', () => {
    const obj = {
      foo: 1,
      bar: 2,
    };
    const result = exclude(obj, prop => prop === 'foo');

    expect(result.foo).toBeUndefined();
    expect(result.bar).toBe(2);
  });
});

describe('excludeObjectProps function test', () => {
  test('exclude object properties', () => {
    const obj = {
      foo: 1,
      bar: 2,
      abc: 3,
    };
    const result = excludeObjectProps(obj, ['foo', 'bar']);

    expect(result.foo).toBeUndefined();
    expect(result.bar).toBeUndefined();
    expect(result.abc).toBe(3);
  });
});

// vim: set ts=2 sw=2 tw=80:
