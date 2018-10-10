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
import {DEFAULT_ROW_HEIGHT} from 'gmp/commands/dashboards';

import {
  convertDefaultDisplays,
  removeItem,
  updateRow,
} from '../utils';

describe('removeItem tests', () => {

  test('should filter empty rows', () => {
    const rows = [{
      items: [],
    }, {
      items: [{
        id: 1,
      }],
    }];

    const filtered = removeItem(rows);
    expect(filtered.length).toEqual(1);
    expect(filtered).toEqual([{
      items: [{
        id: 1,
      }],
    }]);
  });

  test('should remove item with id', () => {
    const rows = [{
      items: [{
        id: 1,
      }, {
        id: 2,
      }],
    }, {
      items: [{
        id: 3,
      }],
    }];

    const filtered = removeItem(rows, 1);
    expect(filtered.length).toEqual(2);
    expect(filtered).toEqual([{
      items: [{
        id: 2,
      }],
    }, {
      items: [{
        id: 3,
      }],
    }]);
  });

});

describe('updateRow tests', () => {

  test('should return a shallow copy', () => {
    const row = {
      items: [{
        id: 1,
      }],
    };

    const updated = updateRow(row);
    expect(updated).not.toBe(row);
    expect(updated).toEqual(row);
  });

  test('should return empty object', () => {
    expect(updateRow()).toEqual({});
  });

  test('should update row', () => {
    const row = {
      items: [{
        id: 1,
      }],
    };

    const updated = updateRow(row, {foo: 'bar'});
    expect(updated).not.toBe(row);
    expect(updated).toEqual({
      items: [{
        id: 1,
      }],
      foo: 'bar',
    });
  });

});

describe('convertDefaultContent test', () => {

  test('should return empty array', () => {
    expect(convertDefaultDisplays()).toEqual({
      rows: [],
    });
  });

  test('should convert array to rows', () => {
    let i = 1;
    const uuid = jest.fn().mockImplementation(() => i++);

    const rows = [[
      'foo',
      'bar',
    ], [
      'lorem',
    ]];

    expect(convertDefaultDisplays(rows, uuid)).toEqual({
      rows: [{
        height: DEFAULT_ROW_HEIGHT,
        id: 3,
        items: [{
          id: 1,
          displayId: 'foo',
        }, {
          id: 2,
          displayId: 'bar',
        }],
      }, {
        height: DEFAULT_ROW_HEIGHT,
        id: 5,
        items: [{
          id: 4,
          displayId: 'lorem',
        }],
      }],
    });
  });

});

// vim: set ts=2 sw=2 tw=80:
