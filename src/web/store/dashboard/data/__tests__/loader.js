/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';

import Filter from 'gmp/models/filter';

import {loadFunc} from '../loader';
import {
  DASHBOARD_DATA_LOADING_REQUEST,
  DASHBOARD_DATA_LOADING_SUCCESS,
  DASHBOARD_DATA_LOADING_ERROR,
} from '../actions';
import {filterIdentifier} from 'web/store/utils';

const createState = state => ({
  dashboardData: {
    ...state,
  },
});

describe('loadFunc tests', () => {
  test('should request dashboard data successfully', () => {
    const dispatch = testing.fn();
    const getState = testing.fn();
    const data = {
      foo: 'bar',
    };
    const func = testing.fn().mockResolvedValue(data);

    const id = 'a1';
    const filter = Filter.fromString('foo=bar');
    const props = {
      filter,
    };

    return loadFunc(
      func,
      id,
    )(props)(dispatch, getState).then(() => {
      expect(getState).toHaveBeenCalled();
      expect(func).toHaveBeenCalledWith(props);
      expect(dispatch).toHaveBeenNthCalledWith(1, {
        type: DASHBOARD_DATA_LOADING_REQUEST,
        id,
        filter,
      });
      expect(dispatch).toHaveBeenNthCalledWith(2, {
        type: DASHBOARD_DATA_LOADING_SUCCESS,
        id,
        filter,
        data,
      });
    });
  });

  test('should not load if data is already loading', () => {
    const id = 'a1';
    const filter = Filter.fromString('foo=bar');
    const filterString = filterIdentifier(filter);
    const state = createState({
      [id]: {
        [filterString]: {
          isLoading: true,
        },
      },
    });
    const dispatch = testing.fn();
    const getState = testing.fn().mockReturnValue(state);
    const data = {
      foo: 'bar',
    };
    const func = testing.fn().mockResolvedValue(data);

    const props = {
      filter,
    };

    return loadFunc(
      func,
      id,
    )(props)(dispatch, getState).then(() => {
      expect(getState).toHaveBeenCalled();
      expect(func).not.toHaveBeenCalled();
      expect(dispatch).not.toHaveBeenCalled();
    });
  });

  test('should fail loading dashboard data', () => {
    const id = 'a1';
    const filter = Filter.fromString('foo=bar');
    const dispatch = testing.fn();
    const getState = testing.fn();
    const func = testing.fn().mockRejectedValue('An error');

    const props = {
      filter,
    };

    return loadFunc(
      func,
      id,
    )(props)(dispatch, getState).then(() => {
      expect(getState).toHaveBeenCalled();
      expect(func).toHaveBeenCalledWith(props);
      expect(dispatch).toHaveBeenNthCalledWith(1, {
        type: DASHBOARD_DATA_LOADING_REQUEST,
        id,
        filter,
      });
      expect(dispatch).toHaveBeenNthCalledWith(2, {
        type: DASHBOARD_DATA_LOADING_ERROR,
        id,
        filter,
        error: 'An error',
      });
    });
  });
});

// vim: set ts=2 sw=2 tw=80:
