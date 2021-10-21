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
import {CLEAR_STORE} from 'web/store/actions';

import {
  getReportComposerDefaultsAction,
  setIsLoggedIn,
  setLocale,
  setSessionTimeout,
  setTimezone,
  setUsername,
} from '../actions';
import {
  isLoggedIn,
  locale,
  reportComposerDefaults,
  sessionTimeout,
  timezone,
  username,
} from '../reducers';

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

  describe('username reducer tests', () => {
    test('should create initial state', () => {
      expect(username(undefined, {})).toBeUndefined();
    });

    test('should reduce username action', () => {
      const action = setUsername('foo');
      expect(username(undefined, action)).toEqual('foo');
    });

    test('should override username in state', () => {
      const action = setUsername('foo');
      expect(username('bar', action)).toEqual('foo');
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

  describe('isLoggedIn tests', () => {
    test('should create initial state', () => {
      expect(isLoggedIn(undefined, {})).toEqual(false);
    });

    test('should reduce false if store is cleared', () => {
      const action = {type: CLEAR_STORE};
      expect(isLoggedIn(undefined, action)).toEqual(false);
    });

    test('should reduce false', () => {
      const action = setIsLoggedIn(false);
      expect(isLoggedIn(undefined, action)).toEqual(false);
    });

    test('should reduce true', () => {
      const action = setIsLoggedIn(true);
      expect(isLoggedIn(undefined, action)).toEqual(true);
    });

    test('should override state', () => {
      const action = setIsLoggedIn(false);
      expect(isLoggedIn(true, action)).toEqual(false);
    });
  });
});
