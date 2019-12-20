/* Copyright (C) 2019 Greenbone Networks GmbH
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

import {entitiesActions as actions} from '../../reports';
import {reportsReducer} from '../reducers';

describe('report entities reducer tests', () => {
  test('should be a reportsReducer function', () => {
    expect(isFunction(reportsReducer)).toBe(true);
  });

  test('should create initial state', () => {
    expect(reportsReducer(undefined, {})).toEqual({});
  });

  test('should reduce request action', () => {
    const action = actions.request();

    expect(reportsReducer(undefined, action)).toEqual({
      byId: {},
      errors: {},
      isLoading: {
        default: true,
      },
      default: {},
    });
  });

  test('should reduce success action', () => {
    const action = actions.success([{id: 'foo'}]);

    expect(reportsReducer(undefined, action)).toEqual({
      byId: {
        foo: {
          id: 'foo',
        },
      },
      errors: {},
      isLoading: {
        default: false,
      },
      default: {
        ids: ['foo'],
      },
    });
  });

  test('should reduce error action', () => {
    const action = actions.error('An error');

    expect(reportsReducer(undefined, action)).toEqual({
      byId: {},
      errors: {
        default: 'An error',
      },
      isLoading: {
        default: false,
      },
      default: {},
    });
  });
});
