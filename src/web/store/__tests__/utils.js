/* Copyright (C) 2018-2021 Greenbone Networks GmbH
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

import {combineReducers, filterIdentifier} from 'web/store/utils';

describe('store utils module tests', () => {
  describe('combineReducer tests', () => {
    test('should create a combined reducer', () => {
      const foo = jest.fn();
      const bar = jest.fn();
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
      const foo = jest.fn();
      const bar = jest.fn();
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
      const foo = jest.fn().mockReturnValue(99);
      const bar = jest.fn().mockReturnValue(100);
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
      const foo = jest.fn().mockReturnValue(99);
      const bar = jest.fn().mockReturnValue(100);
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
      const foo = jest.fn().mockReturnValue(undefined);
      const bar = jest.fn().mockReturnValue(undefined);
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

// vim: set ts=2 sw=2 tw=80:
