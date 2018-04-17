/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2018 Greenbone Networks GmbH
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
import 'core-js/fn/object/entries';

import {
  DASHBOARD_SETTINGS_LOADING_ERROR,
  DASHBOARD_SETTINGS_LOADING_REQUEST,
  DASHBOARD_SETTINGS_LOADING_SUCCESS,
  DASHBOARD_SETTINGS_SAVING_REQUEST,
} from './actions';

import {combineReducers} from 'redux';

const items = (state = null, action) => {
  switch (action.type) {
    case DASHBOARD_SETTINGS_LOADING_SUCCESS:
      return {
        ...state,
        ...action.defaults,
        ...action.items,
      };
    case DASHBOARD_SETTINGS_SAVING_REQUEST:
      return {
        ...state,
        [action.id]: action.items,
      };
    default:
      return state;
  }
};

const error = (state = null, action) => {
  switch (action.type) {
    case DASHBOARD_SETTINGS_LOADING_REQUEST:
    case DASHBOARD_SETTINGS_LOADING_SUCCESS:
      return null; // reset error
    case DASHBOARD_SETTINGS_LOADING_ERROR:
      return action.error;
    default:
      return state;
  }
};

const isLoading = (state = false, action) => {
  switch (action.type) {
    case DASHBOARD_SETTINGS_LOADING_REQUEST:
      return true;
    case DASHBOARD_SETTINGS_LOADING_ERROR:
    case DASHBOARD_SETTINGS_LOADING_SUCCESS:
      return false;
    default:
      return state;
  }
};

const dashboardSettings = combineReducers({
  isLoading,
  items,
  error,
});

export default dashboardSettings;

// vim: set ts=2 sw=2 tw=80:

