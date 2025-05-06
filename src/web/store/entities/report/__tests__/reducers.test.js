/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import Filter from 'gmp/models/filter';
import {isFunction} from 'gmp/utils/identity';
import {reportActions} from 'web/store/entities/report/actions';
import {reportReducer} from 'web/store/entities/report/reducers';
import {
  reportIdentifier,
  simplifiedReportIdentifier,
} from 'web/store/entities/report/selectors';

describe('report reducer tests', () => {
  test('should be a reducer function', () => {
    expect(isFunction(reportReducer)).toBe(true);
  });

  test('should create initial state', () => {
    expect(reportReducer(undefined, {})).toEqual({});
  });

  test('should reduce request action', () => {
    const id = 'a1';
    const action = reportActions.request(id);

    expect(reportReducer(undefined, action)).toEqual({
      byId: {},
      errors: {},
      isLoading: {
        [id]: true,
      },
    });
  });

  test('should reduce request action with filter', () => {
    const id = 'a1';
    const filter = Filter.fromString('foo=bar rows=10');
    const action = reportActions.request(id, filter);

    expect(reportReducer(undefined, action)).toEqual({
      byId: {},
      errors: {},
      isLoading: {
        [reportIdentifier(id, filter)]: true,
      },
    });
  });

  test('should reduce success action', () => {
    const id = 'a1';
    const action = reportActions.success(id, {data: 'foo'});

    expect(reportReducer(undefined, action)).toEqual({
      byId: {
        [id]: {
          data: 'foo',
        },
      },
      errors: {},
      isLoading: {
        [id]: false,
      },
    });
  });

  test('should reduce success action with filter', () => {
    const id = 'a1';
    const filter = Filter.fromString('foo=bar rows=10');
    const action = reportActions.success(id, {data: 'foo'}, filter);

    expect(reportReducer(undefined, action)).toEqual({
      byId: {
        [simplifiedReportIdentifier(id, filter)]: {
          data: 'foo',
        },
      },
      errors: {},
      isLoading: {
        [reportIdentifier(id, filter)]: false,
      },
    });
  });

  test('should reduce success action with simplified filter', () => {
    const id = 'a1';
    const filter = Filter.fromString('foo=bar rows=10');
    const filter2 = Filter.fromString('foo=bar first=10');
    const action = reportActions.success(id, {data: 'foo'}, filter2);

    const existingState = {
      byId: {
        [simplifiedReportIdentifier(id, filter)]: {
          data: 'bar',
        },
      },
      errors: {
        [reportIdentifier(id, filter)]: 'An error',
        [reportIdentifier(id, filter2)]: 'Another error',
      },
      isLoading: {
        [reportIdentifier(id, filter)]: true,
        [reportIdentifier(id, filter2)]: false,
      },
    };

    expect(reportReducer(existingState, action)).toEqual({
      byId: {
        [simplifiedReportIdentifier(id, filter)]: {
          data: 'foo',
        },
      },
      errors: {
        [reportIdentifier(id, filter)]: 'An error',
      },
      isLoading: {
        [reportIdentifier(id, filter)]: true,
        [reportIdentifier(id, filter2)]: false,
      },
    });
  });

  test('should reduce error action', () => {
    const id = 'a1';
    const action = reportActions.error(id, 'An error');

    expect(reportReducer(undefined, action)).toEqual({
      byId: {},
      errors: {
        [id]: 'An error',
      },
      isLoading: {
        [id]: false,
      },
    });
  });

  test('should reduce error action with filter', () => {
    const id = 'a1';
    const filter = Filter.fromString('foo=bar rows=10');
    const filter2 = Filter.fromString('foo=bar first=10');
    const action = reportActions.error(id, 'Another error', filter2);
    const existingState = {
      byId: {
        [simplifiedReportIdentifier(id, filter)]: {
          data: 'foo',
        },
        [simplifiedReportIdentifier(id, filter2)]: {
          data: 'bar',
        },
      },
      errors: {
        [reportIdentifier(id, filter)]: 'An error',
      },
      isLoading: {
        [reportIdentifier(id, filter)]: true,
        [reportIdentifier(id, filter2)]: true,
      },
    };

    expect(reportReducer(existingState, action)).toEqual({
      byId: {
        [simplifiedReportIdentifier(id, filter)]: {
          data: 'foo',
        },
        [simplifiedReportIdentifier(id, filter2)]: {
          data: 'bar',
        },
      },
      errors: {
        [reportIdentifier(id, filter)]: 'An error',
        [reportIdentifier(id, filter2)]: 'Another error',
      },
      isLoading: {
        [reportIdentifier(id, filter)]: true,
        [reportIdentifier(id, filter2)]: false,
      },
    });
  });
});
