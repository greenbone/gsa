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
} from '../actions';

describe('dashboard settings reducers tests for initial state', () => {

  test('should return the initial state', () => {
    const state = dashboardSettings(undefined, {});
    expect(state).toEqual({
      byId: null,
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
      byId: null,
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
      byId: null,
      isLoading: true,
      error: null,
      defaults: {},
    });
  });

  test('should handle request dashboard settings with id', () => {
    const id = 'a1';
    const action = requestDashboardSettings(id);

    expect(dashboardSettings({}, action)).toEqual({
      byId: null,
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
      byId: null,
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
    const byId = {
      a1: [{
        height: 100,
        byId: ['foo', 'bar'],
      }],
    };
    const settings = {
      ...byId,
    };

    const action = receivedDashboardSettings(id, settings);

    expect(dashboardSettings({}, action)).toEqual({
      isLoading: false,
      error: null,
      byId,
      defaults: {},
    });
  });

  test('should reset isLoading and error in received dashboard settings', () => {
    const id = 'a1';
    const byId = {
      a1: [{
        height: 100,
        byId: ['foo', 'bar'],
      }],
    };
    const settings = {
      ...byId,
    };

    const action = receivedDashboardSettings(id, settings);

    expect(dashboardSettings({
      isLoading: true,
      error: 'an previous error',
    }, action)).toEqual({
      byId,
      isLoading: false,
      error: null,
      defaults: {},
    });
  });

  test('should handle receive dashboard settings with defaults', () => {
    const id = 'a2';
    const defaults = [{
      items: ['abc', 'def'],
    }];

    const byId = {
      a1: [{
        height: 100,
        items: ['foo', 'bar'],
      }],
    };
    const settings = {
      ...byId,
    };

    const action = receivedDashboardSettings(id, settings, defaults);

    expect(dashboardSettings({}, action)).toEqual({
      isLoading: false,
      error: null,
      defaults: {},
      byId: {
        a1: [{
          height: 100,
          items: ['foo', 'bar'],
        }],
        a2: [{
          items: ['abc', 'def'],
        }],
      },
    });
  });

  test('should handle receive dashboard settings and override defaults', () => {
    const id = 'a1';
    const defaults = [{
      byId: ['abc', 'def'],
    }];

    const byId = {
      [id]: [{
        height: 100,
        byId: ['foo', 'bar'],
      }],
    };

    const settings = {
      ...byId,
    };

    const action = receivedDashboardSettings(id, settings, defaults);

    expect(dashboardSettings({}, action)).toEqual({
      isLoading: false,
      error: null,
      byId: {
        a1: [{
          height: 100,
          byId: ['foo', 'bar'],
        }],
      },
      defaults: {},
    });
  });

  test('should handle receive dashboard settings and keep state', () => {
    const id = 'a1';
    const state = {
      byId: {
        a2: [{
          byId: ['abc', 'def'],
        }],
      },
    };

    const byId = {
      [id]: [{
        height: 100,
        byId: ['foo', 'bar'],
      }],
    };

    const settings = {
      ...byId,
    };

    const action = receivedDashboardSettings(id, settings);

    expect(dashboardSettings(state, action)).toEqual({
      isLoading: false,
      error: null,
      byId: {
        a2: [{
          byId: ['abc', 'def'],
        }],
        a1: [{
          height: 100,
          byId: [
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
      byId: {
        [id]: [{
          byId: ['abc', 'def'],
        }],
      },
    };

    const byId = {
      [id]: [{
        height: 100,
        byId: ['foo', 'bar'],
      }],
    };

    const settings = {
      ...byId,
    };

    const action = receivedDashboardSettings(id, settings);

    expect(dashboardSettings(state, action)).toEqual({
      isLoading: false,
      error: null,
      byId: {
        a1: [{
          height: 100,
          byId: ['foo', 'bar'],
        }],
      },
      defaults: {},
    });
  });

  test('should handle receive dashboard error', () => {
    const error = 'An error occured';
    const action = receivedDashboardSettingsLoadingError(error);

    expect(dashboardSettings({}, action)).toEqual({
      byId: null,
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
      byId: null,
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
      byId: null,
      isLoading: false,
      error,
      defaults: {},
    });
  });

  test('should keep state in receive dashboard error', () => {
    const error = 'An error occured';
    const action = receivedDashboardSettingsLoadingError(error);

    const byId = {
      a1: [],
      a2: [{
        byId: ['foo', 'bar'],
      }],
    };

    expect(dashboardSettings({
      byId,
    }, action)).toEqual({
      byId,
      isLoading: false,
      error,
      defaults: {},
    });
  });
});

describe('dashboard settings reducers test for saving', () => {

  test('should init state during saving settings', () => {
    const id = 'a1';
    const settings = [{
      height: 100,
      items: ['foo', 'bar'],
    }];

    expect(dashboardSettings(undefined, saveDashboardSettings(id, settings))).toEqual({
      error: null,
      isLoading: false,
      byId: {
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
      byId: {
        a2: [{
          byId: ['abc', 'def'],
        }],
      },
    };

    const id = 'a1';
    const settings = [{
      height: 100,
      byId: ['foo', 'bar'],
    }];

    expect(dashboardSettings(state, saveDashboardSettings(id, settings))).toEqual({
      error: null,
      isLoading: false,
      byId: {
        a1: [{
          height: 100,
          byId: ['foo', 'bar'],
        }],
        a2: [{
          byId: ['abc', 'def'],
        }],
      },
      defaults: {},
    });
  });

  test('should override state during saving settings', () => {
    const state = {
      byId: {
        a1: [{
          items: ['abc', 'def'],
        }],
      },
    };

    const id = 'a1';
    const settings = [{
      height: 100,
      items: ['foo', 'bar'],
    }];

    expect(dashboardSettings(state, saveDashboardSettings(id, settings))).toEqual({
      error: null,
      isLoading: false,
      byId: {
        a1: [{
          height: 100,
          items: ['foo', 'bar'],
        }],
      },
      defaults: {},
    });
  });

  test('should store any data as settings', () => {
    const state = {
      byId: {
        a1: [{
          items: ['abc', 'def'],
        }],
      },
    };

    const id = 'a1';
    const settings = {
      foo: 'bar',
      thisIsWeird: true,
    };

    expect(dashboardSettings(state, saveDashboardSettings(id, settings))).toEqual({
      error: null,
      isLoading: false,
      byId: {
        a1: {
          foo: 'bar',
          thisIsWeird: true,
        },
      },
      defaults: {},
    });
  });
});

// vim: set ts=2 sw=2 tw=80:
