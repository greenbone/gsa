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
import {is_defined} from 'gmp/utils/identity';

import {
  DASHBOARD_DATA_LOADING_SUCCESS,
  DASHBOARD_DATA_LOADING_ERROR,
  DASHBOARD_DATA_LOADING_REQUEST,
} from './actions';

import {getById} from './selectors';

const dashboardData = (state = {}, action) => {
  switch (action.type) {
    case DASHBOARD_DATA_LOADING_REQUEST:
      return {
        isLoading: true,
      };
    case DASHBOARD_DATA_LOADING_SUCCESS:
      return {
        isLoading: false,
        data: action.data,
      };
    case DASHBOARD_DATA_LOADING_ERROR:
      return {
        isLoading: false,
        error: action.error,
      };
    default:
      return state;
    }
};

const dashboardDataById = (state = {}, action) => {
  if (!is_defined(action.id)) {
    return state;
  }

  switch (action.type) {
    case DASHBOARD_DATA_LOADING_REQUEST:
    case DASHBOARD_DATA_LOADING_SUCCESS:
    case DASHBOARD_DATA_LOADING_ERROR:
      return {
        ...state,
        [action.id]: dashboardData(getById(state, action.id), action),
      };
    default:
      return state;
  }
};

export default dashboardDataById;

// vim: set ts=2 sw=2 tw=80:
