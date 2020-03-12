/* Copyright (C) 2019-2020 Greenbone Networks GmbH
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
  USER_SETTINGS_DEFAULT_FILTER_LOADING_ERROR,
  USER_SETTINGS_DEFAULT_FILTER_LOADING_REQUEST,
  USER_SETTINGS_DEFAULT_FILTER_LOADING_SUCCESS,
} from './actions';

const isLoading = (state = false, action) => {
  switch (action.type) {
    case USER_SETTINGS_DEFAULT_FILTER_LOADING_REQUEST:
      return true;
    case USER_SETTINGS_DEFAULT_FILTER_LOADING_SUCCESS:
    case USER_SETTINGS_DEFAULT_FILTER_LOADING_ERROR:
      return false;
    default:
      return state;
  }
};

const error = (state, action) => {
  switch (action.type) {
    case USER_SETTINGS_DEFAULT_FILTER_LOADING_ERROR:
      return action.error;
    case USER_SETTINGS_DEFAULT_FILTER_LOADING_SUCCESS:
      return undefined;
    default:
      return state;
  }
};

const filter = (state, action) => {
  switch (action.type) {
    case USER_SETTINGS_DEFAULT_FILTER_LOADING_SUCCESS:
      return action.filter;
    default:
      return state;
  }
};

const combined = combineReducers({
  filter,
  error,
  isLoading,
});

const reducer = (state = {}, action) => {
  switch (action.type) {
    case USER_SETTINGS_DEFAULT_FILTER_LOADING_SUCCESS:
    case USER_SETTINGS_DEFAULT_FILTER_LOADING_ERROR:
    case USER_SETTINGS_DEFAULT_FILTER_LOADING_REQUEST:
      return {
        ...state,
        [action.entityType]: combined(state[action.entityType], action),
      };
    default:
      return state;
  }
};

export default reducer;
