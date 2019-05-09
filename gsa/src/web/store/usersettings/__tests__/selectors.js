/* Copyright (C) 2018 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
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

import {
  getLocale,
  getReportComposerDefaults,
  getSessionTimeout,
  getTimezone,
  getUsername,
  isLoggedIn,
} from '../selectors';

const createRootState = state => ({
  userSettings: state,
});

describe('settings selectors tests', () => {
  describe('getTimezone tests', () => {
    test('should return undefined timezone for empty state', () => {
      const state = createRootState({});
      expect(getTimezone(state)).toBeUndefined();
    });

    test('should return timezone', () => {
      const state = createRootState({timezone: 'cet'});
      expect(getTimezone(state)).toEqual('cet');
    });
  });

  describe('getLocale tests', () => {
    test('should return undefined locale for empty state', () => {
      const state = createRootState({});
      expect(getLocale(state)).toBeUndefined();
    });

    test('should return locale', () => {
      const state = createRootState({locale: 'de'});
      expect(getLocale(state)).toEqual('de');
    });
  });

  describe('getUsername tests', () => {
    test('should return undefined username for empty state', () => {
      const state = createRootState({});
      expect(getUsername(state)).toBeUndefined();
    });

    test('should return username', () => {
      const state = createRootState({username: 'foo'});
      expect(getUsername(state)).toEqual('foo');
    });
  });

  describe('getSessionTimeout tests', () => {
    test('should return undefined session timeout for empty state', () => {
      const state = createRootState({});
      expect(getSessionTimeout(state)).toBeUndefined();
    });

    test('should return session timeout', () => {
      const state = createRootState({sessionTimeout: '1234'});
      expect(getSessionTimeout(state)).toEqual('1234');
    });
  });

  describe('getReportComposerDetaults tests', () => {
    test('should return undefined reportComposerDefaults for empty state', () => {
      const state = createRootState({});
      expect(getReportComposerDefaults(state)).toBeUndefined();
    });

    test('should return reportComposerDefaults', () => {
      const state = createRootState({reportComposerDefaults: {foo: 'bar'}});
      expect(getReportComposerDefaults(state)).toEqual({foo: 'bar'});
    });
  });

  describe('isLoggedIn tests', () => {
    test('should return false for empty state', () => {
      const state = createRootState({});
      expect(isLoggedIn(state)).toEqual(false);
    });

    test('should return false', () => {
      const state = createRootState({
        isLoggedIn: false,
      });
      expect(isLoggedIn(state)).toEqual(false);
    });

    test('should return false for non bool value', () => {
      const state = createRootState({
        isLoggedIn: 'foo',
      });
      expect(isLoggedIn(state)).toEqual(false);
    });

    test('should return true', () => {
      const state = createRootState({
        isLoggedIn: true,
      });
      expect(isLoggedIn(state)).toEqual(true);
    });
  });
});
