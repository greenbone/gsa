/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {
  CanceledRejection,
  ResponseRejection,
  TimeoutRejection,
} from 'gmp/http/rejection';
import {types} from 'web/store/entities/utils/actions';
import {filterIdentifier} from 'web/store/utils';

/**
 * Check if the error is an actual error that should be stored
 *
 * Cancellations and timeouts are not considered as errors.
 * ResponseRejection with status 401 (authorization required) is also not considered as an error.
 *
 * @param {Error} error The error to check
 * @returns Boolean
 */
export const isError = error =>
  !(error instanceof CanceledRejection) &&
  !(error instanceof TimeoutRejection) &&
  (!(error instanceof ResponseRejection) || error.status !== 401);

export const initialState = {
  byId: {},
  errors: {},
  isLoading: {},
};

export const createReducer = entityType => {
  const isLoading = (state = {}, action) => {
    const filterString = filterIdentifier(action.filter);
    switch (action.type) {
      case types.ENTITIES_LOADING_REQUEST:
        return {
          ...state,
          [filterString]: true,
        };
      case types.ENTITIES_LOADING_SUCCESS:
      case types.ENTITIES_LOADING_ERROR:
        return {
          ...state,
          [filterString]: false,
        };
      case types.ENTITY_LOADING_REQUEST:
        return {
          ...state,
          [action.id]: true,
        };
      case types.ENTITY_LOADING_SUCCESS:
      case types.ENTITY_LOADING_ERROR:
        return {
          ...state,
          [action.id]: false,
        };
      default:
        return state;
    }
  };

  const errors = (state = {}, action) => {
    const filterString = filterIdentifier(action.filter);
    switch (action.type) {
      case types.ENTITIES_LOADING_SUCCESS:
        state = {
          ...state,
        };
        delete state[filterString];
        return state;
      case types.ENTITIES_LOADING_ERROR:
        if (isError(action.error)) {
          return {
            ...state,
            [filterString]: action.error,
          };
        }
        return state;
      case types.ENTITY_LOADING_SUCCESS:
        state = {
          ...state,
        };
        delete state[action.id];
        return state;
      case types.ENTITY_LOADING_ERROR:
        if (isError(action.error)) {
          return {
            ...state,
            [action.id]: action.error,
          };
        }
        return state;
      default:
        return state;
    }
  };

  const entities = (state = {}, action) => {
    switch (action.type) {
      case types.ENTITIES_LOADING_SUCCESS: {
        const {data = [], counts, loadedFilter} = action;
        return {
          ids: data.map(entity => entity.id),
          counts,
          loadedFilter,
        };
      }
      default:
        return state;
    }
  };

  const byId = (state = {}, action) => {
    switch (action.type) {
      case types.ENTITIES_LOADING_SUCCESS: {
        const {data = []} = action;
        const nextState = {
          ...state,
        };
        data.forEach(d => (nextState[d.id] = d));
        return nextState;
      }
      case types.ENTITY_LOADING_SUCCESS:
        return {
          ...state,
          [action.id]: action.data,
        };
      case types.ENTITY_DELETE_SUCCESS: {
        const nState = {
          ...state,
        };
        delete nState[action.id];
        return nState;
      }
      default:
        return state;
    }
  };

  return (state = initialState, action) => {
    if (action.entityType !== entityType) {
      return state;
    }

    const filterString = filterIdentifier(action.filter);

    switch (action.type) {
      case types.ENTITIES_LOADING_REQUEST:
      case types.ENTITIES_LOADING_SUCCESS:
      case types.ENTITIES_LOADING_ERROR:
        return {
          ...state,
          byId: byId(state.byId, action),
          isLoading: isLoading(state.isLoading, action),
          errors: errors(state.errors, action),
          [filterString]: entities(state[filterString], action),
        };
      case types.ENTITY_LOADING_REQUEST:
      case types.ENTITY_LOADING_SUCCESS:
      case types.ENTITY_LOADING_ERROR:
        return {
          ...state,
          byId: byId(state.byId, action),
          isLoading: isLoading(state.isLoading, action),
          errors: errors(state.errors, action),
        };
      case types.ENTITY_DELETE_SUCCESS:
        return {
          ...state,
          byId: byId(state.byId, action),
        };
      default:
        return state;
    }
  };
};
