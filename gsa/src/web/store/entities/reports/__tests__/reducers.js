/* Copyright (C) 2019-2021 Greenbone Networks GmbH
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

import {isFunction} from 'gmp/utils/identity';

import {entitiesActions as actions} from 'web/store/entities/reports';
import {reportsReducer} from 'web/store/entities/reports/reducers';
import {filterIdentifier} from 'web/store/utils';

describe('report entities reducer tests', () => {
  test('should be a reportsReducer function', () => {
    expect(isFunction(reportsReducer)).toBe(true);
  });

  test('should create initial state', () => {
    expect(reportsReducer(undefined, {})).toEqual({});
  });

  test('should reduce request action', () => {
    const action = actions.request();

    const previousState = {
      isLoading: {
        default: false,
      },
      default: {
        ids: ['bar'],
      },
    };

    expect(reportsReducer(previousState, action)).toEqual({
      byId: {},
      errors: {},
      isLoading: {
        default: true,
      },
      default: {
        ids: ['bar'],
      },
    });
  });

  test('should reduce request action with filter', () => {
    const filter = Filter.fromString('foo=bar rows=10');
    const action = actions.request(filter);

    const previousState = {
      isLoading: {
        [filterIdentifier(filter)]: false,
      },
      [filterIdentifier(filter)]: {
        ids: ['bar'],
      },
    };

    expect(reportsReducer(previousState, action)).toEqual({
      byId: {},
      errors: {},
      [filterIdentifier(filter)]: {
        ids: ['bar'],
      },
      isLoading: {
        [filterIdentifier(filter)]: true,
      },
    });
  });

  test('should reduce success action', () => {
    const action = actions.success([{id: 'foo'}]);

    const previousState = {
      byId: {
        bar: {
          id: 'bar',
        },
      },
      isLoading: {
        default: true,
      },
    };

    expect(reportsReducer(previousState, action)).toEqual({
      byId: {
        bar: {
          id: 'bar',
        },
        foo: {
          id: 'foo',
        },
      },
      errors: {},
      isLoading: {
        default: false,
      },
      default: {
        ids: ['foo'],
      },
    });
  });

  test('should reduce success action with filter', () => {
    const filter = Filter.fromString('foo=bar rows=10');
    const action = actions.success([{id: 'foo'}], filter);

    const previousState = {
      byId: {
        bar: {
          id: 'bar',
        },
      },
      isLoading: {
        [filterIdentifier(filter)]: true,
      },
      [filterIdentifier(filter)]: {
        ids: ['bar'],
      },
    };

    expect(reportsReducer(previousState, action)).toEqual({
      byId: {
        foo: {
          id: 'foo',
        },
        bar: {
          id: 'bar',
        },
      },
      errors: {},
      isLoading: {
        [filterIdentifier(filter)]: false,
      },
      [filterIdentifier(filter)]: {
        ids: ['foo'],
      },
    });
  });

  test('should reduce error action', () => {
    const action = actions.error('An error');

    const previousState = {
      isLoading: {
        default: true,
      },
      default: {
        ids: ['bar'],
      },
    };

    expect(reportsReducer(previousState, action)).toEqual({
      byId: {},
      errors: {
        default: 'An error',
      },
      isLoading: {
        default: false,
      },
      default: {
        ids: ['bar'],
      },
    });
  });

  test('should reduce error action with filter', () => {
    const filter = Filter.fromString('foo=bar rows=10');
    const action = actions.error('An error', filter);

    const previousState = {
      isLoading: {
        [filterIdentifier(filter)]: true,
      },
      [filterIdentifier(filter)]: {
        ids: ['bar'],
      },
    };

    expect(reportsReducer(previousState, action)).toEqual({
      byId: {},
      errors: {
        [filterIdentifier(filter)]: 'An error',
      },
      isLoading: {
        [filterIdentifier(filter)]: false,
      },
      [filterIdentifier(filter)]: {
        ids: ['bar'],
      },
    });
  });
});
