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
  convertDisplaysToGridItems,
  convertGridItemsToDisplays,
  filterDisplays,
  getDisplaysById,
  getPermittedDisplayIds,
  getRows,
  removeDisplay,
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

describe('convertDefaultDisplays test', () => {

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

describe('removeDisplay tests', () => {

  test('should not crash for undefined rows', () => {
    expect(removeDisplay()).toEqual([]);
  });

  test('should filter empty rows', () => {
    const rows = [{
      items: [],
    }, {
      items: [{
        id: 1,
      }],
    }];

    const filtered = removeDisplay(rows);
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

    const filtered = removeDisplay(rows, 1);
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

describe('filterDisplays tests', () => {

  test('should not crash for undefined rows', () => {
    expect(filterDisplays()).toEqual([]);
  });

  test('should not filter if isAllowed is not provided', () => {
    const rows = [{
      items: [{
        id: 'a1',
      }, {
        id: 'a2',
      }],
    }, {
      items: [{
        id: 'a3',
      }],
    }];
    expect(filterDisplays(rows)).toEqual(rows);
  });

  test('should filter display', () => {
    const rows = [{
      items: [{
        id: 'a1',
      }, {
        id: 'a2',
      }],
    }, {
      items: [{
        id: 'a3',
      }],
    }];
    const isAllowed = id => id !== 'a2';
    expect(filterDisplays(rows, isAllowed)).toEqual([{
      items: [{
        id: 'a1',
      }],
    }, {
      items: [{
        id: 'a3',
      }],
    }]);
  });
});

describe('getDisplaysById tests', () => {

  test('should not crash for empty argument', () => {
    expect(getDisplaysById()).toEqual({});
  });

  test('should convert to id mapping', () => {
    const rows = [{
      items: [{
        id: 'a1',
        value: 1,
      }, {
        id: 'a2',
        value: 2,
      }],
    }, {
      items: [{
        id: 'a3',
        value: 3,
      }],
    }];
    expect(getDisplaysById(rows)).toEqual({
      a1: {
        id: 'a1',
        value: 1,
      },
      a2: {
        id: 'a2',
        value: 2,
      },
      a3: {
        id: 'a3',
        value: 3,
      },
    });
  });

});

describe('convertDisplaysToGridItems', () => {

  test('should return empty array for undefined', () => {
    expect(convertDisplaysToGridItems()).toEqual([]);
  });

  test('should convert displays to grid items', () => {
    const rows = [{
      id: 'r1',
      height: 100,
      foo: 'bar',
      items: [{
        id: 'a1',
        value: 1,
      }, {
        id: 'a2',
        value: 2,
      }],
    }, {
      id: 'r2',
      height: 200,
      items: [{
        id: 'a3',
        value: 3,
      }],
    }];

    expect(convertDisplaysToGridItems(rows)).toEqual([{
      id: 'r1',
      height: 100,
      items: ['a1', 'a2'],
    }, {
      id: 'r2',
      height: 200,
      items: ['a3'],
    }]);
  });

});

describe('convertGridItemsToDisplays tests', () => {

  test('should return empty array for undefined arguments', () => {
    expect(convertGridItemsToDisplays()).toEqual([]);
  });

  test('should filter displays if displaysById is undefined', () => {
    const gridItems = [{
      id: 'r1',
      height: 100,
      items: ['a1', 'a2'],
    }, {
      id: 'r2',
      height: 200,
      items: ['a3'],
    }];
    expect(convertGridItemsToDisplays(gridItems)).toEqual([{
      id: 'r1',
      height: 100,
      items: [],
    }, {
      id: 'r2',
      height: 200,
      items: [],
    }]);
  });

  test('should return empty array if displaysById is undefined', () => {
    const a1 = {
      value: 1,
    };
    const a2 = {
      value: 2,
    };
    const a3 = {
      value: 3,
    };
    const gridItems = [{
      id: 'r1',
      height: 100,
      items: ['a1', 'a2'],
    }, {
      id: 'r2',
      height: 200,
      items: ['a3'],
    }];
    const displaysById = {
      a1,
      a2,
      a3,
    };
    expect(convertGridItemsToDisplays(gridItems, displaysById)).toEqual([{
      id: 'r1',
      height: 100,
      items: [a1, a2],
    }, {
      id: 'r2',
      height: 200,
      items: [a3],
    }]);
  });

  test('should not convert unknown row props', () => {
    const a1 = {
      value: 1,
    };
    const a2 = {
      value: 2,
    };
    const a3 = {
      value: 3,
    };
    const gridItems = [{
      id: 'r1',
      foo: 'bar',
      height: 100,
      items: ['a1', 'a2'],
    }, {
      lorem: 'ipsum',
      id: 'r2',
      height: 200,
      items: ['a3'],
    }];
    const displaysById = {
      a1,
      a2,
      a3,
    };
    expect(convertGridItemsToDisplays(gridItems, displaysById)).toEqual([{
      id: 'r1',
      height: 100,
      items: [a1, a2],
    }, {
      id: 'r2',
      height: 200,
      items: [a3],
    }]);
  });

});

// vim: set ts=2 sw=2 tw=80:
