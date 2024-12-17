/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {transformSettingName} from 'gmp/commands/users';
import {isDefined} from 'gmp/utils/identity';

import {getUserSettingsDefaults} from './selectors';

export const USER_SETTINGS_DEFAULTS_LOADING_REQUEST =
  'USER_SETTINGS_DEFAULTS_LOADING_REQUEST';
export const USER_SETTINGS_DEFAULTS_LOADING_SUCCESS =
  'USER_SETTINGS_DEFAULTS_LOADING_SUCCESS';
export const USER_SETTINGS_DEFAULTS_LOADING_ERROR =
  'USER_SETTINGS_DEFAULTS_LOADING_ERROR';

export const loadingActions = {
  request: () => ({
    type: USER_SETTINGS_DEFAULTS_LOADING_REQUEST,
  }),
  success: data => ({
    type: USER_SETTINGS_DEFAULTS_LOADING_SUCCESS,
    data,
  }),
  error: err => ({
    type: USER_SETTINGS_DEFAULTS_LOADING_ERROR,
    error: err,
  }),
};

export const loadUserSettingDefaults = gmp => () => (dispatch, getState) => {
  const rootState = getState();
  const selector = getUserSettingsDefaults(rootState);

  if (selector.isLoading()) {
    // we are already loading data
    return Promise.resolve();
  }

  dispatch(loadingActions.request());

  return gmp.user.currentSettings().then(
    response => dispatch(loadingActions.success(response.data)),
    err => dispatch(loadingActions.error(err)),
  );
};

export const loadUserSettingDefault = gmp => id => (dispatch, getState) => {
  const rootState = getState();
  const selector = getUserSettingsDefaults(rootState);

  if (selector.isLoading()) {
    // we are already loading data
    return Promise.resolve();
  }

  dispatch(loadingActions.request());

  return gmp.user
    .getSetting(id)
    .then(response => (isDefined(response) ? response.data : null))
    .then(setting => {
      const settings = {};
      settings[transformSettingName(setting.name)] = setting;
      dispatch(loadingActions.success(settings));
    })
    .catch(err => {
      if (isDefined(err)) {
        dispatch(loadingActions.error(err));
      }
    });
};

// vim: set ts=2 sw=2 two=80:
