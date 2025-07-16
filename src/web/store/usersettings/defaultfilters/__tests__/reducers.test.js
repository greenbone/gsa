/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import Filter from 'gmp/models/filter';
import {defaultFilterLoadingActions} from 'web/store/usersettings/defaultfilters/actions';
import reducer from 'web/store/usersettings/defaultfilters/reducers';

describe('default filters reducers tests', () => {
  test('should init state', () => {
    const state = reducer(undefined, {});
    expect(state).toEqual({});
  });

  test('should reduce a request action', () => {
    const prevState = {};
    const action = defaultFilterLoadingActions.request('foo');
    const state = reducer(prevState, action);
    expect(state).toEqual({
      foo: {
        isLoading: true,
      },
    });
  });

  test('should override isLoading when reducing a request action', () => {
    const filter = Filter.fromString('foo=bar');
    const prevState = {
      foo: {
        isLoading: false,
        filter,
        error: 'An error',
      },
    };
    const action = defaultFilterLoadingActions.request('foo');
    const state = reducer(prevState, action);
    expect(state).toEqual({
      foo: {
        isLoading: true,
        filter,
        error: 'An error',
      },
    });
  });

  test('should reduce an error action', () => {
    const prevState = {};
    const action = defaultFilterLoadingActions.error('foo', 'An error');
    const state = reducer(prevState, action);
    expect(state).toEqual({
      foo: {
        isLoading: false,
        error: 'An error',
      },
    });
  });

  test('should update state when reducing an error action', () => {
    const filter = Filter.fromString('foo=bar');
    const prevState = {
      foo: {
        isLoading: true,
        filter,
        error: 'An old error',
      },
    };
    const action = defaultFilterLoadingActions.error('foo', 'An error');
    const state = reducer(prevState, action);
    expect(state).toEqual({
      foo: {
        isLoading: false,
        error: 'An error',
        filter,
      },
    });
  });

  test('should reduce a success action', () => {
    const filter = Filter.fromString('foo=bar');
    const prevState = {};
    const action = defaultFilterLoadingActions.success('foo', filter);
    const state = reducer(prevState, action);
    expect(state).toEqual({
      foo: {
        isLoading: false,
        filter,
      },
    });
  });

  test('should update state when reducing a success action', () => {
    const oldFilter = Filter.fromString('bar=foo');
    const filter = Filter.fromString('foo=bar');
    const prevState = {
      foo: {
        isLoading: true,
        filter: oldFilter,
        error: 'An old error',
      },
    };
    const action = defaultFilterLoadingActions.success('foo', filter);
    const state = reducer(prevState, action);
    expect(state).toEqual({
      foo: {
        isLoading: false,
        filter,
      },
    });
  });

  test('should reduce an optimistic update action with previous filter object', () => {
    const prevState = {
      foo: {
        isLoading: true,
        filter: {id: 'oldId', name: 'oldFilter'},
        error: 'old error',
      },
    };

    const newFilter = {id: 'newId', name: 'newFilter'};
    const action = defaultFilterLoadingActions.optimisticUpdate(
      'foo',
      newFilter,
    );

    const state = reducer(prevState, action);
    expect(state).toEqual({
      foo: {
        isLoading: false,
        filter: newFilter,
        error: undefined,
      },
    });
  });

  test('should reduce an optimistic update action with no previous filter', () => {
    const prevState = {
      foo: {
        isLoading: true,
        error: 'old error',
      },
    };

    const newFilter = {id: 'newId', name: 'newFilter'};
    const action = defaultFilterLoadingActions.optimisticUpdate(
      'foo',
      newFilter,
    );

    const state = reducer(prevState, action);
    expect(state).toEqual({
      foo: {
        isLoading: false,
        filter: newFilter,
        error: undefined,
      },
    });
  });
});
