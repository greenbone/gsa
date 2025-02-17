/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {isFunction} from 'gmp/utils/identity';

import {
  loadingActions,
  USER_SETTINGS_DEFAULTS_LOADING_REQUEST,
  USER_SETTINGS_DEFAULTS_LOADING_SUCCESS,
  USER_SETTINGS_DEFAULTS_LOADING_ERROR,
  loadUserSettingDefault,
  loadUserSettingDefaults,
} from '../actions';

describe('UserSettings Defaults action tests', () => {
  describe('action creator tests', () => {
    test('should create a loading request action', () => {
      const action = loadingActions.request();
      expect(action).toEqual({
        type: USER_SETTINGS_DEFAULTS_LOADING_REQUEST,
      });
    });

    test('should create a loading success action', () => {
      const action = loadingActions.success({foo: 'bar'});
      expect(action).toEqual({
        type: USER_SETTINGS_DEFAULTS_LOADING_SUCCESS,
        data: {foo: 'bar'},
      });
    });

    test('should create a loading error action', () => {
      const action = loadingActions.error('An Error');
      expect(action).toEqual({
        type: USER_SETTINGS_DEFAULTS_LOADING_ERROR,
        error: 'An Error',
      });
    });
  });

  describe('loadUserSettingDefaults tests', () => {
    test('should not dispatch an action if isLoading is true', () => {
      const dispatch = testing.fn();
      const getState = testing.fn().mockReturnValue({
        userSettings: {
          defaults: {
            isLoading: true,
          },
        },
      });

      const currentSettings = testing.fn().mockReturnValue(
        Promise.resolve({
          foo: 'bar',
        }),
      );
      const gmp = {
        user: {
          currentSettings,
        },
      };

      expect(isFunction(loadUserSettingDefaults)).toBe(true);

      return loadUserSettingDefaults(gmp)()(dispatch, getState).then(() => {
        expect(getState).toBeCalled();
        expect(dispatch).not.toBeCalled();
        expect(currentSettings).not.toBeCalled();
      });
    });

    test('should dispatch request and success actions', () => {
      const dispatch = testing.fn();
      const getState = testing.fn().mockReturnValue({
        userSettings: {
          defaults: {
            isLoading: false,
          },
        },
      });

      const data = {foo: 'bar'};
      const currentSettings = testing
        .fn()
        .mockReturnValue(Promise.resolve({data}));

      const gmp = {
        user: {
          currentSettings,
        },
      };

      expect(isFunction(loadUserSettingDefaults)).toBe(true);

      return loadUserSettingDefaults(gmp)()(dispatch, getState).then(() => {
        expect(getState).toBeCalled();
        expect(currentSettings).toBeCalled();
        expect(dispatch).toHaveBeenCalledTimes(2);
        expect(dispatch.mock.calls[0]).toEqual([
          {
            type: USER_SETTINGS_DEFAULTS_LOADING_REQUEST,
          },
        ]);
        expect(dispatch.mock.calls[1]).toEqual([
          {
            type: USER_SETTINGS_DEFAULTS_LOADING_SUCCESS,
            data,
          },
        ]);
      });
    });

    test('should dispatch request and error actions', () => {
      const dispatch = testing.fn();
      const getState = testing.fn().mockReturnValue({
        userSettings: {
          defaults: {
            isLoading: false,
          },
        },
      });

      const currentSettings = testing
        .fn()
        .mockReturnValue(Promise.reject('An Error'));

      const gmp = {
        user: {
          currentSettings,
        },
      };

      expect(isFunction(loadUserSettingDefaults)).toBe(true);

      return loadUserSettingDefaults(gmp)()(dispatch, getState).then(() => {
        expect(getState).toBeCalled();
        expect(currentSettings).toBeCalled();
        expect(dispatch).toHaveBeenCalledTimes(2);
        expect(dispatch.mock.calls[0]).toEqual([
          {
            type: USER_SETTINGS_DEFAULTS_LOADING_REQUEST,
          },
        ]);
        expect(dispatch.mock.calls[1]).toEqual([
          {
            type: USER_SETTINGS_DEFAULTS_LOADING_ERROR,
            error: 'An Error',
          },
        ]);
      });
    });
  });

  describe('loadUserSettingDefault tests', () => {
    test('should not dispatch an action if isLoading is true', () => {
      const dispatch = testing.fn();
      const getState = testing.fn().mockReturnValue({
        userSettings: {
          defaults: {
            isLoading: true,
          },
        },
      });

      const getSetting = testing.fn().mockReturnValue(
        Promise.resolve({
          id: '42',
          name: 'Rows Per Page',
        }),
      );
      const gmp = {
        user: {
          getSetting,
        },
      };

      expect(isFunction(loadUserSettingDefault)).toBe(true);

      return loadUserSettingDefault(gmp)('42')(dispatch, getState).then(() => {
        expect(getState).toBeCalled();
        expect(dispatch).not.toBeCalled();
        expect(getSetting).not.toBeCalled();
      });
    });

    test('should dispatch request and success actions', () => {
      const dispatch = testing.fn();
      const getState = testing.fn().mockReturnValue({
        userSettings: {
          defaults: {
            isLoading: false,
          },
        },
      });

      const data = {_id: '123', name: 'Rows Per Page', value: 42};
      const getSetting = testing.fn().mockReturnValue(Promise.resolve({data}));

      const gmp = {
        user: {
          getSetting,
        },
      };
      expect(isFunction(loadUserSettingDefault)).toBe(true);

      return loadUserSettingDefault(gmp)('123')(dispatch, getState).then(() => {
        expect(getState).toBeCalled();
        expect(getSetting).toBeCalled();
        expect(dispatch).toHaveBeenCalledTimes(2);

        expect(dispatch.mock.calls[0]).toEqual([
          {
            type: USER_SETTINGS_DEFAULTS_LOADING_REQUEST,
          },
        ]);
        expect(dispatch.mock.calls[1][0].data).toBeDefined();
        expect(dispatch.mock.calls[1][0].type).toEqual(
          USER_SETTINGS_DEFAULTS_LOADING_SUCCESS,
        );
        expect(dispatch.mock.calls[1][0].data.rowsperpage).toEqual(data);
      });
    });

    test('should dispatch request and error actions', () => {
      const dispatch = testing.fn();
      const getState = testing.fn().mockReturnValue({
        userSettings: {
          defaults: {
            isLoading: false,
          },
        },
      });

      const getSetting = testing
        .fn()
        .mockReturnValue(Promise.reject('An Error'));

      const gmp = {
        user: {
          getSetting,
        },
      };
      expect(isFunction(loadUserSettingDefault)).toBe(true);

      return loadUserSettingDefault(gmp)('123')(dispatch, getState).then(() => {
        expect(getState).toBeCalled();
        expect(getSetting).toBeCalled();
        expect(dispatch).toHaveBeenCalledTimes(2);

        expect(dispatch.mock.calls[0]).toEqual([
          {
            type: USER_SETTINGS_DEFAULTS_LOADING_REQUEST,
          },
        ]);
        expect(dispatch.mock.calls[1]).toEqual([
          {
            type: USER_SETTINGS_DEFAULTS_LOADING_ERROR,
            error: 'An Error',
          },
        ]);
      });
    });
  });
});
