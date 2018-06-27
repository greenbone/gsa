/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2018 Greenbone Networks GmbH
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
import {is_function} from 'gmp/utils/identity';

import Filter from 'gmp/models/filter';

import {createRootState} from '../utils/testing';

import {actions, types, reducer, loadAll} from '../filters';

describe('filter entities actions tests', () => {

  test('should have action creators', () => {
    expect(is_function(actions.request)).toBe(true);
    expect(is_function(actions.success)).toBe(true);
    expect(is_function(actions.error)).toBe(true);
  });

  test('should create a load filters request action', () => {
    const action = actions.request();
    expect(action).toEqual({
      type: types.REQUEST,
    });
  });

  test('should create a load specific filters request action', () => {
    const filter = Filter.fromString('type=abc');
    const action = actions.request(filter);

    expect(action).toEqual({
      type: types.REQUEST,
      filter,
    });
  });

  test('should create a load filters success action', () => {
    const action = actions.success(['foo', 'bar']);
    expect(action).toEqual({
      type: types.SUCCESS,
      data: ['foo', 'bar'],
    });
  });

  test('should create a load specific filters success action', () => {
    const filter = Filter.fromString('type=abc');
    const action = actions.success(['foo', 'bar'], filter);

    expect(action).toEqual({
      type: types.SUCCESS,
      data: ['foo', 'bar'],
      filter,
    });
  });

  test('should create a load filters error action', () => {
    const action = actions.error('An error');
    expect(action).toEqual({
      type: types.ERROR,
      error: 'An error',
    });
  });

  test('should create a load specific filters error action', () => {
    const filter = Filter.fromString('type=abc');
    const action = actions.error('An error', filter);

    expect(action).toEqual({
      type: types.ERROR,
      error: 'An error',
      filter,
    });
  });

});

describe('filter entities reducers tests', () => {

  test('should be a reducer function', () => {
    expect(is_function(reducer)).toBe(true);
  });

  test('should create initial state', () => {
    expect(reducer(undefined, {})).toEqual({});
  });

  test('should reduce request action', () => {
    const action = actions.request();

    expect(reducer(undefined, action)).toEqual({
      byId: {},
      default: {
        isLoading: true,
        error: null,
        entities: [],
      },
    });
  });

  test('should reduce success action', () => {
    const action = actions.success([{id: 'foo'}]);

    expect(reducer(undefined, action)).toEqual({
      byId: {
        foo: {
          id: 'foo',
        },
      },
      default: {
        isLoading: false,
        error: null,
        entities: ['foo'],
      },
    });
  });

  test('should reduce error action', () => {
    const action = actions.error('An error');

    expect(reducer(undefined, action)).toEqual({
      byId: {},
      default: {
        isLoading: false,
        error: 'An error',
        entities: [],
      },
    });
  });
});

describe('filter loadAll function tests', () => {

  test('test loading success', () => {
    const filter = Filter.fromString('myfilter');
    const rootState = createRootState({
      myfilter: {
        isLoading: false,
      },
    });
    const getState = jest
      .fn()
      .mockReturnValue(rootState);

    const dispatch = jest.fn();

    const getAll = jest
      .fn()
      .mockReturnValue(Promise.resolve({
        data: 'foo',
      }));

    const gmp = {
      filters: {
        getAll,
      },
    };

    const props = {
      gmp,
      filter,
      other: 3,
    };

    expect(loadAll).toBeDefined();
    expect(is_function(loadAll)).toBe(true);

    return loadAll(props)(dispatch, getState).then(() => {
      expect(getState).toBeCalled();
      expect(getAll).toBeCalledWith({filter});
      expect(dispatch).toHaveBeenCalledTimes(2);
      expect(dispatch.mock.calls[0]).toEqual([{
        type: types.REQUEST,
        filter,
      }]);
      expect(dispatch.mock.calls[1]).toEqual([{
        type: types.SUCCESS,
        filter,
        data: 'foo',
      }]);
    });
  });
});

// vim: set ts=2 sw=2 tw=80:
