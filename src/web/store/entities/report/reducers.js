/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {
  reportIdentifier,
  simplifiedReportIdentifier,
} from 'web/store/entities/report/selectors';
import {types} from 'web/store/entities/utils/actions';
import {isError} from 'web/store/entities/utils/reducers';

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
  if (action.entityType !== 'report' && action.entityType !== 'auditreport') {
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
