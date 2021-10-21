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
    case USER_SETTINGS_DEFAULTS_LOADING_SUCCESS: {
      const {data} = action;
      return {...state, ...data};
    }
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
