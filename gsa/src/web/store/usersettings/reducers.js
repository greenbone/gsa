/* Greenbone Security Assistant
 *
 * Authors:
 * Steffen Waterkamp <steffen.waterkamp@greenbone.net>
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
import {combineReducers} from 'web/store/utils';

import defaults from './defaults/reducers';

import {
  USER_SETTINGS_SET_TIMEZONE,
  USER_SETTINGS_SET_LOCALE,
  USER_SETTINGS_SET_USERNAME,
} from 'web/store/usersettings/actions';

export const timezone = (state, action) => {
  switch (action.type) {
    case USER_SETTINGS_SET_TIMEZONE:
      return action.timezone;
    default:
      return state;
  }
};

export const locale = (state, action) => {
  switch (action.type) {
    case USER_SETTINGS_SET_LOCALE:
      return action.locale;
    default:
      return state;
  }
};

export const username = (state, action) => {
  switch (action.type) {
    case USER_SETTINGS_SET_USERNAME:
      return action.username;
    default:
      return state;
  }
};

const userSettings = combineReducers({
  defaults,
  locale,
  timezone,
  username,
});

export default userSettings;
