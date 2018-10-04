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

import {isFunction} from 'gmp/utils/identity';

import {DEFAULT_ROW_HEIGHT} from 'web/components/sortable/utils';

import {
  DASHBOARD_SETTINGS_LOADING_ERROR,
  DASHBOARD_SETTINGS_LOADING_REQUEST,
  DASHBOARD_SETTINGS_LOADING_SUCCESS,
  DASHBOARD_SETTINGS_SAVING_REQUEST,
  DASHBOARD_SETTINGS_SAVING_SUCCESS,
  DASHBOARD_SETTINGS_SAVING_ERROR,
  receivedDashboardSettings,
  requestDashboardSettings,
  receivedDashboardSettingsLoadingError,
  saveDashboardSettings,
  savedDashboardSettings,
  saveDashboardSettingsError,
  loadSettings,
  saveSettings,
  resetSettings,
  canAddDisplay,
  addDisplayToSettings,
} from '../actions';

const createRootState = (state = {byId: {}}) => ({
  dashboardSettings: {
    ...state,
  },
});

describe('dashboard settings action tests', () => {

  test('should create an action to request dashboard settings', () => {
    const id = 'a1';
    const defaults = {abc: 'def'};

    expect(requestDashboardSettings(id, defaults)).toEqual({
      defaults,
      id,
      type: DASHBOARD_SETTINGS_LOADING_REQUEST,
    });
  });

  test('should create an action after receiving dashboard settings', () => {
    const id = 'a1';
    const data = {foo: 'bar'};
    const settings = {
      items: data,
    };

    expect(receivedDashboardSettings(id, settings)).toEqual({
      settings,
      id,
      type: DASHBOARD_SETTINGS_LOADING_SUCCESS,
    });
  });

  test('should create an action to receive an error during loading', () => {
    const error = 'An error occured';
    const id = 'a1';

    expect(receivedDashboardSettingsLoadingError(id, error)).toEqual({
      error,
      id,
      type: DASHBOARD_SETTINGS_LOADING_ERROR,
    });
  });

  test('should create an action to save dashboard settings', () => {
    const id = 'a1';
    const items = ['a', 'b'];
    const settings = {
      items,
    };

    expect(saveDashboardSettings(id, settings)).toEqual({
      type: DASHBOARD_SETTINGS_SAVING_REQUEST,
      id,
      settings,
    });
  });

  test('should create an action after dashboard settings have been saved', () => {
    expect(savedDashboardSettings()).toEqual({
      type: DASHBOARD_SETTINGS_SAVING_SUCCESS,
    });
  });

  test('should create an action if an error has occurred during saving', () => {
    const error = 'An error';

    expect(saveDashboardSettingsError(error)).toEqual({
      type: DASHBOARD_SETTINGS_SAVING_ERROR,
      error,
    });
  });

});

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

describe('loadSettings tests', () => {

  test('should load settings successfully', () => {
    const id = 'a1';
    const dispatch = jest.fn();
    const rootState = createRootState();
    const getState = jest
      .fn()
      .mockReturnValue(rootState);

    const data = {
      foo: 'bar',
    };

    const currentSettings = jest
      .fn()
      .mockReturnValue(Promise.resolve({data}));

    const gmp = {
      dashboards: {
        currentSettings,
      },
    };
    const defaults = {
      lorem: 'ipsum',
    };

    expect(isFunction(loadSettings)).toEqual(true);
    return loadSettings(gmp)(id, defaults)(dispatch, getState).then(() => {
      expect(dispatch).toHaveBeenCalledTimes(2);
      expect(dispatch.mock.calls[0]).toEqual([{
        id,
        defaults,
        type: DASHBOARD_SETTINGS_LOADING_REQUEST,
      }]);
      expect(dispatch.mock.calls[1]).toEqual([{
        id,
        settings: data,
        type: DASHBOARD_SETTINGS_LOADING_SUCCESS,
      }]);
      expect(getState).toHaveBeenCalled();
      expect(currentSettings).toHaveBeenCalled();
    });
  });

  test('should not load settings if isLoading is true', () => {
    const id = 'a1';
    const dispatch = jest.fn();
    const rootState = createRootState({
      isLoading: true,
    });
    const getState = jest
      .fn()
      .mockReturnValue(rootState);

    const data = {
      foo: 'bar',
    };

    const currentSettings = jest
      .fn()
      .mockReturnValue(Promise.resolve({data}));

    const gmp = {
      dashboards: {
        currentSettings,
      },
    };
    const defaults = {
      lorem: 'ipsum',
    };

    expect(isFunction(loadSettings)).toEqual(true);
    return loadSettings(gmp)(id, defaults)(dispatch, getState).then(() => {
      expect(dispatch).toHaveBeenCalledTimes(0);
      expect(getState).toHaveBeenCalled();
      expect(currentSettings).not.toHaveBeenCalled();
    });
  });

  test('should fail loading settings with an error', () => {
    const id = 'a1';
    const dispatch = jest.fn();
    const rootState = createRootState();
    const getState = jest
      .fn()
      .mockReturnValue(rootState);

    const error = 'An error';

    const currentSettings = jest
      .fn()
      .mockReturnValue(Promise.reject(error));

    const gmp = {
      dashboards: {
        currentSettings,
      },
    };
    const defaults = {
      lorem: 'ipsum',
    };

    expect(isFunction(loadSettings)).toEqual(true);
    return loadSettings(gmp)(id, defaults)(dispatch, getState).then(() => {
      expect(dispatch).toHaveBeenCalledTimes(2);
      expect(dispatch.mock.calls[0]).toEqual([{
        id,
        defaults,
        type: DASHBOARD_SETTINGS_LOADING_REQUEST,
      }]);
      expect(dispatch.mock.calls[1]).toEqual([{
        id,
        error,
        type: DASHBOARD_SETTINGS_LOADING_ERROR,
      }]);
      expect(getState).toHaveBeenCalled();
      expect(currentSettings).toHaveBeenCalled();
    });
  });

});

describe('saveSettings tests', () => {

  test('should save settings successfully', () => {
    const id = 'a1';
    const dispatch = jest.fn();
    const rootState = createRootState();
    const getState = jest
      .fn()
      .mockReturnValue(rootState);

    const settings = {
      foo: 'bar',
    };

    const saveSettingsPromise = jest
      .fn()
      .mockReturnValue(Promise.resolve());

    const gmp = {
      dashboard: {
        saveSetting: saveSettingsPromise,
      },
    };

    expect(isFunction(saveSettings)).toEqual(true);
    return saveSettings(gmp)(id, settings)(dispatch, getState).then(() => {
      expect(dispatch).toHaveBeenCalledTimes(2);
      expect(dispatch.mock.calls[0]).toEqual([{
        id,
        settings,
        type: DASHBOARD_SETTINGS_SAVING_REQUEST,
      }]);
      expect(dispatch.mock.calls[1]).toEqual([{
        type: DASHBOARD_SETTINGS_SAVING_SUCCESS,
      }]);
      expect(getState).not.toHaveBeenCalled();
      expect(saveSettingsPromise).toHaveBeenCalledWith(id, settings);
    });
  });

  test('should fail saving settings', () => {
    const id = 'a1';
    const dispatch = jest.fn();
    const rootState = createRootState();
    const getState = jest
      .fn()
      .mockReturnValue(rootState);

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
      expect(dispatch.mock.calls[0]).toEqual([{
        id,
        settings,
        type: DASHBOARD_SETTINGS_SAVING_REQUEST,
      }]);
      expect(dispatch.mock.calls[1]).toEqual([{
        type: DASHBOARD_SETTINGS_SAVING_ERROR,
        error,
      }]);
      expect(getState).not.toHaveBeenCalled();
      expect(saveSettingsPromise).toHaveBeenCalledWith(id, settings);
    });
  });

});

describe('resetSttings tests', () => {

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
    const getState = jest
      .fn()
      .mockReturnValue(rootState);

    const saveSettingsPromise = jest
      .fn()
      .mockReturnValue(Promise.resolve());

    const gmp = {
      dashboard: {
        saveSetting: saveSettingsPromise,
      },
    };

    expect(isFunction(resetSettings)).toEqual(true);
    return resetSettings(gmp)(id)(dispatch, getState).then(() => {
      expect(dispatch).toHaveBeenCalledTimes(2);
      expect(dispatch.mock.calls[0]).toEqual([{
        id,
        settings,
        type: DASHBOARD_SETTINGS_SAVING_REQUEST,
      }]);
      expect(dispatch.mock.calls[1]).toEqual([{
        type: DASHBOARD_SETTINGS_SAVING_SUCCESS,
      }]);
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
    const getState = jest
      .fn()
      .mockReturnValue(rootState);

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
      expect(dispatch.mock.calls[0]).toEqual([{
        id,
        settings,
        type: DASHBOARD_SETTINGS_SAVING_REQUEST,
      }]);
      expect(dispatch.mock.calls[1]).toEqual([{
        type: DASHBOARD_SETTINGS_SAVING_ERROR,
        error,
      }]);
      expect(getState).toHaveBeenCalled();
      expect(saveSettingsPromise).toHaveBeenCalledWith(id, settings);
    });
  });

});

// vim: set ts=2 sw=2 tw=80:
