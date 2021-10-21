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

import moment from 'gmp/models/date';

import {isFunction} from 'gmp/utils/identity';

import {
  getReportComposerDefaultsAction,
  loadReportComposerDefaults,
  saveReportComposerDefaults,
  setIsLoggedIn,
  setLocale,
  setSessionTimeout,
  setTimezone,
  setUsername,
  renewSessionTimeout,
  updateTimezone,
  USER_SETTINGS_LOAD_REPORT_COMPOSER_DEFAULTS_SUCCESS,
  USER_SETTINGS_SET_LOCALE,
  USER_SETTINGS_SET_SESSION_TIMEOUT,
  USER_SETTINGS_SET_TIMEZONE,
  USER_SETTINGS_SET_USERNAME,
  USER_SETTINGS_SET_LOGGED_IN,
} from '../actions';

describe('settings actions tests', () => {
  test('should create a setLocale action', () => {
    expect(setLocale('de')).toEqual({
      type: USER_SETTINGS_SET_LOCALE,
      locale: 'de',
    });
  });

  test('should create a setTimezone action', () => {
    expect(setTimezone('cet')).toEqual({
      type: USER_SETTINGS_SET_TIMEZONE,
      timezone: 'cet',
    });
  });

  test('should create a setUsername action', () => {
    expect(setUsername('foo')).toEqual({
      type: USER_SETTINGS_SET_USERNAME,
      username: 'foo',
    });
  });

  test('should create a setSessionTimeout action', () => {
    expect(setSessionTimeout('12345')).toEqual({
      type: USER_SETTINGS_SET_SESSION_TIMEOUT,
      timeout: '12345',
    });
  });

  test('should create setIsLoggedIn action', () => {
    expect(setIsLoggedIn(true)).toEqual({
      type: USER_SETTINGS_SET_LOGGED_IN,
      isLoggedIn: true,
    });
    expect(setIsLoggedIn(false)).toEqual({
      type: USER_SETTINGS_SET_LOGGED_IN,
      isLoggedIn: false,
    });
    expect(setIsLoggedIn('foo')).toEqual({
      type: USER_SETTINGS_SET_LOGGED_IN,
      isLoggedIn: false,
    });
  });

  test('should create report composer defaults loading success action', () => {
    const action = getReportComposerDefaultsAction({foo: 'bar'});
    expect(action).toEqual({
      type: USER_SETTINGS_LOAD_REPORT_COMPOSER_DEFAULTS_SUCCESS,
      data: {foo: 'bar'},
    });
  });

  test('should update timezone', () => {
    const dispatch = jest.fn();
    const gmp = {
      setTimezone: jest.fn(),
    };
    return updateTimezone(gmp)('cet')(dispatch).then(() => {
      expect(dispatch).toBeCalledWith({
        type: USER_SETTINGS_SET_TIMEZONE,
        timezone: 'cet',
      });
      expect(gmp.setTimezone).toBeCalledWith('cet');
    });
  });

  test('should renew the session timeout', () => {
    const dispatch = jest.fn();
    const sessionTimeout = moment().add(1, 'day');

    const renewSession = jest.fn().mockReturnValue(
      Promise.resolve({
        data: sessionTimeout,
      }),
    );

    const gmp = {
      user: {
        renewSession,
      },
    };
    return renewSessionTimeout(gmp)()(dispatch).then(() => {
      expect(dispatch).toBeCalledWith({
        type: USER_SETTINGS_SET_SESSION_TIMEOUT,
        timeout: sessionTimeout,
      });
      expect(renewSession).toBeCalled();
    });
  });

  describe('loadReportComposerDefaults tests', () => {
    test('should dispatch success actions', () => {
      const dispatch = jest.fn();

      const data = {foo: 'bar'};
      const getReportComposerDefaults = jest
        .fn()
        .mockReturnValue(Promise.resolve({data}));

      const gmp = {
        user: {
          getReportComposerDefaults,
        },
      };

      expect(isFunction(loadReportComposerDefaults)).toBe(true);

      return loadReportComposerDefaults(gmp)()(dispatch).then(() => {
        expect(getReportComposerDefaults).toBeCalled();
        expect(dispatch).toHaveBeenCalledWith({
          type: USER_SETTINGS_LOAD_REPORT_COMPOSER_DEFAULTS_SUCCESS,
          data,
        });
      });
    });
  });

  describe('saveReportComposerDefaults tests', () => {
    test('should dispatch success actions', () => {
      const dispatch = jest.fn();

      const data = {foo: 'bar'};
      const saveReportComposerDefaultsMock = jest
        .fn()
        .mockReturnValue(Promise.resolve({data}));

      const gmp = {
        user: {
          saveReportComposerDefaults: saveReportComposerDefaultsMock,
        },
      };

      const defaults = {fake: 'someDefaults'};

      expect(isFunction(saveReportComposerDefaults)).toBe(true);

      return saveReportComposerDefaults(gmp)(defaults)(dispatch).then(() => {
        expect(saveReportComposerDefaultsMock).toHaveBeenCalledWith(defaults);
        expect(dispatch).toHaveBeenCalledWith({
          type: USER_SETTINGS_LOAD_REPORT_COMPOSER_DEFAULTS_SUCCESS,
          data: defaults,
        });
      });
    });
  });
});

// vim: set ts=2 sw=2 tw=80:
