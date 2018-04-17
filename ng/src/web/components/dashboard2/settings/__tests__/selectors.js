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

describe('dashboard settings selector init tests', () => {
  test('should not crash with undefined state', () => {
    const selector = getDashboardSettings();

    expect(selector.getItemsById('a')).toBeUndefined();
    expect(selector.getIsLoading()).toEqual(false);
    expect(selector.getError()).toBeUndefined();
  });

  test('should not crash with empty state', () => {
    const selector = getDashboardSettings({});

    expect(selector.getItemsById('a')).toBeUndefined();
    expect(selector.getIsLoading()).toEqual(false);
    expect(selector.getError()).toBeUndefined();
  });

  test('should not crash with empty dashboadSettings', () => {
    const rootState = {
      dashboardSettings: {},
    };

    const selector = getDashboardSettings(rootState);

    expect(selector.getItemsById('a')).toBeUndefined();
    expect(selector.getIsLoading()).toBeUndefined();
    expect(selector.getError()).toBeUndefined();
  });
});

describe('dashboard setting selector isLoading tests', () => {

  test('should return isLoading', () => {
    const rootState = {
      dashboardSettings: {
        isLoading: true,
      },
    };

    const selector = getDashboardSettings(rootState);

    expect(selector.getIsLoading()).toBe(true);
  });
});

describe('dashboard setting selector getItemsById tests', () => {

  test('should return error', () => {
    const rootState = {
      dashboardSettings: {
        error: 'An error',
      },
    };

    const selector = getDashboardSettings(rootState);

    expect(selector.getError()).toEqual('An error');
  });
});

describe('dashboard setting selector getItemsById tests', () => {
  test('should return items', () => {
    const id = 'a1';
    const rootState = {
      dashboardSettings: {
        items: {
          [id]: ['a', 'b'],
        },
      },
    };

    const selector = getDashboardSettings(rootState);

    expect(selector.getItemsById(id)).toEqual(['a', 'b']);
  });

  test('should return null for items if unknown id is passed', () => {
    const rootState = {
      dashboardSettings: {
        items: {
        },
      },
    };

    const selector = getDashboardSettings(rootState);

    expect(selector.getItemsById('a')).toBeNull();
  });
});

// vim: set ts=2 sw=2 tw=80:
