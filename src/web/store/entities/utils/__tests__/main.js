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
import {isFunction} from 'gmp/utils/identity';

import {createAll} from '../main';
import {createState} from '../testing';

describe('createAll function tests', () => {
  test('should create all functions and objects', () => {
    const {
      entitiesLoadingActions,
      entityLoadingActions,
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

    expect(isFunction(entitiesLoadingActions.request)).toBe(true);
    expect(isFunction(entitiesLoadingActions.success)).toBe(true);
    expect(isFunction(entitiesLoadingActions.error)).toBe(true);

    expect(isFunction(entityLoadingActions.request)).toBe(true);
    expect(isFunction(entityLoadingActions.success)).toBe(true);
    expect(isFunction(entityLoadingActions.error)).toBe(true);

    expect(selector(rootState).isLoadingEntities()).toBe(true);
    expect(selector(rootState).isLoadingEntity(id)).toBe(true);
  });
});

// vim: set ts=2 sw=2 tw=80:
