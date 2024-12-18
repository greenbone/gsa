/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
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
