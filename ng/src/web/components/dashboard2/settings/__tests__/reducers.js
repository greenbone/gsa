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

import dashboardSettings from '../reducers';

import {
  receivedDashboardSettings,
  requestDashboardSettings,
  receivedDashboardSettingsLoadingError,
} from '../actions';

describe('dashboard data reducers tests', () => {

  test('should return the initial state', () => {
    const state = dashboardSettings(undefined, {});
    expect(state).toEqual({
      items: null,
      isLoading: false,
      error: null,
    });
  });

  test('should handle request dashboard settings', () => {
    const action = requestDashboardSettings();

    expect(dashboardSettings({}, action)).toEqual({
      items: null,
      isLoading: true,
      error: null,
    });
  });

  test('should reset isLoading and error in request dashboard settings', () => {
    const action = requestDashboardSettings();

    expect(dashboardSettings({
      isLoading: false,
      error: 'an previous error',
    }, action)).toEqual({
      items: null,
      isLoading: true,
      error: null,
    });
  });

  test('should handle receive dashboard settings', () => {
    const data = {
      a1: [{
        height: 100,
        items: ['foo', 'bar'],
      }],
    };
    const action = receivedDashboardSettings(data);

    expect(dashboardSettings({}, action)).toEqual({
      isLoading: false,
      error: null,
      items: data,
    });
  });

  test('should reset isLoading and error in received dashboard settings', () => {
    const data = {
      a1: [{
        height: 100,
        items: ['foo', 'bar'],
      }],
    };
    const action = receivedDashboardSettings(data);

    expect(dashboardSettings({
      isLoading: true,
      error: 'an previous error',
    }, action)).toEqual({
      items: data,
      isLoading: false,
      error: null,
    });
  });

  test('should handle receive dashboard settings with defaults', () => {
    const defaults = {
      a2: [{
        items: ['abc', 'def'],
      }],
    };

    const data = {
      a1: [{
        height: 100,
        items: ['foo', 'bar'],
      }],
    };
    const action = receivedDashboardSettings(data, defaults);

    expect(dashboardSettings({}, action)).toEqual({
      isLoading: false,
      error: null,
      items: {
        ...defaults,
        ...data,
      },
    });
  });

  test('should handle receive dashboard settings and override defaults', () => {
    const defaults = {
      a1: [{
        items: ['abc', 'def'],
      }],
    };

    const data = {
      a1: [{
        height: 100,
        items: ['foo', 'bar'],
      }],
    };
    const action = receivedDashboardSettings(data, defaults);

    expect(dashboardSettings({}, action)).toEqual({
      isLoading: false,
      error: null,
      items: data,
    });
  });

  test('should handle receive dashboard settings and keep state', () => {
    const state = {
      items: {
        a2: [{
          items: ['abc', 'def'],
        }],
      },
    };

    const data = {
      a1: [{
        height: 100,
        items: ['foo', 'bar'],
      }],
    };
    const action = receivedDashboardSettings(data);

    expect(dashboardSettings(state, action)).toEqual({
      isLoading: false,
      error: null,
      items: {
        a2: [{
          items: ['abc', 'def'],
        }],
        a1: [{
          height: 100,
          items: [
            'foo',
            'bar',
          ],
        }],
      },
    });
  });

  test('should handle receive dashboard settings and override state', () => {
    const state = {
      items: {
        a1: [{
          items: ['abc', 'def'],
        }],
      },
    };

    const data = {
      a1: [{
        height: 100,
        items: ['foo', 'bar'],
      }],
    };
    const action = receivedDashboardSettings(data);

    expect(dashboardSettings(state, action)).toEqual({
      isLoading: false,
      error: null,
      items: data,
    });
  });

  test('should handle receive dashboard error', () => {
    const error = 'An error occured';
    const action = receivedDashboardSettingsLoadingError(error);

    expect(dashboardSettings({}, action)).toEqual({
      items: null,
      isLoading: false,
      error,
    });
  });

  test('should reset isLoading in receive dashboard error', () => {
    const error = 'An error occured';
    const action = receivedDashboardSettingsLoadingError(error);

    expect(dashboardSettings({
      isLoading: true,
    }, action)).toEqual({
      items: null,
      isLoading: false,
      error,
    });
  });

  test('should reset old error in receive dashboard error', () => {
    const error = 'An error occured';
    const action = receivedDashboardSettingsLoadingError(error);

    expect(dashboardSettings({
      error: 'An old error',
    }, action)).toEqual({
      items: null,
      isLoading: false,
      error,
    });
  });

  test('should keep state in receive dashboard error', () => {
    const error = 'An error occured';
    const action = receivedDashboardSettingsLoadingError(error);

    const items = {
      a1: [],
      a2: [{
        items: ['foo', 'bar'],
      }],
    };

    expect(dashboardSettings({
      items,
    }, action)).toEqual({
      items,
      isLoading: false,
      error,
    });
  });
});

// vim: set ts=2 sw=2 tw=80:
