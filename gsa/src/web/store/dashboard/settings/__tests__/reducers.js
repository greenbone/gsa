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
  saveDashboardSettings,
  setDashboardSettingDefaults,
} from '../actions';

describe('dashboard settings reducers tests for initial state', () => {

  test('should return the initial state', () => {
    const state = dashboardSettings(undefined, {});
    expect(state).toEqual({
      byId: {},
      isLoading: false,
      defaults: {},
    });
  });

});

describe('dashboard settings reducers tests for loading requests', () => {

  test('should handle request dashboard settings with id', () => {
    const id = 'a1';
    const action = requestDashboardSettings(id);

    expect(dashboardSettings({}, action)).toEqual({
      byId: {},
      isLoading: true,
      defaults: {
        a1: undefined,
      },
    });
  });

  test('should handle request dashboard settings with id and defaults', () => {
    const id = 'a1';
    const action = requestDashboardSettings(id);

    expect(dashboardSettings({}, action)).toEqual({
      byId: {},
      isLoading: true,
      defaults: {},
    });
  });

  test('should reset isLoading and error in request dashboard settings', () => {
    const id = 'a1';
    const action = requestDashboardSettings(id);
    const state = {
      isLoading: false,
      error: 'an previous error',
    };

    expect(dashboardSettings(state, action)).toEqual({
      byId: {},
      isLoading: true,
      defaults: {},
    });
  });

});

describe('dashboard settings reducers tests for loading success', () => {

  test('should handle receive dashboard settings', () => {
    const id = 'a1';
    const settings = {
      height: 100,
      rows: ['foo', 'bar'],
    };

    const action = receivedDashboardSettings(id, settings);

    expect(dashboardSettings({}, action)).toEqual({
      isLoading: false,
      byId: {
        a1: {
          height: 100,
          rows: ['foo', 'bar'],
        },
      },
      defaults: {},
    });
  });

  test('should reset isLoading and error in received dashboard settings', () => {
    const id = 'a1';
    const settings = {
      height: 100,
      rows: ['foo', 'bar'],
    };
    const state = {
      isLoading: true,
      error: 'an previous error',
    };
    const action = receivedDashboardSettings(id, settings);

    expect(dashboardSettings(state, action)).toEqual({
      byId: {
        a1: {
          height: 100,
          rows: ['foo', 'bar'],
        },
      },
      isLoading: false,
      defaults: {},
    });
  });

  test('should handle receive dashboard settings and keep state', () => {
    const id = 'a1';
    const state = {
      byId: {
        a2: {
          foo: 'bar',
          rows: ['abc', 'def'],
        },
      },
    };

    const settings = {
      height: 100,
      rows: ['foo', 'bar'],
    };

    const action = receivedDashboardSettings(id, settings);

    expect(dashboardSettings(state, action)).toEqual({
      isLoading: false,
      byId: {
        a1: {
          height: 100,
          rows: ['foo', 'bar'],
        },
        a2: {
          foo: 'bar',
          rows: ['abc', 'def'],
        },
      },
      defaults: {},
    });
  });

  test('should handle receive dashboard settings and merge state', () => {
    const id = 'a1';
    const state = {
      byId: {
        [id]: {
          other: 'ipsum',
          rows: ['abc', 'def'],
        },
      },
    };

    const settings = {
      height: 100,
      rows: ['foo', 'bar'],
    };

    const action = receivedDashboardSettings(id, settings);

    expect(dashboardSettings(state, action)).toEqual({
      isLoading: false,
      byId: {
        a1: {
          other: 'ipsum',
          height: 100,
          rows: ['foo', 'bar'],
        },
      },
      defaults: {},
    });
  });

  test('should handle receive dashboard settings and merge defaults', () => {
    const id = 'a1';
    const state = {
      byId: {
        [id]: {
          other: 'ipsum',
          rows: ['abc', 'def'],
        },
      },
    };

    const defaults = {
      height: 200,
      foo: 'bar',
      maxRows: 4,
    };

    const settings = {
      height: 100,
      rows: ['foo', 'bar'],
    };

    const action = receivedDashboardSettings(id, settings, defaults);

    expect(dashboardSettings(state, action)).toEqual({
      isLoading: false,
      byId: {
        a1: {
          other: 'ipsum',
          height: 100,
          rows: ['foo', 'bar'],
          maxRows: 4,
          foo: 'bar',
        },
      },
      defaults: {},
    });
  });

  test('should handle receive dashboard error', () => {
    const id = 'a1';
    const error = 'An error occured';
    const action = receivedDashboardSettingsLoadingError(id, error);

    expect(dashboardSettings({}, action)).toEqual({
      byId: {},
      isLoading: false,
      error,
      defaults: {},
    });
  });

  test('should reset isLoading in receive dashboard error', () => {
    const id = 'a1';
    const error = 'An error occured';
    const action = receivedDashboardSettingsLoadingError(id, error);
    const state = {
      isLoading: true,
    };

    expect(dashboardSettings(state, action)).toEqual({
      byId: {},
      isLoading: false,
      error,
      defaults: {},
    });
  });

  test('should reset old error in receive dashboard error', () => {
    const id = 'a1';
    const error = 'An error occured';
    const action = receivedDashboardSettingsLoadingError(id, error);
    const state = {
      error: 'An old error',
    };

    expect(dashboardSettings(state, action)).toEqual({
      byId: {},
      isLoading: false,
      error,
      defaults: {},
    });
  });

  test('should keep state in receive dashboard error', () => {
    const id = 'a1';
    const error = 'An error occured';
    const action = receivedDashboardSettingsLoadingError(id, error);

    const state = {
      byId: {
        a1: {
          rows: ['foo', 'bar'],
        },
        a2: {
          width: 100,
        },
      },
    };

    expect(dashboardSettings(state, action)).toEqual({
      byId: {
        a1: {
          rows: ['foo', 'bar'],
        },
        a2: {
          width: 100,
        },
      },
      isLoading: false,
      error,
      defaults: {},
    });
  });
});

describe('dashboard settings reducers test for saving', () => {

  test('should init state during saving settings', () => {
    const id = 'a1';
    const settings = {
      height: 100,
      items: ['foo', 'bar'],
    };

    expect(dashboardSettings(undefined, saveDashboardSettings(id, settings))).toEqual({
      isLoading: false,
      byId: {
        a1: {
          height: 100,
          items: ['foo', 'bar'],
        },
      },
      defaults: {},
    });
  });

  test('should update state during saving settings', () => {
    const state = {
      byId: {
        a2: {
          rows: ['abc', 'def'],
        },
      },
    };

    const id = 'a1';
    const settings = {
      height: 100,
      rows: ['foo', 'bar'],
    };

    expect(dashboardSettings(state, saveDashboardSettings(id, settings))).toEqual({
      isLoading: false,
      byId: {
        a1: {
          height: 100,
          rows: ['foo', 'bar'],
        },
        a2: {
          rows: ['abc', 'def'],
        },
      },
      defaults: {},
    });
  });

  test('should override state during saving settings', () => {
    const state = {
      byId: {
        a1: {
          items: ['abc', 'def'],
        },
      },
    };

    const id = 'a1';
    const settings = {
      height: 100,
      items: ['foo', 'bar'],
    };

    expect(dashboardSettings(state, saveDashboardSettings(id, settings))).toEqual({
      isLoading: false,
      byId: {
        a1: {
          height: 100,
          items: ['foo', 'bar'],
        },
      },
      defaults: {},
    });
  });

  test('should merge saved settings into current state', () => {
    const state = {
      byId: {
        a1: {
          items: ['abc', 'def'],
          foo: 'bar',
        },
      },
    };

    const id = 'a1';
    const settings = {
      foo: 'ipsum',
      thisIsWeird: true,
    };

    expect(dashboardSettings(state, saveDashboardSettings(id, settings))).toEqual({
      isLoading: false,
      byId: {
        a1: {
          items: ['abc', 'def'],
          foo: 'ipsum',
          thisIsWeird: true,
        },
      },
      defaults: {},
    });
  });
});

describe('dashboard settings reducers test for setting defaults', () => {

  test('should set default settings for dashboard', () => {
    const id = 'a1';
    const defaults = {
      foo: 'bar',
    };
    const action = setDashboardSettingDefaults(id, defaults);

    expect(dashboardSettings(undefined, action)).toEqual({
      isLoading: false,
      byId: {},
      defaults: {
        [id]: defaults,
      },
    });
  });

  test('should override existing default settings for dashboard', () => {
    const id = 'a1';
    const defaults = {
      foo: 'bar',
    };
    const state = {
      defaults: {
        [id]: {
          lorem: 'ipsum',
        },
      },
    };
    const action = setDashboardSettingDefaults(id, defaults);

    expect(dashboardSettings(state, action)).toEqual({
      isLoading: false,
      byId: {},
      defaults: {
        [id]: defaults,
      },
    });
  });

});

// vim: set ts=2 sw=2 tw=80:
