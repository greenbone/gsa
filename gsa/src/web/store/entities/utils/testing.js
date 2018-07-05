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
import {pluralizeType} from 'gmp/utils/entitytype';

import Filter from 'gmp/models/filter';

import {filterIdentifier} from './reducers';
import {types} from './actions';

export const createRootState = stateData => ({
  entities: {
    ...stateData,
  },
});

export const createState = (name, stateData) => createRootState({
  [name]: stateData,
});

export const testReducerForEntities = (entityType, reducer, actions) => {
  describe(`${entityType} entities reducer tests`, () => {

    test('should be a reducer function', () => {
      expect(is_function(reducer)).toBe(true);
    });

    test('should create initial state', () => {
      expect(reducer(undefined, {})).toEqual({
        byId: {},
        errors: {},
        isLoading: {},
        default: [],
      });
    });

    test('should reduce request action', () => {
      const action = actions.request();

      expect(reducer(undefined, action)).toEqual({
        byId: {},
        errors: {},
        isLoading: {
          default: true,
        },
        default: [],
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
        errors: {},
        isLoading: {
          default: false,
        },
        default: ['foo'],
      });
    });

    test('should reduce error action', () => {
      const action = actions.error('An error');

      expect(reducer(undefined, action)).toEqual({
        byId: {},
        errors: {
          default: 'An error',
        },
        isLoading: {
          default: false,
        },
        default: [],
      });
    });
  });
};

export const testEntitiesActions = (entityType, actions) => {
  describe(`${entityType} entities actions tests`, () => {

    test('should have action creators', () => {
      expect(is_function(actions.request)).toBe(true);
      expect(is_function(actions.success)).toBe(true);
      expect(is_function(actions.error)).toBe(true);
    });

    test('should create a load request action', () => {
      const action = actions.request();
      expect(action).toEqual({
        type: types.ENTITIES_LOADING_REQUEST,
        entityType,
      });
    });

    test('should create a load request action with filter', () => {
      const filter = Filter.fromString('type=abc');
      const action = actions.request(filter);

      expect(action).toEqual({
        type: types.ENTITIES_LOADING_REQUEST,
        filter,
        entityType,
      });
    });

    test('should create a load success action', () => {
      const action = actions.success(['foo', 'bar']);
      expect(action).toEqual({
        type: types.ENTITIES_LOADING_SUCCESS,
        data: ['foo', 'bar'],
        entityType,
      });
    });

    test('should create a load success action with filter', () => {
      const filter = Filter.fromString('type=abc');
      const action = actions.success(['foo', 'bar'], filter);

      expect(action).toEqual({
        type: types.ENTITIES_LOADING_SUCCESS,
        data: ['foo', 'bar'],
        filter,
        entityType,
      });
    });

    test('should create a load error action', () => {
      const action = actions.error('An error');
      expect(action).toEqual({
        type: types.ENTITIES_LOADING_ERROR,
        error: 'An error',
        entityType,
      });
    });

    test('should create a load error action with filter', () => {
      const filter = Filter.fromString('type=abc');
      const action = actions.error('An error', filter);

      expect(action).toEqual({
        type: types.ENTITIES_LOADING_ERROR,
        error: 'An error',
        filter,
        entityType,
      });
    });

  });
};

export const testLoadEntities = (entityType, loadEntities) => {

  describe(`${entityType} loadEntities function tests`, () => {

    test('should load all entities successfully', () => {
      const filter = Filter.fromString('myfilter');
      const rootState = createState(entityType, {
        isLoading: {
          [filterIdentifier(filter)]: false,
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
        [pluralizeType(entityType)]: {
          getAll,
        },
      };

      const props = {
        gmp,
        filter,
        other: 3,
      };

      expect(loadEntities).toBeDefined();
      expect(is_function(loadEntities)).toBe(true);

      return loadEntities(props)(dispatch, getState).then(() => {
        expect(getState).toBeCalled();
        expect(getAll).toBeCalledWith({filter});
        expect(dispatch).toHaveBeenCalledTimes(2);
        expect(dispatch.mock.calls[0]).toEqual([{
          type: types.ENTITIES_LOADING_REQUEST,
          filter,
          entityType,
        }]);
        expect(dispatch.mock.calls[1]).toEqual([{
          type: types.ENTITIES_LOADING_SUCCESS,
          entityType,
          filter,
          data: 'foo',
        }]);
      });
    });

    test('should not load all entities if isLoading is true', () => {
      const filter = Filter.fromString('myfilter');
      const rootState = createState(entityType, {
        isLoading: {
          [filterIdentifier(filter)]: true,
        },
      });

      const getState = jest
        .fn()
        .mockReturnValue(rootState);

      const dispatch = jest.fn();

      const getAll = jest
        .fn()
        .mockReturnValue(Promise.resolve([{id: 'foo'}]));

      const gmp = {
        [pluralizeType(entityType)]: {
          getAll,
        },
      };

      return loadEntities({gmp, filter})(dispatch, getState).then(() => {
        expect(getState).toBeCalled();
        expect(dispatch).not.toBeCalled();
        expect(getAll).not.toBeCalled();
      });
    });

    test('should fail loading all entities with an error', () => {
      const filter = Filter.fromString('myfilter');
      const rootState = createState(entityType, {
        [filterIdentifier(filter)]: {
          isLoading: false,
        },
      });

      const getState = jest
        .fn()
        .mockReturnValue(rootState);

      const dispatch = jest.fn();

      const getAll = jest
        .fn()
        .mockReturnValue(Promise.reject('AnError'));

      const gmp = {
        [pluralizeType(entityType)]: {
          getAll,
        },
      };

      return loadEntities({gmp, filter})(dispatch, getState).then(() => {
        expect(getState).toBeCalled();
        expect(getAll).toBeCalledWith({filter});
        expect(dispatch).toHaveBeenCalledTimes(2);
        expect(dispatch.mock.calls[0]).toEqual([{
          type: types.ENTITIES_LOADING_REQUEST,
          entityType,
          filter,
        }]);
        expect(dispatch.mock.calls[1]).toEqual([{
          type: types.ENTITIES_LOADING_ERROR,
          entityType,
          filter,
          error: 'AnError',
        }]);
      });
    });
  });
};

export const testReducerForEntity = (entityType, reducer, actions) => {
  describe(`${entityType} entity reducer tests`, () => {

    test('should be a reducer function', () => {
      expect(is_function(reducer)).toBe(true);
    });

    test('should create initial state', () => {
      expect(reducer(undefined, {})).toEqual({
        byId: {},
        errors: {},
        isLoading: {},
        default: [],
      });
    });

    test('should reduce request action', () => {
      const id = 'a1';
      const action = actions.request(id);

      expect(reducer(undefined, action)).toEqual({
        byId: {},
        errors: {},
        isLoading: {
          [id]: true,
        },
        default: [],
      });
    });

    test('should reduce success action', () => {
      const id = 'a1';
      const action = actions.success(id, {data: 'foo'});

      expect(reducer(undefined, action)).toEqual({
        byId: {
          [id]: {
            data: 'foo',
          },
        },
        errors: {},
        isLoading: {
          [id]: false,
        },
        default: [],
      });
    });

    test('should reduce error action', () => {
      const id = 'a1';
      const action = actions.error(id, 'An error');

      expect(reducer(undefined, action)).toEqual({
        byId: {},
        errors: {
          [id]: 'An error',
        },
        isLoading: {
          [id]: false,
        },
        default: [],
      });
    });
  });
};

export const testEntityActions = (entityType, actions) => {
  describe(`${entityType} entity actions tests`, () => {

    test('should have action creators', () => {
      expect(is_function(actions.request)).toBe(true);
      expect(is_function(actions.success)).toBe(true);
      expect(is_function(actions.error)).toBe(true);
    });

    test('should create a load request action', () => {
      const id = 'a1';
      const action = actions.request(id);
      expect(action).toEqual({
        type: types.ENTITY_LOADING_REQUEST,
        entityType,
        id,
      });
    });

    test('should create a load success action', () => {
      const id = 'a1';
      const action = actions.success(id, {foo: 'bar'});
      expect(action).toEqual({
        type: types.ENTITY_LOADING_SUCCESS,
        data: {foo: 'bar'},
        entityType,
        id,
      });
    });

    test('should create a load error action', () => {
      const id = 'a1';
      const action = actions.error(id, 'An error');
      expect(action).toEqual({
        type: types.ENTITY_LOADING_ERROR,
        error: 'An error',
        entityType,
        id,
      });
    });

  });
};

export const testLoadEntity = (entityType, loadEntity) => {

  describe(`${entityType} loadEntity function tests`, () => {

    test('should load entity successfully', () => {
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

      const props = {
        id,
        gmp,
        other: 3,
      };

      expect(loadEntity).toBeDefined();
      expect(is_function(loadEntity)).toBe(true);

      return loadEntity(props)(dispatch, getState).then(() => {
        expect(getState).toBeCalled();
        expect(get).toBeCalledWith({id});
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

    test('should not load entity if isLoading is true', () => {
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

      return loadEntity({gmp, id})(dispatch, getState).then(() => {
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

      return loadEntity({gmp, id})(dispatch, getState).then(() => {
        expect(getState).toBeCalled();
        expect(get).toBeCalledWith({id});
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
};

export const testAll = (name, {
  entitiesActions,
  entityActions,
  loadEntities,
  loadEntity,
  reducer,
}) => {
  testEntitiesActions(name, entitiesActions);
  testEntityActions(name, entityActions);
  testLoadEntities(name, loadEntities);
  testLoadEntity(name, loadEntity);
  testReducerForEntities(name, reducer, entitiesActions);
  testReducerForEntity(name, reducer, entityActions);
};

// vim: set ts=2 sw=2 tw=80:
