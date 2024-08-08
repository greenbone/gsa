/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

export const DASHBOARD_DATA_LOADING_SUCCESS = 'DASHBOARD_DATA_LOADING_SUCCESS';
export const DASHBOARD_DATA_LOADING_REQUEST = 'DASHBOARD_DATA_LOADING_REQUEST';
export const DASHBOARD_DATA_LOADING_ERROR = 'DASHBOARD_DATA_LOADING_ERROR';

export const receivedDashboardData = (id, data, filter) => ({
  type: DASHBOARD_DATA_LOADING_SUCCESS,
  id,
  data,
  filter,
});

export const receivedDashboardError = (id, error, filter) => ({
  type: DASHBOARD_DATA_LOADING_ERROR,
  id,
  error,
  filter,
});

export const requestDashboardData = (id, filter) => ({
  type: DASHBOARD_DATA_LOADING_REQUEST,
  id,
  filter,
});

// vim: set ts=2 sw=2 tw=80:
