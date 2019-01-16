/* Copyright (C) 2018-2019 Greenbone Networks GmbH
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
import {combineReducers} from 'web/store/utils';

import {
  USER_SETTINGS_DEFAULTS_LOADING_ERROR,
  USER_SETTINGS_DEFAULTS_LOADING_REQUEST,
  USER_SETTINGS_DEFAULTS_LOADING_SUCCESS,
} from './actions';

const isLoading = (state = false, action) => {
  switch (action.type) {
    case USER_SETTINGS_DEFAULTS_LOADING_REQUEST:
      return true;
    case USER_SETTINGS_DEFAULTS_LOADING_ERROR:
    case USER_SETTINGS_DEFAULTS_LOADING_SUCCESS:
      return false;
    default:
      return state;
  }
};

const error = (state, action) => {
  switch (action.type) {
    case USER_SETTINGS_DEFAULTS_LOADING_ERROR:
      return action.error;
    case USER_SETTINGS_DEFAULTS_LOADING_SUCCESS:
      return undefined;
    default:
      return state;
  }
};

const byName = (state = {}, action) => {
  switch (action.type) {
    case USER_SETTINGS_DEFAULTS_LOADING_SUCCESS:
      return action.data;
    default:
      return state;
  }
};

const defaults = combineReducers({
  isLoading,
  error,
  byName,
});

export default defaults;

// vim: set ts=2 sw=2 tw=80:
