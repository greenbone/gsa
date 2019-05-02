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

import Filter from 'gmp/models/filter';

import {
  types,
  createEntitiesActions,
  createLoadAllEntities,
  createLoadEntities,
  createEntityActions,
  createLoadEntity,
} from '../actions';

describe('entities actions tests', () => {
  describe('createEntitiesActions tests', () => {
    test('should create action creators for loading', () => {
      const actions = createEntitiesActions('foo');

      expect(actions.request).toBeDefined();
      expect(isFunction(actions.request)).toBe(true);
      expect(actions.success).toBeDefined();
      expect(isFunction(actions.success)).toBe(true);
      expect(actions.error).toBeDefined();
      expect(isFunction(actions.error)).toBe(true);
    });

    test('should create a load request action', () => {
      const actions = createEntitiesActions('foo');
      const action = actions.request();

      expect(action).toEqual({
        type: types.ENTITIES_LOADING_REQUEST,
        entityType: 'foo',
      });
    });

    test('should create a load request action with filter', () => {
      const filter = Filter.fromString('type=abc');
      const actions = createEntitiesActions('foo');
      const action = actions.request(filter);

      expect(action).toEqual({
        type: types.ENTITIES_LOADING_REQUEST,
        entityType: 'foo',
        filter,
      });
    });

    test('should create a load success action', () => {
      const actions = createEntitiesActions('foo');
      const action = actions.success(['foo', 'bar']);

      expect(action).toEqual({
        type: types.ENTITIES_LOADING_SUCCESS,
        entityType: 'foo',
        data: ['foo', 'bar'],
      });
    });

    test('should create a load success action with filter', () => {
      const filter = Filter.fromString('type=abc');
      const actions = createEntitiesActions('foo');
      const action = actions.success(['foo', 'bar'], filter);

      expect(action).toEqual({
        type: types.ENTITIES_LOADING_SUCCESS,
        entityType: 'foo',
        data: ['foo', 'bar'],
        filter,
      });
    });

    test('should create a load success action with meta info', () => {
      const filter = Filter.fromString('type=abc');
      const loadedFilter = Filter.fromString('type=abc rows=100');
      const actions = createEntitiesActions('foo');
      const counts = {first: 1};
      const action = actions.success(
        ['foo', 'bar'],
        filter,
        loadedFilter,
        counts,
      );

      expect(action).toEqual({
        type: types.ENTITIES_LOADING_SUCCESS,
        entityType: 'foo',
        data: ['foo', 'bar'],
        filter,
        counts,
        loadedFilter,
      });
    });

    test('should create a load error action', () => {
      const actions = createEntitiesActions('foo');
      const action = actions.error('An error');

      expect(action).toEqual({
        type: types.ENTITIES_LOADING_ERROR,
        entityType: 'foo',
        error: 'An error',
      });
    });

    test('should create a load error action with filter', () => {
      const filter = Filter.fromString('type=abc');
      const actions = createEntitiesActions('foo');
      const action = actions.error('An error', filter);

      expect(action).toEqual({
        type: types.ENTITIES_LOADING_ERROR,
        entityType: 'foo',
        error: 'An error',
        filter,
      });
    });
  });

  describe('createEntityActions tests', () => {
    test('should create actions for loading', () => {
      const actions = createEntityActions('foo');

      expect(actions.request).toBeDefined();
      expect(isFunction(actions.request)).toBe(true);
      expect(actions.success).toBeDefined();
      expect(isFunction(actions.success)).toBe(true);
      expect(actions.error).toBeDefined();
      expect(isFunction(actions.error)).toBe(true);
    });

    test('should create a load request action', () => {
      const actions = createEntityActions('foo');
      const action = actions.request('id1');

      expect(action).toEqual({
        type: types.ENTITY_LOADING_REQUEST,
        entityType: 'foo',
        id: 'id1',
      });
    });

    test('should create a load success action', () => {
      const actions = createEntityActions('foo');
      const action = actions.success('id1', {foo: 'bar'});

      expect(action).toEqual({
        type: types.ENTITY_LOADING_SUCCESS,
        entityType: 'foo',
        id: 'id1',
        data: {foo: 'bar'},
      });
    });

    test('should create a load error action', () => {
      const actions = createEntityActions('foo');
      const action = actions.error('id1', 'An error');

      expect(action).toEqual({
        type: types.ENTITY_LOADING_ERROR,
        entityType: 'foo',
        id: 'id1',
        error: 'An error',
      });
    });
  });

  describe('createLoadAllEntities tests', () => {
    test('test isLoading true', () => {
      const actions = createEntitiesActions('foo');

      const getState = jest.fn().mockReturnValue({foo: 'bar'});

      const dispatch = jest.fn();
      const isLoadingEntities = jest.fn().mockReturnValue(true);
      const get = jest.fn();
      const gmp = {
        foos: {
          get,
        },
      };

      const selector = jest.fn(() => ({
        isLoadingEntities,
      }));

      const loadAllEntities = createLoadAllEntities({
        selector,
        actions,
        entityType: 'foo',
      });

      expect(loadAllEntities).toBeDefined();
      expect(isFunction(loadAllEntities)).toBe(true);

      return loadAllEntities(gmp)()(dispatch, getState).then(() => {
        expect(getState).toBeCalled();
        expect(selector).toBeCalledWith({foo: 'bar'});
        expect(isLoadingEntities).toBeCalled();
        expect(dispatch).not.toBeCalled();
        expect(get).not.toBeCalled();
      });
    });

    test('test loading success', () => {
      const actions = {
        request: jest.fn().mockReturnValue({type: 'MY_REQUEST_ACTION'}),
        success: jest.fn().mockReturnValue({type: 'MY_SUCCESS_ACTION'}),
        error: jest.fn(),
      };

      const getState = jest.fn().mockReturnValue({foo: 'bar'});

      const loadedFilter = Filter.fromString('name=abc');
      const counts = {first: 1};
      const dispatch = jest.fn();
      const get = jest.fn().mockReturnValue(
        Promise.resolve({
          data: 'foo',
          meta: {
            filter: loadedFilter,
            counts,
          },
        }),
      );
      const gmp = {
        foos: {
          get,
        },
      };
      const isLoadingEntities = jest.fn().mockReturnValue(false);

      const selector = jest.fn(() => ({
        isLoadingEntities,
      }));

      const loadAllEntities = createLoadAllEntities({
        selector,
        actions,
        entityType: 'foo',
      });

      const filter = Filter.fromString('type=teip');

      const myFilterAll = {
        entityType: 'filter',
        filter_type: undefined,
        id: undefined,
        terms: [
          {
            keyword: 'type',
            relation: '=',
            value: 'teip',
          },
          {
            keyword: 'first',
            relation: '=',
            value: 1,
          },
          {
            keyword: 'rows',
            relation: '=',
            value: -1,
          },
        ],
      };
      expect(loadAllEntities).toBeDefined();
      expect(isFunction(loadAllEntities)).toBe(true);

      return loadAllEntities(gmp)(filter)(dispatch, getState).then(() => {
        expect(getState).toBeCalled();
        expect(selector).toBeCalledWith({foo: 'bar'});
        expect(isLoadingEntities).toBeCalledWith(myFilterAll);
        expect(get).toBeCalledWith({filter: myFilterAll});
        expect(actions.request).toBeCalledWith(myFilterAll);
        expect(actions.success).toBeCalledWith(
          'foo',
          myFilterAll,
          loadedFilter,
          counts,
        );
        expect(actions.error).not.toBeCalled();
        expect(dispatch).toHaveBeenCalledTimes(2);
        expect(dispatch.mock.calls[0]).toEqual([{type: 'MY_REQUEST_ACTION'}]);
        expect(dispatch.mock.calls[1]).toEqual([{type: 'MY_SUCCESS_ACTION'}]);
      });
    });

    test('test loading error', () => {
      const actions = {
        request: jest.fn().mockReturnValue({type: 'MY_REQUEST_ACTION'}),
        success: jest.fn().mockReturnValue({type: 'MY_SUCCESS_ACTION'}),
        error: jest.fn().mockReturnValue({type: 'MY_ERROR_ACTION'}),
      };

      const getState = jest.fn().mockReturnValue({foo: 'bar'});

      const dispatch = jest.fn();
      const get = jest.fn().mockReturnValue(Promise.reject('AnError'));
      const gmp = {
        foos: {
          get,
        },
      };
      const isLoadingEntities = jest.fn().mockReturnValue(false);

      const selector = jest.fn(() => ({
        isLoadingEntities,
      }));

      const loadAllEntities = createLoadAllEntities({
        selector,
        actions,
        entityType: 'foo',
      });

      const filter = Filter.fromString('type=teip');

      const myFilterAll = {
        entityType: 'filter',
        filter_type: undefined,
        id: undefined,
        terms: [
          {
            keyword: 'type',
            relation: '=',
            value: 'teip',
          },
          {
            keyword: 'first',
            relation: '=',
            value: 1,
          },
          {
            keyword: 'rows',
            relation: '=',
            value: -1,
          },
        ],
      };

      expect(loadAllEntities).toBeDefined();
      expect(isFunction(loadAllEntities)).toBe(true);

      return loadAllEntities(gmp)(filter)(dispatch, getState).then(() => {
        expect(getState).toBeCalled();
        expect(selector).toBeCalledWith({foo: 'bar'});
        expect(isLoadingEntities).toBeCalledWith(myFilterAll);
        expect(actions.request).toBeCalledWith(myFilterAll);
        expect(actions.success).not.toBeCalled();
        expect(actions.error).toBeCalledWith('AnError', myFilterAll);
        expect(get).toBeCalledWith({filter: myFilterAll});
        expect(dispatch).toHaveBeenCalledTimes(2);
        expect(dispatch.mock.calls[0]).toEqual([{type: 'MY_REQUEST_ACTION'}]);
        expect(dispatch.mock.calls[1]).toEqual([{type: 'MY_ERROR_ACTION'}]);
      });
    });
  });

  describe('createLoadEntities tests', () => {
    test('test isLoading true', () => {
      const actions = createEntitiesActions('foo');

      const getState = jest.fn().mockReturnValue({foo: 'bar'});

      const dispatch = jest.fn();
      const isLoadingEntities = jest.fn().mockReturnValue(true);
      const get = jest.fn();
      const gmp = {
        foos: {
          get,
        },
      };

      const selector = jest.fn(() => ({
        isLoadingEntities,
      }));

      const loadEntities = createLoadEntities({
        selector,
        actions,
        entityType: 'foo',
      });

      expect(loadEntities).toBeDefined();
      expect(isFunction(loadEntities)).toBe(true);

      return loadEntities(gmp)()(dispatch, getState).then(() => {
        expect(getState).toBeCalled();
        expect(selector).toBeCalledWith({foo: 'bar'});
        expect(isLoadingEntities).toBeCalled();
        expect(dispatch).not.toBeCalled();
        expect(get).not.toBeCalled();
      });
    });

    test('test loading success', () => {
      const actions = {
        request: jest.fn().mockReturnValue({type: 'MY_REQUEST_ACTION'}),
        success: jest.fn().mockReturnValue({type: 'MY_SUCCESS_ACTION'}),
        error: jest.fn(),
      };

      const getState = jest.fn().mockReturnValue({foo: 'bar'});

      const loadedFilter = Filter.fromString('name=abc');
      const counts = {first: 1};
      const dispatch = jest.fn();
      const get = jest.fn().mockReturnValue(
        Promise.resolve({
          data: 'foo',
          meta: {
            filter: loadedFilter,
            counts,
          },
        }),
      );
      const gmp = {
        foos: {
          get,
        },
      };
      const isLoadingEntities = jest.fn().mockReturnValue(false);

      const selector = jest.fn(() => ({
        isLoadingEntities,
      }));

      const loadEntities = createLoadEntities({
        selector,
        actions,
        entityType: 'foo',
      });

      const filter = 'myfilter';

      expect(loadEntities).toBeDefined();
      expect(isFunction(loadEntities)).toBe(true);

      return loadEntities(gmp)(filter)(dispatch, getState).then(() => {
        expect(getState).toBeCalled();
        expect(selector).toBeCalledWith({foo: 'bar'});
        expect(isLoadingEntities).toBeCalledWith('myfilter');
        expect(get).toBeCalledWith({filter: 'myfilter'});
        expect(actions.request).toBeCalledWith('myfilter');
        expect(actions.success).toBeCalledWith(
          'foo',
          'myfilter',
          loadedFilter,
          counts,
        );
        expect(actions.error).not.toBeCalled();
        expect(dispatch).toHaveBeenCalledTimes(2);
        expect(dispatch.mock.calls[0]).toEqual([{type: 'MY_REQUEST_ACTION'}]);
        expect(dispatch.mock.calls[1]).toEqual([{type: 'MY_SUCCESS_ACTION'}]);
      });
    });

    test('test loading error', () => {
      const actions = {
        request: jest.fn().mockReturnValue({type: 'MY_REQUEST_ACTION'}),
        success: jest.fn().mockReturnValue({type: 'MY_SUCCESS_ACTION'}),
        error: jest.fn().mockReturnValue({type: 'MY_ERROR_ACTION'}),
      };

      const getState = jest.fn().mockReturnValue({foo: 'bar'});

      const dispatch = jest.fn();
      const get = jest.fn().mockReturnValue(Promise.reject('AnError'));
      const gmp = {
        foos: {
          get,
        },
      };
      const isLoadingEntities = jest.fn().mockReturnValue(false);

      const selector = jest.fn(() => ({
        isLoadingEntities,
      }));

      const loadEntities = createLoadEntities({
        selector,
        actions,
        entityType: 'foo',
      });

      const filter = 'myfilter';

      expect(loadEntities).toBeDefined();
      expect(isFunction(loadEntities)).toBe(true);

      return loadEntities(gmp)(filter)(dispatch, getState).then(() => {
        expect(getState).toBeCalled();
        expect(selector).toBeCalledWith({foo: 'bar'});
        expect(isLoadingEntities).toBeCalledWith('myfilter');
        expect(actions.request).toBeCalledWith('myfilter');
        expect(actions.success).not.toBeCalled();
        expect(actions.error).toBeCalledWith('AnError', 'myfilter');
        expect(get).toBeCalledWith({filter: 'myfilter'});
        expect(dispatch).toHaveBeenCalledTimes(2);
        expect(dispatch.mock.calls[0]).toEqual([{type: 'MY_REQUEST_ACTION'}]);
        expect(dispatch.mock.calls[1]).toEqual([{type: 'MY_ERROR_ACTION'}]);
      });
    });
  });

  describe('createLoadEntity tests', () => {
    test('test isLoading true', () => {
      const id = 'a1';
      const actions = {
        request: jest.fn().mockReturnValue({type: 'MY_REQUEST_ACTION'}),
        success: jest.fn().mockReturnValue({type: 'MY_SUCCESS_ACTION'}),
        error: jest.fn().mockReturnValue({type: 'MY_ERROR_ACTION'}),
      };

      const getState = jest.fn().mockReturnValue({foo: 'bar'});

      const dispatch = jest.fn();
      const isLoadingEntity = jest.fn().mockReturnValue(true);
      const get = jest.fn().mockReturnValue(Promise.resolve({id: 'foo'}));
      const gmp = {
        foo: {
          get,
        },
      };

      const selector = jest.fn(() => ({
        isLoadingEntity,
      }));

      const loadEntity = createLoadEntity({
        selector,
        actions,
        entityType: 'foo',
      });

      expect(loadEntity).toBeDefined();
      expect(isFunction(loadEntity)).toBe(true);

      return loadEntity(gmp)(id)(dispatch, getState).then(() => {
        expect(getState).toBeCalled();
        expect(selector).toBeCalledWith({foo: 'bar'});
        expect(isLoadingEntity).toBeCalledWith(id);
        expect(dispatch).not.toBeCalled();
        expect(actions.success).not.toBeCalled();
        expect(actions.error).not.toBeCalled();
        expect(actions.request).not.toBeCalled();
        expect(get).not.toBeCalled();
      });
    });

    test('test loading success', () => {
      const id = 'a1';
      const actions = {
        request: jest.fn().mockReturnValue({type: 'MY_REQUEST_ACTION'}),
        success: jest.fn().mockReturnValue({type: 'MY_SUCCESS_ACTION'}),
        error: jest.fn().mockReturnValue({type: 'MY_ERROR_ACTION'}),
      };

      const getState = jest.fn().mockReturnValue({foo: 'bar'});

      const dispatch = jest.fn();
      const isLoadingEntity = jest.fn().mockReturnValue(false);
      const get = jest
        .fn()
        .mockReturnValue(Promise.resolve({data: {id, name: 'foo'}}));
      const gmp = {
        foo: {
          get,
        },
      };

      const selector = jest.fn(() => ({
        isLoadingEntity,
      }));

      const loadEntity = createLoadEntity({
        selector,
        actions,
        entityType: 'foo',
      });

      expect(loadEntity).toBeDefined();
      expect(isFunction(loadEntity)).toBe(true);

      return loadEntity(gmp)(id)(dispatch, getState).then(() => {
        expect(getState).toBeCalled();
        expect(selector).toBeCalledWith({foo: 'bar'});
        expect(isLoadingEntity).toBeCalledWith(id);
        expect(actions.request).toBeCalledWith(id);
        expect(actions.success).toBeCalledWith(id, {id, name: 'foo'});
        expect(actions.error).not.toBeCalled();
        expect(dispatch).toHaveBeenCalledTimes(2);
        expect(dispatch.mock.calls[0]).toEqual([{type: 'MY_REQUEST_ACTION'}]);
        expect(dispatch.mock.calls[1]).toEqual([{type: 'MY_SUCCESS_ACTION'}]);
        expect(get).toBeCalledWith({id});
      });
    });

    test('test loading error', () => {
      const id = 'a1';
      const actions = {
        request: jest.fn().mockReturnValue({type: 'MY_REQUEST_ACTION'}),
        success: jest.fn().mockReturnValue({type: 'MY_SUCCESS_ACTION'}),
        error: jest.fn().mockReturnValue({type: 'MY_ERROR_ACTION'}),
      };

      const getState = jest.fn().mockReturnValue({foo: 'bar'});

      const dispatch = jest.fn();
      const isLoadingEntity = jest.fn().mockReturnValue(false);
      const get = jest.fn().mockReturnValue(Promise.reject('An error'));
      const gmp = {
        foo: {
          get,
        },
      };

      const selector = jest.fn(() => ({
        isLoadingEntity,
      }));

      const loadEntity = createLoadEntity({
        selector,
        actions,
        entityType: 'foo',
      });

      expect(loadEntity).toBeDefined();
      expect(isFunction(loadEntity)).toBe(true);

      return loadEntity(gmp)(id)(dispatch, getState).then(() => {
        expect(getState).toBeCalled();
        expect(selector).toBeCalledWith({foo: 'bar'});
        expect(isLoadingEntity).toBeCalledWith(id);
        expect(actions.request).toBeCalledWith(id);
        expect(actions.success).not.toBeCalled();
        expect(actions.error).toBeCalledWith(id, 'An error');
        expect(dispatch).toHaveBeenCalledTimes(2);
        expect(dispatch.mock.calls[0]).toEqual([{type: 'MY_REQUEST_ACTION'}]);
        expect(dispatch.mock.calls[1]).toEqual([{type: 'MY_ERROR_ACTION'}]);
        expect(get).toBeCalledWith({id});
      });
    });
  });
});
// vim: set ts=2 sw=2 tw=80:
