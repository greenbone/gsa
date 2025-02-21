/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {reportReducer} from 'web/store/entities/report/reducers';
import {reportsReducer} from 'web/store/entities/reports/reducers';
import {
  createEntitiesLoadingActions,
  createLoadAllEntities,
  createLoadEntities,
  types,
} from 'web/store/entities/utils/actions';
import {createReducer, initialState} from 'web/store/entities/utils/reducers';
import {createEntitiesSelector} from 'web/store/entities/utils/selectors';


const reportsSelector = createEntitiesSelector('auditreport');
const entitiesActions = createEntitiesLoadingActions('auditreport');
const loadAllEntities = createLoadAllEntities({
  selector: reportsSelector,
  actions: entitiesActions,
  entityType: 'auditreport',
});
const loadEntities = createLoadEntities({
  selector: reportsSelector,
  actions: entitiesActions,
  entityType: 'auditreport',
});

const reducer = (state = initialState, action) => {
  if (action.entityType !== 'auditreport') {
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

const deltaAuditReducer = createReducer('deltaAuditReport');

export {
  deltaAuditReducer,
  loadAllEntities,
  loadEntities,
  reducer,
  reportsSelector as selector,
  entitiesActions,
};
