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
import Filter from 'gmp/models/filter';

import {
  DASHBOARD_DATA_LOADING_SUCCESS,
  DASHBOARD_DATA_LOADING_REQUEST,
  DASHBOARD_DATA_LOADING_ERROR,
  receivedDashboardData,
  requestDashboardData,
  receivedDashboardError,
} from '../actions';

describe('action tests', () => {
  test('should create an action to request dashboard data', () => {
    const id = 'a1';

    expect(requestDashboardData(id)).toEqual({
      id,
      type: DASHBOARD_DATA_LOADING_REQUEST,
    });
  });

  test('should create an action to request dashboard data with filter', () => {
    const id = 'a1';
    const filter = Filter.fromString('name=foo');

    expect(requestDashboardData(id, filter)).toEqual({
      id,
      type: DASHBOARD_DATA_LOADING_REQUEST,
      filter,
    });
  });

  test('should create an action to receive dashboard data', () => {
    const id = 'a1';
    const data = {foo: 'bar'};

    expect(receivedDashboardData(id, data)).toEqual({
      id,
      data,
      type: DASHBOARD_DATA_LOADING_SUCCESS,
    });
  });

  test('should create an action to receive dashboard data with filter', () => {
    const id = 'a1';
    const data = {foo: 'bar'};
    const filter = Filter.fromString('name=foo');

    expect(receivedDashboardData(id, data, filter)).toEqual({
      id,
      data,
      type: DASHBOARD_DATA_LOADING_SUCCESS,
      filter,
    });
  });

  test('should create an action to receive an error', () => {
    const id = 'a1';
    const error = 'An error occured';

    expect(receivedDashboardError(id, error)).toEqual({
      id,
      error,
      type: DASHBOARD_DATA_LOADING_ERROR,
    });
  });

  test('should create an action to receive an error with filter', () => {
    const id = 'a1';
    const error = 'An error occured';
    const filter = Filter.fromString('name=foo');

    expect(receivedDashboardError(id, error, filter)).toEqual({
      id,
      error,
      type: DASHBOARD_DATA_LOADING_ERROR,
      filter,
    });
  });
});

// vim: set ts=2 sw=2 tw=80:
