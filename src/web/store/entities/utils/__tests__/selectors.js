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
import Filter from 'gmp/models/filter';

import {filterIdentifier} from 'web/store/utils';

import {createRootState, createState} from '../testing';

import {createSelector} from '../selectors';

describe('EntitiesSelector isLoadingEntities tests', () => {
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

  test('should be false for unknown filter', () => {
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

describe('EntitiesSelector isLoadingEntity tests', () => {
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

  test('should be false for unknown id', () => {
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
    expect(fooSelector.getEntities()).toBeUndefined();
  });

  test('getEntities for undefined state with filter', () => {
    const selector = createSelector('foo');
    const rootState = createRootState({});
    const fooSelector = selector(rootState);
    const filter = Filter.fromString('name=foo');

    expect(fooSelector.getEntities(filter)).toBeUndefined();
  });

  test('getEntities for empty state', () => {
    const selector = createSelector('foo');
    const rootState = createState('foo', {});
    const fooSelector = selector(rootState);

    expect(fooSelector.getEntities()).toBeUndefined();
  });

  test('getEntities for empty state with filter', () => {
    const selector = createSelector('foo');
    const rootState = createState('foo', {});
    const fooSelector = selector(rootState);
    const filter = Filter.fromString('name=foo');

    expect(fooSelector.getEntities(filter)).toBeUndefined();
  });

  test('getEntities should return empty array if byId is empty', () => {
    const selector = createSelector('foo');
    const rootState = createState('foo', {
      byId: {},
      default: {
        ids: ['foo', 'bar'],
      },
      'name=foo': {
        ids: ['lorem', 'ipsum'],
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
        ids: ['foo', 'bar'],
      },
      'name=foo': {
        ids: ['lorem', 'ipsum'],
      },
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
      default: {
        ids: ['foo', 'bar'],
      },
      [filterIdentifier(filter)]: {
        ids: ['lorem', 'ipsum'],
      },
    });
    const fooSelector = selector(rootState);

    expect(fooSelector.getEntities(filter)).toEqual([
      {id: 'lorem'},
      {id: 'ipsum'},
    ]);
  });

  test('getEntities should return empty array for undefined entities', () => {
    const selector = createSelector('foo');
    const rootState = createState('foo', {
      default: {},
    });
    const fooSelector = selector(rootState);

    expect(fooSelector.getEntities()).toBeUndefined();
  });

  test('getEntities should return empty array for unknown filter', () => {
    const selector = createSelector('foo');
    const rootState = createState('foo', {
      default: ['foo', 'bar'],
      'name=foo': ['lorem', 'ipsum'],
    });
    const fooSelector = selector(rootState);
    const filter = Filter.fromString('name=bar');

    expect(fooSelector.getEntities(filter)).toBeUndefined();
  });
});

describe('EntitiesSelector getAllEntities tests', () => {
  test('getAllEntities should return entities with all-filter', () => {
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
      default: {
        ids: ['foo', 'bar'],
      },
      [filterIdentifier(filter.all())]: {
        ids: ['lorem', 'ipsum', 'bar', 'foo'],
      },
    });
    const fooSelector = selector(rootState);

    expect(fooSelector.getAllEntities(filter)).toEqual([
      {id: 'lorem'},
      {id: 'ipsum'},
      {id: 'bar'},
      {id: 'foo'},
    ]);
  });

  test('getAllEntities should return entities with all-filter if filter is undefined', () => {
    const filter = new Filter();
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
        ids: ['foo', 'bar'],
      },
      [filterIdentifier(filter.all())]: {
        ids: ['lorem', 'ipsum', 'bar', 'foo'],
      },
    });
    const fooSelector = selector(rootState);

    expect(fooSelector.getAllEntities()).toEqual([
      {id: 'lorem'},
      {id: 'ipsum'},
      {id: 'bar'},
      {id: 'foo'},
    ]);
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
      default: {},
    });
    const fooSelector = selector(rootState);

    expect(fooSelector.getEntitiesError()).toBeUndefined();
  });

  test('should return undefined for unknown filter', () => {
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

describe('EntitiesSelector getEntitiesCounts tests', () => {
  test('should return undefined for undefined state', () => {
    const selector = createSelector('foo');
    const rootState = createRootState({});
    const fooSelector = selector(rootState);

    expect(fooSelector.getEntitiesCounts()).toBeUndefined();
  });

  test('should return undefined for undefined state with filter', () => {
    const selector = createSelector('foo');
    const rootState = createRootState({});
    const fooSelector = selector(rootState);
    const filter = Filter.fromString('name=foo');

    expect(fooSelector.getEntitiesCounts(filter)).toBeUndefined();
  });

  test('should return undefined for empty state', () => {
    const selector = createSelector('foo');
    const rootState = createState('foo', {});
    const fooSelector = selector(rootState);

    expect(fooSelector.getEntitiesCounts()).toBeUndefined();
  });

  test('should return undefined for empty state with filter', () => {
    const selector = createSelector('foo');
    const rootState = createState('foo', {});
    const fooSelector = selector(rootState);
    const filter = Filter.fromString('name=foo');

    expect(fooSelector.getEntitiesCounts(filter)).toBeUndefined();
  });

  test('should return counts', () => {
    const selector = createSelector('foo');
    const counts = {
      first: 1,
    };
    const rootState = createState('foo', {
      default: {
        counts,
      },
    });
    const fooSelector = selector(rootState);

    expect(fooSelector.getEntitiesCounts()).toEqual(counts);
  });

  test('should return counts with filter', () => {
    const selector = createSelector('foo');
    const counts = {
      first: 1,
    };
    const filter = Filter.fromString('name=foo');
    const filterId = filterIdentifier(filter);
    const rootState = createState('foo', {
      [filterId]: {
        counts,
      },
    });
    const fooSelector = selector(rootState);

    expect(fooSelector.getEntitiesCounts(filter)).toEqual(counts);
  });
});

describe('EntitiesSelector getLoadedFilter tests', () => {
  test('should return undefined for undefined state', () => {
    const selector = createSelector('foo');
    const rootState = createRootState({});
    const fooSelector = selector(rootState);

    expect(fooSelector.getLoadedFilter()).toBeUndefined();
  });

  test('should return undefined for undefined state with filter', () => {
    const selector = createSelector('foo');
    const rootState = createRootState({});
    const fooSelector = selector(rootState);
    const filter = Filter.fromString('name=foo');

    expect(fooSelector.getLoadedFilter(filter)).toBeUndefined();
  });

  test('should return undefined for empty state', () => {
    const selector = createSelector('foo');
    const rootState = createState('foo', {});
    const fooSelector = selector(rootState);

    expect(fooSelector.getLoadedFilter()).toBeUndefined();
  });

  test('should return undefined for empty state with filter', () => {
    const selector = createSelector('foo');
    const rootState = createState('foo', {});
    const fooSelector = selector(rootState);
    const filter = Filter.fromString('name=foo');

    expect(fooSelector.getLoadedFilter(filter)).toBeUndefined();
  });

  test('should return loaded filter', () => {
    const selector = createSelector('foo');
    const loadedFilter = Filter.fromString('foo=bar');
    const rootState = createState('foo', {
      default: {
        loadedFilter,
      },
    });
    const fooSelector = selector(rootState);

    expect(fooSelector.getLoadedFilter()).toEqual(loadedFilter);
  });

  test('should return loadedFilter with filter', () => {
    const selector = createSelector('foo');
    const loadedFilter = Filter.fromString('foo=bar');
    const filter = Filter.fromString('name=foo');
    const filterId = filterIdentifier(filter);
    const rootState = createState('foo', {
      [filterId]: {
        loadedFilter,
      },
    });
    const fooSelector = selector(rootState);

    expect(fooSelector.getLoadedFilter(filter)).toEqual(loadedFilter);
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

  test('should return undefined for unknown id', () => {
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
      errors: {},
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

  test('should return undefined for unknown id', () => {
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
