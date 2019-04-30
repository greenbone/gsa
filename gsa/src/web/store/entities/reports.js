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

import {createEntityActions} from './utils/actions';

import {createAll} from './utils/main';

import {createReducer} from 'web/store/entities/utils/reducers';

const {
  loadAllEntities,
  loadEntities,
  reducer,
  selector,
  entitiesActions,
  entityActions,
} = createAll('report');

const entityType = 'deltaReport';

const deltaIdentifier = (id, deltaId) => `${id}+${deltaId}`;

class DeltaSelector {
  constructor(state = {}) {
    this.state = state;
  }

  isLoading(id, deltaId) {
    return isDefined(this.state.isLoading)
      ? !!this.state.isLoading[deltaIdentifier(id, deltaId)]
      : false;
  }

  getError(id, deltaId) {
    return isDefined(this.state.errors)
      ? this.state.errors[deltaIdentifier(id, deltaId)]
      : undefined;
  }

  getEntity(id, deltaId) {
    return isDefined(this.state.byId)
      ? this.state.byId[deltaIdentifier(id, deltaId)]
      : undefined;
  }
}

const deltaReducer = createReducer(entityType);
const deltaSelector = rootState =>
  new DeltaSelector(rootState.entities[entityType]);

const deltaEntityActions = createEntityActions(entityType);

const loadEntity = gmp => (id, filter) => (dispatch, getState) => {
  const rootState = getState();
  const state = selector(rootState);

  if (state.isLoadingEntity(id)) {
    // we are already loading data
    return Promise.resolve();
  }

  dispatch(entityActions.request(id));

  return gmp.report
    .get({id}, {filter})
    .then(
      response => dispatch(entityActions.success(id, response.data)),
      error => dispatch(entityActions.error(id, error)),
    );
};

const loadDeltaReport = gmp => (id, deltaId, filter) => (
  dispatch,
  getState,
) => {
  const rootState = getState();
  const state = deltaSelector(rootState);

  if (state.isLoading(id, deltaId)) {
    // we are already loading data
    return Promise.resolve();
  }

  const identifier = deltaIdentifier(id, deltaId);

  dispatch(deltaEntityActions.request(identifier));

  return gmp.report
    .getDelta({id}, {id: deltaId}, {filter})
    .then(
      response =>
        dispatch(deltaEntityActions.success(identifier, response.data)),
      error => dispatch(deltaEntityActions.error(identifier, error)),
    );
};

export {
  deltaEntityActions,
  deltaReducer,
  deltaSelector,
  loadDeltaReport,
  loadAllEntities,
  loadEntities,
  loadEntity,
  reducer,
  selector,
  entitiesActions,
  entityActions,
};

// vim: set ts=2 sw=2 tw=80:
