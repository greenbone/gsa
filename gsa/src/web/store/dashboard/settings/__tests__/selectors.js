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

/* eslint-disable max-len */

import getDashboardSettings from '../selectors';

const createState = state => ({
  dashboardSettings: {
    ...state,
  },
});

describe('dashboard settings selector init tests', () => {
  test('should not crash with undefined state', () => {
    const selector = getDashboardSettings();

    expect(selector.getById('a')).toBeUndefined();
    expect(selector.getIsLoading()).toEqual(false);
    expect(selector.getError()).toBeUndefined();
    expect(selector.getDefaultsById('a')).toEqual({});
    expect(selector.hasSettings('a')).toBe(false);
  });

  test('should not crash with empty state', () => {
    const selector = getDashboardSettings({});

    expect(selector.getById('a')).toBeUndefined();
    expect(selector.getIsLoading()).toEqual(false);
    expect(selector.getError()).toBeUndefined();
    expect(selector.getDefaultsById('a')).toEqual({});
    expect(selector.hasSettings('a')).toBe(false);
  });

  test('should not crash with empty dashboadSettings', () => {
    const rootState = createState({});

    const selector = getDashboardSettings(rootState);

    expect(selector.getById('a')).toBeUndefined();
    expect(selector.getIsLoading()).toBeUndefined();
    expect(selector.getError()).toBeUndefined();
    expect(selector.getDefaultsById('a')).toEqual({});
    expect(selector.hasSettings('a')).toBe(false);
  });
});

describe('dashboard setting selector isLoading tests', () => {

  test('should return isLoading', () => {
    const rootState = createState({
      isLoading: true,
    });

    const selector = getDashboardSettings(rootState);

    expect(selector.getIsLoading()).toBe(true);
  });
});

describe('dashboard setting selector getItemsById tests', () => {

  test('should return error', () => {
    const rootState = createState({
      error: 'An error',
    });

    const selector = getDashboardSettings(rootState);

    expect(selector.getError()).toEqual('An error');
  });
});

describe('dashboard setting selector getById tests', () => {

  test('should return settings', () => {
    const id = 'a1';
    const rootState = createState({
      byId: {
        [id]: {
          foo: 'bar',
        },
      },
    });

    const selector = getDashboardSettings(rootState);

    expect(selector.getById(id)).toEqual({foo: 'bar'});
  });

  test('should return undefined if unknown id is passed', () => {
    const rootState = createState({
      byId: {
      },
    });

    const selector = getDashboardSettings(rootState);

    expect(selector.getById('a')).toBeUndefined();
  });
});

describe('dashboard setting selector getDefaultsById tests', () => {
  test('should return defaults', () => {
    const id = 'a1';
    const rootState = createState({
      defaults: {
        [id]: ['a', 'b'],
      },
    });

    const selector = getDashboardSettings(rootState);

    expect(selector.getDefaultsById(id)).toEqual(['a', 'b']);
  });

  test('should return null for items if unknown id is passed', () => {
    const rootState = createState({
      defaults: {
      },
    });

    const selector = getDashboardSettings(rootState);

    expect(selector.getDefaultsById('a')).toEqual({});
  });
});

describe('dashboard setting selector hasSettings tests', () => {

  test('should return false for undefined state', () => {
    const selector = getDashboardSettings();

    expect(selector.hasSettings('a')).toBe(false);
  });

  test('should return false for empty state', () => {
    const selector = getDashboardSettings({});

    expect(selector.hasSettings('a')).toBe(false);
  });

  test('should return false for empty byId', () => {
    const rootState = createState({
      byId: {},
    });
    const selector = getDashboardSettings(rootState);

    expect(selector.hasSettings('a')).toBe(false);
  });

  test('should return false for undefined id in byId', () => {
    const rootState = createState({
      byId: {
        a: undefined,
      },
    });
    const selector = getDashboardSettings(rootState);

    expect(selector.hasSettings('a')).toBe(false);
  });

  test('should return true for empty id in byId', () => {
    const rootState = createState({
      byId: {
        a: {},
      },
    });
    const selector = getDashboardSettings(rootState);

    expect(selector.hasSettings('a')).toBe(true);
  });

  test('should return false for other id in byId', () => {
    const rootState = createState({
      byId: {
        a: {},
      },
    });
    const selector = getDashboardSettings(rootState);

    expect(selector.hasSettings('b')).toBe(false);
  });
});

// vim: set ts=2 sw=2 tw=80:
