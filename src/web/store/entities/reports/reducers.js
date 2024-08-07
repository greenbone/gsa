/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {types} from 'web/store/entities/utils/actions';

import {isError} from 'web/store/entities/utils/reducers';

import {filterIdentifier} from 'web/store/utils';

const isLoading = (state = {}, action) => {
  switch (action.type) {
    case types.ENTITIES_LOADING_REQUEST:
      return {
        ...state,
        [filterIdentifier(action.filter)]: true,
      };
    case types.ENTITIES_LOADING_SUCCESS:
    case types.ENTITIES_LOADING_ERROR:
      return {
        ...state,
        [filterIdentifier(action.filter)]: false,
      };
    default:
      return state;
  }
};

const errors = (state = {}, action) => {
  switch (action.type) {
    case types.ENTITIES_LOADING_SUCCESS:
      state = {
        ...state,
      };
      delete state[filterIdentifier(action.filter)];
      return state;
    case types.ENTITIES_LOADING_ERROR:
      if (isError(action.error)) {
        return {
          ...state,
          [filterIdentifier(action.filter)]: action.error,
        };
      }
      return state;
    default:
      return state;
  }
};

const entities = (state = {}, action) => {
  switch (action.type) {
    case types.ENTITIES_LOADING_SUCCESS:
      const {data = [], counts, loadedFilter} = action;
      return {
        ids: data.map(entity => entity.id),
        counts,
        loadedFilter,
      };
    default:
      return state;
  }
};

const byId = (state = {}, action) => {
  switch (action.type) {
    case types.ENTITIES_LOADING_SUCCESS:
      const {data = []} = action;
      const nextState = {
        ...state,
      };
      data.forEach(d => (nextState[d.id] = d));
      return nextState;
    default:
      return state;
  }
};

export const reportsReducer = (state = {}, action) => {
  if (action.entityType !== 'report' && action.entityType !== 'auditreport') {
    return state;
  }

  switch (action.type) {
    case types.ENTITIES_LOADING_REQUEST:
    case types.ENTITIES_LOADING_SUCCESS:
    case types.ENTITIES_LOADING_ERROR:
      const filterString = filterIdentifier(action.filter);
      return {
        ...state,
        byId: byId(state.byId, action),
        isLoading: isLoading(state.isLoading, action),
        errors: errors(state.errors, action),
        [filterString]: entities(state[filterString], action),
      };
    default:
      return state;
  }
};
