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

import {
  requestFilters,
  receivedFiltersError,
  receivedFiltersSuccess,
  types,
} from '../actions';

describe('filter entities actions tests', () => {

  test('should create a load filters request action', () => {
    const action = requestFilters();
    expect(action).toEqual({
      type: types.REQUEST,
    });
  });

  test('should create a load specific filters request action', () => {
    const filter = Filter.fromString('type=abc');
    const action = requestFilters(filter);

    expect(action).toEqual({
      type: types.REQUEST,
      filter,
    });
  });

  test('should create a load filters success action', () => {
    const action = receivedFiltersSuccess(['foo', 'bar']);
    expect(action).toEqual({
      type: types.SUCCESS,
      data: ['foo', 'bar'],
    });
  });

  test('should create a load specific filters success action', () => {
    const filter = Filter.fromString('type=abc');
    const action = receivedFiltersSuccess(['foo', 'bar'], filter);

    expect(action).toEqual({
      type: types.SUCCESS,
      data: ['foo', 'bar'],
      filter,
    });
  });

  test('should create a load filters error action', () => {
    const action = receivedFiltersError('An error');
    expect(action).toEqual({
      type: types.ERROR,
      error: 'An error',
    });
  });

  test('should create a load specific filters error action', () => {
    const filter = Filter.fromString('type=abc');
    const action = receivedFiltersError('An error', filter);

    expect(action).toEqual({
      type: types.ERROR,
      error: 'An error',
      filter,
    });
  });

});

// vim: set ts=2 sw=2 tw=80:
