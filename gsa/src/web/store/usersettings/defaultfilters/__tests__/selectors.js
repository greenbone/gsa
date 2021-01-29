import {getUserSettingsDefaultFilter} from '../selectors';
import Filter from 'gmp/models/filter';

/* Copyright (C) 2019-2021 Greenbone Networks GmbH
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
