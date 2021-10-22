/* Copyright (C) 2018-2021 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License
 * as published by the Free Software Foundation, either version 3
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */

/* eslint-disable max-len */

import {isFunction} from 'gmp/utils/identity';

import {
  DASHBOARD_SETTINGS_LOADING_ERROR,
  DASHBOARD_SETTINGS_LOADING_REQUEST,
  DASHBOARD_SETTINGS_LOADING_SUCCESS,
  DASHBOARD_SETTINGS_SAVING_REQUEST,
  DASHBOARD_SETTINGS_SAVING_SUCCESS,
  DASHBOARD_SETTINGS_SAVING_ERROR,
  DASHBOARD_SETTINGS_SET_DEFAULTS,
  DASHBOARD_SETTINGS_RESET_REQUEST,
  DASHBOARD_SETTINGS_RESET_SUCCESS,
  DASHBOARD_SETTINGS_RESET_ERROR,
  loadDashboardSettingsSuccess,
  loadDashboardSettingsRequest,
  loadDashboardSettingsError,
  saveDashboardSettingsRequest,
  saveDashboardSettingsSuccess,
  saveDashboardSettingsError,
  loadSettings,
  saveSettings,
  resetSettings,
  setDashboardSettingDefaults,
  resetDashboardSettingsRequest,
  resetDashboardSettingsSuccess,
  resetDashboardSettingsError,
} from '../actions';

const createRootState = (state = {byId: {}}) => ({
  dashboardSettings: {
    ...state,
  },
});

describe('loadDashboardSettingsRequest tests', () => {
  test('should create a load dashboard settings request action', () => {
    const id = 'a1';

    expect(loadDashboardSettingsRequest(id)).toEqual({
      id,
      type: DASHBOARD_SETTINGS_LOADING_REQUEST,
    });
  });
});

describe('loadDashboardSettingsSuccess tests', () => {
  test('should create an action after receiving dashboard settings', () => {
    const id = 'a1';
    const data = {foo: 'bar'};
    const settings = {
      items: data,
    };
    const defaultSettings = {
      foo: 'bar',
    };

    expect(loadDashboardSettingsSuccess(id, settings, defaultSettings)).toEqual(
      {
        settings,
        id,
        type: DASHBOARD_SETTINGS_LOADING_SUCCESS,
        defaultSettings,
      },
    );
  });
});

describe('loadDashboardSettingsError tests', () => {
  test('should create an action to receive an error during loading', () => {
    const id = 'a1';
    const error = 'An error occured';
    expect(loadDashboardSettingsError(id, error)).toEqual({
      error,
      id,
      type: DASHBOARD_SETTINGS_LOADING_ERROR,
    });
  });
});

describe('saveDashboardSettingsRequest tests', () => {
  test('should create a save dashboard settings request action', () => {
    const id = 'a1';
    const items = ['a', 'b'];
    const settings = {
      items,
    };

    expect(saveDashboardSettingsRequest(id, settings)).toEqual({
      type: DASHBOARD_SETTINGS_SAVING_REQUEST,
      id,
      settings,
    });
  });
});

describe('saveDashboardSettingsSuccess tests', () => {
  test('should create a save dashboard settings success action', () => {
    const id = 'a1';
    expect(saveDashboardSettingsSuccess(id)).toEqual({
      type: DASHBOARD_SETTINGS_SAVING_SUCCESS,
      id,
    });
  });
});

describe('saveDashboardSettingsError tests', () => {
  test('should create a save dashboard setting error action', () => {
    const id = 'a1';
    const error = 'An error';

    expect(saveDashboardSettingsError(id, error)).toEqual({
      type: DASHBOARD_SETTINGS_SAVING_ERROR,
      error,
      id,
    });
  });
});

describe('setDashboardSettingDefaults', () => {
  test('should create an action to set dashboard setting defaults', () => {
    const id = 'a1';
    const defaults = {
      foo: 'bar',
    };
    expect(setDashboardSettingDefaults(id, defaults)).toEqual({
      type: DASHBOARD_SETTINGS_SET_DEFAULTS,
      id,
      defaults,
    });
  });
});

describe('resetDashboardSettingsRequest tests', () => {
  test('should create a reset dashboard settings request action', () => {
    const id = 'a1';
    const settings = {
      foo: 'bar',
    };
    expect(resetDashboardSettingsRequest(id, settings)).toEqual({
      type: DASHBOARD_SETTINGS_RESET_REQUEST,
      id,
      settings,
    });
  });
});

describe('resetDashboardSettingsSuccess tests', () => {
  test('should create a reset dashboard settings success action', () => {
    const id = 'a1';
    expect(resetDashboardSettingsSuccess(id)).toEqual({
      type: DASHBOARD_SETTINGS_RESET_SUCCESS,
      id,
    });
  });
});

describe('resetDashboardSettingsError tests', () => {
  test('should create a reset dashboard settings error action', () => {
    const id = 'a1';
    const error = 'an error';
    expect(resetDashboardSettingsError(id, error)).toEqual({
      type: DASHBOARD_SETTINGS_RESET_ERROR,
      id,
      error,
    });
  });
});

describe('loadSettings tests', () => {
  test('should load settings successfully', () => {
    const id = 'a1';
    const dispatch = jest.fn();
    const rootState = createRootState();
    const getState = jest.fn().mockReturnValue(rootState);

    const data = {
      foo: 'bar',
    };

    const getSetting = jest.fn().mockReturnValue(Promise.resolve({data}));

    const gmp = {
      dashboard: {
        getSetting,
      },
    };
    const defaultSettings = {
      lorem: 'ipsum',
    };

    expect(isFunction(loadSettings)).toEqual(true);
    return loadSettings(gmp)(id, defaultSettings)(dispatch, getState).then(
      () => {
        expect(dispatch).toHaveBeenCalledTimes(2);
        expect(dispatch.mock.calls[0]).toEqual([
          {
            id,
            type: DASHBOARD_SETTINGS_LOADING_REQUEST,
          },
        ]);
        expect(dispatch.mock.calls[1]).toEqual([
          {
            id,
            settings: data,
            type: DASHBOARD_SETTINGS_LOADING_SUCCESS,
            defaultSettings,
          },
        ]);
        expect(getState).toHaveBeenCalled();
        expect(getSetting).toHaveBeenCalledWith(id);
      },
    );
  });

  test('should not load settings if isLoading is true', () => {
    const id = 'a1';
    const dispatch = jest.fn();
    const rootState = createRootState({
      isLoading: {
        [id]: true,
      },
    });
    const getState = jest.fn().mockReturnValue(rootState);

    const data = {
      foo: 'bar',
    };

    const getSetting = jest.fn().mockReturnValue(Promise.resolve({data}));

    const gmp = {
      dashboard: {
        getSetting,
      },
    };
    const defaults = {
      lorem: 'ipsum',
    };

    expect(isFunction(loadSettings)).toEqual(true);
    return loadSettings(gmp)(id, defaults)(dispatch, getState).then(() => {
      expect(dispatch).toHaveBeenCalledTimes(0);
      expect(getState).toHaveBeenCalled();
      expect(getSetting).not.toHaveBeenCalled();
    });
  });

  test('should fail loading settings with an error', () => {
    const id = 'a1';
    const dispatch = jest.fn();
    const rootState = createRootState();
    const getState = jest.fn().mockReturnValue(rootState);

    const error = 'An error';

    const getSetting = jest.fn().mockReturnValue(Promise.reject(error));

    const gmp = {
      dashboard: {
        getSetting,
      },
    };
    const defaults = {
      lorem: 'ipsum',
    };

    expect(isFunction(loadSettings)).toEqual(true);
    return loadSettings(gmp)(id, defaults)(dispatch, getState).then(() => {
      expect(dispatch).toHaveBeenCalledTimes(2);
      expect(dispatch.mock.calls[0]).toEqual([
        {
          id,
          type: DASHBOARD_SETTINGS_LOADING_REQUEST,
        },
      ]);
      expect(dispatch.mock.calls[1]).toEqual([
        {
          id,
          error,
          type: DASHBOARD_SETTINGS_LOADING_ERROR,
        },
      ]);
      expect(getState).toHaveBeenCalled();
      expect(getSetting).toHaveBeenCalled();
    });
  });
});

