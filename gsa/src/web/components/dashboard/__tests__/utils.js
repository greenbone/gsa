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
  getPermittedDisplayIds,
  getRows,
} from '../utils';

describe('getPermittedDisplayIds tests', () => {

  test('should return undefined for undefined', () => {
    expect(getPermittedDisplayIds()).toBeUndefined();
  });

  test('should return undefined for empty object', () => {
    expect(getPermittedDisplayIds({})).toBeUndefined();
  });

  test('should return permitted display ids', () => {
    const settings = {
      permittedDisplays: ['foo', 'bar'],
    };
    expect(getPermittedDisplayIds(settings)).toEqual(['foo', 'bar']);
  });

});

describe('getRows tests', () => {

  test('should return undefined for undefined', () => {
    expect(getRows()).toBeUndefined();
  });

  test('should return undefined for empty object', () => {
    expect(getRows({})).toBeUndefined();
  });

  test('should return permitted display ids', () => {
    const settings = {
      rows: ['foo', 'bar'],
    };
    expect(getRows(settings)).toEqual(['foo', 'bar']);
  });

});

// vim: set ts=2 sw=2 tw=80:
