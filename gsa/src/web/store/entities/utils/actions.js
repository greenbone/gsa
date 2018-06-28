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

export const types = {
  ENTITIES_LOADING_REQUEST: 'ENTITIES_LOADING_REQUEST',
  ENTITIES_LOADING_SUCCESS: 'ENTITIES_LOADING_SUCCESS',
  ENTITIES_LOADING_ERROR: 'ENTITIES_LOADING_ERROR',
};

export const createEntitiesActionCreators = entityType => ({
  request: filter => ({
    type: types.ENTITIES_LOADING_REQUEST,
    entityType,
    filter,
  }),
  success: (data, filter) => ({
    type: types.ENTITIES_LOADING_SUCCESS,
    entityType,
    filter,
    data,
  }),
  error: (error, filter) => ({
    type: types.ENTITIES_LOADING_ERROR,
    entityType,
    filter,
    error,
  }),
});

export const createLoadAllFunc = ({
  selector,
  actionCreators,
  entityType,
}) => ({gmp, filter, ...props}) => (dispatch, getState) => {
    const rootState = getState();
    const state = selector(rootState);

    if (state.isLoadingEntities(filter)) {
      // we are already loading data
      return Promise.resolve();
    }

    dispatch(actionCreators.request(filter));

    return gmp[entityType].getAll({filter}).then(
      response => dispatch(actionCreators.success(response.data, filter)),
      error => dispatch(actionCreators.error(error, filter)),
    );
  };

// vim: set ts=2 sw=2 tw=80:
