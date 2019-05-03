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
import {isFunction} from 'gmp/utils/identity';

import {createAll} from '../main';
import {createState} from '../testing';

describe('createAll function tests', () => {
  test('should create all functions and objects', () => {
    const {
      entitiesActions,
      entityActions,
      loadAllEntities,
      loadEntities,
      loadEntity,
      reducer,
      selector,
    } = createAll('foo');

    const id = 'a1';
    const rootState = createState('foo', {
      isLoading: {
        default: true,
        [id]: true,
      },
    });

    expect(isFunction(loadAllEntities)).toBe(true);
    expect(isFunction(loadEntities)).toBe(true);
    expect(isFunction(loadEntity)).toBe(true);
    expect(isFunction(reducer)).toBe(true);
    expect(isFunction(selector)).toBe(true);

    expect(isFunction(entitiesActions.request)).toBe(true);
    expect(isFunction(entitiesActions.success)).toBe(true);
    expect(isFunction(entitiesActions.error)).toBe(true);

    expect(isFunction(entityActions.request)).toBe(true);
    expect(isFunction(entityActions.success)).toBe(true);
    expect(isFunction(entityActions.error)).toBe(true);

    expect(selector(rootState).isLoadingEntities()).toBe(true);
    expect(selector(rootState).isLoadingEntity(id)).toBe(true);
  });
});

// vim: set ts=2 sw=2 tw=80:
