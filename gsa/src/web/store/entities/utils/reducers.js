/* Copyright (C) 2018-2019 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
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
import {isDefined} from 'gmp/utils/identity';

import {types} from './actions';

import {filterIdentifier} from 'web/store/utils';

/**
 * Return true if error is not a Rejection class or if Rejection class has a
 * reason of error
 *
 * @returns Boolean
 */
const isError = error => !isDefined(error.isError) || error.isError();

const initialState = {
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
      case types.ENTITY_LOADING_SUCCESS:
        return {
          ...state,
          [action.id]: action.data,
        };
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
      default:
        return state;
    }
  };
};

// vim: set ts=2 sw=2 tw=80:
