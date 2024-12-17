/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
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
