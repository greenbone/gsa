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

import {filterIdentifier} from 'web/store/utils';

import dashboardData from '../reducers';

import {
  receivedDashboardData,
  requestDashboardData,
  receivedDashboardError,
} from '../actions';

describe('dashboard data reducers tests', () => {
  test('should return the initial state', () => {
    const state = dashboardData(undefined, {});
    expect(state).toEqual({});
  });

  test('should return the initial state if action with id is passed', () => {
    const state = dashboardData(undefined, {id: 'foo'});
    expect(state).toEqual({});
  });

  test('should handle request dashboard data', () => {
    const id = 'a1';
    const action = requestDashboardData(id);

    expect(dashboardData({}, action)).toEqual({
      [id]: {
        default: {
          isLoading: true,
          error: null,
        },
      },
    });
  });

  test('should handle request dashboard data with filter', () => {
    const id = 'a1';
    const filter = Filter.fromString('name=foo');
    const filterString = filterIdentifier(filter);
    const action = requestDashboardData(id, filter);

    expect(dashboardData({}, action)).toEqual({
      [id]: {
        [filterString]: {
          isLoading: true,
          error: null,
        },
      },
    });
  });

  test('should handle receive dashboard data', () => {
    const id = 'a1';
    const data = {foo: 'bar'};
    const action = receivedDashboardData(id, data);

    expect(dashboardData({}, action)).toEqual({
      [id]: {
        default: {
          isLoading: false,
          data,
          error: null,
        },
      },
    });
  });

  test('should handle receive dashboard data with filter', () => {
    const id = 'a1';
    const data = {foo: 'bar'};
    const filter = Filter.fromString('name=foo');
    const filterString = filterIdentifier(filter);
    const action = receivedDashboardData(id, data, filter);

    expect(dashboardData({}, action)).toEqual({
      [id]: {
        [filterString]: {
          isLoading: false,
          data,
          error: null,
        },
      },
    });
  });

  test('should handle receive dashboard error', () => {
    const id = 'a1';
    const error = 'An error occured';
    const action = receivedDashboardError(id, error);

    expect(dashboardData({}, action)).toEqual({
      [id]: {
        default: {
          isLoading: false,
          error,
        },
      },
    });
  });

  test('should handle receive dashboard error with filter', () => {
    const id = 'a1';
    const error = 'An error occured';
    const filter = Filter.fromString('name=foo');
    const filterString = filterIdentifier(filter);
    const action = receivedDashboardError(id, error, filter);

    expect(dashboardData({}, action)).toEqual({
      [id]: {
        [filterString]: {
          isLoading: false,
          error,
        },
      },
    });
  });
});

// vim: set ts=2 sw=2 tw=80:
