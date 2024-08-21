/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */


import {combineReducers} from 'web/store/utils';

import defaults from './defaults/reducers';
import defaultFilters from './defaultfilters/reducers';

import {
  USER_SETTINGS_LOAD_REPORT_COMPOSER_DEFAULTS_SUCCESS,
  USER_SETTINGS_SET_TIMEZONE,
  USER_SETTINGS_SET_LOCALE,
  USER_SETTINGS_SET_USERNAME,
  USER_SETTINGS_SET_SESSION_TIMEOUT,
  USER_SETTINGS_SET_LOGGED_IN,
} from 'web/store/usersettings/actions';

export const reportComposerDefaults = (state = {}, action) => {
  switch (action.type) {
    case USER_SETTINGS_LOAD_REPORT_COMPOSER_DEFAULTS_SUCCESS:
      return {
        ...state,
        ...action.data,
      };
    default:
      return state;
  }
};

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

export const sessionTimeout = (state, action) => {
  switch (action.type) {
    case USER_SETTINGS_SET_SESSION_TIMEOUT:
      return action.timeout;
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

export const isLoggedIn = (state = false, action) => {
  switch (action.type) {
    case USER_SETTINGS_SET_LOGGED_IN:
      return action.isLoggedIn;
    default:
      return state;
  }
};

const userSettings = combineReducers({
  defaults,
  defaultFilters,
  isLoggedIn,
  locale,
  reportComposerDefaults,
  sessionTimeout,
  timezone,
  username,
});

export default userSettings;
