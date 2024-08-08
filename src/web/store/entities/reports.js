/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {
  createEntitiesLoadingActions,
  createLoadAllEntities,
  createLoadEntities,
  types,
} from 'web/store/entities/utils/actions';

import {createReducer, initialState} from 'web/store/entities/utils/reducers';
import {createEntitiesSelector} from 'web/store/entities/utils/selectors';

import {reportReducer} from './report/reducers';
import {reportsReducer} from './reports/reducers';

const reportsSelector = createEntitiesSelector('report');
const entitiesActions = createEntitiesLoadingActions('report');
const loadAllEntities = createLoadAllEntities({
  selector: reportsSelector,
  actions: entitiesActions,
  entityType: 'report',
});
const loadEntities = createLoadEntities({
  selector: reportsSelector,
  actions: entitiesActions,
  entityType: 'report',
});

const reducer = (state = initialState, action) => {
  if (action.entityType !== 'report') {
    return state;
  }

  switch (action.type) {
    case types.ENTITIES_LOADING_REQUEST:
    case types.ENTITIES_LOADING_SUCCESS:
    case types.ENTITIES_LOADING_ERROR:
      return reportsReducer(state, action);
    case types.ENTITY_LOADING_REQUEST:
    case types.ENTITY_LOADING_SUCCESS:
    case types.ENTITY_LOADING_ERROR:
      return reportReducer(state, action);
    default:
      return state;
  }
};

const deltaReducer = createReducer('deltaReport');

export {
  deltaReducer,
  loadAllEntities,
  loadEntities,
  reducer,
  reportsSelector as selector,
  entitiesActions,
};

// vim: set ts=2 sw=2 tw=80:
