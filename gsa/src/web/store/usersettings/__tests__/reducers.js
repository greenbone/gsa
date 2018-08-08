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
import {setTimezone, setLocale} from '../actions';
import {timezone, locale} from '../reducers';

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
});
