/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import {loadingActions} from 'web/store/usersettings/defaults/actions';
import reducer from 'web/store/usersettings/defaults/reducers';

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

  test('should not overwrite existing settings', () => {
    const action = loadingActions.success({foo: 'bar'});
    const state = {
      byName: {
        bar: 'foo',
      },
    };
    expect(reducer(state, action)).toEqual({
      byName: {
        bar: 'foo',
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

  test('should optimistically update a user setting', () => {
    const action = {
      type: 'USER_SETTINGS_DEFAULTS_OPTIMISTIC_UPDATE',
      name: 'theme',
      value: 'dark',
    };
    const state = {
      byName: {
        theme: {value: 'light', other: 'meta'},
        foo: {value: 'bar'},
      },
      isLoading: false,
    };
    expect(reducer(state, action)).toEqual({
      byName: {
        theme: {value: 'dark', other: 'meta'},
        foo: {value: 'bar'},
      },
      isLoading: false,
    });
  });
});
