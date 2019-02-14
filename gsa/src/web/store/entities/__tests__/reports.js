/* Copyright (C) 2018-2019 Greenbone Networks GmbH
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
    const getState = jest.fn().mockReturnValue(rootState);

    const dispatch = jest.fn();

    const get = jest.fn().mockReturnValue(
      Promise.resolve({
        data: {foo: 'bar'},
      }),
    );

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
      expect(dispatch.mock.calls[0]).toEqual([
        {
          type: types.ENTITY_LOADING_REQUEST,
          entityType,
          id,
        },
      ]);
      expect(dispatch.mock.calls[1]).toEqual([
        {
          type: types.ENTITY_LOADING_SUCCESS,
          entityType,
          data: {foo: 'bar'},
          id,
        },
      ]);
    });
  });

  test('should load report with results filter successfully', () => {
    const id = 'a1';
    const rootState = createState(entityType, {
      isLoading: {
        [id]: false,
      },
    });
    const getState = jest.fn().mockReturnValue(rootState);

    const dispatch = jest.fn();

    const get = jest.fn().mockReturnValue(
      Promise.resolve({
        data: {foo: 'bar'},
      }),
    );

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
      expect(dispatch.mock.calls[0]).toEqual([
        {
          type: types.ENTITY_LOADING_REQUEST,
          entityType,
          id,
        },
      ]);
      expect(dispatch.mock.calls[1]).toEqual([
        {
          type: types.ENTITY_LOADING_SUCCESS,
          entityType,
          data: {foo: 'bar'},
          id,
        },
      ]);
    });
  });

  test('should not load report if isLoading is true', () => {
    const id = 'a1';
    const rootState = createState(entityType, {
      isLoading: {
        [id]: true,
      },
    });

    const getState = jest.fn().mockReturnValue(rootState);

    const dispatch = jest.fn();

    const get = jest.fn().mockReturnValue(Promise.resolve([{id: 'foo'}]));

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

    const getState = jest.fn().mockReturnValue(rootState);

    const dispatch = jest.fn();

    const get = jest.fn().mockReturnValue(Promise.reject('An Error'));

    const gmp = {
      [entityType]: {
        get,
      },
    };

    return loadEntity(gmp)(id)(dispatch, getState).then(() => {
      expect(getState).toBeCalled();
      expect(get).toBeCalledWith({id}, {filter: undefined});
      expect(dispatch).toHaveBeenCalledTimes(2);
      expect(dispatch.mock.calls[0]).toEqual([
        {
          type: types.ENTITY_LOADING_REQUEST,
          entityType,
          id,
        },
      ]);
      expect(dispatch.mock.calls[1]).toEqual([
        {
          type: types.ENTITY_LOADING_ERROR,
          entityType,
          error: 'An Error',
          id,
        },
      ]);
    });
  });
});

testEntityActions('deltaReport', deltaEntityActions);
testReducerForEntity('deltaReport', deltaReducer, deltaEntityActions);

describe('delta report loadDeltaReport function tests', () => {
  test('should load delta report successfully', () => {
    const id = 'a1';
    const deltaId = 'a2';
    const identifier = `${id}+${deltaId}`;

    const rootState = createState('deltaReport', {
      isLoading: {
        [identifier]: false,
      },
    });
    const getState = jest.fn().mockReturnValue(rootState);

    const dispatch = jest.fn();

    const getDelta = jest.fn().mockReturnValue(
      Promise.resolve({
        data: {foo: 'bar'},
      }),
    );

    const gmp = {
      [entityType]: {
        getDelta,
      },
    };

    expect(loadDeltaReport).toBeDefined();
    expect(isFunction(loadDeltaReport)).toBe(true);

    return loadDeltaReport(gmp)(id, deltaId)(dispatch, getState).then(() => {
      expect(getState).toBeCalled();
      expect(getDelta).toBeCalledWith({id}, {id: deltaId}, {filter: undefined});
      expect(dispatch).toHaveBeenCalledTimes(2);
      expect(dispatch.mock.calls[0]).toEqual([
        {
          type: types.ENTITY_LOADING_REQUEST,
          entityType: 'deltaReport',
          id: identifier,
        },
      ]);
      expect(dispatch.mock.calls[1]).toEqual([
        {
          type: types.ENTITY_LOADING_SUCCESS,
          entityType: 'deltaReport',
          data: {foo: 'bar'},
          id: identifier,
        },
      ]);
    });
  });

  test('should load delta report with results filter successfully', () => {
    const id = 'a1';
    const deltaId = 'a2';
    const identifier = `${id}+${deltaId}`;

    const rootState = createState('deltaReport', {
      isLoading: {
        [identifier]: false,
      },
    });
    const getState = jest.fn().mockReturnValue(rootState);

    const dispatch = jest.fn();

    const getDelta = jest.fn().mockReturnValue(
      Promise.resolve({
        data: {foo: 'bar'},
      }),
    );

    const gmp = {
      [entityType]: {
        getDelta,
      },
    };

    const filter = Filter.fromString('foo=bar');

    expect(loadDeltaReport).toBeDefined();
    expect(isFunction(loadDeltaReport)).toBe(true);

    return loadDeltaReport(gmp)(id, deltaId, filter)(dispatch, getState).then(
      () => {
        expect(getState).toBeCalled();
        expect(getDelta).toBeCalledWith({id}, {id: deltaId}, {filter});
        expect(dispatch).toHaveBeenCalledTimes(2);
        expect(dispatch.mock.calls[0]).toEqual([
          {
            type: types.ENTITY_LOADING_REQUEST,
            entityType: 'deltaReport',
            id: identifier,
          },
        ]);
        expect(dispatch.mock.calls[1]).toEqual([
          {
            type: types.ENTITY_LOADING_SUCCESS,
            entityType: 'deltaReport',
            data: {foo: 'bar'},
            id: identifier,
          },
        ]);
      },
    );
  });

  test('should not load delta report if isLoading is true', () => {
    const id = 'a1';
    const deltaId = 'a2';
    const identifier = `${id}+${deltaId}`;
    const rootState = createState('deltaReport', {
      isLoading: {
        [identifier]: true,
      },
    });

    const getState = jest.fn().mockReturnValue(rootState);

    const dispatch = jest.fn();

    const getDelta = jest.fn().mockReturnValue(Promise.resolve([{id: 'foo'}]));

    const gmp = {
      [entityType]: {
        getDelta,
      },
    };

    return loadDeltaReport(gmp)(id, deltaId)(dispatch, getState).then(() => {
      expect(getState).toBeCalled();
      expect(dispatch).not.toBeCalled();
      expect(getDelta).not.toBeCalled();
    });
  });

  test('should fail loading delta report with an error', () => {
    const id = 'a1';
    const deltaId = 'a2';
    const identifier = `${id}+${deltaId}`;
    const rootState = createState('deltaReport', {
      [identifier]: {
        isLoading: false,
      },
    });

    const getState = jest.fn().mockReturnValue(rootState);

    const dispatch = jest.fn();

    const getDelta = jest.fn().mockReturnValue(Promise.reject('An Error'));

    const gmp = {
      [entityType]: {
        getDelta,
      },
    };

    return loadDeltaReport(gmp)(id, deltaId)(dispatch, getState).then(() => {
      expect(getState).toBeCalled();
      expect(getDelta).toBeCalledWith({id}, {id: deltaId}, {filter: undefined});
      expect(dispatch).toHaveBeenCalledTimes(2);
      expect(dispatch.mock.calls[0]).toEqual([
        {
          type: types.ENTITY_LOADING_REQUEST,
          entityType: 'deltaReport',
          id: identifier,
        },
      ]);
      expect(dispatch.mock.calls[1]).toEqual([
        {
          type: types.ENTITY_LOADING_ERROR,
          entityType: 'deltaReport',
          error: 'An Error',
          id: identifier,
        },
      ]);
    });
  });
});

describe('deltaSelector isLoading tests', () => {
  test('should be false for undefined state', () => {
    const id = 'a1';
    const deltaId = 'a2';
    const rootState = createRootState({});
    const selector = deltaSelector(rootState);

    expect(selector.isLoading(id, deltaId)).toBe(false);
  });

  test('should be false for empty state', () => {
    const id = 'a1';
    const deltaId = 'a2';
    const rootState = createState('deltaReport', {});
    const selector = deltaSelector(rootState);

    expect(selector.isLoading(id, deltaId)).toEqual(false);
  });

  test('should be false for unknown id', () => {
    const id = 'a1';
    const deltaId = 'a2';
    const rootState = createState('deltaReport', {
      isLoading: {
        foo: true,
      },
    });
    const selector = deltaSelector(rootState);

    expect(selector.isLoading(id, deltaId)).toBe(false);
  });

  test('should be false if false in state', () => {
    const id = 'a1';
    const deltaId = 'a2';
    const identifier = `${id}+${deltaId}`;
    const rootState = createState('deltaId', {
      isLoading: {
        [identifier]: false,
      },
    });
    const selector = deltaSelector(rootState);

    expect(selector.isLoading(id, deltaId)).toBe(false);
  });

  test('should be true if true in state', () => {
    const id = 'a1';
    const deltaId = 'a2';
    const identifier = `${id}+${deltaId}`;
    const rootState = createState('deltaReport', {
      isLoading: {
        [identifier]: true,
      },
    });
    const selector = deltaSelector(rootState);

    expect(selector.isLoading(id, deltaId)).toBe(true);
  });
});

describe('deltaSelector getEntity tests', () => {
  test('should return undefined for empty state', () => {
    const rootState = createRootState({});
    const selector = deltaSelector(rootState);

    expect(selector.getEntity('bar')).toBeUndefined();
  });

  test('should return undefined for empty byId', () => {
    const rootState = createState('deltaReport', {
      byId: {},
    });
    const selector = deltaSelector(rootState);

    expect(selector.getEntity('bar')).toBeUndefined();
  });

  test('should return undefined for unknown id', () => {
    const rootState = createState('deltaReport', {
      byId: {
        foo: {
          id: 'foo',
        },
      },
    });
    const selector = deltaSelector(rootState);

    expect(selector.getEntity('bar')).toBeUndefined();
  });

  test('should return entity data', () => {
    const id = 'a1';
    const deltaId = 'a2';
    const identifier = `${id}+${deltaId}`;

    const rootState = createState('deltaReport', {
      byId: {
        [identifier]: {
          id: 'bar',
          lorem: 'ipsum',
        },
      },
    });
    const selector = deltaSelector(rootState);

    expect(selector.getEntity(id, deltaId)).toEqual({
      id: 'bar',
      lorem: 'ipsum',
    });
  });
});

describe('deltaSelector getError tests', () => {
  test('should return undefined for empty state', () => {
    const id = 'a1';
    const deltaId = 'a2';
    const rootState = createRootState({});
    const selector = deltaSelector(rootState);

    expect(selector.getError(id, deltaId)).toBeUndefined();
  });

  test('should return undefined for empty byId', () => {
    const id = 'a1';
    const deltaId = 'a2';
    const rootState = createState('deltaReport', {
      byId: {},
    });
    const selector = deltaSelector(rootState);

    expect(selector.getError(id, deltaId)).toBeUndefined();
  });

  test('should return undefined for unknown id', () => {
    const id = 'a1';
    const deltaId = 'a2';
    const rootState = createState('deltaReport', {
      byId: {
        foo: {
          id: 'foo',
        },
      },
    });
    const selector = deltaSelector(rootState);

    expect(selector.getError(id, deltaId)).toBeUndefined();
  });

  test('should return error', () => {
    const id = 'a1';
    const deltaId = 'a2';
    const identifier = `${id}+${deltaId}`;
    const rootState = createState('deltaReport', {
      errors: {
        [identifier]: 'An error',
      },
    });
    const selector = deltaSelector(rootState);

    expect(selector.getError(id, deltaId)).toEqual('An error');
  });
});

// vim: set ts=2 sw=2 tw=80:
