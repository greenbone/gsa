/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import Filter from 'gmp/models/filter';
import {
  receivedDashboardData,
  requestDashboardData,
  receivedDashboardError,
} from 'web/store/dashboard/data/actions';
import dashboardData from 'web/store/dashboard/data/reducers';
import {filterIdentifier} from 'web/store/utils';

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
