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
  convertDefaultContent,
  createItem,
  createRow,
  removeItem,
  updateRow,
  DEFAULT_ROW_HEIGHT,
} from '../utils';

describe('createItem tests', () => {

  test('should create a new item with empty props', () => {
    const uuid = jest.fn().mockReturnValue(1);
    expect(createItem(undefined, uuid)).toEqual({
      id: 1,
    });
    expect(uuid).toHaveBeenCalled();
  });

  test('should create a new item with props', () => {
    const uuid = jest.fn().mockReturnValue(1);
    expect(createItem({foo: 'bar'}, uuid)).toEqual({
      id: 1,
      foo: 'bar',
    });
    expect(uuid).toHaveBeenCalled();
  });

});

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
    expect(convertDefaultContent()).toEqual([]);
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

    expect(convertDefaultContent(rows, uuid)).toEqual([{
      height: DEFAULT_ROW_HEIGHT,
      id: 3,
      items: [{
        id: 1,
        name: 'foo',
      }, {
        id: 2,
        name: 'bar',
      }],
    }, {
      height: DEFAULT_ROW_HEIGHT,
      id: 5,
      items: [{
        id: 4,
        name: 'lorem',
      }],
    }]);
  });

});

// vim: set ts=2 sw=2 tw=80:
