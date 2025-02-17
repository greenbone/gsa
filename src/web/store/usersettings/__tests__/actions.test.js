/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
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
    const dispatch = testing.fn();
    const gmp = {
      setTimezone: testing.fn(),
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
    const dispatch = testing.fn();
    const sessionTimeout = moment().add(1, 'day');

    const renewSession = testing.fn().mockReturnValue(
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
      const dispatch = testing.fn();

      const data = {foo: 'bar'};
      const getReportComposerDefaults = testing
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
      const dispatch = testing.fn();

      const data = {foo: 'bar'};
      const saveReportComposerDefaultsMock = testing
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
