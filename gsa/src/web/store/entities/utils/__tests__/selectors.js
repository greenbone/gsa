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
import {filterIdentifier} from '../reducers';

describe('EntitiesSelector getIsLoadingEntities tests', () => {

  test('should be false for undefined state', () => {
    const selector = createSelector('foo');
    const rootState = createRootState({});
    const fooSelector = selector(rootState);

    expect(fooSelector.isLoadingEntities()).toEqual(false);
  });

  test('should be false for undefined state with filter', () => {
    const selector = createSelector('foo');
    const rootState = createRootState({});
    const filter = Filter.fromString('name=foo');
    const fooSelector = selector(rootState);

    expect(fooSelector.isLoadingEntities(filter)).toEqual(false);
  });

  test('should be false for empty state', () => {
    const selector = createSelector('foo');
    const rootState = createState('foo', {});
    const fooSelector = selector(rootState);

    expect(fooSelector.isLoadingEntities()).toEqual(false);
  });

  test('should be false for empty state with filter', () => {
    const selector = createSelector('foo');
    const rootState = createState('foo', {});
    const fooSelector = selector(rootState);
    const filter = Filter.fromString('name=foo');

    expect(fooSelector.isLoadingEntities(filter)).toEqual(false);
  });

  test('should be true for default filter', () => {
    const selector = createSelector('foo');
    const rootState = createState('foo', {
      isLoading: {
        default: true,
        'name=foo': false,
      },
    });
    const fooSelector = selector(rootState);

    expect(fooSelector.isLoadingEntities()).toEqual(true);
  });

  test('should be true for filter', () => {
    const filter = Filter.fromString('name=foo');
    const selector = createSelector('foo');
    const rootState = createState('foo', {
      isLoading: {
        default: false,
        [filterIdentifier(filter)]: true,
      },
    });
    const fooSelector = selector(rootState);

    expect(fooSelector.isLoadingEntities(filter)).toEqual(true);
  });

  test('should be false for unkown filter', () => {
    const selector = createSelector('foo');
    const rootState = createState('foo', {
      isLoading: {
        default: true,
        'name=foo': true,
      },
    });
    const fooSelector = selector(rootState);
    const filter = Filter.fromString('name=bar');

    expect(fooSelector.isLoadingEntities(filter)).toEqual(false);
  });

  test('should be false for undefined isLoading', () => {
    const selector = createSelector('foo');
    const rootState = createState('foo', {
      isLoading: {
        'name=foo': true,
      },
    });
    const fooSelector = selector(rootState);

    expect(fooSelector.isLoadingEntities()).toBe(false);
  });

});

describe('EntitiesSelector getIsLoadingEntity tests', () => {

  test('should be false for undefined state', () => {
    const id = 'a1';
    const selector = createSelector('foo');
    const rootState = createRootState({});
    const fooSelector = selector(rootState);

    expect(fooSelector.isLoadingEntity(id)).toBe(false);
  });

  test('should be false for empty state', () => {
    const id = 'a1';
    const selector = createSelector('foo');
    const rootState = createState('foo', {});
    const fooSelector = selector(rootState);

    expect(fooSelector.isLoadingEntity(id)).toEqual(false);
  });

  test('should be false for unkown id', () => {
    const id = 'a1';
    const selector = createSelector('foo');
    const rootState = createState('foo', {
      isLoading: {
        a2: true,
      },
    });
    const fooSelector = selector(rootState);

    expect(fooSelector.isLoadingEntity(id)).toBe(false);
  });

  test('should be false if false in state', () => {
    const id = 'a1';
    const selector = createSelector('foo');
    const rootState = createState('foo', {
      isLoading: {
        [id]: false,
      },
    });
    const fooSelector = selector(rootState);

    expect(fooSelector.isLoadingEntity(id)).toBe(false);
  });

  test('should be true if true in state', () => {
    const id = 'a1';
    const selector = createSelector('foo');
    const rootState = createState('foo', {
      isLoading: {
        [id]: true,
      },
    });
    const fooSelector = selector(rootState);

    expect(fooSelector.isLoadingEntity(id)).toBe(true);
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
      default: ['foo', 'bar'],
      'name=foo': ['lorem', 'ipsum'],
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
      default: ['foo', 'bar'],
      'name=foo': ['lorem', 'ipsum'],
    });
    const fooSelector = selector(rootState);

    expect(fooSelector.getEntities()).toEqual([{id: 'foo'}, {id: 'bar'}]);
  });

  test('getEntities should return entities with filter', () => {
    const filter = Filter.fromString('name=foo');
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
      default: ['foo', 'bar'],
      [filterIdentifier(filter)]: ['lorem', 'ipsum'],
    });
    const fooSelector = selector(rootState);

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
      default: ['foo', 'bar'],
      'name=foo': ['lorem', 'ipsum'],
    });
    const fooSelector = selector(rootState);
    const filter = Filter.fromString('name=bar');

    expect(fooSelector.getEntities(filter)).toEqual([]);
  });

});

describe('EntitiesSelector getEntitiesError tests', () => {

  test('should return undefined for undefined state', () => {
    const selector = createSelector('foo');
    const rootState = createRootState({});
    const fooSelector = selector(rootState);

    expect(fooSelector.getEntitiesError()).toBeUndefined();
  });

  test('should return undefined for undefined state with filter', () => {
    const selector = createSelector('foo');
    const rootState = createRootState({});
    const fooSelector = selector(rootState);
    const filter = Filter.fromString('name=foo');

    expect(fooSelector.getEntitiesError(filter)).toBeUndefined();
  });

  test('should return undefined for empty state', () => {
    const selector = createSelector('foo');
    const rootState = createState('foo', {});
    const fooSelector = selector(rootState);

    expect(fooSelector.getEntitiesError()).toBeUndefined();
  });

  test('should return undefined for empty state with filter', () => {
    const selector = createSelector('foo');
    const rootState = createState('foo', {});
    const fooSelector = selector(rootState);
    const filter = Filter.fromString('name=foo');

    expect(fooSelector.getEntitiesError(filter)).toBeUndefined();
  });

  test('should return error with default filter', () => {
    const filter = Filter.fromString('name=foo');
    const selector = createSelector('foo');
    const rootState = createState('foo', {
      errors: {
        default: 'An error',
        [filterIdentifier(filter)]: 'Another error',
      },
    });
    const fooSelector = selector(rootState);

    expect(fooSelector.getEntitiesError()).toEqual('An error');
  });

  test('should return error with filter', () => {
    const filter = Filter.fromString('name=foo');
    const selector = createSelector('foo');
    const rootState = createState('foo', {
      errors: {
        default: 'An error',
        [filterIdentifier(filter)]: 'Another error',
      },
    });
    const fooSelector = selector(rootState);

    expect(fooSelector.getEntitiesError(filter)).toEqual('Another error');
  });

  test('should return undefined for undefined error', () => {
    const selector = createSelector('foo');
    const rootState = createState('foo', {
      default: {
      },
    });
    const fooSelector = selector(rootState);

    expect(fooSelector.getEntitiesError()).toBeUndefined();
  });

  test('should return undefined for unkown filter', () => {
    const otherFilter = Filter.fromString('name=foo');
    const selector = createSelector('foo');
    const rootState = createState('foo', {
      errors: {
        default: 'An error',
        [filterIdentifier(otherFilter)]: 'Another error',
      },
    });
    const filter = Filter.fromString('name=bar');
    const fooSelector = selector(rootState);

    expect(fooSelector.getEntitiesError(filter)).toBeUndefined();
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

describe('EntitiesSelector getEntityError tests', () => {

  test('should return undefined for undefined state', () => {
    const id = 'a1';
    const selector = createSelector('foo');
    const rootState = createRootState({});
    const fooSelector = selector(rootState);

    expect(fooSelector.getEntityError(id)).toBeUndefined();
  });

  test('should return undefined for empty state', () => {
    const id = 'a1';
    const selector = createSelector('foo');
    const rootState = createState('foo', {});
    const fooSelector = selector(rootState);

    expect(fooSelector.getEntityError(id)).toBeUndefined();
  });

  test('should return undefined for empty errors', () => {
    const id = 'a1';
    const selector = createSelector('foo');
    const rootState = createState('foo', {
      errors: {
      },
    });
    const fooSelector = selector(rootState);

    expect(fooSelector.getEntityError(id)).toBeUndefined();
  });

  test('should return error', () => {
    const id = 'a1';
    const selector = createSelector('foo');
    const rootState = createState('foo', {
      errors: {
        [id]: 'An error',
      },
    });
    const fooSelector = selector(rootState);

    expect(fooSelector.getEntityError(id)).toEqual('An error');
  });

  test('should return undefined for unkown id', () => {
    const id = 'a1';
    const selector = createSelector('foo');
    const rootState = createState('foo', {
      errors: {
        a2: 'An error',
      },
    });
    const fooSelector = selector(rootState);

    expect(fooSelector.getEntityError(id)).toBeUndefined();
  });

});

// vim: set ts=2 sw=2 tw=80:
