/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2018 Greenbone Networks GmbH
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
import {
  includes_id,
  select_save_id,
} from '../id';

describe('includes_id function tests', () => {
  test('should return true for found id', () => {
    const list = [{id: 1}, {id: 2}, {id: 3}];

    expect(includes_id(list, 1)).toBe(true);
    expect(includes_id(list, 2)).toBe(true);
    expect(includes_id(list, 3)).toBe(true);
  });

  test('should return false for unkown id', () => {
    const list = [{id: 1}, {id: 2}, {id: 3}];

    expect(includes_id(list, 4)).toBe(false);
  });

  test('should return false for different type of id', () => {
    const list = [{id: 1}, {id: 2}, {id: 3}];

    expect(includes_id(list, '2')).toBe(false);
  });
});

describe('select_save_id function tests', () => {
  test('should return id if id is in list', () => {
    const list = [{id: 1}, {id: 2}, {id: 3}];

    expect(select_save_id(list, 1)).toEqual(1);
    expect(select_save_id(list, 2)).toEqual(2);
    expect(select_save_id(list, 3)).toEqual(3);
  });

  test('should return first id if id is not in list', () => {
    const list = [{id: 1}, {id: 2}, {id: 3}];

    expect(select_save_id(list, 4)).toBe(1);
    expect(select_save_id(list, '2')).toBe(1);
  });

  test('should return default if id is not in list', () => {
    const list = [{id: 1}, {id: 2}, {id: 3}];

    expect(select_save_id(list, 4, 42)).toBe(42);
    expect(select_save_id(list, '2', 42)).toBe(42);
  });
});

// vim: set ts=2 sw=2 tw=80:

