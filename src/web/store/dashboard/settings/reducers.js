/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {
  DASHBOARD_SETTINGS_LOADING_ERROR,
  DASHBOARD_SETTINGS_LOADING_REQUEST,
  DASHBOARD_SETTINGS_LOADING_SUCCESS,
  DASHBOARD_SETTINGS_SAVING_REQUEST,
  DASHBOARD_SETTINGS_SET_DEFAULTS,
  DASHBOARD_SETTINGS_RESET_REQUEST,
} from 'web/store/dashboard/settings/actions';
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
