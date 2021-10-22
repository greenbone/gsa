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
import {DEFAULT_ROW_HEIGHT, createDisplay, createRow} from '../dashboards';

describe('createRow tests', () => {
  test('should create row with default height', () => {
    const uuid = jest.fn().mockReturnValue(1);
    expect(createRow(['foo', 'bar'], undefined, uuid)).toEqual({
      id: 1,
      items: ['foo', 'bar'],
      height: DEFAULT_ROW_HEIGHT,
    });
    expect(uuid).toHaveBeenCalled();
  });

  test('should create row with height', () => {
    const uuid = jest.fn().mockReturnValue(1);
    expect(createRow(['foo', 'bar'], 100, uuid)).toEqual({
      id: 1,
      items: ['foo', 'bar'],
      height: 100,
    });
    expect(uuid).toHaveBeenCalled();
  });
});

describe('createDisplay tests', () => {
  test('should create a new item with empty props', () => {
    const uuid = jest.fn().mockReturnValue(1);
    expect(createDisplay('foo1', undefined, uuid)).toEqual({
      id: 1,
      displayId: 'foo1',
    });
    expect(uuid).toHaveBeenCalled();
  });

  test('should create a new item with props', () => {
    const uuid = jest.fn().mockReturnValue(1);
    expect(createDisplay('foo1', {foo: 'bar'}, uuid)).toEqual({
      id: 1,
      displayId: 'foo1',
      foo: 'bar',
    });
    expect(uuid).toHaveBeenCalled();
  });
});

// vim: set ts=2 sw=2 tw=80:
