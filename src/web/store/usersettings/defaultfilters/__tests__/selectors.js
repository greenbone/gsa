/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';

import Filter from 'gmp/models/filter';

import {getUserSettingsDefaultFilter} from '../selectors';

describe('getUserSettingsDefaultFilter selector tests', () => {
  test('should return defaults', () => {
    const state = {
      userSettings: {
        defaultFilters: {},
      },
    };
    const selector = getUserSettingsDefaultFilter(state);

    expect(selector.getError()).toBeUndefined();
    expect(selector.getFilter()).toBeUndefined();
    expect(selector.isLoading()).toEqual(false);

    expect(selector.getError('foo')).toBeUndefined();
    expect(selector.getFilter('foo')).toBeUndefined();
    expect(selector.isLoading('foo')).toEqual(false);
  });

  test('should select values with class entity type', () => {
    const filter = Filter.fromString('foo=bar');

    const state = {
      userSettings: {
        defaultFilters: {
          foo: {
            isLoading: true,
            error: 'An error',
            filter,
          },
        },
      },
    };
    const selector = getUserSettingsDefaultFilter(state, 'foo');

    expect(selector.getError()).toEqual('An error');
    expect(selector.getFilter()).toEqual(filter);
    expect(selector.isLoading()).toEqual(true);

    expect(selector.getError('foo')).toEqual('An error');
    expect(selector.getFilter('foo')).toEqual(filter);
    expect(selector.isLoading('foo')).toEqual(true);

    expect(selector.getError('bar')).toBeUndefined();
    expect(selector.getFilter('bar')).toBeUndefined();
    expect(selector.isLoading('bar')).toEqual(false);
  });

  test('should select values without class entity type', () => {
    const filter = Filter.fromString('foo=bar');

    const state = {
      userSettings: {
        defaultFilters: {
          foo: {
            isLoading: true,
            error: 'An error',
            filter,
          },
        },
      },
    };
    const selector = getUserSettingsDefaultFilter(state);

    expect(selector.getError()).toBeUndefined();
    expect(selector.getFilter()).toBeUndefined();
    expect(selector.isLoading()).toEqual(false);

    expect(selector.getError('foo')).toEqual('An error');
    expect(selector.getFilter('foo')).toEqual(filter);
    expect(selector.isLoading('foo')).toEqual(true);

    expect(selector.getError('bar')).toBeUndefined();
    expect(selector.getFilter('bar')).toBeUndefined();
    expect(selector.isLoading('bar')).toEqual(false);
  });
});
