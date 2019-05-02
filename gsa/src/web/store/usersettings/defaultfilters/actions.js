/* Copyright (C) 2019 Greenbone Networks GmbH
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
import {isDefined} from 'gmp/utils/identity';

import {DEFAULT_FILTER_SETTINGS} from 'gmp/commands/users';

import {getUserSettingsDefaultFilter} from './selectors';

export const USER_SETTINGS_DEFAULT_FILTER_LOADING_SUCCESS =
  'USER_SETTINGS_DEFAULT_FILTER_LOADING_SUCCESS';
export const USER_SETTINGS_DEFAULT_FILTER_LOADING_REQUEST =
  'USER_SETTINGS_DEFAULT_FILTER_LOADING_REQUEST';
export const USER_SETTINGS_DEFAULT_FILTER_LOADING_ERROR =
  'USER_SETTINGS_DEFAULT_FILTER_LOADING_ERROR';

export const defaultFilterLoadingActions = {
  request: entityType => ({
    type: USER_SETTINGS_DEFAULT_FILTER_LOADING_REQUEST,
    entityType,
  }),
  success: (entityType, filter) => ({
    type: USER_SETTINGS_DEFAULT_FILTER_LOADING_SUCCESS,
    entityType,
    filter,
  }),
  error: (entityType, error) => ({
    type: USER_SETTINGS_DEFAULT_FILTER_LOADING_ERROR,
    entityType,
    error,
  }),
};

export const loadUserSettingsDefaultFilter = gmp => entityType => (
  dispatch,
  getState,
) => {
  const rootState = getState();
  const selector = getUserSettingsDefaultFilter(rootState, entityType);

  if (selector.isLoading()) {
    // we are already loading data
    return Promise.resolve();
  }

  dispatch(defaultFilterLoadingActions.request(entityType));

  const settingId = DEFAULT_FILTER_SETTINGS[entityType];

  return gmp.user
    .getSetting(settingId)
    .then(resp => {
      const {data: setting} = resp;
      return isDefined(setting) ? setting.value : undefined;
    })
    .then(filterId => {
      if (!isDefined(filterId)) {
        dispatch(defaultFilterLoadingActions.success(entityType));
        return Promise.reject();
      }
      return gmp.filter.get({id: filterId});
    })
    .then(resp => {
      dispatch(defaultFilterLoadingActions.success(entityType, resp.data));
    })
    .catch(err => {
      if (isDefined(err)) {
        dispatch(defaultFilterLoadingActions.error(entityType, err));
      }
    });
};

// vim: set ts=2 sw=2 two=80:
