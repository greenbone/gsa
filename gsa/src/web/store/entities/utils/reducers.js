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
import {combineReducers} from 'redux';

import {is_defined} from 'gmp/utils/identity';

export const createReducer = types => {

  const isLoading = (state = false, action) => {
    switch (action.type) {
      case types.REQUEST:
        return true;
      case types.SUCCESS:
      case types.ERROR:
        return false;
      default:
        return state;
    }
  };

  const error = (state = null, action) => {
    switch (action.type) {
      case types.SUCCESS:
        return null;
      case types.ERROR:
        return action.error;
      default:
        return state;
    }
  };

  const entities = (state = null, action) => {
    switch (action.type) {
      case types.SUCCESS:
        return action.data;
      default:
        return state;
    }
  };

  const combinedReducer = combineReducers({
    isLoading,
    error,
    entities,
  });

  return (state = {}, action) => {
    switch (action.type) {
      case types.REQUEST:
      case types.SUCCESS:
      case types.ERROR:
        const filterString = is_defined(action.filter) ?
          action.filter.toFilterString() : 'default';
        return {
          ...state,
          [filterString]: combinedReducer(state[filterString], action),
        };
      default:
        return state;
    }
  };
};

// vim: set ts=2 sw=2 tw=80:
