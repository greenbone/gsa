/* Copyright (C) 2019-2020 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301 USA.
 */

import Filter from 'gmp/models/filter';

import {isFunction} from 'gmp/utils/identity';

import {reportActions} from '../actions';
import {reportReducer} from '../reducers';
import {reportIdentifier, simplifiedReportIdentifier} from '../selectors';

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
