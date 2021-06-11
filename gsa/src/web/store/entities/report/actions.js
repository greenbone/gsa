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
import {isDefined} from 'gmp/utils/identity';

import {
  types,
  createEntityLoadingActions,
} from 'web/store/entities/utils/actions';

import {
  reportSelector,
  deltaReportSelector,
  deltaReportIdentifier,
} from './selectors';

const entityType = 'report';

export const reportActions = {
  request: (id, filter) => ({
    type: types.ENTITY_LOADING_REQUEST,
    entityType,
    filter,
    id,
  }),
  success: (id, data, filter) => ({
    type: types.ENTITY_LOADING_SUCCESS,
    entityType,
    data,
    filter,
    id,
  }),
  error: (id, error, filter) => ({
    type: types.ENTITY_LOADING_ERROR,
    entityType,
    error,
    filter,
    id,
  }),
};

export const loadReport = gmp => (
  id,
  {filter, details = true, force = false} = {},
) => (dispatch, getState) => {
  const rootState = getState();
  const state = reportSelector(rootState);

  if (!force && state.isLoadingEntity(id, filter)) {
    // we are already loading data
    return Promise.resolve();
  }

  dispatch(reportActions.request(id, filter));

  return gmp.report
    .get({id}, {filter, details})
    .then(
      response => response.data,
      error => {
        dispatch(reportActions.error(id, error, filter));
        return Promise.reject(error);
      },
    )
    .then(data => {
      dispatch(reportActions.success(id, data, filter));
      return data;
    });
};

export const loadReportWithThreshold = gmp => (id, {filter} = {}) => (
  dispatch,
  getState,
) => {
  const rootState = getState();
  const state = reportSelector(rootState);

  if (state.isLoadingEntity(id, filter)) {
    // we are already loading data
    return Promise.resolve();
  }

  dispatch(reportActions.request(id, filter));

  const {reportResultsThreshold: threshold} = gmp.settings;
  return gmp.report
    .get({id}, {filter, details: false})
    .then(
      response => response.data,
      error => {
        dispatch(reportActions.error(id, error, filter));
        return Promise.reject(error);
      },
    )
    .then(report => {
      const fullReport =
        isDefined(report) &&
        isDefined(report.report) &&
        isDefined(report.report.results) &&
        report.report.results.counts.filtered < threshold;

      dispatch(reportActions.success(id, report, filter));

      if (fullReport) {
        return loadReport(gmp)(id, {filter, details: true, force: true})(
          dispatch,
          getState,
        );
      }
    });
};

export const loadReportIfNeeded = gmp => (
  id,
  {filter, details = false} = {},
) => (dispatch, getState) => {
  // loads the small report (without details) if these information are not
  // yet in the store. resolve() otherwise
  const rootState = getState();
  const state = reportSelector(rootState);

  if (isDefined(state.getEntity(id, filter))) {
    // we are already loading data or have it in the store
    return Promise.resolve();
  }
  return loadReport(gmp)(id, {filter, details})(dispatch, getState);
};

export const deltaReportActions = createEntityLoadingActions('deltaReport');

export const loadDeltaReport = gmp => (id, deltaId, filter) => (
  dispatch,
  getState,
) => {
  const rootState = getState();
  const state = deltaReportSelector(rootState);

  if (state.isLoading(id, deltaId)) {
    // we are already loading data
    return Promise.resolve();
  }

  const identifier = deltaReportIdentifier(id, deltaId);

  dispatch(deltaReportActions.request(identifier));

  return gmp.report.getDelta({id}, {id: deltaId}, {filter}).then(
    response => dispatch(deltaReportActions.success(identifier, response.data)),
    error => dispatch(deltaReportActions.error(identifier, error)),
  );
};
