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

  return gmp.user
    .currentSettings()
    .then(
      response => dispatch(loadingActions.success(response.data)),
      err => dispatch(loadingActions.error(err)),
    );
};

// vim: set ts=2 sw=2 two=80:
