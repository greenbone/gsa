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
import {
  loadingActions,
  USER_SETTINGS_DEFAULTS_LOADING_REQUEST,
  USER_SETTINGS_DEFAULTS_LOADING_SUCCESS,
  USER_SETTINGS_DEFAULTS_LOADING_ERROR,
  loadUserSettingDefault,
  loadUserSettingDefaults,
} from '../actions';
import {isFunction} from 'gmp/utils/identity';

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
      const dispatch = jest.fn();
      const getState = jest.fn().mockReturnValue({
        userSettings: {
          defaults: {
            isLoading: true,
          },
        },
      });

      const currentSettings = jest.fn().mockReturnValue(
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
      const dispatch = jest.fn();
      const getState = jest.fn().mockReturnValue({
        userSettings: {
          defaults: {
            isLoading: false,
          },
        },
      });

      const data = {foo: 'bar'};
      const currentSettings = jest
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
      const dispatch = jest.fn();
      const getState = jest.fn().mockReturnValue({
        userSettings: {
          defaults: {
            isLoading: false,
          },
        },
      });

      const currentSettings = jest
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
      const dispatch = jest.fn();
      const getState = jest.fn().mockReturnValue({
        userSettings: {
          defaults: {
            isLoading: true,
          },
        },
      });

      const getSetting = jest.fn().mockReturnValue(
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
      const dispatch = jest.fn();
      const getState = jest.fn().mockReturnValue({
        userSettings: {
          defaults: {
            isLoading: false,
          },
        },
      });

      const data = {_id: '123', name: 'Rows Per Page', value: 42};
      const getSetting = jest.fn().mockReturnValue(Promise.resolve({data}));

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
      const dispatch = jest.fn();
      const getState = jest.fn().mockReturnValue({
        userSettings: {
          defaults: {
            isLoading: false,
          },
        },
      });

      const getSetting = jest.fn().mockReturnValue(Promise.reject('An Error'));

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

// vim: set ts=2 sw=2 tw=80:
