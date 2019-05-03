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
import Filter, {ALL_FILTER} from 'gmp/models/filter';

import {pluralizeType} from 'gmp/utils/entitytype';

import {isDefined} from 'gmp/utils/identity';

export const types = {
  ENTITIES_LOADING_REQUEST: 'ENTITIES_LOADING_REQUEST',
  ENTITIES_LOADING_SUCCESS: 'ENTITIES_LOADING_SUCCESS',
  ENTITIES_LOADING_ERROR: 'ENTITIES_LOADING_ERROR',
  ENTITY_LOADING_REQUEST: 'ENTITY_LOADING_REQUEST',
  ENTITY_LOADING_SUCCESS: 'ENTITY_LOADING_SUCCESS',
  ENTITY_LOADING_ERROR: 'ENTITY_LOADING_ERROR',
};

export const createEntitiesActions = entityType => ({
  request: filter => ({
    type: types.ENTITIES_LOADING_REQUEST,
    entityType,
    filter,
  }),
  success: (data, filter, loadedFilter, counts) => ({
    type: types.ENTITIES_LOADING_SUCCESS,
    entityType,
    filter,
    data,
    loadedFilter,
    counts,
  }),
  error: (error, filter) => ({
    type: types.ENTITIES_LOADING_ERROR,
    entityType,
    filter,
    error,
  }),
});

export const createEntityActions = entityType => ({
  request: id => ({
    type: types.ENTITY_LOADING_REQUEST,
    entityType,
    id,
  }),
  success: (id, data) => ({
    type: types.ENTITY_LOADING_SUCCESS,
    entityType,
    data,
    id,
  }),
  error: (id, error) => ({
    type: types.ENTITY_LOADING_ERROR,
    entityType,
    error,
    id,
  }),
});

export const createLoadEntities = ({
  selector,
  actions,
  entityType,
}) => gmp => filter => (dispatch, getState) => {
  const rootState = getState();
  const state = selector(rootState);

  if (state.isLoadingEntities(filter)) {
    // we are already loading data
    return Promise.resolve();
  }

  dispatch(actions.request(filter));

  return gmp[pluralizeType(entityType)].get({filter}).then(
    response => {
      const {data, meta} = response;
      const {filter: loadedFilter, counts} = meta;
      return dispatch(actions.success(data, filter, loadedFilter, counts));
    },
    error => dispatch(actions.error(error, filter)),
  );
};

export const createLoadAllEntities = ({
  selector,
  actions,
  entityType,
}) => gmp => filter => (dispatch, getState) => {
  const rootState = getState();
  const state = selector(rootState);

  if (isDefined(filter)) {
    filter = isDefined(filter.toFilterString)
      ? filter.all()
      : Filter.fromString(filter).all();
  } else {
    filter = ALL_FILTER;
  }

  if (state.isLoadingEntities(filter)) {
    // we are already loading data
    return Promise.resolve();
  }
  dispatch(actions.request(filter));

  return gmp[pluralizeType(entityType)].get({filter}).then(
    response => {
      const {data, meta} = response;
      const {filter: loadedFilter, counts} = meta;
      return dispatch(actions.success(data, filter, loadedFilter, counts));
    },
    error => dispatch(actions.error(error, filter)),
  );
};

export const createLoadEntity = ({
  selector,
  actions,
  entityType,
}) => gmp => id => (dispatch, getState) => {
  const rootState = getState();
  const state = selector(rootState);

  if (state.isLoadingEntity(id)) {
    // we are already loading data
    return Promise.resolve();
  }

  dispatch(actions.request(id));

  return gmp[entityType]
    .get({id})
    .then(
      response => dispatch(actions.success(id, response.data)),
      error => dispatch(actions.error(id, error)),
    );
};
// vim: set ts=2 sw=2 tw=80:
