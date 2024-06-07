/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';

import dashboardSettings from '../reducers';

import {
  loadDashboardSettingsSuccess,
  loadDashboardSettingsRequest,
  loadDashboardSettingsError,
  saveDashboardSettingsRequest,
  setDashboardSettingDefaults,
  resetDashboardSettingsRequest,
} from '../actions';

describe('dashboard settings reducers tests for initial state', () => {
  test('should return the initial state', () => {
    const state = dashboardSettings(undefined, {});
    expect(state).toEqual({
      byId: {},
      isLoading: {},
      defaults: {},
      errors: {},
    });
  });
});

describe('dashboard settings reducers tests for loading requests', () => {
  test('should handle request dashboard settings with id', () => {
    const id = 'a1';
    const action = loadDashboardSettingsRequest(id);

    expect(dashboardSettings({}, action)).toEqual({
      byId: {},
      defaults: {
        a1: undefined,
      },
      isLoading: {
        a1: true,
      },
      errors: {},
    });
  });

  test('should handle request dashboard settings with id and defaults', () => {
    const id = 'a1';
    const action = loadDashboardSettingsRequest(id);

    expect(dashboardSettings({}, action)).toEqual({
      byId: {},
      isLoading: {
        a1: true,
      },
      defaults: {},
      errors: {},
    });
  });

  test('should reset isLoading and error in request dashboard settings', () => {
    const id = 'a1';
    const action = loadDashboardSettingsRequest(id);
    const state = {
      isLoading: false,
      errors: {
        [id]: 'an previous error',
      },
    };

    expect(dashboardSettings(state, action)).toEqual({
      byId: {},
      isLoading: {
        [id]: true,
      },
      defaults: {},
      errors: {},
    });
  });
});

describe('dashboard settings reducers tests for loading success', () => {
  test('should handle receive dashboard settings', () => {
    const id = 'a1';
    const settings = {
      foo: 1,
      rows: ['foo', 'bar'],
    };

    const action = loadDashboardSettingsSuccess(id, settings);

    expect(dashboardSettings({}, action)).toEqual({
      byId: {
        a1: {
          foo: 1,
          rows: ['foo', 'bar'],
        },
      },
      defaults: {},
      errors: {},
      isLoading: {
        [id]: false,
      },
    });
  });

  test('should reset isLoading and error in received dashboard settings', () => {
    const id = 'a1';
    const settings = {
      foo: 1,
      rows: ['foo', 'bar'],
    };
    const state = {
      isLoading: {
        [id]: true,
      },
      errors: {
        [id]: 'an previous error',
      },
    };
    const action = loadDashboardSettingsSuccess(id, settings);

    expect(dashboardSettings(state, action)).toEqual({
      byId: {
        a1: {
          foo: 1,
          rows: ['foo', 'bar'],
        },
      },
      defaults: {},
      errors: {},
      isLoading: {
        [id]: false,
      },
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

    const action = loadDashboardSettingsSuccess(id, settings);

    expect(dashboardSettings(state, action)).toEqual({
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
      errors: {},
      isLoading: {
        [id]: false,
      },
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

    const action = loadDashboardSettingsSuccess(id, settings);

    expect(dashboardSettings(state, action)).toEqual({
      byId: {
        a1: {
          other: 'ipsum',
          height: 100,
          rows: ['foo', 'bar'],
        },
      },
      defaults: {},
      errors: {},
      isLoading: {
        [id]: false,
      },
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

    const action = loadDashboardSettingsSuccess(id, settings, defaults);

    expect(dashboardSettings(state, action)).toEqual({
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
      errors: {},
      isLoading: {
        [id]: false,
      },
    });
  });

  test('should handle receive dashboard error', () => {
    const id = 'a1';
    const error = 'An error occured';
    const action = loadDashboardSettingsError(id, error);

    expect(dashboardSettings({}, action)).toEqual({
      byId: {},
      defaults: {},
      errors: {
        [id]: error,
      },
      isLoading: {
        [id]: false,
      },
    });
  });

  test('should reset isLoading in receive dashboard error', () => {
    const id = 'a1';
    const error = 'An error occured';
    const action = loadDashboardSettingsError(id, error);
    const state = {
      isLoading: {
        [id]: true,
      },
    };

    expect(dashboardSettings(state, action)).toEqual({
      byId: {},
      defaults: {},
      errors: {
        [id]: error,
      },
      isLoading: {
        [id]: false,
      },
    });
  });

  test('should reset old error in receive dashboard error', () => {
    const id = 'a1';
    const error = 'An error occured';
    const action = loadDashboardSettingsError(id, error);
    const state = {
      errors: {
        [id]: 'An old error',
      },
    };

    expect(dashboardSettings(state, action)).toEqual({
      byId: {},
      defaults: {},
      errors: {
        [id]: error,
      },
      isLoading: {
        [id]: false,
      },
    });
  });

  test('should keep state in receive dashboard error', () => {
    const id = 'a1';
    const error = 'An error occured';
    const action = loadDashboardSettingsError(id, error);

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
      defaults: {},
      errors: {
        [id]: error,
      },
      isLoading: {
        [id]: false,
      },
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

    expect(
      dashboardSettings(undefined, saveDashboardSettingsRequest(id, settings)),
    ).toEqual({
      byId: {
        a1: {
          height: 100,
          items: ['foo', 'bar'],
        },
      },
      defaults: {},
      errors: {},
      isLoading: {},
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

    expect(
      dashboardSettings(state, saveDashboardSettingsRequest(id, settings)),
    ).toEqual({
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
      errors: {},
      isLoading: {},
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

    expect(
      dashboardSettings(state, saveDashboardSettingsRequest(id, settings)),
    ).toEqual({
      byId: {
        a1: {
          height: 100,
          items: ['foo', 'bar'],
        },
      },
      defaults: {},
      errors: {},
      isLoading: {},
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

    expect(
      dashboardSettings(state, saveDashboardSettingsRequest(id, settings)),
    ).toEqual({
      byId: {
        a1: {
          items: ['abc', 'def'],
          foo: 'ipsum',
          thisIsWeird: true,
        },
      },
      defaults: {},
      isLoading: {},
      errors: {},
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
      byId: {},
      defaults: {
        [id]: defaults,
      },
      errors: {},
      isLoading: {},
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
      byId: {},
      defaults: {
        [id]: defaults,
      },
      errors: {},
      isLoading: {},
    });
  });
});

describe('dashboard settings reducers test for resetting', () => {
  test('should init state during reset request', () => {
    const id = 'a1';
    const settings = {
      height: 100,
      items: ['foo', 'bar'],
    };

    const action = resetDashboardSettingsRequest(id, settings);

    expect(dashboardSettings(undefined, action)).toEqual({
      byId: {
        a1: {
          height: 100,
          items: ['foo', 'bar'],
        },
      },
      defaults: {},
      errors: {},
      isLoading: {},
    });
  });

  test('should update state during resetting settings', () => {
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

    const action = resetDashboardSettingsRequest(id, settings);

    expect(dashboardSettings(state, action)).toEqual({
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
      errors: {},
      isLoading: {},
    });
  });

  test('should override state during resetting settings', () => {
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

    const action = resetDashboardSettingsRequest(id, settings);

    expect(dashboardSettings(state, action)).toEqual({
      byId: {
        a1: {
          height: 100,
          items: ['foo', 'bar'],
        },
      },
      defaults: {},
      errors: {},
      isLoading: {},
    });
  });

  test('should merge settings into current state for resetting', () => {
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

    const action = resetDashboardSettingsRequest(id, settings);

    expect(dashboardSettings(state, action)).toEqual({
      byId: {
        a1: {
          items: ['abc', 'def'],
          foo: 'ipsum',
          thisIsWeird: true,
        },
      },
      defaults: {},
      isLoading: {},
      errors: {},
    });
  });
});

// vim: set ts=2 sw=2 tw=80:
