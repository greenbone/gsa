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
import {isDefined} from 'gmp/utils/identity';

import {filterIdentifier} from 'web/store/utils';

import {
  DASHBOARD_DATA_LOADING_SUCCESS,
  DASHBOARD_DATA_LOADING_ERROR,
  DASHBOARD_DATA_LOADING_REQUEST,
} from './actions';

const dashboardData = (state = {}, action) => {
  switch (action.type) {
    case DASHBOARD_DATA_LOADING_REQUEST:
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case DASHBOARD_DATA_LOADING_SUCCESS:
      return {
        ...state,
        isLoading: false,
        data: action.data,
        error: null,
      };
    case DASHBOARD_DATA_LOADING_ERROR:
      return {
        ...state,
        isLoading: false,
        error: action.error,
      };
    default:
      return state;
  }
};

const dashboardDataForFilter = (state = {}, action) => {
  const filterString = filterIdentifier(action.filter);

  return {
    ...state,
    [filterString]: dashboardData(state[filterString], action),
  };
};

const dashboardDataById = (state = {}, action) => {
  if (!isDefined(action.id)) {
    return state;
  }

  switch (action.type) {
    case DASHBOARD_DATA_LOADING_REQUEST:
    case DASHBOARD_DATA_LOADING_SUCCESS:
    case DASHBOARD_DATA_LOADING_ERROR:
      return {
        ...state,
        [action.id]: dashboardDataForFilter(state[action.id], action),
      };
    default:
      return state;
  }
};

export default dashboardDataById;

// vim: set ts=2 sw=2 tw=80:
