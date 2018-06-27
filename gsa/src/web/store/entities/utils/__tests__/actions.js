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

import {
  createLoadingTypes,
  createActionCreators,
  createLoadAllFunc,
} from '../actions';

describe('entities actions tests', () => {

  describe('createLoadingTypes tests', () => {

    test('should create loading types', () => {
      const types = createLoadingTypes('foo');

      expect(types.REQUEST).toEqual('FOO_LOADING_REQUEST');
      expect(types.SUCCESS).toEqual('FOO_LOADING_SUCCESS');
      expect(types.ERROR).toEqual('FOO_LOADING_ERROR');
    });

    test('should not care about case when creating loading types', () => {
      const types = createLoadingTypes('fOO');

      expect(types.REQUEST).toEqual('FOO_LOADING_REQUEST');
      expect(types.SUCCESS).toEqual('FOO_LOADING_SUCCESS');
      expect(types.ERROR).toEqual('FOO_LOADING_ERROR');
    });
  });

  describe('createActionCreators tests', () => {

    test('should create action creators for loading', () => {
      const types = createLoadingTypes('foo');
      const actions = createActionCreators(types);

      expect(actions.request).toBeDefined();
      expect(is_function(actions.request)).toBe(true);
      expect(actions.success).toBeDefined();
      expect(is_function(actions.success)).toBe(true);
      expect(actions.error).toBeDefined();
      expect(is_function(actions.error)).toBe(true);
    });

    test('should create a load request action', () => {
      const types = createLoadingTypes('foo');
      const actions = createActionCreators(types);
      const action = actions.request();

      expect(action).toEqual({
        type: types.REQUEST,
      });
    });

    test('should create a load request action with filter', () => {
      const filter = Filter.fromString('type=abc');
      const types = createLoadingTypes('FOO');
      const actions = createActionCreators(types);
      const action = actions.request(filter);

      expect(action).toEqual({
        type: types.REQUEST,
        filter,
      });
    });

    test('should create a load success action', () => {
      const types = createLoadingTypes('FOO');
      const actions = createActionCreators(types);
      const action = actions.success(['foo', 'bar']);

      expect(action).toEqual({
        type: types.SUCCESS,
        data: ['foo', 'bar'],
      });
    });

    test('should create a load success action with filter', () => {
      const filter = Filter.fromString('type=abc');
      const types = createLoadingTypes('FOO');
      const actions = createActionCreators(types);
      const action = actions.success(['foo', 'bar'], filter);

      expect(action).toEqual({
        type: types.SUCCESS,
        data: ['foo', 'bar'],
        filter,
      });
    });

    test('should create a load error action', () => {
      const types = createLoadingTypes('FOO');
      const actions = createActionCreators(types);
      const action = actions.error('An error');

      expect(action).toEqual({
        type: types.ERROR,
        error: 'An error',
      });
    });

    test('should create a load error action with filter', () => {
      const filter = Filter.fromString('type=abc');
      const types = createLoadingTypes('FOO');
      const actions = createActionCreators(types);
      const action = actions.error('An error', filter);

      expect(action).toEqual({
        type: types.ERROR,
        error: 'An error',
        filter,
      });
    });
  });

  describe('createLoadAllFunc tests', () => {

    test('test isLoading true', () => {
      const types = createLoadingTypes('FOO');
      const actions = createActionCreators(types);

      const getState = jest
        .fn()
        .mockReturnValue({foo: 'bar'});

      const dispatch = jest.fn();
      const getIsLoading = jest
        .fn()
        .mockReturnValue(true);
      const getAll = jest.fn();
      const gmp = {
        foo: {
          getAll,
        },
      };

      const selector = jest.fn(() => ({
        getIsLoading,
      }));

      const loadAllFunc = createLoadAllFunc({
        selector,
        actionCreators: actions,
        name: 'foo',
      });

      expect(loadAllFunc).toBeDefined();
      expect(is_function(loadAllFunc)).toBe(true);

      return loadAllFunc({gmp})(dispatch, getState).then(() => {
        expect(getState).toBeCalled();
        expect(selector).toBeCalledWith({foo: 'bar'});
        expect(getIsLoading).toBeCalled();
        expect(dispatch).not.toBeCalled();
        expect(getAll).not.toBeCalled();
      });
    });

    test('test loading success', () => {
      const actions = {
        request: jest.fn().mockReturnValue({type: 'MY_REQUEST_ACTION'}),
        success: jest.fn().mockReturnValue({type: 'MY_SUCCESS_ACTION'}),
        error: jest.fn(),
      };

      const getState = jest
        .fn()
        .mockReturnValue({foo: 'bar'});

      const dispatch = jest.fn();
      const getAll = jest
        .fn()
        .mockReturnValue(Promise.resolve({
          data: 'foo',
        }));
      const gmp = {
        foo: {
          getAll,
        },
      };
      const getIsLoading = jest
        .fn()
        .mockReturnValue(false);

      const selector = jest.fn(() => ({
        getIsLoading,
      }));

      const loadAllFunc = createLoadAllFunc({
        selector,
        actionCreators: actions,
        name: 'foo',
      });

      const props = {
        gmp,
        filter: 'myfilter',
        other: 3,
      };

      expect(loadAllFunc).toBeDefined();
      expect(is_function(loadAllFunc)).toBe(true);

      return loadAllFunc(props)(dispatch, getState).then(() => {
        expect(getState).toBeCalled();
        expect(selector).toBeCalledWith({foo: 'bar'});
        expect(getIsLoading).toBeCalledWith('myfilter');
        expect(getAll).toBeCalledWith({filter: 'myfilter'});
        expect(actions.request).toBeCalledWith('myfilter');
        expect(actions.success).toBeCalledWith('foo', 'myfilter');
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

      const getState = jest
        .fn()
        .mockReturnValue({foo: 'bar'});

      const dispatch = jest.fn();
      const getAll = jest
        .fn()
        .mockReturnValue(Promise.reject('AnError'));
      const gmp = {
        foo: {
          getAll,
        },
      };
      const getIsLoading = jest
        .fn()
        .mockReturnValue(false);

      const selector = jest.fn(() => ({
        getIsLoading,
      }));

      const loadAllFunc = createLoadAllFunc({
        selector,
        actionCreators: actions,
        name: 'foo',
      });

      const props = {
        gmp,
        filter: 'myfilter',
        other: 3,
      };

      expect(loadAllFunc).toBeDefined();
      expect(is_function(loadAllFunc)).toBe(true);

      return loadAllFunc(props)(dispatch, getState).then(() => {
        expect(getState).toBeCalled();
        expect(selector).toBeCalledWith({foo: 'bar'});
        expect(getIsLoading).toBeCalledWith('myfilter');
        expect(actions.request).toBeCalledWith('myfilter');
        expect(actions.success).not.toBeCalled();
        expect(actions.error).toBeCalledWith('AnError', 'myfilter');
        expect(getAll).toBeCalledWith({filter: 'myfilter'});
        expect(dispatch).toHaveBeenCalledTimes(2);
        expect(dispatch.mock.calls[0]).toEqual([{type: 'MY_REQUEST_ACTION'}]);
        expect(dispatch.mock.calls[1]).toEqual([{type: 'MY_ERROR_ACTION'}]);
      });
    });
  });
});

// vim: set ts=2 sw=2 tw=80:
