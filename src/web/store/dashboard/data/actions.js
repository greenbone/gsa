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
