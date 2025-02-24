/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {isDefined} from 'gmp/utils/identity';
import {
  auditReportSelector,
  reportSelector,
  deltaReportSelector,
  deltaAuditReportSelector,
  deltaReportIdentifier,
} from 'web/store/entities/report/selectors';
import {
  types,
  createEntityLoadingActions,
} from 'web/store/entities/utils/actions';


export const reportActions = {
  request: (id, filter) => ({
    type: types.ENTITY_LOADING_REQUEST,
    entityType: 'report',
    filter,
    id,
  }),
  success: (id, data, filter) => ({
    type: types.ENTITY_LOADING_SUCCESS,
    entityType: 'report',
    data,
    filter,
    id,
  }),
  error: (id, error, filter) => ({
    type: types.ENTITY_LOADING_ERROR,
    entityType: 'report',
    error,
    filter,
    id,
  }),
};

export const auditReportActions = {
  request: (id, filter) => ({
    type: types.ENTITY_LOADING_REQUEST,
    entityType: 'auditreport',
    filter,
    id,
  }),
  success: (id, data, filter) => ({
    type: types.ENTITY_LOADING_SUCCESS,
    entityType: 'auditreport',
    data,
    filter,
    id,
  }),
  error: (id, error, filter) => ({
    type: types.ENTITY_LOADING_ERROR,
    entityType: 'auditreport',
    error,
    filter,
    id,
  }),
};

export const loadReport =
  gmp =>
  (id, {filter, details = true, force = false} = {}) =>
  (dispatch, getState) => {
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

export const loadReportWithThreshold =
  gmp =>
  (id, {filter} = {}) =>
  (dispatch, getState) => {
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

export const loadReportIfNeeded =
  gmp =>
  (id, {filter, details = false} = {}) =>
  (dispatch, getState) => {
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

export const loadDeltaReport =
  gmp => (id, deltaId, filter) => (dispatch, getState) => {
    const rootState = getState();
    const state = deltaReportSelector(rootState);

    if (state.isLoading(id, deltaId)) {
      // we are already loading data
      return Promise.resolve();
    }

    const identifier = deltaReportIdentifier(id, deltaId);

    dispatch(deltaReportActions.request(identifier));

    return gmp.report.getDelta({id}, {id: deltaId}, {filter}).then(
      response =>
        dispatch(deltaReportActions.success(identifier, response.data)),
      error => dispatch(deltaReportActions.error(identifier, error)),
    );
  };

export const loadAuditReport =
  gmp =>
  (id, {filter, details = true, force = false} = {}) =>
  (dispatch, getState) => {
    const rootState = getState();
    const state = auditReportSelector(rootState);

    if (!force && state.isLoadingEntity(id, filter)) {
      return Promise.resolve();
    }

    dispatch(auditReportActions.request(id, filter));

    return gmp.auditreport
      .get({id}, {filter, details})
      .then(
        response => response.data,
        error => {
          dispatch(auditReportActions.error(id, error, filter));
          return Promise.reject(error);
        },
      )
      .then(data => {
        dispatch(auditReportActions.success(id, data, filter));

        return data;
      });
  };

export const loadAuditReportWithThreshold =
  gmp =>
  (id, {filter} = {}) =>
  (dispatch, getState) => {
    const rootState = getState();
    const state = auditReportSelector(rootState);

    if (state.isLoadingEntity(id, filter)) {
      return Promise.resolve();
    }

    dispatch(auditReportActions.request(id, filter));

    const {reportResultsThreshold: threshold} = gmp.settings;
    return gmp.auditreport
      .get({id}, {filter, details: false})
      .then(
        response => response.data,
        error => {
          dispatch(auditReportActions.error(id, error, filter));
          return Promise.reject(error);
        },
      )
      .then(report => {
        const fullReport =
          isDefined(report) &&
          isDefined(report.report) &&
          isDefined(report.report.results) &&
          report.report.results.counts.filtered < threshold;

        dispatch(auditReportActions.success(id, report, filter));
        if (fullReport) {
          return loadAuditReport(gmp)(id, {filter, details: true, force: true})(
            dispatch,
            getState,
          );
        }
      });
  };

export const loadAuditReportIfNeeded =
  gmp =>
  (id, {filter, details = false} = {}) =>
  (dispatch, getState) => {
    const rootState = getState();
    const state = auditReportSelector(rootState);

    if (isDefined(state.getEntity(id, filter))) {
      return Promise.resolve();
    }
    return loadAuditReport(gmp)(id, {filter, details})(dispatch, getState);
  };

export const deltaAuditReportActions =
  createEntityLoadingActions('deltaAuditReport');

export const loadDeltaAuditReport =
  gmp => (id, deltaId, filter) => (dispatch, getState) => {
    const rootState = getState();
    const state = deltaAuditReportSelector(rootState);

    if (state.isLoading(id, deltaId)) {
      return Promise.resolve();
    }

    const identifier = deltaReportIdentifier(id, deltaId);

    dispatch(deltaAuditReportActions.request(identifier));

    return gmp.auditreport.getDelta({id}, {id: deltaId}, {filter}).then(
      response =>
        dispatch(deltaAuditReportActions.success(identifier, response.data)),
      error => dispatch(deltaAuditReportActions.error(identifier, error)),
    );
  };
