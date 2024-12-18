/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import Filter from 'gmp/models/filter';
import {combineReducers, filterIdentifier} from 'web/store/utils';

describe('store utils module tests', () => {
  describe('combineReducer tests', () => {
    test('should create a combined reducer', () => {
      const foo = testing.fn();
      const bar = testing.fn();
      const action = {type: 'ipsum'};

      const reducer = combineReducers({
        foo,
        bar,
      });

      expect(reducer(undefined, action)).toEqual({});
      expect(foo).toBeCalledWith(undefined, action);
      expect(bar).toBeCalledWith(undefined, action);
    });

    test('should pass state[reducerName] to reducers', () => {
      const foo = testing.fn();
      const bar = testing.fn();
      const action = {type: 'ipsum'};
      const state = {
        foo: 1,
        bar: 2,
      };

      const reducer = combineReducers({
        foo,
        bar,
      });

      expect(reducer(state, action)).toEqual({});
      expect(foo).toBeCalledWith(1, action);
      expect(bar).toBeCalledWith(2, action);
    });

    test('should combine state from reducers', () => {
      const foo = testing.fn().mockReturnValue(99);
      const bar = testing.fn().mockReturnValue(100);
      const action = {type: 'ipsum'};
      const state = {
        foo: 1,
        bar: 2,
      };

      const reducer = combineReducers({
        foo,
        bar,
      });

      expect(reducer(state, action)).toEqual({
        foo: 99,
        bar: 100,
      });
      expect(foo).toBeCalledWith(1, action);
      expect(bar).toBeCalledWith(2, action);
    });

    test('should drop unknown props from state', () => {
      const foo = testing.fn().mockReturnValue(99);
      const bar = testing.fn().mockReturnValue(100);
      const action = {type: 'ipsum'};
      const state = {
        foo: 1,
        bar: 2,
        z: 101,
      };

      const reducer = combineReducers({
        foo,
        bar,
      });

      expect(reducer(state, action)).toEqual({
        foo: 99,
        bar: 100,
      });
      expect(foo).toBeCalledWith(1, action);
      expect(bar).toBeCalledWith(2, action);
    });

    test('should allow to return undefined from reducers', () => {
      const foo = testing.fn().mockReturnValue(undefined);
      const bar = testing.fn().mockReturnValue(undefined);
      const action = {type: 'ipsum'};
      const state = {
        foo: 1,
        bar: 2,
      };

      const reducer = combineReducers({
        foo,
        bar,
      });

      expect(reducer(state, action)).toEqual({
        foo: undefined,
        bar: undefined,
      });
      expect(foo).toBeCalledWith(1, action);
      expect(bar).toBeCalledWith(2, action);
    });
  });

  describe('filterIdentifier tests', () => {
    test('use default for undefined filter', () => {
      expect(filterIdentifier()).toEqual('default');
    });

    test('should create an identifier for an existing filter', () => {
      const filter = Filter.fromString('foo=bar');

      expect(filterIdentifier(filter)).toEqual('filter:foo=bar');
    });
  });
});
