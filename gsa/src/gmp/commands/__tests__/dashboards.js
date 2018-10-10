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
  DEFAULT_ROW_HEIGHT,
  createRow,
} from '../dashboards';

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
