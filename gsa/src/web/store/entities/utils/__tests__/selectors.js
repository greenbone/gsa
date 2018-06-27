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
import Filter from 'gmp/models/filter';

import {createRootState, createState} from '../testing';

import {createSelector} from '../selectors';

describe('EntitiesSelector getIsLoading tests', () => {

  test('isLoading for undefined state', () => {
    const selector = createSelector('foo');
    const rootState = createRootState({});
    const fooSelector = selector(rootState);

    expect(fooSelector.getIsLoading()).toEqual(false);
  });

  test('isLoading for undefined state with filter', () => {
    const selector = createSelector('foo');
    const rootState = createRootState({});
    const filter = Filter.fromString('name=foo');
    const fooSelector = selector(rootState);

    expect(fooSelector.getIsLoading(filter)).toEqual(false);
  });

  test('isLoading for empty state', () => {
    const selector = createSelector('foo');
    const rootState = createState('foo', {});
    const fooSelector = selector(rootState);

    expect(fooSelector.getIsLoading()).toEqual(false);
  });

  test('isLoading for empty state with filter', () => {
    const selector = createSelector('foo');
    const rootState = createState('foo', {});
    const fooSelector = selector(rootState);
    const filter = Filter.fromString('name=foo');

    expect(fooSelector.getIsLoading(filter)).toEqual(false);
  });

  test('isLoading should be true with default filter', () => {
    const selector = createSelector('foo');
    const rootState = createState('foo', {
      default: {
        isLoading: true,
      },
      'name=foo': {
        isLoading: false,
      },
    });
    const fooSelector = selector(rootState);

    expect(fooSelector.getIsLoading()).toEqual(true);
  });

  test('isLoading should be true with filter', () => {
    const selector = createSelector('foo');
    const rootState = createState('foo', {
      default: {
        isLoading: false,
      },
      'name=foo': {
        isLoading: true,
      },
    });
    const fooSelector = selector(rootState);
    const filter = Filter.fromString('name=foo');

    expect(fooSelector.getIsLoading(filter)).toEqual(true);
  });

  test('isLoading should be false for unkown filter', () => {
    const selector = createSelector('foo');
    const rootState = createState('foo', {
      default: {
        isLoading: true,
      },
      'name=foo': {
        isLoading: true,
      },
    });
    const fooSelector = selector(rootState);
    const filter = Filter.fromString('name=bar');

    expect(fooSelector.getIsLoading(filter)).toEqual(false);
  });

  test('isLoading should be undefined for undefined isLoading', () => {
    const selector = createSelector('foo');
    const rootState = createState('foo', {
      default: {
      },
      'name=foo': {
        isLoading: false,
      },
    });
    const fooSelector = selector(rootState);

    expect(fooSelector.getIsLoading()).toBeUndefined();
  });

});

describe('EntitiesSelector getEntities tests', () => {

  test('getEntities for undefined state', () => {
    const selector = createSelector('foo');
    const rootState = createRootState({});
    const fooSelector = selector(rootState);
    expect(fooSelector.getEntities()).toEqual([]);
  });

  test('getEntities for undefined state with filter', () => {
    const selector = createSelector('foo');
    const rootState = createRootState({});
    const fooSelector = selector(rootState);
    const filter = Filter.fromString('name=foo');

    expect(fooSelector.getEntities(filter)).toEqual([]);
  });

  test('getEntities for empty state', () => {
    const selector = createSelector('foo');
    const rootState = createState('foo', {});
    const fooSelector = selector(rootState);

    expect(fooSelector.getEntities()).toEqual([]);
  });

  test('getEntities for empty state with filter', () => {
    const selector = createSelector('foo');
    const rootState = createState('foo', {});
    const fooSelector = selector(rootState);
    const filter = Filter.fromString('name=foo');

    expect(fooSelector.getEntities(filter)).toEqual([]);
  });

  test('getEntities should return empty array if byId is empty', () => {
    const selector = createSelector('foo');
    const rootState = createState('foo', {
      byId: {},
      default: {
        entities: ['foo', 'bar'],
      },
      'name=foo': {
        entities: ['lorem', 'ipsum'],
      },
    });
    const fooSelector = selector(rootState);

    expect(fooSelector.getEntities()).toEqual([]);
  });

  test('getEntities should return entities with default filter', () => {
    const selector = createSelector('foo');
    const rootState = createState('foo', {
      byId: {
        foo: {
          id: 'foo',
        },
        bar: {
          id: 'bar',
        },
      },
      default: {
        entities: ['foo', 'bar'],
      },
      'name=foo': {
        entities: ['lorem', 'ipsum'],
      },
    });
    const fooSelector = selector(rootState);

    expect(fooSelector.getEntities()).toEqual([{id: 'foo'}, {id: 'bar'}]);
  });

  test('getEntities should return entities with filter', () => {
    const selector = createSelector('foo');
    const rootState = createState('foo', {
      byId: {
        foo: {
          id: 'foo',
        },
        bar: {
          id: 'bar',
        },
        lorem: {
          id: 'lorem',
        },
        ipsum: {
          id: 'ipsum',
        },
      },
      default: {
        entities: ['foo', 'bar'],
      },
      'name=foo': {
        entities: ['lorem', 'ipsum'],
      },
    });
    const fooSelector = selector(rootState);
    const filter = Filter.fromString('name=foo');

    expect(fooSelector.getEntities(filter))
      .toEqual([{id: 'lorem'}, {id: 'ipsum'}]);
  });

  test('getEntities should return empty array for undefined entities', () => {
    const selector = createSelector('foo');
    const rootState = createState('foo', {
      default: {
      },
    });
    const fooSelector = selector(rootState);

    expect(fooSelector.getEntities()).toEqual([]);
  });

  test('getEntities should return empty array for unkown filter', () => {
    const selector = createSelector('foo');
    const rootState = createState('foo', {
      default: {
        entities: ['foo', 'bar'],
      },
      'name=foo': {
        entities: ['lorem', 'ipsum'],
      },
    });
    const fooSelector = selector(rootState);
    const filter = Filter.fromString('name=bar');

    expect(fooSelector.getEntities(filter)).toEqual([]);
  });

});

describe('EntitiesSelector getError tests', () => {

  test('getError for undefined state', () => {
    const selector = createSelector('foo');
    const rootState = createRootState({});
    const fooSelector = selector(rootState);

    expect(fooSelector.getError()).toBeUndefined();
  });

  test('getError for undefined state with filter', () => {
    const selector = createSelector('foo');
    const rootState = createRootState({});
    const fooSelector = selector(rootState);
    const filter = Filter.fromString('name=foo');

    expect(fooSelector.getError(filter)).toBeUndefined();
  });

  test('getError for empty state', () => {
    const selector = createSelector('foo');
    const rootState = createState('foo', {});
    const fooSelector = selector(rootState);

    expect(fooSelector.getError()).toBeUndefined();
  });

  test('getError for empty state with filter', () => {
    const selector = createSelector('foo');
    const rootState = createState('foo', {});
    const fooSelector = selector(rootState);
    const filter = Filter.fromString('name=foo');

    expect(fooSelector.getError(filter)).toBeUndefined();
  });

  test('getError should return error with default filter', () => {
    const selector = createSelector('foo');
    const rootState = createRootState({
      foo: {
        default: {
          error: 'An error',
        },
        'name=foo': {
          error: 'Another error',
        },
      },
    });
    const fooSelector = selector(rootState);

    expect(fooSelector.getError()).toEqual('An error');
  });

  test('getError should return error with filter', () => {
    const selector = createSelector('foo');
    const rootState = createState('foo', {
      default: {
        error: 'An error',
      },
      'name=foo': {
        error: 'Another error',
      },
    });
    const fooSelector = selector(rootState);
    const filter = Filter.fromString('name=foo');

    expect(fooSelector.getError(filter)).toEqual('Another error');
  });

  test('getEeror should return undefined for undefined error', () => {
    const selector = createSelector('foo');
    const rootState = createState('foo', {
      default: {
      },
    });
    const fooSelector = selector(rootState);

    expect(fooSelector.getError()).toBeUndefined();
  });

  test('getError should return undefined for unkown filter', () => {
    const selector = createSelector('foo');
    const rootState = createState('foo', {
      default: {
        error: 'An error',
      },
      'name=foo': {
        error: 'Another error',
      },
    });
    const filter = Filter.fromString('name=bar');
    const fooSelector = selector(rootState);

    expect(fooSelector.getError(filter)).toBeUndefined();
  });

});

describe('EntitiesSelector getEntity tests', () => {

  test('should return undefined for empty state', () => {
    const selector = createSelector('foo');
    const rootState = createRootState({});
    const fooSelector = selector(rootState);

    expect(fooSelector.getEntity('bar')).toBeUndefined();
  });

  test('should return undefined for empty byId', () => {
    const selector = createSelector('foo');
    const rootState = createState('foo', {
      byId: {},
    });
    const fooSelector = selector(rootState);

    expect(fooSelector.getEntity('bar')).toBeUndefined();
  });

  test('should return undefined for unkown id', () => {
    const selector = createSelector('foo');
    const rootState = createState('foo', {
      byId: {
        foo: {
          id: 'foo',
        },
      },
    });
    const fooSelector = selector(rootState);

    expect(fooSelector.getEntity('bar')).toBeUndefined();
  });

  test('should return entity data', () => {
    const selector = createSelector('foo');
    const rootState = createState('foo', {
      byId: {
        bar: {
          id: 'bar',
          lorem: 'ipsum',
        },
      },
    });
    const fooSelector = selector(rootState);

    expect(fooSelector.getEntity('bar')).toEqual({
      id: 'bar',
      lorem: 'ipsum',
    });
  });
});

// vim: set ts=2 sw=2 tw=80:
