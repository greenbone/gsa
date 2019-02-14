/* Copyright (C) 2018-2019 Greenbone Networks GmbH
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
import {loadingActions} from '../actions';
import reducer from '../reducers';

describe('UserSetting Defaults reducer tests', () => {
  test('should create the default state', () => {
    expect(reducer(undefined, {})).toEqual({
      byName: {},
      isLoading: false,
    });
  });

  test('should reduce loading request action', () => {
    const action = loadingActions.request();
    expect(reducer(undefined, action)).toEqual({
      byName: {},
      isLoading: true,
    });
  });

  test('should reduce loading success action', () => {
    const action = loadingActions.success({foo: 'bar'});
    expect(reducer(undefined, action)).toEqual({
      byName: {
        foo: 'bar',
      },
      isLoading: false,
    });
  });

  test('should reduce loading error action', () => {
    const action = loadingActions.error('An Error');
    expect(reducer(undefined, action)).toEqual({
      byName: {},
      isLoading: false,
      error: 'An Error',
    });
  });

  test('should override existing settings', () => {
    const action = loadingActions.success({foo: 'bar'});
    const state = {
      byName: {
        bar: 'foo',
      },
    };
    expect(reducer(state, action)).toEqual({
      byName: {
        foo: 'bar',
      },
      isLoading: false,
    });
  });

  test('should reset isLoading on success', () => {
    const action = loadingActions.success({foo: 'bar'});
    const state = {
      isLoading: true,
    };
    expect(reducer(state, action)).toEqual({
      byName: {
        foo: 'bar',
      },
      isLoading: false,
    });
  });

  test('should reset isLoading on error', () => {
    const action = loadingActions.error('An Error');
    const state = {
      isLoading: true,
    };
    expect(reducer(state, action)).toEqual({
      byName: {},
      error: 'An Error',
      isLoading: false,
    });
  });

  test('should keep error on request', () => {
    const action = loadingActions.request();
    const state = {
      error: 'An Error',
    };
    expect(reducer(state, action)).toEqual({
      byName: {},
      error: 'An Error',
      isLoading: true,
    });
  });

  test('should reset error on success', () => {
    const action = loadingActions.success({foo: 'bar'});
    const state = {
      error: 'An Error',
    };
    expect(reducer(state, action)).toEqual({
      byName: {
        foo: 'bar',
      },
      isLoading: false,
    });
  });

  test('should override previous error', () => {
    const action = loadingActions.error('Another Error');
    const state = {
      error: 'An Error',
    };
    expect(reducer(state, action)).toEqual({
      byName: {},
      error: 'Another Error',
      isLoading: false,
    });
  });
});

// vim: set ts=2 sw=2 tw=80:
