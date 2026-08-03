/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {DEFAULT_ROW_HEIGHT} from 'gmp/commands/dashboards';
import {
  addDisplayToSettings,
  canAddDisplay,
  convertDefaultDisplays,
  convertDisplaysToGridItems,
  convertGridItemsToDisplays,
  filterDisplays,
  getDisplaysById,
  getPermittedDisplayIds,
  getRows,
  removeDisplay,
} from 'web/components/dashboard/utils';

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
      rows: [{id: 'r1', height: 100, items: [{id: 'foo', displayId: 'foo'}]}],
    };
    expect(getRows(settings)).toEqual(settings.rows);
  });

  test('should return default for undefined rows', () => {
    expect(getRows({}, [])).toEqual([]);
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
    const uuid = testing.fn().mockImplementation(() => i++);

    const rows = [['foo', 'bar'], ['lorem']];

    expect(convertDefaultDisplays(rows, uuid)).toEqual({
      rows: [
        {
          height: DEFAULT_ROW_HEIGHT,
          id: 3,
          items: [
            {
              id: 1,
              displayId: 'foo',
            },
            {
              id: 2,
              displayId: 'bar',
            },
          ],
        },
        {
          height: DEFAULT_ROW_HEIGHT,
          id: 5,
          items: [
            {
              id: 4,
              displayId: 'lorem',
            },
          ],
        },
      ],
    });
  });
});

describe('removeDisplay tests', () => {
  test('should not crash for undefined rows', () => {
    expect(removeDisplay()).toEqual([]);
  });

  test('should filter empty rows', () => {
    const rows = [
      {
        id: 'r1',
        items: [] as {id: string; displayId: string}[],
      },
      {
        id: 'r2',
        items: [
          {
            id: 'item-1',
            displayId: 'display-1',
          },
        ],
      },
    ];

    const filtered = removeDisplay(rows);
    expect(filtered.length).toEqual(1);
    expect(filtered).toEqual([
      {
        id: 'r2',
        items: [
          {
            id: 'item-1',
            displayId: 'display-1',
          },
        ],
      },
    ]);
  });

  test('should remove item with id', () => {
    const rows = [
      {
        id: 'r1',
        items: [
          {
            id: 'item-1',
            displayId: 'display-1',
          },
          {
            id: 'item-2',
            displayId: 'display-2',
          },
        ],
      },
      {
        id: 'r2',
        items: [
          {
            id: 'item-3',
            displayId: 'display-3',
          },
        ],
      },
    ];

    const filtered = removeDisplay(rows, 'item-1');
    expect(filtered.length).toEqual(2);
    expect(filtered).toEqual([
      {
        id: 'r1',
        items: [
          {
            id: 'item-2',
            displayId: 'display-2',
          },
        ],
      },
      {
        id: 'r2',
        items: [
          {
            id: 'item-3',
            displayId: 'display-3',
          },
        ],
      },
    ]);
  });
});

describe('filterDisplays tests', () => {
  test('should not crash for undefined rows', () => {
    expect(filterDisplays()).toEqual([]);
  });

  test('should not filter if isAllowed is not provided', () => {
    const rows = [
      {
        id: 'r1',
        items: [
          {id: 'a1', displayId: 'a1'},
          {id: 'a2', displayId: 'a2'},
        ],
      },
      {
        id: 'r2',
        items: [{id: 'a3', displayId: 'a3'}],
      },
    ];
    expect(filterDisplays(rows)).toEqual(rows);
  });

  test('should filter display', () => {
    const rows = [
      {
        id: 'r1',
        items: [
          {id: 'a1', displayId: 'a1'},
          {id: 'a2', displayId: 'a2'},
        ],
      },
      {
        id: 'r2',
        items: [{id: 'a3', displayId: 'a3'}],
      },
    ];
    const isAllowed = (id: string) => id !== 'a2';
    expect(filterDisplays(rows, isAllowed)).toEqual([
      {
        id: 'r1',
        items: [{id: 'a1', displayId: 'a1'}],
      },
      {
        id: 'r2',
        items: [{id: 'a3', displayId: 'a3'}],
      },
    ]);
  });
});

describe('getDisplaysById tests', () => {
  test('should not crash for empty argument', () => {
    expect(getDisplaysById()).toEqual({});
  });

  test('should convert to id mapping', () => {
    const rows = [
      {
        id: 'r1',
        items: [
          {id: 'a1', displayId: 'a1'},
          {id: 'a2', displayId: 'a2'},
        ],
      },
      {
        id: 'r2',
        items: [{id: 'a3', displayId: 'a3'}],
      },
    ];
    expect(getDisplaysById(rows)).toEqual({
      a1: {id: 'a1', displayId: 'a1'},
      a2: {id: 'a2', displayId: 'a2'},
      a3: {id: 'a3', displayId: 'a3'},
    });
  });
});

describe('convertDisplaysToGridItems', () => {
  test('should return empty array for undefined', () => {
    expect(convertDisplaysToGridItems()).toEqual([]);
  });

  test('should convert displays to grid items', () => {
    const rows = [
      {
        id: 'r1',
        height: 100,
        items: [
          {id: 'a1', displayId: 'display-a1'},
          {id: 'a2', displayId: 'display-a2'},
        ],
      },
      {
        id: 'r2',
        height: 200,
        items: [{id: 'a3', displayId: 'display-a3'}],
      },
    ];

    expect(convertDisplaysToGridItems(rows)).toEqual([
      {
        id: 'r1',
        height: 100,
        items: ['a1', 'a2'],
      },
      {
        id: 'r2',
        height: 200,
        items: ['a3'],
      },
    ]);
  });
});

describe('convertGridItemsToDisplays tests', () => {
  test('should return empty array for undefined arguments', () => {
    expect(convertGridItemsToDisplays()).toEqual([]);
  });

  test('should filter displays if displaysById is undefined', () => {
    const gridItems = [
      {
        id: 'r1',
        height: 100,
        items: ['a1', 'a2'],
      },
      {
        id: 'r2',
        height: 200,
        items: ['a3'],
      },
    ];
    expect(convertGridItemsToDisplays(gridItems)).toEqual([
      {
        id: 'r1',
        height: 100,
        items: [],
      },
      {
        id: 'r2',
        height: 200,
        items: [],
      },
    ]);
  });

  test('should convert grid items to displays using displaysById', () => {
    const a1: {id: string; displayId: string} = {
      id: 'a1',
      displayId: 'display-a1',
    };
    const a2: {id: string; displayId: string} = {
      id: 'a2',
      displayId: 'display-a2',
    };
    const a3: {id: string; displayId: string} = {
      id: 'a3',
      displayId: 'display-a3',
    };
    const gridItems = [
      {
        id: 'r1',
        height: 100,
        items: ['a1', 'a2'],
      },
      {
        id: 'r2',
        height: 200,
        items: ['a3'],
      },
    ];
    const displaysById = {a1, a2, a3};
    expect(convertGridItemsToDisplays(gridItems, displaysById)).toEqual([
      {id: 'r1', height: 100, items: [a1, a2]},
      {id: 'r2', height: 200, items: [a3]},
    ]);
  });

  test('should not convert unknown row props', () => {
    const a1: {id: string; displayId: string} = {
      id: 'a1',
      displayId: 'display-a1',
    };
    const a2: {id: string; displayId: string} = {
      id: 'a2',
      displayId: 'display-a2',
    };
    const a3: {id: string; displayId: string} = {
      id: 'a3',
      displayId: 'display-a3',
    };
    const gridItems = [
      {
        id: 'r1',
        foo: 'bar',
        height: 100,
        items: ['a1', 'a2'],
      },
      {
        lorem: 'ipsum',
        id: 'r2',
        height: 200,
        items: ['a3'],
      },
    ];
    const displaysById = {
      a1,
      a2,
      a3,
    };
    expect(convertGridItemsToDisplays(gridItems, displaysById)).toEqual([
      {
        id: 'r1',
        height: 100,
        items: [a1, a2],
      },
      {
        id: 'r2',
        height: 200,
        items: [a3],
      },
    ]);
  });
});

describe('canAddDisplay helper function tests', () => {
  test('should allow to add display without settings', () => {
    expect(canAddDisplay()).toEqual(true);
  });

  test('should allow to add display without existing rows', () => {
    const rows = [];
    expect(
      canAddDisplay({
        rows,
        maxItemsPerRow: 3,
        maxRows: 1,
      }),
    ).toEqual(true);
  });

  test('should allow to add display without maxItemsPerRow', () => {
    const rows = [
      {
        id: 'r1',
        items: [
          {id: 'i1', displayId: 'd'},
          {id: 'i2', displayId: 'd'},
          {id: 'i3', displayId: 'd'},
        ],
      },
    ];
    expect(canAddDisplay({rows, maxRows: 1})).toEqual(true);
  });

  test('should allow to add display without maxRows', () => {
    const rows = [
      {
        id: 'r1',
        items: [
          {id: 'i1', displayId: 'd'},
          {id: 'i2', displayId: 'd'},
          {id: 'i3', displayId: 'd'},
        ],
      },
    ];
    expect(canAddDisplay({rows, maxItemsPerRow: 3})).toEqual(true);
  });

  test('should allow to add display if last row is not full', () => {
    const rows = [
      {
        id: 'r1',
        items: [
          {id: 'i1', displayId: 'd'},
          {id: 'i2', displayId: 'd'},
        ],
      },
    ];
    expect(canAddDisplay({rows, maxItemsPerRow: 3, maxRows: 1})).toEqual(true);
  });

  test('should allow to add display if another row is possible', () => {
    const rows = [
      {
        id: 'r1',
        items: [
          {id: 'i1', displayId: 'd'},
          {id: 'i2', displayId: 'd'},
          {id: 'i3', displayId: 'd'},
        ],
      },
    ];
    expect(canAddDisplay({rows, maxItemsPerRow: 3, maxRows: 2})).toEqual(true);
  });

  test('should not be able to add display if last row is full', () => {
    const rows = [
      {
        id: 'r1',
        items: [
          {id: 'i1', displayId: 'd'},
          {id: 'i2', displayId: 'd'},
          {id: 'i3', displayId: 'd'},
        ],
      },
    ];
    expect(canAddDisplay({rows, maxItemsPerRow: 3, maxRows: 1})).toEqual(false);
  });
});

describe('addDisplayToSettings tests', () => {
  test('should create new settings', () => {
    const uuid = 'foo1';
    const uuidFunc = () => uuid;

    expect(addDisplayToSettings(undefined, 'a1', uuidFunc)).toEqual({
      rows: [
        {
          items: [{id: uuid, displayId: 'a1'}],
        },
      ],
    });

    expect(addDisplayToSettings({rows: undefined}, 'a1', uuidFunc)).toEqual({
      rows: [
        {
          items: [{id: uuid, displayId: 'a1'}],
        },
      ],
    });

    expect(addDisplayToSettings({rows: []}, 'a1', uuidFunc)).toEqual({
      rows: [
        {
          items: [{id: uuid, displayId: 'a1'}],
        },
      ],
    });
  });

  test('should add display to last row', () => {
    const uuid = 'foo1';
    const uuidFunc = () => uuid;
    const settings = {
      rows: [
        {
          id: 'row-1',
          items: [{id: 'u1', displayId: 'display-u1'}],
        },
        {
          id: 'row-2',
          items: [{id: 'u2', displayId: 'display-u2'}],
        },
      ],
      maxItemsPerRow: 2,
    };

    const newSettings = addDisplayToSettings(settings, 'a1', uuidFunc);
    expect(newSettings).toEqual({
      rows: [
        {
          id: 'row-1',
          items: [{id: 'u1', displayId: 'display-u1'}],
        },
        {
          id: 'row-2',
          items: [
            {id: 'u2', displayId: 'display-u2'},
            {id: uuid, displayId: 'a1'},
          ],
        },
      ],
      maxItemsPerRow: 2,
    });
    expect(settings).not.toBe(newSettings);
    // ensure changed row has copied instead of mutated
    const newRows = newSettings.rows as typeof settings.rows;
    expect(settings.rows[0]).toBe(newRows[0]);
    expect(settings.rows[0].items).toBe(newRows[0].items);
    expect(settings.rows[1]).not.toBe(newRows[1]);
    expect(settings.rows[1].items).not.toBe(newRows[1].items);
  });

  test('should add display to new row', () => {
    const uuid = 'foo1';
    const uuidFunc = () => uuid;
    const settings = {
      rows: [
        {
          id: 'row-1',
          items: [{id: 'u1', displayId: 'display-u1'}],
        },
        {
          id: 'row-2',
          items: [{id: 'u2', displayId: 'display-u2'}],
        },
      ],
      maxItemsPerRow: 1,
    };

    const newSettings = addDisplayToSettings(settings, 'a1', uuidFunc);
    expect(newSettings).toEqual({
      rows: [
        {
          id: 'row-1',
          items: [{id: 'u1', displayId: 'display-u1'}],
        },
        {
          id: 'row-2',
          items: [{id: 'u2', displayId: 'display-u2'}],
        },
        {
          id: uuid,
          height: DEFAULT_ROW_HEIGHT,
          items: [{id: uuid, displayId: 'a1'}],
        },
      ],
      maxItemsPerRow: 1,
    });
    expect(settings).not.toBe(newSettings);
  });
});
