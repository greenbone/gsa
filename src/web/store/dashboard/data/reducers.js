/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
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
