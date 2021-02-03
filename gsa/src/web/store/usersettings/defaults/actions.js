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
import {getUserSettingsDefaults} from './selectors';

import {isDefined} from 'gmp/utils/identity';

import {transformSettingName} from 'gmp/commands/users';

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
