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
import reducer from '../reducers';
import {pageFilter} from 'web/store/pages/actions';

describe('page reducers tests', () => {
  test('should create initial state', () => {
    expect(reducer(undefined, {})).toEqual({});
  });

  test('should create empty state for page', () => {
    expect(reducer(undefined, {page: 'foo'})).toEqual({
      foo: {},
    });
  });

  test('should reduce pageFilter action', () => {
    const action = pageFilter('foo', 'name~foo');

    expect(reducer(undefined, action)).toEqual({
      foo: {
        filter: 'name~foo',
      },
    });
  });

  test('should override existing filter', () => {
    const action = pageFilter('foo', 'name~foo');
    const state = {
      foo: {
        filter: 'name~bar',
      },
    };

    expect(reducer(state, action)).toEqual({
      foo: {
        filter: 'name~foo',
      },
    });
  });

  test('should not override other state', () => {
    const action = pageFilter('foo', 'name~foo');
    const state = {
      bar: {
        filter: 'name~bar',
      },
    };

    expect(reducer(state, action)).toEqual({
      foo: {
        filter: 'name~foo',
      },
      bar: {
        filter: 'name~bar',
      },
    });
  });
});

// vim: set ts=2 sw=2 tw=80:
