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

import {createEntitiesActionCreators} from '../actions';
import {createReducer, filterIdentifier} from '../reducers';

describe('entities reducers test', () => {

  describe('createReducers tests', () => {

    test('should create a reducer function', () => {
      const reducer = createReducer('foo');

      expect(is_function(reducer)).toBe(true);
    });

    test('Should create initial state', () => {
      const reducer = createReducer('foo');

      expect(reducer(undefined, {})).toEqual({});
    });

    describe('reducing loading request actions', () => {

      test('should set isLoading with default filter', () => {
        const actions = createEntitiesActionCreators('foo');
        const action = actions.request();
        const reducer = createReducer('foo');

        expect(reducer(undefined, action)).toEqual({
          byId: {},
          default: {
            isLoading: true,
            error: null,
            entities: [],
          },
        });
      });

      test('should set isLoading for filter', () => {
        const actions = createEntitiesActionCreators('foo');
        const reducer = createReducer('foo');
        const filter = Filter.fromString('name=foo');
        const action = actions.request(filter);

        expect(reducer(undefined, action)).toEqual({
          byId: {},
          [filterIdentifier(filter)]: {
            isLoading: true,
            error: null,
            entities: [],
          },
        });
      });

      test('should set isLoading and not override existing state', () => {
        const actions = createEntitiesActionCreators('foo');
        const reducer = createReducer('foo');
        const filter = Filter.fromString('name=foo');
        const otherFilter = Filter.fromString('name=bar');
        const action = actions.request(filter);
        const state = {
          [filterIdentifier(otherFilter)]: {
            isLoading: false,
            entities: [],
            error: null,
          },
        };

        expect(reducer(state, action)).toEqual({
          byId: {},
          [filterIdentifier(filter)]: {
            isLoading: true,
            error: null,
            entities: [],
          },
          [filterIdentifier(otherFilter)]: {
            isLoading: false,
            entities: [],
            error: null,
          },
        });
      });

      test('should set isLoading and not override other properties', () => {
        const actions = createEntitiesActionCreators('foo');
        const reducer = createReducer('foo');
        const filter = Filter.fromString('name=foo');
        const action = actions.request(filter);
        const state = {
          [filterIdentifier(filter)]: {
            isLoading: false,
            entities: ['foo', 'bar'],
            error: 'An error',
          },
        };

        expect(reducer(state, action)).toEqual({
          byId: {},
          [filterIdentifier(filter)]: {
            isLoading: true,
            entities: ['foo', 'bar'],
            error: 'An error',
          },
        });
      });

    });

    describe('reducing filter loading success actions', () => {

      test('should set isLoading with default filter', () => {
        const actions = createEntitiesActionCreators('foo');
        const reducer = createReducer('foo');
        const action = actions.success([{id: 'foo'}, {id: 'bar'}]);

        expect(reducer(undefined, action)).toEqual({
          byId: {
            foo: {
              id: 'foo',
            },
            bar: {
              id: 'bar',
            },
          },
          default: {
            isLoading: false,
            error: null,
            entities: ['foo', 'bar'],
          },
        });
      });

      test('should reset other properties with default filter', () => {
        const actions = createEntitiesActionCreators('foo');
        const reducer = createReducer('foo');
        const action = actions.success([{id: 'foo'}, {id: 'bar'}]);
        const state = {
          default: {
            isLoading: true,
            error: 'An error',
            entities: [],
          },
        };

        expect(reducer(state, action)).toEqual({
          byId: {
            foo: {
              id: 'foo',
            },
            bar: {
              id: 'bar',
            },
          },
          default: {
            isLoading: false,
            error: null,
            entities: ['foo', 'bar'],
          },
        });
      });

      test('should not override other filters', () => {
        const actions = createEntitiesActionCreators('foo');
        const reducer = createReducer('foo');
        const filter = Filter.fromString('name=bar');
        const otherFilter = Filter.fromString('name=foo');
        const action = actions.success([{id: 'foo'}, {id: 'bar'}], filter);
        const state = {
          [filterIdentifier(otherFilter)]: {
            isLoading: true,
            entities: ['lorem', 'ipsum'],
            error: 'An error',
          },
        };

        expect(reducer(state, action)).toEqual({
          byId: {
            foo: {
              id: 'foo',
            },
            bar: {
              id: 'bar',
            },
          },
          [filterIdentifier(otherFilter)]: {
            isLoading: true,
            entities: ['lorem', 'ipsum'],
            error: 'An error',
          },
          [filterIdentifier(filter)]: {
            isLoading: false,
            entities: ['foo', 'bar'],
            error: null,
          },
        });
      });

    });

    describe('reducing filter loading error actions', () => {

      test('should set isLoading and error with default filter', () => {
        const actions = createEntitiesActionCreators('foo');
        const reducer = createReducer('foo');
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

      test('should reset isLoading and error with default filter', () => {
        const actions = createEntitiesActionCreators('foo');
        const reducer = createReducer('foo');
        const action = actions.error('An error');
        const state = {
          default: {
            isLoading: true,
            error: 'Another error',
            entities: ['foo', 'bar'],
          },
        };

        expect(reducer(state, action)).toEqual({
          byId: {},
          default: {
            isLoading: false,
            error: 'An error',
            entities: ['foo', 'bar'],
          },
        });
      });

      test('should not override other filters', () => {
        const actions = createEntitiesActionCreators('foo');
        const reducer = createReducer('foo');
        const filter = Filter.fromString('name=bar');
        const otherFilter = Filter.fromString('name=foo');
        const action = actions.error('An error', filter);
        const state = {
          byId: {
            lorem: {
              id: 'lorem',
            },
            ipsum: {
              id: 'ipsum',
            },
          },
          [filterIdentifier(otherFilter)]: {
            isLoading: true,
            entities: ['lorem', 'ipsum'],
            error: 'Another error',
          },
        };

        expect(reducer(state, action)).toEqual({
          byId: {
            lorem: {
              id: 'lorem',
            },
            ipsum: {
              id: 'ipsum',
            },
          },
          [filterIdentifier(otherFilter)]: {
            isLoading: true,
            entities: ['lorem', 'ipsum'],
            error: 'Another error',
          },
          [filterIdentifier(filter)]: {
            isLoading: false,
            entities: [],
            error: 'An error',
          },
        });
      });

    });

    test('should not override byId accidentially', () => {
      const actions = createEntitiesActionCreators('foo');
      const reducer = createReducer('foo');
      const filter = Filter.fromString('byId');
      const action = actions.success([{id: 'foo'}], filter);
      const state = {
        byId: {
          bar: {
            id: 'bar',
          },
        },
        default: {
          isLoading: true,
          error: null,
          entities: ['bar'],
        },
      };

      expect(reducer(state, action)).toEqual({
        byId: {
          bar: {
            id: 'bar',
          },
          foo: {
            id: 'foo',
          },
        },
        default: {
          isLoading: true,
          error: null,
          entities: ['bar'],
        },
        [filterIdentifier(filter)]: {
          isLoading: false,
          error: null,
          entities: ['foo'],
        },
      });
    });

    test('should not override default accidentially', () => {
      const actions = createEntitiesActionCreators('foo');
      const reducer = createReducer('foo');
      const filter = Filter.fromString('default');
      const action = actions.success([{id: 'foo'}], filter);
      const state = {
        byId: {
          bar: {
            id: 'bar',
          },
        },
        default: {
          isLoading: true,
          error: null,
          entities: ['bar'],
        },
      };

      expect(reducer(state, action)).toEqual({
        byId: {
          bar: {
            id: 'bar',
          },
          foo: {
            id: 'foo',
          },
        },
        default: {
          isLoading: true,
          error: null,
          entities: ['bar'],
        },
        [filterIdentifier(filter)]: {
          isLoading: false,
          error: null,
          entities: ['foo'],
        },
      });
    });

  });
});

// vim: set ts=2 sw=2 tw=80:
