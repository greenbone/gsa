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
import moment from 'gmp/models/date';

import {
  setLocale,
  setSessionTimeout,
  setTimezone,
  setUsername,
  renewSessionTimeout,
  updateTimezone,
  USER_SETTINGS_SET_LOCALE,
  USER_SETTINGS_SET_SESSION_TIMEOUT,
  USER_SETTINGS_SET_TIMEZONE,
  USER_SETTINGS_SET_USERNAME,
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

    const renewSession = jest.fn().mockReturnValue(Promise.resolve({
      data: sessionTimeout,
    }));

    const gmp = {
      user: {
        renewSession,
      },
    };
    return renewSessionTimeout({gmp})(dispatch).then(() => {
      expect(dispatch).toBeCalledWith({
        type: USER_SETTINGS_SET_SESSION_TIMEOUT,
        timeout: sessionTimeout,
      });
      expect(renewSession).toBeCalled();
    });
  });

});

// vim: set ts=2 sw=2 tw=80:
