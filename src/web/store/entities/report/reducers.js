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

import {reportIdentifier, simplifiedReportIdentifier} from './selectors';

/*
  Use the full filter string for identifying if a single report is loaded
  currently.

  When storing a loaded report use the simplified report because
  with the current implementation the rows, first and sort(-reverse) filter
  terms are not relevant. Therefore we can consider these reports to be equal
  and store them under the same identifier. This will safe us some memory.
*/

const isLoading = (state = {}, action) => {
  switch (action.type) {
    case types.ENTITY_LOADING_REQUEST:
      return {
        ...state,
        [reportIdentifier(action.id, action.filter)]: true,
      };
    case types.ENTITY_LOADING_SUCCESS:
    case types.ENTITY_LOADING_ERROR:
      return {
        ...state,
        [reportIdentifier(action.id, action.filter)]: false,
      };
    default:
      return state;
  }
};

const errors = (state = {}, action) => {
  switch (action.type) {
    case types.ENTITY_LOADING_SUCCESS:
      state = {
        ...state,
      };
      delete state[reportIdentifier(action.id, action.filter)];
      return state;
    case types.ENTITY_LOADING_ERROR:
      if (isError(action.error)) {
        return {
          ...state,
          [reportIdentifier(action.id, action.filter)]: action.error,
        };
      }
      return state;
    default:
      return state;
  }
};

const byId = (state = {}, action) => {
  switch (action.type) {
    case types.ENTITY_LOADING_SUCCESS:
      return {
        ...state,
        [simplifiedReportIdentifier(action.id, action.filter)]: action.data,
      };
    default:
      return state;
  }
};

export const reportReducer = (state = {}, action) => {
  if (action.entityType !== 'report') {
    return state;
  }

  switch (action.type) {
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
