/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {DEFAULT_FILTER_SETTINGS} from 'gmp/commands/user';
import {isDefined} from 'gmp/utils/identity';
import {getUserSettingsDefaultFilter} from 'web/store/usersettings/defaultfilters/selectors';

export const USER_SETTINGS_DEFAULT_FILTER_LOADING_SUCCESS =
  'USER_SETTINGS_DEFAULT_FILTER_LOADING_SUCCESS';
export const USER_SETTINGS_DEFAULT_FILTER_LOADING_REQUEST =
  'USER_SETTINGS_DEFAULT_FILTER_LOADING_REQUEST';
export const USER_SETTINGS_DEFAULT_FILTER_LOADING_ERROR =
  'USER_SETTINGS_DEFAULT_FILTER_LOADING_ERROR';
export const USER_SETTINGS_DEFAULT_FILTER_OPTIMISTIC_UPDATE =
  'USER_SETTINGS_DEFAULT_FILTER_OPTIMISTIC_UPDATE';

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
  optimisticUpdate: (entityType, filter) => ({
    type: USER_SETTINGS_DEFAULT_FILTER_OPTIMISTIC_UPDATE,
    entityType,
    filter,
  }),
};

export const loadUserSettingsDefaultFilter =
  gmp => entityType => (dispatch, getState) => {
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
