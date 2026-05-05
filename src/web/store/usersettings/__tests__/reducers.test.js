/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import {
  getReportComposerDefaultsAction,
  setLocale,
  setSessionTimeout,
  setTimezone,
} from 'web/store/usersettings/actions';
import {
  locale,
  reportComposerDefaults,
  sessionTimeout,
  timezone,
} from 'web/store/usersettings/reducers';

describe('settings reducers tests', () => {
  describe('timezone reducer tests', () => {
    test('should create initial state', () => {
      expect(timezone(undefined, {})).toBeUndefined();
    });

    test('should reduce timezone action', () => {
      const action = setTimezone('cet');
      expect(timezone(undefined, action)).toEqual('cet');
    });

    test('should override timezone in state', () => {
      const action = setTimezone('cet');
      expect(timezone('foo', action)).toEqual('cet');
    });
  });

  describe('locale reducer tests', () => {
    test('should create initial state', () => {
      expect(locale(undefined, {})).toBeUndefined();
    });

    test('should reduce locale action', () => {
      const action = setLocale('de');
      expect(locale(undefined, action)).toEqual('de');
    });

    test('should override locale in state', () => {
      const action = setLocale('de');
      expect(locale('foo', action)).toEqual('de');
    });
  });

  describe('sessionTimeout reducer tests', () => {
    test('should create initial state', () => {
      expect(sessionTimeout(undefined, {})).toBeUndefined();
    });

    test('should reduce username action', () => {
      const action = setSessionTimeout('1234');
      expect(sessionTimeout(undefined, action)).toEqual('1234');
    });

    test('should override username in state', () => {
      const action = setSessionTimeout('1234');
      expect(sessionTimeout('54321', action)).toEqual('1234');
    });
  });

  describe('reportComposerDefaults reducer tests', () => {
    test('should create initial empty state', () => {
      expect(reportComposerDefaults(undefined, {})).toEqual({});
    });

    test('should reduce reportComposerDefaults success action', () => {
      const action = getReportComposerDefaultsAction({foo: 'bar'});
      expect(reportComposerDefaults(undefined, action)).toEqual({foo: 'bar'});
    });

    test('should merge existing defaults', () => {
      const action = getReportComposerDefaultsAction({foo: 'bar'});
      const state = {
        foo: 'ipsum',
        toBe: 'preserved',
      };
      const res = {
        foo: 'bar',
        toBe: 'preserved',
      };
      expect(reportComposerDefaults(state, action)).toEqual(res);
    });
  });
});
