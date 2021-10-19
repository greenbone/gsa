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

import Filter from 'gmp/models/filter';

import Rejection from 'gmp/http/rejection';

import {filterIdentifier} from 'web/store/utils';

import {
  createEntitiesLoadingActions,
  createEntityLoadingActions,
} from '../actions';
import {createReducer} from '../reducers';

describe('entities reducers test', () => {
  test('should create a reducer function', () => {
    const reducer = createReducer('foo');

    expect(isFunction(reducer)).toBe(true);
  });

  test('Should create initial state', () => {
    const reducer = createReducer('foo');

    expect(reducer(undefined, {})).toEqual({
      byId: {},
      isLoading: {},
      errors: {},
    });
  });

  test('should create empty state for corresponding entityType action', () => {
    const reducer = createReducer('foo');

    expect(reducer(undefined, {entityType: 'foo'})).toEqual({
      byId: {},
      isLoading: {},
      errors: {},
    });
  });

  test('should not override byId accidentially', () => {
    const actions = createEntitiesLoadingActions('foo');
    const reducer = createReducer('foo');
    const filter = Filter.fromString('byId');
    const filterId = filterIdentifier(filter);
    const action = actions.success([{id: 'foo'}], filter);
    const state = {
      byId: {
        bar: {
          id: 'bar',
        },
      },
      isLoading: {
        default: true,
      },
      default: {
        ids: ['bar'],
      },
    };

    expect(reducer(state, action)).toEqual({
      byId: {
        bar: {
          id: 'bar',
        },
        foo: {
          id: 'foo',
        },
      },
      errors: {},
      isLoading: {
        default: true,
        [filterId]: false,
      },
      default: {
        ids: ['bar'],
      },
      [filterId]: {
        ids: ['foo'],
      },
    });
  });

  test('should not override default accidentially', () => {
    const actions = createEntitiesLoadingActions('foo');
    const reducer = createReducer('foo');
    const filter = Filter.fromString('default');
    const filterId = filterIdentifier(filter);
    const action = actions.success([{id: 'foo'}], filter);
    const state = {
      byId: {
        bar: {
          id: 'bar',
        },
      },
      isLoading: {
        default: true,
      },
      default: {
        ids: ['bar'],
      },
    };

    expect(reducer(state, action)).toEqual({
      byId: {
        bar: {
          id: 'bar',
        },
        foo: {
          id: 'foo',
        },
      },
      errors: {},
      isLoading: {
        default: true,
        [filterId]: false,
      },
      default: {
        ids: ['bar'],
      },
      [filterId]: {
        ids: ['foo'],
      },
    });
  });

  describe('reducing entities loading request actions', () => {
    test('should set isLoading with default filter', () => {
      const actions = createEntitiesLoadingActions('foo');
      const action = actions.request();
      const reducer = createReducer('foo');

      expect(reducer(undefined, action)).toEqual({
        byId: {},
        isLoading: {
          default: true,
        },
        errors: {},
        default: {},
      });
    });

    test('should set isLoading for filter', () => {
      const actions = createEntitiesLoadingActions('foo');
      const reducer = createReducer('foo');
      const filter = Filter.fromString('name=foo');
      const filterId = filterIdentifier(filter);
      const action = actions.request(filter);

      expect(reducer(undefined, action)).toEqual({
        byId: {},
        isLoading: {
          [filterId]: true,
        },
        errors: {},
        [filterId]: {},
      });
    });

    test('should set isLoading and not override existing state', () => {
      const actions = createEntitiesLoadingActions('foo');
      const reducer = createReducer('foo');
      const filter = Filter.fromString('name=foo');
      const filterId = filterIdentifier(filter);
      const otherFilter = Filter.fromString('name=bar');
      const otherFilterId = filterIdentifier(otherFilter);
      const action = actions.request(filter);
      const state = {
        isLoading: {
          [otherFilterId]: false,
        },
        [otherFilterId]: {},
      };

      expect(reducer(state, action)).toEqual({
        byId: {},
        errors: {},
        isLoading: {
          [otherFilterId]: false,
          [filterId]: true,
        },
        [otherFilterId]: {},
        [filterId]: {},
      });
    });

    test('should set isLoading and not override other properties', () => {
      const actions = createEntitiesLoadingActions('foo');
      const reducer = createReducer('foo');
      const filter = Filter.fromString('name=foo');
      const loadedFilter = Filter.fromString('name=foo rows=10');
      const filterId = filterIdentifier(filter);
      const action = actions.request(filter);
      const counts = {first: 1};
      const state = {
        errors: {
          [filterId]: 'An Error',
        },
        isLoading: {
          [filterId]: false,
        },
        [filterId]: {
          ids: ['foo', 'bar'],
          loadedFilter,
          counts,
        },
      };

      expect(reducer(state, action)).toEqual({
        byId: {},
        errors: {
          [filterId]: 'An Error',
        },
        isLoading: {
          [filterId]: true,
        },
        [filterId]: {
          ids: ['foo', 'bar'],
          loadedFilter,
          counts,
        },
      });
    });
  });

  describe('reducing entities loading success actions', () => {
    test('should set isLoading with default filter', () => {
      const actions = createEntitiesLoadingActions('foo');
      const reducer = createReducer('foo');
      const action = actions.success([{id: 'foo'}, {id: 'bar'}]);

      expect(reducer(undefined, action)).toEqual({
        byId: {
          foo: {
            id: 'foo',
          },
          bar: {
            id: 'bar',
          },
        },
        errors: {},
        isLoading: {
          default: false,
        },
        default: {
          ids: ['foo', 'bar'],
        },
      });
    });

    test('should reset other properties with default filter', () => {
      const actions = createEntitiesLoadingActions('foo');
      const reducer = createReducer('foo');
      const action = actions.success([{id: 'foo'}, {id: 'bar'}]);
      const state = {
        errors: {
          default: 'An error',
        },
        isLoading: {
          default: true,
        },
        default: {},
      };

      expect(reducer(state, action)).toEqual({
        byId: {
          foo: {
            id: 'foo',
          },
          bar: {
            id: 'bar',
          },
        },
        errors: {},
        isLoading: {
          default: false,
        },
        default: {
          ids: ['foo', 'bar'],
        },
      });
    });

    test('should not override other filters', () => {
      const actions = createEntitiesLoadingActions('foo');
      const reducer = createReducer('foo');
      const filter = Filter.fromString('name=bar');
      const filterId = filterIdentifier(filter);
      const counts = {first: 1};
      const otherFilter = Filter.fromString('name=foo');
      const otherFilterId = filterIdentifier(otherFilter);
      const otherCounts = {last: 22};
      const action = actions.success(
        [{id: 'foo'}, {id: 'bar'}],
        filter,
        filter,
        counts,
      );
      const state = {
        errors: {
          [otherFilterId]: 'An error',
        },
        isLoading: {
          [otherFilterId]: true,
        },
        [otherFilterId]: {
          ids: ['lorem', 'ipsum'],
          loadedFilter: otherFilter,
          counts: otherCounts,
        },
      };

      expect(reducer(state, action)).toEqual({
        byId: {
          foo: {
            id: 'foo',
          },
          bar: {
            id: 'bar',
          },
        },
        errors: {
          [otherFilterId]: 'An error',
        },
        isLoading: {
          [otherFilterId]: true,
          [filterId]: false,
        },
        [otherFilterId]: {
          ids: ['lorem', 'ipsum'],
          loadedFilter: otherFilter,
          counts: otherCounts,
        },
        [filterId]: {
          ids: ['foo', 'bar'],
          loadedFilter: filter,
          counts,
        },
      });
    });
  });

  describe('reducing entities loading error actions', () => {
    test('should set isLoading and error with default filter', () => {
      const actions = createEntitiesLoadingActions('foo');
      const reducer = createReducer('foo');
      const action = actions.error('An error');

      expect(reducer(undefined, action)).toEqual({
        byId: {},
        errors: {
          default: 'An error',
        },
        isLoading: {
          default: false,
        },
        default: {},
      });
    });

    test('should reset isLoading and error with default filter', () => {
      const actions = createEntitiesLoadingActions('foo');
      const reducer = createReducer('foo');
      const action = actions.error('An error');
      const state = {
        errors: {
          default: 'Another error',
        },
        isLoading: {
          default: true,
        },
        default: {
          ids: ['foo', 'bar'],
        },
      };

      expect(reducer(state, action)).toEqual({
        byId: {},
        errors: {
          default: 'An error',
        },
        isLoading: {
          default: false,
        },
        default: {
          ids: ['foo', 'bar'],
        },
      });
    });

    test('should not override other filters', () => {
      const actions = createEntitiesLoadingActions('foo');
      const reducer = createReducer('foo');
      const filter = Filter.fromString('name=bar');
      const filterId = filterIdentifier(filter);
      const otherFilter = Filter.fromString('name=foo');
      const otherFilterId = filterIdentifier(otherFilter);
      const action = actions.error('An error', filter);
      const state = {
        byId: {
          lorem: {
            id: 'lorem',
          },
          ipsum: {
            id: 'ipsum',
          },
        },
        errors: {
          [otherFilterId]: 'Another error',
        },
        isLoading: {
          [otherFilterId]: true,
        },
        [otherFilterId]: {
          ids: ['lorem', 'ipsum'],
        },
      };

      expect(reducer(state, action)).toEqual({
        byId: {
          lorem: {
            id: 'lorem',
          },
          ipsum: {
            id: 'ipsum',
          },
        },
        errors: {
          [otherFilterId]: 'Another error',
          [filterId]: 'An error',
        },
        isLoading: {
          [otherFilterId]: true,
          [filterId]: false,
        },
        [otherFilterId]: {
          ids: ['lorem', 'ipsum'],
        },
        [filterId]: {},
      });
    });

    test('should not reduce expected errors', () => {
      const actions = createEntitiesLoadingActions('foo');
      const reducer = createReducer('foo');
      const filter = Filter.fromString('name=bar');
      const filterId = filterIdentifier(filter);
      const otherFilter = Filter.fromString('name=foo');
      const otherFilterId = filterIdentifier(otherFilter);
      const rejection = new Rejection({}, Rejection.REASON_UNAUTHORIZED);
      const action = actions.error(rejection, filter);
      const state = {
        byId: {
          lorem: {
            id: 'lorem',
          },
          ipsum: {
            id: 'ipsum',
          },
        },
        errors: {
          [otherFilterId]: 'Another error',
        },
        isLoading: {
          [otherFilterId]: true,
        },
        [otherFilterId]: {
          ids: ['lorem', 'ipsum'],
        },
      };

      expect(reducer(state, action)).toEqual({
        byId: {
          lorem: {
            id: 'lorem',
          },
          ipsum: {
            id: 'ipsum',
          },
        },
        errors: {
          [otherFilterId]: 'Another error',
        },
        isLoading: {
          [otherFilterId]: true,
          [filterId]: false,
        },
        [otherFilterId]: {
          ids: ['lorem', 'ipsum'],
        },
        [filterId]: {},
      });
    });
  });

  describe('reducing entity loading requests', () => {
    test('should set isLoading', () => {
      const id = 'a1';
      const actions = createEntityLoadingActions('foo');
      const action = actions.request(id);
      const reducer = createReducer('foo');

      expect(reducer(undefined, action)).toEqual({
        byId: {},
        isLoading: {
          [id]: true,
        },
        errors: {},
      });
    });

    test('should set isLoading and not override other state', () => {
      const id = 'a1';
      const actions = createEntityLoadingActions('foo');
      const action = actions.request(id);
      const reducer = createReducer('foo');
      const state = {
        byId: {
          [id]: {
            foo: 'bar',
          },
          a3: {
            lorem: 'ipsum',
          },
        },
        isLoading: {
          a2: true,
          a3: false,
        },
        errors: {
          a1: 'An error',
          a2: 'Another error',
        },
        default: {
          ids: ['a2'],
        },
      };

      expect(reducer(state, action)).toEqual({
        byId: {
          [id]: {
            foo: 'bar',
          },
          a3: {
            lorem: 'ipsum',
          },
        },
        isLoading: {
          a2: true,
          a3: false,
          [id]: true,
        },
        errors: {
          a1: 'An error',
          a2: 'Another error',
        },
        default: {
          ids: ['a2'],
        },
      });
    });
  });

  describe('reducing entity loading success', () => {
    test('should reduce success action', () => {
      const id = 'a1';
      const actions = createEntityLoadingActions('foo');
      const data = {
        id: 'bar',
        foo: 'bar',
      };
      const action = actions.success(id, data);
      const reducer = createReducer('foo');

      expect(reducer(undefined, action)).toEqual({
        byId: {
          [id]: {
            id: 'bar',
            foo: 'bar',
          },
        },
        errors: {},
        isLoading: {
          [id]: false,
        },
      });
    });

    test('should reset isLoading', () => {
      const id = 'a1';
      const actions = createEntityLoadingActions('foo');
      const data = {
        id: 'bar',
        foo: 'bar',
      };
      const action = actions.success(id, data);
      const reducer = createReducer('foo');
      const state = {
        isLoading: {
          [id]: true,
        },
      };

      expect(reducer(state, action)).toEqual({
        byId: {
          [id]: {
            id: 'bar',
            foo: 'bar',
          },
        },
        errors: {},
        isLoading: {
          [id]: false,
        },
      });
    });

    test('should reset error', () => {
      const id = 'a1';
      const actions = createEntityLoadingActions('foo');
      const data = {
        id: 'bar',
        foo: 'bar',
      };
      const action = actions.success(id, data);
      const reducer = createReducer('foo');
      const state = {
        errors: {
          [id]: 'An error',
        },
      };

      expect(reducer(state, action)).toEqual({
        byId: {
          [id]: {
            id: 'bar',
            foo: 'bar',
          },
        },
        errors: {},
        isLoading: {
          [id]: false,
        },
      });
    });

    test('should override previous data', () => {
      const id = 'a1';
      const actions = createEntityLoadingActions('foo');
      const data = {
        id: 'bar',
        foo: 'bar',
      };
      const action = actions.success(id, data);
      const reducer = createReducer('foo');
      const state = {
        byId: {
          [id]: {
            id: 'baz',
            old: 'mydata',
          },
        },
      };

      expect(reducer(state, action)).toEqual({
        byId: {
          [id]: {
            id: 'bar',
            foo: 'bar',
          },
        },
        errors: {},
        isLoading: {
          [id]: false,
        },
      });
    });

    test('should not override other state', () => {
      const id = 'a1';
      const actions = createEntityLoadingActions('foo');
      const data = {
        id: 'bar',
        foo: 'bar',
      };
      const action = actions.success(id, data);
      const reducer = createReducer('foo');
      const state = {
        byId: {
          baz: {
            id: 'baz',
            old: 'mydata',
          },
        },
        errors: {
          baz: 'An error',
        },
        isLoading: {
          bar: true,
        },
      };

      expect(reducer(state, action)).toEqual({
        byId: {
          [id]: {
            id: 'bar',
            foo: 'bar',
          },
          baz: {
            id: 'baz',
            old: 'mydata',
          },
        },
        errors: {
          baz: 'An error',
        },
        isLoading: {
          [id]: false,
          bar: true,
        },
      });
    });
  });

  describe('reducing entity loading error', () => {
    test('should reduce error action', () => {
      const id = 'a1';
      const actions = createEntityLoadingActions('foo');
      const action = actions.error(id, 'An error');
      const reducer = createReducer('foo');

      expect(reducer(undefined, action)).toEqual({
        byId: {},
        errors: {
          [id]: 'An error',
        },
        isLoading: {
          [id]: false,
        },
      });
    });

    test('should reset isLoading', () => {
      const id = 'a1';
      const actions = createEntityLoadingActions('foo');
      const action = actions.error(id, 'An error');
      const reducer = createReducer('foo');
      const state = {
        isLoading: {
          [id]: true,
        },
      };

      expect(reducer(state, action)).toEqual({
        byId: {},
        errors: {
          [id]: 'An error',
        },
        isLoading: {
          [id]: false,
        },
      });
    });

    test('should override previous error', () => {
      const id = 'a1';
      const actions = createEntityLoadingActions('foo');
      const action = actions.error(id, 'An error');
      const reducer = createReducer('foo');
      const state = {
        errors: {
          [id]: 'An old error',
        },
      };

      expect(reducer(state, action)).toEqual({
        byId: {},
        errors: {
          [id]: 'An error',
        },
        isLoading: {
          [id]: false,
        },
      });
    });

    test('should not override other state', () => {
      const id = 'a1';
      const actions = createEntityLoadingActions('foo');
      const action = actions.error(id, 'An error');
      const reducer = createReducer('foo');
      const state = {
        byId: {
          baz: {
            id: 'baz',
            old: 'mydata',
          },
        },
        errors: {
          baz: 'Another error',
        },
        isLoading: {
          bar: true,
        },
      };

      expect(reducer(state, action)).toEqual({
        byId: {
          baz: {
            id: 'baz',
            old: 'mydata',
          },
        },
        errors: {
          baz: 'Another error',
          [id]: 'An error',
        },
        isLoading: {
          [id]: false,
          bar: true,
        },
      });
    });

    test('should not reduce expected errors', () => {
      const id = 'a1';
      const actions = createEntityLoadingActions('foo');
      const rejection = new Rejection({}, Rejection.REASON_UNAUTHORIZED);
      const action = actions.error(id, rejection);
      const reducer = createReducer('foo');
      const state = {
        byId: {
          baz: {
            id: 'baz',
            old: 'mydata',
          },
        },
        errors: {
          baz: 'Another error',
        },
        isLoading: {
          bar: true,
        },
      };

      expect(reducer(state, action)).toEqual({
        byId: {
          baz: {
            id: 'baz',
            old: 'mydata',
          },
        },
        errors: {
          baz: 'Another error',
        },
        isLoading: {
          [id]: false,
          bar: true,
        },
      });
    });
  });
});

// vim: set ts=2 sw=2 tw=80:
