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
  if (action.entityType !== 'report') {
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
