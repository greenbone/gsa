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
import {DEFAULT_ROW_HEIGHT} from 'web/components/sortable/utils';

import {
  addDisplayToSettings,
  canAddDisplay,
} from '../utils';

describe('canAddDisplay helper function tests', () => {

  test('should allow to add display without settings', () => {
    expect(canAddDisplay()).toEqual(true);
  });

  test('should allow to add display without existing rows', () => {
    const rows = [];
    expect(canAddDisplay({
      rows,
      maxItemsPerRow: 3,
      maxRows: 1,
    })).toEqual(true);
  });

  test('should allow to add display without maxItemsPerRow', () => {
    const rows = [
      {
        items: [1, 2, 3],
      },
    ];
    expect(canAddDisplay({
      rows,
      maxRows: 1,
    })).toEqual(true);
  });

  test('should allow to add display without maxRows', () => {
    const rows = [
      {
        items: [1, 2, 3],
      },
    ];
    expect(canAddDisplay({
      rows,
      maxItemsPerRow: 3,
    })).toEqual(true);
  });

  test('should allow to add display if last row is not full', () => {
    const rows = [
      {
        items: [1, 2],
      },
    ];
    expect(canAddDisplay({
      rows,
      maxItemsPerRow: 3,
      maxRows: 1,
    })).toEqual(true);
  });

  test('should allow to add display if another row is possible', () => {
    const rows = [
      {
        items: [1, 2, 3],
      },
    ];
    expect(canAddDisplay({
      rows,
      maxItemsPerRow: 3,
      maxRows: 2,
    })).toEqual(true);
  });

  test('should not be able to add display if last row is full', () => {
    const rows = [
      {
        items: [1, 2, 3],
      },
    ];
    expect(canAddDisplay({
      rows,
      maxItemsPerRow: 3,
      maxRows: 1,
    })).toEqual(false);
  });

});

describe('addDisplayToSettings tests', () => {

  test('should create new settings', () => {
    const uuid = 'foo1';
    const uuidFunc = () => uuid;

    expect(addDisplayToSettings(undefined, 'a1', uuidFunc)).toEqual({
      rows: [{
        items: [{
          id: uuid,
          name: 'a1',
        }],
      }],
    });

    expect(addDisplayToSettings({rows: {}}, 'a1', uuidFunc)).toEqual({
      rows: [{
        items: [{
          id: uuid,
          name: 'a1',
        }],
      }],
    });

    expect(addDisplayToSettings({rows: []}, 'a1', uuidFunc)).toEqual({
      rows: [{
        items: [{
          id: uuid,
          name: 'a1',
        }],
      }],
    });
  });

  test('should add display to last row', () => {
    const uuid = 'foo1';
    const uuidFunc = () => uuid;
    const settings = {
      rows: [{
        items: [{
          id: 'u1',
        }],
      }, {
        items: [{
          id: 'u2',
        }],
      }],
      maxItemsPerRow: 2,
    };

    const newSettings = addDisplayToSettings(settings, 'a1', uuidFunc);
    expect(newSettings).toEqual({
      rows: [{
        items: [{
          id: 'u1',
        }],
      }, {
        items: [{
          id: 'u2',
        }, {
          id: uuid,
          name: 'a1',
        }],
      }],
      maxItemsPerRow: 2,
    });
    expect(settings).not.toBe(newSettings);
    // ensure changed row has copied instead of mutated
    expect(settings.rows[0]).toBe(newSettings.rows[0]);
    expect(settings.rows[0].items).toBe(newSettings.rows[0].items);
    expect(settings.rows[1]).not.toBe(newSettings.rows[1]);
    expect(settings.rows[1].items).not.toBe(newSettings.rows[1].items);
  });

  test('should add display to new row', () => {
    const uuid = 'foo1';
    const uuidFunc = () => uuid;
    const settings = {
      rows: [{
        items: [{
          id: 'u1',
        }],
      }, {
        items: [{
          id: 'u2',
        }],
      }],
      maxItemsPerRow: 1,
    };

    const newSettings = addDisplayToSettings(settings, 'a1', uuidFunc);
    expect(newSettings).toEqual({
      rows: [{
        items: [{
          id: 'u1',
        }],
      }, {
        items: [{
          id: 'u2',
        }],
      }, {
        id: uuid,
        height: DEFAULT_ROW_HEIGHT,
        items: [{
          id: uuid,
          name: 'a1',
        }],
      }],
      maxItemsPerRow: 1,
    });
    expect(settings).not.toBe(newSettings);
  });

});