describe('saveSettings tests', () => {
  test('should save settings successfully', () => {
    const id = 'a1';
    const dispatch = jest.fn();
    const rootState = createRootState();
    const getState = jest.fn().mockReturnValue(rootState);

    const settings = {
      foo: 'bar',
    };

    const saveSettingsPromise = jest.fn().mockReturnValue(Promise.resolve());

    const gmp = {
      dashboard: {
        saveSetting: saveSettingsPromise,
      },
    };

    expect(isFunction(saveSettings)).toEqual(true);
    return saveSettings(gmp)(id, settings)(dispatch, getState).then(() => {
      expect(dispatch).toHaveBeenCalledTimes(2);
      expect(dispatch).toHaveBeenNthCalledWith(1, {
        id,
        settings,
        type: DASHBOARD_SETTINGS_SAVING_REQUEST,
      });
      expect(dispatch).toHaveBeenNthCalledWith(2, {
        type: DASHBOARD_SETTINGS_SAVING_SUCCESS,
        id,
      });
      expect(getState).not.toHaveBeenCalled();
      expect(saveSettingsPromise).toHaveBeenCalledWith(id, settings);
    });
  });

  test('should fail saving settings', () => {
    const id = 'a1';
    const dispatch = jest.fn();
    const rootState = createRootState();
    const getState = jest.fn().mockReturnValue(rootState);

    const settings = {
      foo: 'bar',
    };

    const error = 'An error';
    const saveSettingsPromise = jest
      .fn()
      .mockReturnValue(Promise.reject(error));

    const gmp = {
      dashboard: {
        saveSetting: saveSettingsPromise,
      },
    };

    expect(isFunction(saveSettings)).toEqual(true);
    return saveSettings(gmp)(id, settings)(dispatch, getState).then(() => {
      expect(dispatch).toHaveBeenCalledTimes(2);
      expect(dispatch).toHaveBeenNthCalledWith(1, {
        id,
        settings,
        type: DASHBOARD_SETTINGS_SAVING_REQUEST,
      });
      expect(dispatch).toHaveBeenNthCalledWith(2, {
        type: DASHBOARD_SETTINGS_SAVING_ERROR,
        error,
        id,
      });
      expect(getState).not.toHaveBeenCalled();
      expect(saveSettingsPromise).toHaveBeenCalledWith(id, settings);
    });
  });
});

describe('resetSettings tests', () => {
  test('should reset settings successfully', () => {
    const id = 'a1';
    const settings = {
      foo: 'bar',
    };

    const dispatch = jest.fn();
    const rootState = createRootState({
      defaults: {
        [id]: settings,
      },
    });
    const getState = jest.fn().mockReturnValue(rootState);

    const saveSettingsPromise = jest.fn().mockReturnValue(Promise.resolve());

    const gmp = {
      dashboard: {
        saveSetting: saveSettingsPromise,
      },
    };

    expect(isFunction(resetSettings)).toEqual(true);
    return resetSettings(gmp)(id)(dispatch, getState).then(() => {
      expect(dispatch).toHaveBeenCalledTimes(2);
      expect(dispatch).toHaveBeenNthCalledWith(1, {
        id,
        settings,
        type: DASHBOARD_SETTINGS_RESET_REQUEST,
      });
      expect(dispatch).toHaveBeenNthCalledWith(2, {
        type: DASHBOARD_SETTINGS_RESET_SUCCESS,
        id,
      });
      expect(getState).toHaveBeenCalled();
      expect(saveSettingsPromise).toHaveBeenCalledWith(id, settings);
    });
  });

  test('should fail resetting settings', () => {
    const id = 'a1';
    const settings = {
      foo: 'bar',
    };

    const dispatch = jest.fn();
    const rootState = createRootState({
      defaults: {
        [id]: settings,
      },
    });
    const getState = jest.fn().mockReturnValue(rootState);

    const error = 'An error';
    const saveSettingsPromise = jest
      .fn()
      .mockReturnValue(Promise.reject(error));

    const gmp = {
      dashboard: {
        saveSetting: saveSettingsPromise,
      },
    };

    expect(isFunction(resetSettings)).toEqual(true);
    return resetSettings(gmp)(id)(dispatch, getState).then(() => {
      expect(dispatch).toHaveBeenCalledTimes(2);
      expect(dispatch).toHaveBeenNthCalledWith(1, {
        id,
        settings,
        type: DASHBOARD_SETTINGS_RESET_REQUEST,
      });
      expect(dispatch).toHaveBeenNthCalledWith(2, {
        type: DASHBOARD_SETTINGS_RESET_ERROR,
        id,
        error,
      });
      expect(getState).toHaveBeenCalled();
      expect(saveSettingsPromise).toHaveBeenCalledWith(id, settings);
    });
  });
});

// vim: set ts=2 sw=2 tw=80:
