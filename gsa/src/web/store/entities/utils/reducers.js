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

import {types} from './actions';

export const filterIdentifier = filter => is_defined(filter) ?
  `filter:${filter.toFilterString()}` :
  'default';

const initialState = {
  default: [],
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
        return {
          ...state,
          [filterString]: action.error,
        };
      default:
        return state;
    }
  };

  const entities = (state = [], action) => {
    switch (action.type) {
      case types.ENTITIES_LOADING_SUCCESS:
        const {data = []} = action;
        return data.map(entity => entity.id);
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
        data.forEach(d => nextState[d.id] = d);
        return nextState;
      default:
        return state;
    }
  };

  return (state = initialState, action) => {
    if (action.entityType !== entityType) {
      return state;
    }

    const filterString = filterIdentifier(action.filter);
    return {
      ...state,
      byId: byId(state.byId, action),
      isLoading: isLoading(state.isLoading, action),
      errors: errors(state.errors, action),
      [filterString]: entities(state[filterString], action),
    };
  };
};

// vim: set ts=2 sw=2 tw=80:
