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

import {createAll} from '../main';
import {createRootState} from 'web/store/entities/utils/testing';

describe('createAll function tests', () => {

  test('should create all functions and objects', () => {
    const {
      loadEntities,
      reducer,
      actions,
      selector,
    } = createAll('foo');

    const rootState = createRootState({
      foo: {
        default: {
          isLoading: true,
        },
      },
    });

    expect(is_function(loadEntities)).toBe(true);
    expect(is_function(reducer)).toBe(true);
    expect(is_function(selector)).toBe(true);

    expect(is_function(actions.request)).toBe(true);
    expect(is_function(actions.success)).toBe(true);
    expect(is_function(actions.error)).toBe(true);

    expect(selector(rootState).isLoadingEntities()).toBe(true);
  });
});

// vim: set ts=2 sw=2 tw=80:
