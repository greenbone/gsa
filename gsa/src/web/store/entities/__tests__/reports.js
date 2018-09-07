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
import {isFunction} from 'gmp/utils/identity';

import {types} from 'web/store/entities/utils/actions';

import {
  testEntitiesActions,
  testEntityActions,
  testLoadEntities,
  testReducerForEntities,
  testReducerForEntity,
  createState,
  createRootState,
} from 'web/store/entities/utils/testing';

import {
  entitiesActions,
  entityActions,
  loadEntities,
  loadEntity,
  reducer,
  deltaEntityActions,
  deltaReducer,
  deltaSelector,
  loadDeltaReport,
} from '../reports';
import Filter from 'gmp/models/filter';

testEntitiesActions('report', entitiesActions);
testEntityActions('report', entityActions);
testLoadEntities('report', loadEntities);
testReducerForEntities('report', reducer, entitiesActions);
testReducerForEntity('report', reducer, entityActions);

const entityType = 'report';

describe('report loadEntity function tests', () => {

  test('should load report successfully', () => {
    const id = 'a1';
    const rootState = createState(entityType, {
      isLoading: {
        [id]: false,
      },
    });
    const getState = jest
      .fn()
      .mockReturnValue(rootState);

    const dispatch = jest.fn();

    const get = jest
      .fn()
      .mockReturnValue(Promise.resolve({
        data: {foo: 'bar'},
      }));

    const gmp = {
      [entityType]: {
        get,
      },
    };

    expect(loadEntity).toBeDefined();
    expect(isFunction(loadEntity)).toBe(true);

    return loadEntity(gmp)(id)(dispatch, getState).then(() => {
      expect(getState).toBeCalled();
      expect(get).toBeCalledWith({id}, {filter: undefined});
      expect(dispatch).toHaveBeenCalledTimes(2);
      expect(dispatch.mock.calls[0]).toEqual([{
        type: types.ENTITY_LOADING_REQUEST,
        entityType,
        id,
      }]);
      expect(dispatch.mock.calls[1]).toEqual([{
        type: types.ENTITY_LOADING_SUCCESS,
        entityType,
        data: {foo: 'bar'},
        id,
      }]);
    });
  });

  test('should load report with results filter successfully', () => {
    const id = 'a1';
    const rootState = createState(entityType, {
      isLoading: {
        [id]: false,
      },
    });
    const getState = jest
      .fn()
      .mockReturnValue(rootState);

    const dispatch = jest.fn();

    const get = jest
      .fn()
      .mockReturnValue(Promise.resolve({
        data: {foo: 'bar'},
      }));

    const gmp = {
      [entityType]: {
        get,
      },
    };

    const filter = Filter.fromString('foo=bar');

    expect(loadEntity).toBeDefined();
    expect(isFunction(loadEntity)).toBe(true);

    return loadEntity(gmp)(id, filter)(dispatch, getState).then(() => {
      expect(getState).toBeCalled();
      expect(get).toBeCalledWith({id}, {filter});
      expect(dispatch).toHaveBeenCalledTimes(2);
      expect(dispatch.mock.calls[0]).toEqual([{
        type: types.ENTITY_LOADING_REQUEST,
        entityType,
        id,
      }]);
      expect(dispatch.mock.calls[1]).toEqual([{
        type: types.ENTITY_LOADING_SUCCESS,
        entityType,
        data: {foo: 'bar'},
        id,
      }]);
    });
  });

  test('should not load report if isLoading is true', () => {
    const id = 'a1';
    const rootState = createState(entityType, {
      isLoading: {
        [id]: true,
      },
    });

    const getState = jest
      .fn()
      .mockReturnValue(rootState);

    const dispatch = jest.fn();

    const get = jest
      .fn()
      .mockReturnValue(Promise.resolve([{id: 'foo'}]));

    const gmp = {
      [entityType]: {
        get,
      },
    };

    return loadEntity(gmp)(id)(dispatch, getState).then(() => {
      expect(getState).toBeCalled();
      expect(dispatch).not.toBeCalled();
      expect(get).not.toBeCalled();
    });
  });

  test('should fail loading entity with an error', () => {
    const id = 'a1';
    const rootState = createState(entityType, {
      [id]: {
        isLoading: false,
      },
    });

    const getState = jest
      .fn()
      .mockReturnValue(rootState);

    const dispatch = jest.fn();

    const get = jest
      .fn()
      .mockReturnValue(Promise.reject('An Error'));

    const gmp = {
      [entityType]: {
        get,
      },
    };

    return loadEntity(gmp)(id)(dispatch, getState).then(() => {
      expect(getState).toBeCalled();
      expect(get).toBeCalledWith({id}, {filter: undefined});
      expect(dispatch).toHaveBeenCalledTimes(2);
      expect(dispatch.mock.calls[0]).toEqual([{
        type: types.ENTITY_LOADING_REQUEST,
        entityType,
        id,
      }]);
      expect(dispatch.mock.calls[1]).toEqual([{
        type: types.ENTITY_LOADING_ERROR,
        entityType,
        error: 'An Error',
        id,
      }]);
    });
  });
});

// vim: set ts=2 sw=2 tw=80:
