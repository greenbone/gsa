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
  resetDashboardSettings,
} from '../actions';

describe('dashboard settings reducers tests for initial state', () => {

  test('should return the initial state', () => {
    const state = dashboardSettings(undefined, {});
    expect(state).toEqual({
      items: null,
      isLoading: false,
      error: null,
      defaults: {},
    });
  });

});

describe('dashboard settings reducers tests for loading requests', () => {
  test('should handle request dashboard settings', () => {
    const action = requestDashboardSettings();

    expect(dashboardSettings({}, action)).toEqual({
      items: null,
      isLoading: true,
      error: null,
      defaults: {},
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
      defaults: {},
    });
  });

  test('should handle request dashboard settings with id', () => {
    const id = 'a1';
    const action = requestDashboardSettings(id);

    expect(dashboardSettings({}, action)).toEqual({
      items: null,
      isLoading: true,
      error: null,
      defaults: {
        a1: undefined,
      },
    });
  });

  test('should handle request dashboard settings with id and defaults', () => {
    const id = 'a1';
    const defaults = {foo: 'bar'};
    const action = requestDashboardSettings(id, defaults);

    expect(dashboardSettings({}, action)).toEqual({
      items: null,
      isLoading: true,
      error: null,
      defaults: {
        a1: {
          foo: 'bar',
        },
      },
    });
  });
});

describe('dashboard settings reducers tests for loading success', () => {

  test('should handle receive dashboard settings', () => {
    const id = 'a1';
    const data = {
      a1: [{
        height: 100,
        items: ['foo', 'bar'],
      }],
    };
    const action = receivedDashboardSettings(id, data);

    expect(dashboardSettings({}, action)).toEqual({
      isLoading: false,
      error: null,
      items: data,
      defaults: {},
    });
  });

  test('should reset isLoading and error in received dashboard settings', () => {
    const id = 'a1';
    const data = {
      a1: [{
        height: 100,
        items: ['foo', 'bar'],
      }],
    };

    const action = receivedDashboardSettings(id, data);

    expect(dashboardSettings({
      isLoading: true,
      error: 'an previous error',
    }, action)).toEqual({
      items: data,
      isLoading: false,
      error: null,
      defaults: {},
    });
  });

  test('should handle receive dashboard settings with defaults', () => {
    const id = 'a2';
    const defaults = {
      items: [{
        items: ['abc', 'def'],
      }],
    };

    const data = {
      a1: [{
        height: 100,
        items: ['foo', 'bar'],
      }],
    };
    const action = receivedDashboardSettings(id, data, defaults);

    expect(dashboardSettings({}, action)).toEqual({
      isLoading: false,
      error: null,
      defaults: {},
      items: {
        [id]: defaults.items,
        a1: [{
          height: 100,
          items: ['foo', 'bar'],
        }],
      },
    });
  });

  test('should handle receive dashboard settings and override defaults', () => {
    const id = 'a1';
    const defaults = {
      items: [{
        items: ['abc', 'def'],
      }],
    };

    const data = {
      [id]: [{
        height: 100,
        items: ['foo', 'bar'],
      }],
    };
    const action = receivedDashboardSettings(id, data, defaults);

    expect(dashboardSettings({}, action)).toEqual({
      isLoading: false,
      error: null,
      items: data,
      defaults: {},
    });
  });

  test('should handle receive dashboard settings and keep state', () => {
    const id = 'a1';
    const state = {
      items: {
        a2: [{
          items: ['abc', 'def'],
        }],
      },
    };

    const data = {
      [id]: [{
        height: 100,
        items: ['foo', 'bar'],
      }],
    };
    const action = receivedDashboardSettings(id, data);

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
      defaults: {},
    });
  });

  test('should handle receive dashboard settings and override state', () => {
    const id = 'a1';
    const state = {
      items: {
        [id]: [{
          items: ['abc', 'def'],
        }],
      },
    };

    const data = {
      [id]: [{
        height: 100,
        items: ['foo', 'bar'],
      }],
    };
    const action = receivedDashboardSettings(id, data);

    expect(dashboardSettings(state, action)).toEqual({
      isLoading: false,
      error: null,
      items: data,
      defaults: {},
    });
  });

  test('should handle receive dashboard error', () => {
    const error = 'An error occured';
    const action = receivedDashboardSettingsLoadingError(error);

    expect(dashboardSettings({}, action)).toEqual({
      items: null,
      isLoading: false,
      error,
      defaults: {},
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
      defaults: {},
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
      defaults: {},
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
      defaults: {},
    });
  });
});

describe('dashboard settings reducers test for saving', () => {

  test('should init state during saving settings', () => {
    const id = 'a1';
    const items = [{
      height: 100,
      items: ['foo', 'bar'],
    }];

    expect(dashboardSettings(undefined, saveDashboardSettings(id, items))).toEqual({
      error: null,
      isLoading: false,
      items: {
        a1: [{
          height: 100,
          items: ['foo', 'bar'],
        }],
      },
      defaults: {},
    });
  });

  test('should update state during saving settings', () => {
    const state = {
      items: {
        a2: [{
          items: ['abc', 'def'],
        }],
      },
    };

    const id = 'a1';
    const items = [{
      height: 100,
      items: ['foo', 'bar'],
    }];

    expect(dashboardSettings(state, saveDashboardSettings(id, items))).toEqual({
      error: null,
      isLoading: false,
      items: {
        a1: [{
          height: 100,
          items: ['foo', 'bar'],
        }],
        a2: [{
          items: ['abc', 'def'],
        }],
      },
      defaults: {},
    });
  });

  test('should override state during saving settings', () => {
    const state = {
      items: {
        a1: [{
          items: ['abc', 'def'],
        }],
      },
    };

    const id = 'a1';
    const items = [{
      height: 100,
      items: ['foo', 'bar'],
    }];

    expect(dashboardSettings(state, saveDashboardSettings(id, items))).toEqual({
      error: null,
      isLoading: false,
      items: {
        a1: [{
          height: 100,
          items: ['foo', 'bar'],
        }],
      },
      defaults: {},
    });
  });
});

describe('dashboard settings reducers test for resetting to defaults', () => {

  test('should init state during resetting', () => {
    const id = 'a1';
    const defaults = {
      height: 100,
      items: ['foo', 'bar'],
    };

    expect(dashboardSettings(undefined, resetDashboardSettings(id, defaults))).toEqual({
      error: null,
      isLoading: false,
      items: {
        a1: ['foo', 'bar'],
      },
      defaults: {},
    });
  });

  test('should override state during resetting', () => {
    const id = 'a1';
    const defaults = {
      height: 100,
      items: ['foo', 'bar'],
    };

    const state = {
      items: {
        [id]: ['abc', 'def'],
      },
    };

    expect(dashboardSettings(state, resetDashboardSettings(id, defaults))).toEqual({
      error: null,
      isLoading: false,
      items: {
        a1: ['foo', 'bar'],
      },
      defaults: {},
    });
  });

  test('should not override other settings during resetting', () => {
    const id = 'a1';
    const defaults = {
      height: 100,
      items: ['foo', 'bar'],
    };

    const state = {
      items: {
        a2: ['abc', 'def'],
      },
    };

    expect(dashboardSettings(state, resetDashboardSettings(id, defaults))).toEqual({
      error: null,
      isLoading: false,
      items: {
        a1: ['foo', 'bar'],
        a2: ['abc', 'def'],
      },
      defaults: {},
    });
  });
});
// vim: set ts=2 sw=2 tw=80:
