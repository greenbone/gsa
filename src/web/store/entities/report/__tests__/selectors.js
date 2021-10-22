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

import Filter from 'gmp/models/filter';

import {createState, createRootState} from 'web/store/entities/utils/testing';

import {
  reportIdentifier,
  simplifiedReportIdentifier,
  reportSelector,
  deltaReportSelector,
} from '../selectors';

describe('reportIdentifier tests', () => {
  test('should create identifier without filter', () => {
    const id = 'foo';
    expect(reportIdentifier(id)).toEqual('foo');
  });

  test('should create identifier with filter', () => {
    const id = 'foo';
    const filter = Filter.fromString('foo=bar rows=10');
    expect(reportIdentifier(id, filter)).toEqual('foo-foo=bar rows=10');
  });
});

describe('simplifiedReportIdentifier tests', () => {
  test('should create identifier without filter', () => {
    const id = 'foo';
    expect(simplifiedReportIdentifier(id)).toEqual('foo');
  });

  test('should create identifier with filter', () => {
    const id = 'foo';
    const filter = Filter.fromString('foo=bar rows=10');
    expect(simplifiedReportIdentifier(id, filter)).toEqual('foo-foo=bar');
  });
});

describe('report selector tests', () => {
  test('should return true for isLoading', () => {
    const state = createState('report', {
      isLoading: {
        foo: true,
      },
    });
    const selector = reportSelector(state);

    expect(selector.isLoadingEntity('foo')).toEqual(true);
  });

  test('should return true for isLoading with filter', () => {
    const filter = Filter.fromString('foo=bar rows=10');
    const state = createState('report', {
      isLoading: {
        [reportIdentifier('foo', filter)]: true,
      },
    });
    const selector = reportSelector(state);

    expect(selector.isLoadingEntity('foo', filter)).toEqual(true);
  });

  test('should return false for isLoading', () => {
    const state = createState('report', {
      isLoading: {
        foo: false,
      },
    });
    const selector = reportSelector(state);

    expect(selector.isLoadingEntity('foo')).toEqual(false);
  });

  test('should return false for isLoading with filter', () => {
    const filter = Filter.fromString('foo=bar rows=10');
    const state = createState('report', {
      isLoading: {
        [reportIdentifier('foo', filter)]: false,
      },
    });
    const selector = reportSelector(state);

    expect(selector.isLoadingEntity('foo', filter)).toEqual(false);
  });

  test('should return undefined for isLoading', () => {
    let state = createState('report', {});
    let selector = reportSelector(state);
    expect(selector.isLoadingEntity('foo')).toBeUndefined();

    state = createState('report', {
      isLoading: {},
    });
    selector = reportSelector(state);
    expect(selector.isLoadingEntity('foo')).toBeUndefined();

    state = createState('report', {
      isLoading: {
        foo: undefined,
      },
    });
    selector = reportSelector(state);
    expect(selector.isLoadingEntity('foo')).toBeUndefined();
  });

  test('should return undefined for isLoading with filter', () => {
    const filter = Filter.fromString('foo=bar rows=10');
    let state = createState('report', {
      isLoading: {
        foo: true,
      },
    });
    let selector = reportSelector(state);
    expect(selector.isLoadingEntity('foo', filter)).toBeUndefined();

    state = createState('report', {
      isLoading: {
        [reportIdentifier('foo', filter)]: undefined,
      },
    });
    selector = reportSelector(state);
    expect(selector.isLoadingEntity('foo', filter)).toBeUndefined();
  });

  test('should return error', () => {
    const state = createState('report', {
      errors: {
        foo: 'An error',
      },
    });
    const selector = reportSelector(state);
    expect(selector.getEntityError('foo')).toEqual('An error');
  });

  test('should return error with filter', () => {
    const filter = Filter.fromString('foo=bar rows=10');
    const state = createState('report', {
      errors: {
        [reportIdentifier('foo', filter)]: 'An error',
      },
    });
    const selector = reportSelector(state);
    expect(selector.getEntityError('foo', filter)).toEqual('An error');
  });

  test('should return undefined error', () => {
    const filter = Filter.fromString('foo=bar rows=10');
    const state = createState('report', {
      errors: {
        [simplifiedReportIdentifier('foo', filter)]: 'An error',
      },
    });
    const selector = reportSelector(state);
    expect(selector.getEntityError('foo')).toBeUndefined();
  });

  test('should return undefined error with filter', () => {
    const filter = Filter.fromString('foo=bar rows=10');
    const state = createState('report', {
      errors: {
        foo: 'An error',
      },
    });
    const selector = reportSelector(state);
    expect(selector.getEntityError('foo', filter)).toBeUndefined();
  });

  test('should return report', () => {
    const model = {id: 'foo'};
    const state = createState('report', {
      byId: {
        foo: model,
      },
    });
    const selector = reportSelector(state);
    expect(selector.getEntity('foo')).toBe(model);
  });

  test('should return report with filter', () => {
    const model = {id: 'foo'};
    const filter = Filter.fromString('foo=bar rows=10');
    const state = createState('report', {
      byId: {
        [simplifiedReportIdentifier('foo', filter)]: model,
      },
    });
    const selector = reportSelector(state);
    expect(selector.getEntity('foo', filter)).toBe(model);
  });

  test('should return report with simplified filter', () => {
    const model = {id: 'foo'};
    const filter = Filter.fromString('foo=bar rows=10');
    const filter2 = Filter.fromString('foo=bar first=10');
    const state = createState('report', {
      byId: {
        [simplifiedReportIdentifier('foo', filter)]: model,
      },
    });
    const selector = reportSelector(state);
    expect(selector.getEntity('foo', filter2)).toBe(model);
  });
});

describe('delta report selector tests', () => {
  test('should be false for undefined state', () => {
    const id = 'a1';
    const deltaId = 'a2';
    const rootState = createRootState({});
    const selector = deltaReportSelector(rootState);

    expect(selector.isLoading(id, deltaId)).toBe(false);
  });

  test('should be false for empty state', () => {
    const id = 'a1';
    const deltaId = 'a2';
    const rootState = createState('deltaReport', {});
    const selector = deltaReportSelector(rootState);

    expect(selector.isLoading(id, deltaId)).toEqual(false);
  });

  test('should be false for unknown id', () => {
    const id = 'a1';
    const deltaId = 'a2';
    const rootState = createState('deltaReport', {
      isLoading: {
        foo: true,
      },
    });
    const selector = deltaReportSelector(rootState);

    expect(selector.isLoading(id, deltaId)).toBe(false);
  });

  test('should be false if false in state', () => {
    const id = 'a1';
    const deltaId = 'a2';
    const identifier = `${id}+${deltaId}`;
    const rootState = createState('deltaId', {
      isLoading: {
        [identifier]: false,
      },
    });
    const selector = deltaReportSelector(rootState);

    expect(selector.isLoading(id, deltaId)).toBe(false);
  });

  test('should be true if true in state', () => {
    const id = 'a1';
    const deltaId = 'a2';
    const identifier = `${id}+${deltaId}`;
    const rootState = createState('deltaReport', {
      isLoading: {
        [identifier]: true,
      },
    });
    const selector = deltaReportSelector(rootState);

    expect(selector.isLoading(id, deltaId)).toBe(true);
  });

  test('should return undefined for empty state', () => {
    const rootState = createRootState({});
    const selector = deltaReportSelector(rootState);

    expect(selector.getEntity('bar')).toBeUndefined();
  });

  test('should return undefined for empty byId', () => {
    const rootState = createState('deltaReport', {
      byId: {},
    });
    const selector = deltaReportSelector(rootState);

    expect(selector.getEntity('bar')).toBeUndefined();
  });

  test('should return undefined for unknown id', () => {
    const rootState = createState('deltaReport', {
      byId: {
        foo: {
          id: 'foo',
        },
      },
    });
    const selector = deltaReportSelector(rootState);

    expect(selector.getEntity('bar')).toBeUndefined();
  });

  test('should return entity data', () => {
    const id = 'a1';
    const deltaId = 'a2';
    const identifier = `${id}+${deltaId}`;

    const rootState = createState('deltaReport', {
      byId: {
        [identifier]: {
          id: 'bar',
          lorem: 'ipsum',
        },
      },
    });
    const selector = deltaReportSelector(rootState);

    expect(selector.getEntity(id, deltaId)).toEqual({
      id: 'bar',
      lorem: 'ipsum',
    });
  });

  test('should return undefined for empty state', () => {
    const id = 'a1';
    const deltaId = 'a2';
    const rootState = createRootState({});
    const selector = deltaReportSelector(rootState);

    expect(selector.getError(id, deltaId)).toBeUndefined();
  });

  test('should return undefined for empty byId', () => {
    const id = 'a1';
    const deltaId = 'a2';
    const rootState = createState('deltaReport', {
      byId: {},
    });
    const selector = deltaReportSelector(rootState);

    expect(selector.getError(id, deltaId)).toBeUndefined();
  });

  test('should return undefined for unknown id', () => {
    const id = 'a1';
    const deltaId = 'a2';
    const rootState = createState('deltaReport', {
      byId: {
        foo: {
          id: 'foo',
        },
      },
    });
    const selector = deltaReportSelector(rootState);

    expect(selector.getError(id, deltaId)).toBeUndefined();
  });

  test('should return error', () => {
    const id = 'a1';
    const deltaId = 'a2';
    const identifier = `${id}+${deltaId}`;
    const rootState = createState('deltaReport', {
      errors: {
        [identifier]: 'An error',
      },
    });
    const selector = deltaReportSelector(rootState);

    expect(selector.getError(id, deltaId)).toEqual('An error');
  });
});
