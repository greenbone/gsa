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

import {
  DASHBOARD_SETTINGS_LOADING_ERROR,
  DASHBOARD_SETTINGS_LOADING_REQUEST,
  DASHBOARD_SETTINGS_LOADING_SUCCESS,
  DASHBOARD_SETTINGS_SAVING_REQUEST,
  DASHBOARD_SETTINGS_SET_DEFAULTS,
  DASHBOARD_SETTINGS_RESET_REQUEST,
} from './actions';

import {combineReducers} from 'web/store/utils';

const defaults = (state = {}, action) => {
  switch (action.type) {
    case DASHBOARD_SETTINGS_SET_DEFAULTS:
      return {
        ...state,
        [action.id]: action.defaults,
      };
    default:
      return state;
  }
};

const byId = (state = {}, action) => {
  const {id, settings = {}} = action;

  switch (action.type) {
    case DASHBOARD_SETTINGS_LOADING_SUCCESS:
      return {
        ...state,
        [id]: {
          ...state[id],
          ...action.defaultSettings,
          ...settings,
        },
      };
    case DASHBOARD_SETTINGS_RESET_REQUEST:
    case DASHBOARD_SETTINGS_SAVING_REQUEST:
      return {
        ...state,
        [id]: {
          ...state[id],
          ...settings,
        },
      };
    default:
      return state;
  }
};

const errors = (state = {}, action) => {
  const {id} = action;
  switch (action.type) {
    case DASHBOARD_SETTINGS_LOADING_REQUEST:
    case DASHBOARD_SETTINGS_LOADING_SUCCESS:
      const newState = {...state};
      delete newState[id];
      return newState;
    case DASHBOARD_SETTINGS_LOADING_ERROR:
      return {
        ...state,
        [id]: action.error,
      };
    default:
      return state;
  }
};

const isLoading = (state = {}, action) => {
  const {id} = action;
  switch (action.type) {
    case DASHBOARD_SETTINGS_LOADING_REQUEST:
      return {
        ...state,
        [id]: true,
      };
    case DASHBOARD_SETTINGS_LOADING_ERROR:
    case DASHBOARD_SETTINGS_LOADING_SUCCESS:
      return {
        ...state,
        [id]: false,
      };
    default:
      return state;
  }
};

const dashboardSettings = combineReducers({
  isLoading,
  byId,
  errors,
  defaults,
});

export default dashboardSettings;

// vim: set ts=2 sw=2 tw=80:
