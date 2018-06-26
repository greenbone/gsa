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

import filtersReducer from '../reducers';

import {actions} from '../actions';

describe('filter entities reducers tests', () => {

  test('Should be a reducer function', () => {
    expect(is_function(filtersReducer)).toBe(true);
  });

  test('Should create initial state', () => {
    expect(filtersReducer(undefined, {})).toEqual({});
  });

  test('should set isLoading with default filter', () => {
    const action = actions.request();

    expect(filtersReducer(undefined, action)).toEqual({
      default: {
        isLoading: true,
        error: null,
        entities: null,
      },
    });
  });

  test('should set isLoading with default filter', () => {
    const action = actions.success(['foo', 'bar']);

    expect(filtersReducer(undefined, action)).toEqual({
      default: {
        isLoading: false,
        error: null,
        entities: ['foo', 'bar'],
      },
    });
  });

  test('should set isLoading and error with default filter', () => {
    const action = actions.error('An error');

    expect(filtersReducer(undefined, action)).toEqual({
      default: {
        isLoading: false,
        error: 'An error',
        entities: null,
      },
    });
  });
});

// vim: set ts=2 sw=2 tw=80:
