/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import {pageFilter} from 'web/store/pages/actions';
import reducer from 'web/store/pages/reducers';

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
