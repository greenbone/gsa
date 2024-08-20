/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';

import Filter from 'gmp/models/filter';

import {filterIdentifier} from 'web/store/utils';

import getDashboardData from '../selectors';

const createState = state => ({
  dashboardData: {
    ...state,
  },
});

describe('dashboard data selector init tests', () => {
  test('should not crash with undefined data', () => {
    const id = 'a1';
    const selector = getDashboardData();

    expect(selector.getData(id)).toBeUndefined();
    expect(selector.getError(id)).toBeUndefined();
    expect(selector.getIsLoading(id)).toEqual(false);
  });

  test('should not crash with empty state', () => {
    const id = 'a1';
    const selector = getDashboardData({});

    expect(selector.getData(id)).toBeUndefined();
    expect(selector.getError(id)).toBeUndefined();
    expect(selector.getIsLoading(id)).toEqual(false);
  });

  test('should not crash with empty dashboard data', () => {
    const id = 'a1';
    const rootState = createState();
    const selector = getDashboardData(rootState);

    expect(selector.getData(id)).toBeUndefined();
    expect(selector.getError(id)).toBeUndefined();
    expect(selector.getIsLoading(id)).toEqual(false);
  });
});

describe('dashboard data selector isLoading tests', () => {
  test('should return true for isLoading', () => {
    const id = 'a1';
    const filterString = filterIdentifier();
    const rootState = createState({
      [id]: {
        [filterString]: {
          isLoading: true,
        },
      },
    });
    const selector = getDashboardData(rootState);
    expect(selector.getIsLoading(id)).toEqual(true);
  });

  test('should return true for isLoading with filter', () => {
    const id = 'a1';
    const filter = Filter.fromString('foo=bar');
    const filterString = filterIdentifier(filter);
    const rootState = createState({
      [id]: {
        [filterString]: {
          isLoading: true,
        },
      },
    });
    const selector = getDashboardData(rootState);
    expect(selector.getIsLoading(id, filter)).toEqual(true);
  });
});

describe('dashboard data selector error tests', () => {
  test('should return error', () => {
    const id = 'a1';
    const filterString = filterIdentifier();
    const rootState = createState({
      [id]: {
        [filterString]: {
          error: 'An error',
        },
      },
    });
    const selector = getDashboardData(rootState);
    expect(selector.getError(id)).toEqual('An error');
  });

  test('should return true for isLoading with filter', () => {
    const id = 'a1';
    const filter = Filter.fromString('foo=bar');
    const filterString = filterIdentifier(filter);
    const rootState = createState({
      [id]: {
        [filterString]: {
          error: 'An error',
        },
      },
    });
    const selector = getDashboardData(rootState);
    expect(selector.getError(id, filter)).toEqual('An error');
  });
});

describe('dashboard data selector getData tests', () => {
  test('should return data', () => {
    const id = 'a1';
    const filterString = filterIdentifier();
    const rootState = createState({
      [id]: {
        [filterString]: {
          data: {
            foo: 'bar',
          },
        },
      },
    });

    const selector = getDashboardData(rootState);

    expect(selector.getData(id)).toEqual({foo: 'bar'});
  });

  test('should return data with filter', () => {
    const id = 'a1';
    const filter = Filter.fromString('foo=bar');
    const filterString = filterIdentifier(filter);
    const rootState = createState({
      [id]: {
        [filterString]: {
          data: {
            foo: 'bar',
          },
        },
      },
    });

    const selector = getDashboardData(rootState);

    expect(selector.getData(id, filter)).toEqual({foo: 'bar'});
  });

  test('should return undefined if unknown id is passed', () => {
    const id = 'a1';
    const filterString = filterIdentifier();
    const rootState = createState({
      [id]: {
        [filterString]: {
          data: {
            foo: 'bar',
          },
        },
      },
    });

    const selector = getDashboardData(rootState);
    expect(selector.getData('a2')).toBeUndefined();
  });

  test('should return undefined if unknown filter is passed', () => {
    const id = 'a1';
    const filter = Filter.fromString('foo=bar');
    const filterString = filterIdentifier();
    const rootState = createState({
      [id]: {
        [filterString]: {
          data: {
            foo: 'bar',
          },
        },
      },
    });

    const selector = getDashboardData(rootState);
    expect(selector.getData(id, filter)).toBeUndefined();
  });
});

// vim: set ts=2 sw=2 tw=80:
