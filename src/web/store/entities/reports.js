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
