/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {
  USER_SETTINGS_DEFAULT_FILTER_LOADING_ERROR,
  USER_SETTINGS_DEFAULT_FILTER_LOADING_REQUEST,
  USER_SETTINGS_DEFAULT_FILTER_LOADING_SUCCESS,
  USER_SETTINGS_DEFAULT_FILTER_OPTIMISTIC_UPDATE,
} from 'web/store/usersettings/defaultfilters/actions';
import {combineReducers} from 'web/store/utils';

const isLoading = (state = false, action) => {
  switch (action.type) {
    case USER_SETTINGS_DEFAULT_FILTER_LOADING_REQUEST:
      return true;
    case USER_SETTINGS_DEFAULT_FILTER_LOADING_SUCCESS:
    case USER_SETTINGS_DEFAULT_FILTER_LOADING_ERROR:
    case USER_SETTINGS_DEFAULT_FILTER_OPTIMISTIC_UPDATE:
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
    case USER_SETTINGS_DEFAULT_FILTER_OPTIMISTIC_UPDATE:
      return undefined;
    default:
      return state;
  }
};

const filter = (state, action) => {
  switch (action.type) {
    case USER_SETTINGS_DEFAULT_FILTER_LOADING_SUCCESS:
      return action.filter;
    case USER_SETTINGS_DEFAULT_FILTER_OPTIMISTIC_UPDATE: {
      return action.filter;
    }
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
    case USER_SETTINGS_DEFAULT_FILTER_OPTIMISTIC_UPDATE:
      return {
        ...state,
        [action.entityType]: combined(state[action.entityType], action),
      };
    default:
      return state;
  }
};

export default reducer;
