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
import {defaultFilterLoadingActions} from '../actions';
import reducer from '../reducers';
import Filter from 'gmp/models/filter';

describe('default filters reducers tests', () => {
  test('should init state', () => {
    const state = reducer(undefined, {});
    expect(state).toEqual({});
  });

  test('should reduce a request action', () => {
    const prevState = {};
    const action = defaultFilterLoadingActions.request('foo');
    const state = reducer(prevState, action);
    expect(state).toEqual({
      foo: {
        isLoading: true,
      },
    });
  });

  test('should override isLoading when reducing a request action', () => {
    const filter = Filter.fromString('foo=bar');
    const prevState = {
      foo: {
        isLoading: false,
        filter,
        error: 'An error',
      },
    };
    const action = defaultFilterLoadingActions.request('foo');
    const state = reducer(prevState, action);
    expect(state).toEqual({
      foo: {
        isLoading: true,
        filter,
        error: 'An error',
      },
    });
  });

  test('should reduce an error action', () => {
    const prevState = {};
    const action = defaultFilterLoadingActions.error('foo', 'An error');
    const state = reducer(prevState, action);
    expect(state).toEqual({
      foo: {
        isLoading: false,
        error: 'An error',
      },
    });
  });

  test('should update state when reducing an error action', () => {
    const filter = Filter.fromString('foo=bar');
    const prevState = {
      foo: {
        isLoading: true,
        filter,
        error: 'An old error',
      },
    };
    const action = defaultFilterLoadingActions.error('foo', 'An error');
    const state = reducer(prevState, action);
    expect(state).toEqual({
      foo: {
        isLoading: false,
        error: 'An error',
        filter,
      },
    });
  });

  test('should reduce a success action', () => {
    const filter = Filter.fromString('foo=bar');
    const prevState = {};
    const action = defaultFilterLoadingActions.success('foo', filter);
    const state = reducer(prevState, action);
    expect(state).toEqual({
      foo: {
        isLoading: false,
        filter,
      },
    });
  });

  test('should update state when reducing a success action', () => {
    const oldFilter = Filter.fromString('bar=foo');
    const filter = Filter.fromString('foo=bar');
    const prevState = {
      foo: {
        isLoading: true,
        filter: oldFilter,
        error: 'An old error',
      },
    };
    const action = defaultFilterLoadingActions.success('foo', filter);
    const state = reducer(prevState, action);
    expect(state).toEqual({
      foo: {
        isLoading: false,
        filter,
      },
    });
  });
});
