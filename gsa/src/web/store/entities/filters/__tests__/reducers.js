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
import Filter from 'gmp/models/filter';

import filtersReducer from '../reducers';

import {
  requestFilters,
  receivedFiltersSuccess,
  receivedFiltersError,
} from '../actions';

describe('filter entities reducers tests', () => {

  test('Should create initial state', () => {
    expect(filtersReducer(undefined, {})).toEqual({});
  });

  describe('reducing filter loading request actions', () => {

    test('should set isLoading with default filter', () => {
      const action = requestFilters();

      expect(filtersReducer(undefined, action)).toEqual({
        default: {
          isLoading: true,
          error: null,
          entities: null,
        },
      });
    });

    test('should set isLoading for filter', () => {
      const filter = Filter.fromString('name=foo');
      const action = requestFilters(filter);

      expect(filtersReducer(undefined, action)).toEqual({
        'name=foo': {
          isLoading: true,
          error: null,
          entities: null,
        },
      });
    });

    test('should set isLoading and not override existing state', () => {
      const filter = Filter.fromString('name=foo');
      const action = requestFilters(filter);
      const state = {
        'name=bar': {
          isLoading: false,
          entities: [],
          error: null,
        },
      };

      expect(filtersReducer(state, action)).toEqual({
        'name=foo': {
          isLoading: true,
          error: null,
          entities: null,
        },
        'name=bar': {
          isLoading: false,
          entities: [],
          error: null,
        },
      });
    });

    test('should set isLoading and not override other properties', () => {
      const filter = Filter.fromString('name=foo');
      const action = requestFilters(filter);
      const state = {
        'name=foo': {
          isLoading: false,
          entities: ['foo', 'bar'],
          error: 'An error',
        },
      };

      expect(filtersReducer(state, action)).toEqual({
        'name=foo': {
          isLoading: true,
          entities: ['foo', 'bar'],
          error: 'An error',
        },
      });
    });
  });

  describe('reducing filter loading success actions', () => {

    test('should set isLoading with default filter', () => {
      const action = receivedFiltersSuccess(['foo', 'bar']);

      expect(filtersReducer(undefined, action)).toEqual({
        default: {
          isLoading: false,
          error: null,
          entities: ['foo', 'bar'],
        },
      });
    });

    test('should reset other properties with default filter', () => {
      const action = receivedFiltersSuccess(['foo', 'bar']);
      const state = {
        default: {
          isLoading: true,
          error: 'An error',
          entities: [],
        },
      };

      expect(filtersReducer(state, action)).toEqual({
        default: {
          isLoading: false,
          error: null,
          entities: ['foo', 'bar'],
        },
      });
    });

    test('should not override other filters', () => {
      const filter = Filter.fromString('name=bar');
      const action = receivedFiltersSuccess(['foo', 'bar'], filter);
      const state = {
        'name=foo': {
          isLoading: true,
          entities: ['lorem', 'ipsum'],
          error: 'An error',
        },
      };

      expect(filtersReducer(state, action)).toEqual({
        'name=foo': {
          isLoading: true,
          entities: ['lorem', 'ipsum'],
          error: 'An error',
        },
        'name=bar': {
          isLoading: false,
          entities: ['foo', 'bar'],
          error: null,
        },
      });
    });
  });

  describe('reducing filter loading error actions', () => {

    test('should set isLoading and error with default filter', () => {
      const action = receivedFiltersError('An error');

      expect(filtersReducer(undefined, action)).toEqual({
        default: {
          isLoading: false,
          error: 'An error',
          entities: null,
        },
      });
    });

    test('should reset isLoading and error with default filter', () => {
      const action = receivedFiltersError('An error');
      const state = {
        default: {
          isLoading: true,
          error: 'Another error',
          entities: ['foo', 'bar'],
        },
      };

      expect(filtersReducer(state, action)).toEqual({
        default: {
          isLoading: false,
          error: 'An error',
          entities: ['foo', 'bar'],
        },
      });
    });

    test('should not override other filters', () => {
      const filter = Filter.fromString('name=bar');
      const action = receivedFiltersError('An error', filter);
      const state = {
        'name=foo': {
          isLoading: true,
          entities: ['lorem', 'ipsum'],
          error: 'Another error',
        },
      };

      expect(filtersReducer(state, action)).toEqual({
        'name=foo': {
          isLoading: true,
          entities: ['lorem', 'ipsum'],
          error: 'Another error',
        },
        'name=bar': {
          isLoading: false,
          entities: null,
          error: 'An error',
        },
      });
    });
  });
});

// vim: set ts=2 sw=2 tw=80:
