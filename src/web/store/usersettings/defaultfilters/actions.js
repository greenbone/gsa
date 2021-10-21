/* Copyright (C) 2019-2021 Greenbone Networks GmbH
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
    .then(filterId =>
      isDefined(filterId) && filterId !== 0
        ? gmp.filter.get({id: filterId})
        : null,
    )
    .then(resp => {
      if (resp === null) {
        dispatch(defaultFilterLoadingActions.success(entityType, null));
      } else {
        dispatch(defaultFilterLoadingActions.success(entityType, resp.data));
      }
    })
    .catch(err => {
      if (isDefined(err)) {
        dispatch(defaultFilterLoadingActions.error(entityType, err));
      }
    });
};

// vim: set ts=2 sw=2 two=80:
