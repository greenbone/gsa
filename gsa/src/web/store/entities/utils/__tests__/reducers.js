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

      expect(reducer(undefined, {})).toEqual({
        byId: {},
        isLoading: {},
        errors: {},
        default: [],
      });
    });

    describe('reducing loading request actions', () => {

      test('should set isLoading with default filter', () => {
        const actions = createEntitiesActionCreators('foo');
        const action = actions.request();
        const reducer = createReducer('foo');

        expect(reducer(undefined, action)).toEqual({
          byId: {},
          isLoading: {
            default: true,
          },
          errors: {},
          default: [],
        });
      });

      test('should set isLoading for filter', () => {
        const actions = createEntitiesActionCreators('foo');
        const reducer = createReducer('foo');
        const filter = Filter.fromString('name=foo');
        const filterId = filterIdentifier(filter);
        const action = actions.request(filter);

        expect(reducer(undefined, action)).toEqual({
          byId: {},
          isLoading: {
            [filterId]: true,
          },
          errors: {},
          default: [],
          [filterId]: [],
        });
      });

      test('should set isLoading and not override existing state', () => {
        const actions = createEntitiesActionCreators('foo');
        const reducer = createReducer('foo');
        const filter = Filter.fromString('name=foo');
        const filterId = filterIdentifier(filter);
        const otherFilter = Filter.fromString('name=bar');
        const otherFilterId = filterIdentifier(otherFilter);
        const action = actions.request(filter);
        const state = {
          isLoading: {
            [otherFilterId]: false,
          },
          [otherFilterId]: [],
        };

        expect(reducer(state, action)).toEqual({
          byId: {},
          errors: {},
          isLoading: {
            [otherFilterId]: false,
            [filterId]: true,
          },
          [otherFilterId]: [],
          [filterId]: [],
        });
      });

      test('should set isLoading and not override other properties', () => {
        const actions = createEntitiesActionCreators('foo');
        const reducer = createReducer('foo');
        const filter = Filter.fromString('name=foo');
        const filterId = filterIdentifier(filter);
        const action = actions.request(filter);
        const state = {
          errors: {
            [filterId]: 'An Error',
          },
          isLoading: {
            [filterId]: false,
          },
          [filterId]: ['foo', 'bar'],
        };

        expect(reducer(state, action)).toEqual({
          byId: {},
          errors: {
            [filterId]: 'An Error',
          },
          isLoading: {
            [filterId]: true,
          },
          [filterId]: ['foo', 'bar'],
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
          errors: {},
          isLoading: {
            default: false,
          },
          default: ['foo', 'bar'],
        });
      });

      test('should reset other properties with default filter', () => {
        const actions = createEntitiesActionCreators('foo');
        const reducer = createReducer('foo');
        const action = actions.success([{id: 'foo'}, {id: 'bar'}]);
        const state = {
          errors: {
            default: 'An error',
          },
          isLoading: {
            default: true,
          },
          default: [],
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
          errors: {},
          isLoading: {
            default: false,
          },
          default: ['foo', 'bar'],
        });
      });

      test('should not override other filters', () => {
        const actions = createEntitiesActionCreators('foo');
        const reducer = createReducer('foo');
        const filter = Filter.fromString('name=bar');
        const filterId = filterIdentifier(filter);
        const otherFilter = Filter.fromString('name=foo');
        const otherFilterId = filterIdentifier(otherFilter);
        const action = actions.success([{id: 'foo'}, {id: 'bar'}], filter);
        const state = {
          errors: {
            [otherFilterId]: 'An error',
          },
          isLoading: {
            [otherFilterId]: true,
          },
          [otherFilterId]: ['lorem', 'ipsum'],
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
          errors: {
            [otherFilterId]: 'An error',
          },
          isLoading: {
            [otherFilterId]: true,
            [filterId]: false,
          },
          [otherFilterId]: ['lorem', 'ipsum'],
          [filterId]: ['foo', 'bar'],
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
          errors: {
            default: 'An error',
          },
          isLoading: {
            default: false,
          },
          default: [],
        });
      });

      test('should reset isLoading and error with default filter', () => {
        const actions = createEntitiesActionCreators('foo');
        const reducer = createReducer('foo');
        const action = actions.error('An error');
        const state = {
          errors: {
            default: 'Another error',
          },
          isLoading: {
            default: true,
          },
          default: ['foo', 'bar'],
        };

        expect(reducer(state, action)).toEqual({
          byId: {},
          errors: {
            default: 'An error',
          },
          isLoading: {
            default: false,
          },
          default: ['foo', 'bar'],
        });
      });

      test('should not override other filters', () => {
        const actions = createEntitiesActionCreators('foo');
        const reducer = createReducer('foo');
        const filter = Filter.fromString('name=bar');
        const filterId = filterIdentifier(filter);
        const otherFilter = Filter.fromString('name=foo');
        const otherFilterId = filterIdentifier(otherFilter);
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
          errors: {
            [otherFilterId]: 'Another error',
          },
          isLoading: {
            [otherFilterId]: true,
          },
          [otherFilterId]: ['lorem', 'ipsum'],
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
          errors: {
            [otherFilterId]: 'Another error',
            [filterId]: 'An error',
          },
          isLoading: {
            [otherFilterId]: true,
            [filterId]: false,
          },
          [otherFilterId]: ['lorem', 'ipsum'],
          [filterId]: [],
        });
      });

    });

    test('should not override byId accidentially', () => {
      const actions = createEntitiesActionCreators('foo');
      const reducer = createReducer('foo');
      const filter = Filter.fromString('byId');
      const filterId = filterIdentifier(filter);
      const action = actions.success([{id: 'foo'}], filter);
      const state = {
        byId: {
          bar: {
            id: 'bar',
          },
        },
        isLoading: {
          default: true,
        },
        default: ['bar'],
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
        errors: {},
        isLoading: {
          default: true,
          [filterId]: false,
        },
        default: ['bar'],
        [filterId]: ['foo'],
      });
    });

    test('should not override default accidentially', () => {
      const actions = createEntitiesActionCreators('foo');
      const reducer = createReducer('foo');
      const filter = Filter.fromString('default');
      const filterId = filterIdentifier(filter);
      const action = actions.success([{id: 'foo'}], filter);
      const state = {
        byId: {
          bar: {
            id: 'bar',
          },
        },
        isLoading: {
          default: true,
        },
        default: ['bar'],
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
        errors: {},
        isLoading: {
          default: true,
          [filterId]: false,
        },
        default: ['bar'],
        [filterId]: ['foo'],
      });
    });

  });
});

// vim: set ts=2 sw=2 tw=80:
